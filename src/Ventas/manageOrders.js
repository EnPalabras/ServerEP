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

export const getOneOrder = async (id) => {
  console.log(id)
  try {
    const order = await prisma.orders.findUnique({
      where: {
        idEP: id,
      },
      include: {
        Shipment: true,
        Products: true,
        Payments: true,
        Discounts: true,
      },
    })

    console.log(order)

    return { status: 200, message: 'Order', order: order }
  } catch (error) {
    return { status: 500, message: 'Error', error }
  }
}

export const deleteOneOrder = async (id) => {
  try {
    const order = await prisma.orders.delete({
      where: {
        idEP: id,
      },
    })

    return { status: 200, message: 'Order deleted', order: order }
  } catch (error) {
    return { status: 500, message: 'Error', error }
  }
}

export const getOrders = async (page, salesChannel, search) => {
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
        AND: [
          {
            canalVenta: {
              in: sales,
            },
          },
          {
            OR: [
              {
                idEP: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                nombre: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                mail: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      include: {
        Shipment: true,
        Products: true,
        Payments: true,
      },
      skip: (page - 1) * 20,
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

export const localSales = async (page, search, shipStatus, payStatus) => {
  try {
    const orders = await prisma.orders.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                nombre: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                mail: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                idEP: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                DNI: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },

          {
            OR: [
              {
                Shipment: {
                  some: {
                    tipoEnvio: {
                      contains: 'Recoleta',
                      mode: 'insensitive',
                    },
                  },
                },
              },
              {
                Shipment: {
                  some: {
                    tipoEnvio: {
                      contains: 'Local',
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ],
          },
        ],
      },

      include: {
        Shipment: true,
        Products: true,
        Payments: true,
      },

      skip: (page - 1) * 20,
      take: 20,
      orderBy: {
        fechaCreada: 'desc',
      },
    })
    const orderFullData = await prisma.orders.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                nombre: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                mail: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                idEP: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                DNI: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },

          {
            OR: [
              {
                Shipment: {
                  some: {
                    tipoEnvio: {
                      contains: 'Recoleta',
                      mode: 'insensitive',
                    },
                  },
                },
              },
              {
                Shipment: {
                  some: {
                    tipoEnvio: {
                      contains: 'Local',
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ],
          },
        ],
      },

      include: {
        Shipment: true,
        Products: true,
        Payments: true,
      },

      orderBy: {
        fechaCreada: 'desc',
      },
    })

    return {
      status: 200,
      message: 'Orders',
      orders,
      queryInfo: {
        page,
        skip: (page - 1) * 20,
        take: 20,
        total: orderFullData.length,
      },
    }
  } catch (error) {
    console.log(error)

    return { status: 500, message: 'Error', error }
  }
}

export const markOrderAsPaid = async (paymentId, date, amountReceived) => {
  const parseDate = (date) => {
    if (date === null || date === undefined) {
      return null
    }

    const datetime = new Date(
      new Date(date).toLocaleString('sv-SE', {
        timeZone: 'America/Argentina/Buenos_Aires',
      })
    )

    datetime.setHours(datetime.getHours())

    return datetime
  }

  try {
    const payment = await prisma.payments.update({
      where: {
        id: paymentId,
      },
      data: {
        estado: 'Pagado',
        fechaPago: parseDate(date),
        fechaLiquidacion: parseDate(date),
        montoRecibido: amountReceived,
      },
    })
    return { status: 200, message: 'Order updated', payment: payment }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Error', error }
  }
}

export const updateProductsFromOrder = async (id, products, paymentId) => {
  try {
    await prisma.products.deleteMany({
      where: {
        idEP: id,
      },
    })

    let productsOfOrder = []

    const montoTotal = products.reduce((acc, product) => {
      return acc + parseFloat(product.precioTotal)
    }, 0)

    products.forEach((product) => {
      const productBody = {
        // idEP: id,
        producto: product.producto,
        variante: product.variante,
        categoria: product.categoria,
        cantidad: parseInt(product.cantidad),
        precioUnitario: parseFloat(product.precioUnitario),
        precioTotal:
          parseFloat(product.cantidad) * parseFloat(product.precioUnitario),
        moneda: product.moneda,
      }
      productsOfOrder.push(productBody)
    })

    let resArray = []

    productsOfOrder.forEach(async (product) => {
      const updateProducts = await prisma.orders.update({
        where: {
          idEP: id,
        },
        data: {
          Products: {
            create: {
              ...product,
            },
          },
        },

        include: {
          Products: true,
        },
      })
      resArray.push(updateProducts)
    })

    console.log(paymentId)

    const payment = await prisma.payments.findUnique({
      where: {
        id: paymentId,
      },
      select: {
        tipoPago: true,
      },
    })

    console.log('payment', payment)

    if (payment.tipoPago === 'Efectivo') {
      await prisma.discounts.deleteMany({
        where: {
          idEP: id,
          tipoDescuento: 'Metodo de Pago',
        },
      })

      await prisma.discounts.create({
        data: {
          idEP: id,
          tipoDescuento: 'Metodo de Pago',
          montoDescuento: montoTotal * 0.1,
        },
      })
    }

    const sumOfShipments = await prisma.shipment.findMany({
      where: {
        idEP: id,
      },
      select: {
        pagoEnvio: true,
      },
    })

    const sumShipments = sumOfShipments.reduce((acc, shipment) => {
      return acc + shipment.pagoEnvio
    }, 0)

    const sumOfDiscounts = await prisma.discounts.findMany({
      where: {
        idEP: id,
      },
      select: {
        montoDescuento: true,
      },
    })

    const sumDiscounts = sumOfDiscounts.reduce((acc, discount) => {
      return acc + discount.montoDescuento
    }, 0)

    const total = montoTotal + sumShipments - sumDiscounts

    await prisma.payments.update({
      where: {
        id: paymentId,
      },
      data: {
        montoTotal: total,
      },
    })

    return { status: 200, message: resArray, payment: payment }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Error', error }
  }
}

export const updatePaymentFromOrder = async (
  paymentId,
  tipoPago,
  cuentaDestino,
  orderId
) => {
  try {
    const sumOfProducts = await prisma.products.findMany({
      where: {
        idEP: orderId,
      },
      select: {
        precioTotal: true,
      },
    })

    const sumProducts = sumOfProducts.reduce((acc, product) => {
      return acc + product.precioTotal
    }, 0)

    if (tipoPago !== 'Efectivo') {
      await prisma.discounts.deleteMany({
        where: {
          idEP: orderId,
          tipoDescuento: 'Metodo de Pago',
        },
      })
    } else if (tipoPago === 'Efectivo') {
      const discounts = await prisma.discounts.findMany({
        where: {
          idEP: orderId,
          tipoDescuento: 'Metodo de Pago',
        },
      })

      if (discounts.length === 0) {
        await prisma.discounts.create({
          data: {
            idEP: orderId,
            tipoDescuento: 'Metodo de Pago',
            montoDescuento: sumProducts * 0.1,
          },
        })
      }
    }

    const sumOfShipments = await prisma.shipment.findMany({
      where: {
        idEP: orderId,
      },
      select: {
        pagoEnvio: true,
      },
    })

    const sumShipments = sumOfShipments.reduce((acc, shipment) => {
      return acc + shipment.pagoEnvio
    }, 0)

    const sumOfDiscounts = await prisma.discounts.findMany({
      where: {
        idEP: orderId,
      },
      select: {
        montoDescuento: true,
      },
    })

    const sumDiscounts = sumOfDiscounts.reduce((acc, discount) => {
      return acc + discount.montoDescuento
    }, 0)

    const total = sumProducts + sumShipments - sumDiscounts

    const updatePayment = await prisma.payments.update({
      where: {
        id: paymentId,
      },
      data: {
        montoTotal: total,
        tipoPago: tipoPago,
        cuentaDestino: cuentaDestino,
      },
    })

    return { status: 200, message: 'Order updated', payment: updatePayment }
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
