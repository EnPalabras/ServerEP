import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

// async function main() {
//   const result = await prisma.orders.findMany({
//     where: {
//       OR: [{ idEP: 'TN-18213' }, { idEP: 'TN-18216' }],
//     },
//     include: {
//       Products: true,
//       Discounts: true,
//       Shipment: true,
//     },
//     // include: {
//     //   Products: true,
//     //   Discounts: true,
//     // },
//   })
//   console.log(result[0].Shipment)
// }

// main()
