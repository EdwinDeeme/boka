-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "parentItemId" INTEGER;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
