/*
  Warnings:

  - You are about to alter the column `cpf` on the `Usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(14)`.
  - Made the column `tipo` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `cnpj` VARCHAR(18) NULL,
    MODIFY `tipo` ENUM('fisico', 'juridico') NOT NULL DEFAULT 'fisico',
    MODIFY `cpf` VARCHAR(14) NULL;
