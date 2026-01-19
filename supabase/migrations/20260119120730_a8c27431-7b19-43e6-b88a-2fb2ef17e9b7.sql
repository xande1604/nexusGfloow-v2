-- Remove the foreign key constraint that causes the issue
-- The used_by_user_id doesn't need to reference auth.users since 
-- the user might not exist in the exact moment of validation

ALTER TABLE public.access_keys 
DROP CONSTRAINT IF EXISTS access_keys_used_by_user_id_fkey;