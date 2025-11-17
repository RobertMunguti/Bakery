-- Create storage bucket for cake images
INSERT INTO storage.buckets (id, name, public) VALUES ('cake-images', 'cake-images', true);

-- Create storage policies for cake images
CREATE POLICY "Anyone can view cake images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cake-images');

CREATE POLICY "Authenticated users can upload cake images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cake-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cake-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add customer_reference_image column to orders table
ALTER TABLE public.orders ADD COLUMN customer_reference_image TEXT;