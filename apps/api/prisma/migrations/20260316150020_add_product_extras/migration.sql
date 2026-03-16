-- CreateTable
CREATE TABLE "product_extras" (
    "productId" INTEGER NOT NULL,
    "extraId" INTEGER NOT NULL,

    CONSTRAINT "product_extras_pkey" PRIMARY KEY ("productId","extraId")
);

-- AddForeignKey
ALTER TABLE "product_extras" ADD CONSTRAINT "product_extras_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_extras" ADD CONSTRAINT "product_extras_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
