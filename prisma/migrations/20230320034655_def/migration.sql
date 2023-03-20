-- AlterTable
ALTER TABLE "Orders" ALTER COLUMN "fechaActualizada" DROP NOT NULL,
ADD CONSTRAINT "Orders_pkey" PRIMARY KEY ("idEP");
