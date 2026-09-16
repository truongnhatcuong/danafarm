-- Additive production-safe order lifecycle migration.
-- Existing orders remain unchanged and are treated as inventory already allocated.
ALTER TABLE `Order`
  ADD COLUMN `idempotencyKey` VARCHAR(191) NULL,
  ADD COLUMN `inventoryRestored` BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX `Order_idempotencyKey_key` ON `Order`(`idempotencyKey`);

CREATE TABLE `OrderStatusHistory` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `orderId` INTEGER NOT NULL,
  `changedById` INTEGER NOT NULL,
  `changeType` VARCHAR(191) NOT NULL,
  `previousStatus` ENUM('PENDING', 'CONFIRMED', 'PACKING', 'SHIPPING', 'DELIVERED', 'CANCELLED') NULL,
  `nextStatus` ENUM('PENDING', 'CONFIRMED', 'PACKING', 'SHIPPING', 'DELIVERED', 'CANCELLED') NULL,
  `previousPayment` ENUM('PENDING', 'PAID', 'CANCELLED', 'FAILED') NULL,
  `nextPayment` ENUM('PENDING', 'PAID', 'CANCELLED', 'FAILED') NULL,
  `isUndo` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `OrderStatusHistory_orderId_createdAt_idx`(`orderId`, `createdAt`),
  INDEX `OrderStatusHistory_changedById_idx`(`changedById`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `OrderStatusHistory`
  ADD CONSTRAINT `OrderStatusHistory_orderId_fkey`
    FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderStatusHistory_changedById_fkey`
    FOREIGN KEY (`changedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
