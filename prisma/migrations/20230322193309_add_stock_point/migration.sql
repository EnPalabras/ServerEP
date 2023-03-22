/*
  Warnings:

  - Added the required column `stockDesde` to the `Shipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "stockDesde" VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE "StockPoint" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,

    CONSTRAINT "StockPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockPoint_nombre_key" ON "StockPoint"("nombre");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_stockDesde_fkey" FOREIGN KEY ("stockDesde") REFERENCES "StockPoint"("nombre") ON DELETE CASCADE ON UPDATE CASCADE;
