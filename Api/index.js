import express from 'express'
import MercadoLibre from './MercadoLibre/index.js'
import TiendaNube from './TiendaNube/index.js'
import Auth from './Auth/index.js'
import { prisma } from '../lib/prisma.js'
import Ventas from './Ventas/index.js'
import Mayoristas from './Mayoristas/index.js'
import PayTN from './PayTN/index.js'

const apiRoutes = express.Router()

apiRoutes.use('/tienda-nube', TiendaNube)
apiRoutes.use('/mercado-libre', MercadoLibre)
apiRoutes.use('/auth', Auth)
apiRoutes.use('/ventas', Ventas)
apiRoutes.use('/mayoristas', Mayoristas)
apiRoutes.use('/paytn', PayTN)

apiRoutes.post('/', async (req, res) => {
  // try {
  //   BigInt.prototype.toJSON = function () {
  //     return parseInt(this.toString())
  //   }

  // const allCalipsian = await prisma.$queryRaw`
  //  SELECT DATE_TRUNC('month', "Orders"."fechaCreada") AS "Month",
  //  "Orders"."canalVenta" AS "Canal",
  //  COUNT("Orders"."idEP") AS "Ventas"
  //  FROM "Orders"
  // --  "Products"."producto" AS "Producto"
  // --  FROM "Products"
  // --  JOIN "Shipment"
  // --  ON "Products"."idEP" = "Shipment"."idEP"

  //   //  WHERE "Orders"."estado" = 'Finalizada'
  //   //  OR "Orders"."estado" = 'Abierta' OR "Orders"."estado" = 'Pendiente Envio' OR "Orders"."estado" = 'Pendiente Envío'
  //   //  GROUP BY "Month", "Canal"
  //   //  ORDER BY "Month" ASC
  //   //  `

  //   // const allCalipsian = await prisma.$queryRaw`
  //   //  SELECT DATE_TRUNC('day', "Shipment"."fechaEnvio") AS "Date",
  //   //  SUM("Products"."cantidad") AS "Cantidad",
  //   //  "Products"."producto" AS "Producto"
  //   //  FROM "Products"
  //   //  JOIN "Shipment"
  //   //  ON "Products"."idEP" = "Shipment"."idEP"

  //   //  WHERE "Shipment"."stockDesde" = 'Calipsian Recoleta'
  //   //  AND "Shipment"."fechaEnvio" IS NOT NULL
  //   //  AND "Shipment"."estado" != 'cancelled'
  //   //  GROUP BY "Producto", "Date"
  //   //  `

  //   const allCalipsian = await prisma.$queryRaw`
  //    SELECT "Orders"."idEP" AS "id"

  //    FROM "Orders"
  //    LEFT OUTER JOIN "Products"
  //    ON "Orders"."idEP" = "Products"."idEP"

  //    WHERE "Products"."idEP" IS NULL
  //    `

  //   return res.status(200).send(allCalipsian)
  // } catch (err) {
  //   console.log(err)
  //   return res.status(200).json({
  //     err,
  //   })
  // }

  const { body } = req

  const order = body

  try {
    const orderCreated = await prisma.orders.create({
      data: {
        idEP: order.idEP,
        fechaCreada: order.fechaCreada,
        estado: order.estado,
        canalVenta: order.canalVenta,
        nombre: order.nombre,
        mail: order.mail,
        DNI: order.DNI,
        telefono: order.telefono,
        montoTotal: order.montoTotal,
        externalId: order.externalId,
        cuponPago: order.cuponPago,
        packId: order.packId,
        Products: {
          create: order.Products,
        },
        Shipment: {
          create: order.Shipment,
        },
        Payments: {
          create: order.Payments,
        },
        Discounts: {
          create: order.Discounts,
        },
      },
    })
    console.log('ok')
    return res.status(200).json({
      orderCreated,
    })
  } catch (error) {
    console.log('no')
    console.log(error)

    return res.status(500).json({
      error,
    })
  }
})

// const deleteSome = await prisma.orders.deleteMany({
//   where: {
//     idEP: {
//       in: results.map((order) => order.idEP),
//     },
//   },
// })

// return res.json(results)

//   const result = await prisma.orders.findMany({
//     where: {
//       OR: [{ idEP: 'TN-18213' }, { idEP: 'TN-18216' }],
//     },
//     include: {
//       Products: true,
//       Discounts: true,
//       Shipment: true,
//       Payments: true,
//     },
//   })

//   const withConditions = await prisma.orders.findMany({
//     where: {
//       Payments: {
//         some: {
//           estado: 'paid',
//         },
//       },
//     },

//     include: {
//       Products: true,
//       Payments: true,
//     },
//   })

//   BigInt.prototype.toJSON = function () {
//     return parseInt(this.toString())
//   }

//   const sumOf = await prisma.$queryRaw`
//     SELECT DATE_TRUNC('day', "Orders"."fechaCreada") AS "Date",
//     COUNT("Products"."cantidad") AS "Cantidad",
//     "Products"."producto" AS "Producto"
//     FROM "Orders"
//     JOIN "Payments"
//     ON "Orders"."idEP" = "Payments"."idEP"
//     JOIN "Products"
//     ON "Orders"."idEP" = "Products"."idEP"

//     WHERE "Payments"."estado" = 'paid'
//     GROUP BY "Date", "Producto"
//     ORDER BY "Date" ASC
//     `

// const JSON = await prisma.$queryRaw`

// WITH "Probando" AS (
//   SELECT DATE_TRUNC('day', "Orders"."fechaCreada") AS "Date",

//       JSON_BUILD_OBJECT(
//           'Cantidad', COUNT("Products"."cantidad"),
//           'Producto', "Products"."producto"
//       )
//    AS "Productos"

//   FROM "Orders"
//   JOIN "Payments"
//   ON "Orders"."idEP" = "Payments"."idEP"
//   JOIN "Products"
//   ON "Orders"."idEP" = "Products"."idEP"

//   WHERE "Payments"."estado" = 'paid'
//   GROUP BY "Date", "Products"."producto"
//   ORDER BY "Date" ASC
// )

//   SELECT "Date",
//   JSON_AGG("Productos") AS "Productos"
//   FROM "Probando"

//   GROUP BY "Date"

//   `

// res.send(JSON)

export default apiRoutes
