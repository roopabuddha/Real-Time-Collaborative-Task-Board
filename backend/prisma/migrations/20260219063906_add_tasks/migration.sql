/*
  Warnings:

  - You are about to drop the column `position` on the `Task` table. All the data in the column will be lost.
  - Added the required column `order` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `column` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Column" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "position",
ADD COLUMN     "order" DOUBLE PRECISION NOT NULL,
DROP COLUMN "column",
ADD COLUMN     "column" "Column" NOT NULL,
ALTER COLUMN "version" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Task_column_order_idx" ON "Task"("column", "order");
