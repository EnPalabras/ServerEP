import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

// async function main() {
//   const result = await prisma.orders.findMany({
//     where: {
//       OR: [{ idEP: 'TN-18221' }, { idEP: 'TN-18200' }],
//     },
//     include: {
//       Products: true,
//       Discounts: true,
//     },
//     // include: {
//     //   Products: true,
//     //   Discounts: true,
//     // },
//   })
//   console.log(result[0].Products)
// }

// main()
