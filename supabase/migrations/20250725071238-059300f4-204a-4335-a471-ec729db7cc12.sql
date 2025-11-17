-- Create cakes table for managing cake products
CREATE TABLE public.cakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table for tracking customer orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cake_id UUID REFERENCES public.cakes(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_date DATE,
  delivery_address TEXT,
  special_instructions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.cakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for cakes (public read, admin write)
CREATE POLICY "Anyone can view available cakes" ON public.cakes
  FOR SELECT USING (available = true);

CREATE POLICY "Admins can manage all cakes" ON public.cakes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_cakes_updated_at
  BEFORE UPDATE ON public.cakes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample cakes
INSERT INTO public.cakes (name, description, price, category, image_url) VALUES
  ('Elegant Rose Wedding Cake', 'Beautiful multi-tier wedding cake with fondant roses', 299.99, 'Wedding', '/placeholder.svg'),
  ('Chocolate Birthday Delight', 'Rich chocolate cake with ganache frosting', 45.99, 'Birthday', '/placeholder.svg'),
  ('Vanilla Dream', 'Classic vanilla sponge with buttercream', 35.99, 'Birthday', '/placeholder.svg'),
  ('Red Velvet Romance', 'Moist red velvet with cream cheese frosting', 49.99, 'Special', '/placeholder.svg'),
  ('Baby Shower Bliss', 'Adorable baby-themed cake with pastel colors', 65.99, 'Baby Shower', '/placeholder.svg');