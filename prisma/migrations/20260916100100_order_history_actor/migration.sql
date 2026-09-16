-- Distinguish customer-initiated order changes from administrator actions.
-- Existing history rows remain administrator actions through the default value.
ALTER TABLE `OrderStatusHistory`
  ADD COLUMN `actorType` VARCHAR(191) NOT NULL DEFAULT 'ADMIN';
