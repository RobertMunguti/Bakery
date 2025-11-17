-- Fix the infinite recursion in profiles policies by dropping and recreating them correctly
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create correct policies without recursion
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- For admin access, we'll use a simpler approach that doesn't cause recursion
CREATE POLICY "Service role can access all profiles" 
ON public.profiles 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow authenticated users to view profiles for admin checks
CREATE POLICY "Authenticated users can view profiles for role checks" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);