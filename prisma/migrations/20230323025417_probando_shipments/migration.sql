/*
  Warnings:

  - You are about to drop the `StockPoint` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_stockDesde_fkey";

-- DropTable
DROP TABLE "StockPoint";
