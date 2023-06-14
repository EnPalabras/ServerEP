import dotenv, { parse } from 'dotenv'
import fetch from 'node-fetch'
import { prisma } from '../../lib/prisma.js'

dotenv.config()

const genereteId = () => {
  const month = new Date().toLocaleString('es-AR', { month: '2-digit' })
  const year = new Date().toLocaleString('es-AR', { year: 'numeric' })
  const date = new Date().toLocaleString('es-AR', { day: '2-digit' })
  const random = Math.floor(Math.random() * 1000)
  const id = `${month}${year}${date}${random}`

  return id
}

const canal = {
  Regalo: 'RG',
  Reventa: 'REV',
  Empresa: 'EMP',
  Personal: 'PE',
}

export const uploadSale = async (body) => {
  let id = genereteId()

  try {
    const {
      fechaCreada,
      canalVenta,
      nombre,
      mail,
      DNI,
      telefono,
      shipment,
      products,
      payments,
    } = body

    const {
      tipoEnvio,
      nombreEnvio,
      costoEnvio,
      pagoEnvio,
      stockDesde,
      fechaEnvio,
      codigoPostal,
      ciudad,
      provincia,
      pais,
    } = shipment

    let idEP = `${canal[canalVenta]}-${id}`

    let orderBody = {
      idEP,
      fechaCreada: new Date(fechaCreada),
      canalVenta,
      nombre,
      mail,
      DNI,
      telefono,
      externalId: id,
    }

    await prisma.orders.create({
      data: { ...orderBody },
    })

    let shipBody = {
      idEP,
      estado: 'Enviado',
      tipoEnvio,
      nombreEnvio,
      costoEnvio,
      pagoEnvio,
      stockDesde,
      fechaEnvio: new Date(fechaEnvio),
      fechaEntrega: new Date(fechaEnvio),
      codigoPostal,
      ciudad,
      provincia,
      pais,
    }

    await prisma.shipment.create({
      data: { ...shipBody },
    })

    let productsOfOrder = products.map((product) => {
      return {
        idEP,
        producto: product.producto,
        cantidad: product.cantidad,
        precioUnitario: product.precio,
        precioTotal: product.cantidad * product.precio,
        moneda: product.moneda,
      }
    })

    productsOfOrder.forEach(async (product) => {
      await prisma.products.create({
        data: { ...product },
      })
    })

    let paymentsOfOrder = payments.map((payment) => {
      return {
        idEP,
        estado: 'Pagado',
        tipoPago: payment.tipoPago,
        cuentaDestino: parsePayment[payment.tipoPago],
        fechaPago: new Date(payment.fechaPago),
        fechaLiquidacion: new Date(payment.fechaPago),
        moneda: payment.moneda,
        montoTotal: payment.montoTotal,
        montoRecibido: payment.montoRecibido,
      }
    })

    paymentsOfOrder.forEach(async (payment) => {
      await prisma.payments.create({
        data: { ...payment },
      })
    })

    return { status: 201, message: 'Sale created' }
  } catch (error) {
    return { status: 500, message: 'Error', error }
  }
}

export const getOrders = async (page, salesChannel) => {
  try {
    let sales = [
      'Tienda Nube',
      'Mercado Libre',
      'Regalo',
      'Reventa',
      'Empresa',
      'Personal',
    ]
    if (salesChannel !== 'all' && salesChannel !== undefined) {
      sales = [salesChannel]
    }

    const orders = await prisma.orders.findMany({
      where: {
        canalVenta: {
          in: sales,
        },
      },
      include: {
        Shipment: true,
        Products: true,
        Payments: true,
      },
      skip: (page - 1) * 10,
      take: 20,
      orderBy: {
        fechaCreada: 'desc',
      },
    })

    return { status: 200, message: 'Orders', orders }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Error', error }
  }
}

const parsePayment = {
  'Mercado Pago': 'Mercado Pago',
  'MP Jochi': 'MP Jochi',
  Santander: 'Santander',
  'Efectivo Katy': 'Efectivo Katy',
  'Efectivo Jochi': 'Efectivo Jochi',
  'Efectivo Belu': 'Efectivo Belu',
}
