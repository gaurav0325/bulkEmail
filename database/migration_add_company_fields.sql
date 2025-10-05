-- Migration: Add additional_data and is_default fields to companies table
-- Date: October 5, 2025
-- Purpose: Store all company fields (email templates, portfolio, etc.) in JSONB column

-- Add additional_data JSONB column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'companies'
        AND column_name = 'additional_data'
    ) THEN
        ALTER TABLE public.companies
        ADD COLUMN additional_data JSONB DEFAULT '{}'::jsonb;

        COMMENT ON COLUMN public.companies.additional_data IS 'Store all additional company fields (email templates, portfolio points, offerings, images, etc.)';
    END IF;
END $$;

-- Add is_default BOOLEAN column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'companies'
        AND column_name = 'is_default'
    ) THEN
        ALTER TABLE public.companies
        ADD COLUMN is_default BOOLEAN DEFAULT FALSE;

        COMMENT ON COLUMN public.companies.is_default IS 'Mark one company as default for email personalization';

        -- Create index for faster default company lookup
        CREATE INDEX idx_companies_default ON public.companies(user_id, is_default) WHERE is_default = TRUE;
    END IF;
END $$;

-- Update comments
COMMENT ON TABLE public.companies IS 'Company information for each user with full data stored in additional_data JSONB column';

-- Verify migration
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'companies'
AND column_name IN ('additional_data', 'is_default')
ORDER BY column_name;
