/*
  Warnings:

  - You are about to drop the column `order` on the `Task` table. All the data in the column will be lost.
  - Added the required column `position` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Task_column_order_idx";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "order",
ADD COLUMN     "position" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "Task_column_position_idx" ON "Task"("column", "position");
