
-- Add pending_approval support to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pending_admin_id uuid DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pending_role text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS requested_at timestamp with time zone DEFAULT NULL;

-- Create index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_profiles_pending_admin ON public.profiles(pending_admin_id) WHERE pending_admin_id IS NOT NULL;

-- RLS: Allow admins to view pending profiles that requested to join their environment
CREATE POLICY "Admins can view pending profiles for their tenant"
ON public.profiles
FOR SELECT
USING (
  -- Users can view their own profile
  auth.uid() = id
  OR
  -- Admins can view profiles pending approval for their admin ID
  (
    pending_admin_id IS NOT NULL AND
    public.has_role(auth.uid(), 'admin'::app_role) AND
    (
      -- Direct admin (pending_admin_id = their own ID)
      pending_admin_id = auth.uid()
      OR
      -- OR they are under the same master admin
      pending_admin_id = public.get_owner_admin_id(auth.uid())
    )
  )
);

-- Allow users to update their own pending fields (for self-registration)
CREATE POLICY "Users can set their own pending approval"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to approve/clear pending approval
CREATE POLICY "Admins can approve pending profiles"
ON public.profiles
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::app_role) AND
  pending_admin_id = public.get_owner_admin_id(auth.uid())
);
