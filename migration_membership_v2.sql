-- ================================================================
-- Migration v2: Membership Expiry & Transaction Auditing
-- Run AFTER migration.sql has been applied.
-- ================================================================

-- 1. Add membership expiry timestamp to users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Ensure transactions table has the audit columns we need
-- Add transaction_type to distinguish upgrade/downgrade/admin_override
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN transaction_type TEXT DEFAULT 'membership_upgrade';
  END IF;
END $$;

-- Add reference column for mock receipt IDs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'reference'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN reference TEXT DEFAULT NULL;
  END IF;
END $$;

-- 3. Backfill: any user currently marked 'member' without an expiry gets 30 days from now
UPDATE public.users
SET membership_expires_at = NOW() + INTERVAL '30 days'
WHERE membership_status = 'member' AND membership_expires_at IS NULL;
