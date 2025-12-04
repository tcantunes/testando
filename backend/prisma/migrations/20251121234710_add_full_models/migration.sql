-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `cep` VARCHAR(191) NULL,
    ADD COLUMN `cidade` VARCHAR(191) NULL,
    ADD COLUMN `cpf` VARCHAR(191) NULL,
    ADD COLUMN `estado` VARCHAR(191) NULL,
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `rua` VARCHAR(191) NULL,
    ADD COLUMN `telefone` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Inscricao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vagaId` INTEGER NOT NULL,
    `voluntarioId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `vagaId` INTEGER NULL,
    `mensagem` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inscricao` ADD CONSTRAINT `Inscricao_vagaId_fkey` FOREIGN KEY (`vagaId`) REFERENCES `Vaga`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscricao` ADD CONSTRAINT `Inscricao_voluntarioId_fkey` FOREIGN KEY (`voluntarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_vagaId_fkey` FOREIGN KEY (`vagaId`) REFERENCES `Vaga`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
