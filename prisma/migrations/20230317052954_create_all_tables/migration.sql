/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "Profile";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Orders" (
    "idEP" TEXT NOT NULL,
    "estado" VARCHAR(255) NOT NULL,
    "fechaCreada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizada" TIMESTAMP(3) NOT NULL,
    "canalVenta" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "mail" VARCHAR(255),
    "DNI" VARCHAR(255),
    "telefono" VARCHAR(255),
    "externalId" VARCHAR(255) NOT NULL,
    "packId" VARCHAR(255),
    "cuponPago" VARCHAR(255)
);

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "idEP" TEXT NOT NULL,
    "producto" VARCHAR(255) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "precioTotal" DOUBLE PRECISION NOT NULL,
    "moneda" VARCHAR(255) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "idEP" TEXT NOT NULL,
    "estado" VARCHAR(255) NOT NULL,
    "tipoEnvio" VARCHAR(255) NOT NULL,
    "costoEnvio" DOUBLE PRECISION,
    "pagoEnvio" DOUBLE PRECISION,
    "fechaEnvio" TIMESTAMP(3),
    "fechaEntrega" TIMESTAMP(3),
    "fechaRebotado" TIMESTAMP(3),
    "codigoPostal" VARCHAR(255),
    "ciudad" VARCHAR(255),
    "provincia" VARCHAR(255),
    "pais" VARCHAR(255),

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" TEXT NOT NULL,
    "idEP" TEXT NOT NULL,
    "estado" VARCHAR(255) NOT NULL,
    "tipoPago" VARCHAR(255) NOT NULL,
    "cuentaDestino" VARCHAR(255),
    "fechaPago" TIMESTAMP(3),
    "fechaLiquidacion" TIMESTAMP(3),
    "montoTotal" DOUBLE PRECISION,
    "montoRecibido" DOUBLE PRECISION,
    "cuotas" INTEGER,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discounts" (
    "id" TEXT NOT NULL,
    "idEP" TEXT NOT NULL,
    "tipoDescuento" VARCHAR(255) NOT NULL,
    "montoDescuento" DOUBLE PRECISION,
    "codigoDescuento" VARCHAR(255),

    CONSTRAINT "Discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producciones" (
    "id" SERIAL NOT NULL,
    "fechaCreada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "producto" VARCHAR(255) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION,
    "precioTotal" DOUBLE PRECISION,
    "moneda" VARCHAR(255),

    CONSTRAINT "Producciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntregasImprenta" (
    "id" SERIAL NOT NULL,
    "idProduccion" INTEGER NOT NULL,
    "fechaEntrega" TIMESTAMP(3) NOT NULL,
    "cantidadEntregada" INTEGER NOT NULL,

    CONSTRAINT "EntregasImprenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductosImprenta" (
    "id" SERIAL NOT NULL,
    "idEntrega" INTEGER NOT NULL,
    "idProduccion" INTEGER NOT NULL,
    "producto" VARCHAR(255) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "comentarios" VARCHAR(255),

    CONSTRAINT "ProductosImprenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "producto" VARCHAR(255) NOT NULL,
    "stockActual" INTEGER NOT NULL,
    "faltanEntregar" INTEGER NOT NULL,
    "stockPuntos" JSONB,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Orders_idEP_key" ON "Orders"("idEP");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_idEP_fkey" FOREIGN KEY ("idEP") REFERENCES "Orders"("idEP") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_idEP_fkey" FOREIGN KEY ("idEP") REFERENCES "Orders"("idEP") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_idEP_fkey" FOREIGN KEY ("idEP") REFERENCES "Orders"("idEP") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discounts" ADD CONSTRAINT "Discounts_idEP_fkey" FOREIGN KEY ("idEP") REFERENCES "Orders"("idEP") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregasImprenta" ADD CONSTRAINT "EntregasImprenta_idProduccion_fkey" FOREIGN KEY ("idProduccion") REFERENCES "Producciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductosImprenta" ADD CONSTRAINT "ProductosImprenta_idEntrega_fkey" FOREIGN KEY ("idEntrega") REFERENCES "EntregasImprenta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductosImprenta" ADD CONSTRAINT "ProductosImprenta_idProduccion_fkey" FOREIGN KEY ("idProduccion") REFERENCES "Producciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
