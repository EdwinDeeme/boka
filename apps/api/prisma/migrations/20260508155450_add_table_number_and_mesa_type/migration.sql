-- AlterEnum
ALTER TYPE "DeliveryType" ADD VALUE 'MESA';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "tableNumber" TEXT;
