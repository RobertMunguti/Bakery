import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Cake {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  available: boolean;
  created_at: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_date: string;
  delivery_address: string;
  special_instructions: string;
  status: string;
  total_amount: number;
  created_at: string;
  cake_id: string;
  customer_reference_image?: string;
  cakes?: {
    name: string;
    price: number;
  };
}

const AdminPanel = () => {
  const { isAdmin, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingCake, setEditingCake] = useState<Cake | null>(null);
  const [isAddingCake, setIsAddingCake] = useState(false);
  const { toast } = useToast();

  const [cakeForm, setCakeForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    available: true
  });

  useEffect(() => {
    if (!loading && isAdmin) {
      fetchOrders();
      fetchCakes();
    }
  }, [loading, isAdmin]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          cakes (
            name,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    }
  };

  const fetchCakes = async () => {
    try {
      const { data, error } = await supabase
        .from('cakes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCakes(data || []);
    } catch (error) {
      console.error('Error fetching cakes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cakes",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Order status updated"
      });
      
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handleCakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const cakeData = {
        ...cakeForm,
        price: parseFloat(cakeForm.price)
      };

      if (editingCake) {
        const { error } = await supabase
          .from('cakes')
          .update(cakeData)
          .eq('id', editingCake.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Cake updated successfully" });
      } else {
        const { error } = await supabase
          .from('cakes')
          .insert([cakeData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Cake added successfully" });
      }

      setCakeForm({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category: '',
        available: true
      });
      setEditingCake(null);
      setIsAddingCake(false);
      fetchCakes();
    } catch (error) {
      console.error('Error saving cake:', error);
      toast({
        title: "Error",
        description: "Failed to save cake",
        variant: "destructive"
      });
    }
  };

  const deleteCake = async (cakeId: string) => {
    try {
      const { error } = await supabase
        .from('cakes')
        .delete()
        .eq('id', cakeId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Cake deleted successfully"
      });
      
      fetchCakes();
    } catch (error) {
      console.error('Error deleting cake:', error);
      toast({
        title: "Error",
        description: "Failed to delete cake",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `cake-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cake-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('cake-images')
        .getPublicUrl(filePath);

      setCakeForm(prev => ({ ...prev, image_url: data.publicUrl }));

      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  const startEdit = (cake: Cake) => {
    setEditingCake(cake);
    setCakeForm({
      name: cake.name,
      description: cake.description || '',
      price: cake.price.toString(),
      image_url: cake.image_url || '',
      category: cake.category || '',
      available: cake.available
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You must be an admin to access this panel.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Manage orders and cakes</p>
        </div>
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Website
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="cakes">Cakes</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>View and manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div>Loading orders...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Cake</TableHead>
                      <TableHead>Reference Image</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{order.cakes?.name || 'Custom Order'}</TableCell>
                        <TableCell>
                          {order.customer_reference_image ? (
                            <a 
                              href={order.customer_reference_image} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View Image
                            </a>
                          ) : (
                            <span className="text-muted-foreground">No image</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'in_progress' ? 'secondary' :
                            order.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>KSH {order.total_amount}</TableCell>
                        <TableCell>{order.delivery_date}</TableCell>
                        <TableCell>
                          <Select onValueChange={(value) => updateOrderStatus(order.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cakes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cakes Management</CardTitle>
                <CardDescription>Add, edit, and manage cake products</CardDescription>
              </div>
              <Dialog open={isAddingCake} onOpenChange={setIsAddingCake}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Cake
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Cake</DialogTitle>
                    <DialogDescription>Create a new cake product</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCakeSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={cakeForm.name}
                        onChange={(e) => setCakeForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={cakeForm.description}
                        onChange={(e) => setCakeForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={cakeForm.price}
                        onChange={(e) => setCakeForm(prev => ({ ...prev, price: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={cakeForm.category}
                        onChange={(e) => setCakeForm(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      {cakeForm.image_url && (
                        <div className="mt-2">
                          <img src={cakeForm.image_url} alt="Preview" className="w-20 h-20 object-cover rounded" />
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full">Add Cake</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div>Loading cakes...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cakes.map((cake) => (
                      <TableRow key={cake.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{cake.name}</div>
                            <div className="text-sm text-muted-foreground">{cake.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{cake.category}</TableCell>
                        <TableCell>KSH {cake.price}</TableCell>
                        <TableCell>
                          <Badge variant={cake.available ? 'default' : 'secondary'}>
                            {cake.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={editingCake?.id === cake.id} onOpenChange={(open) => !open && setEditingCake(null)}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEdit(cake)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit Cake</DialogTitle>
                                  <DialogDescription>Update cake information</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCakeSubmit} className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input
                                      id="edit-name"
                                      value={cakeForm.name}
                                      onChange={(e) => setCakeForm(prev => ({ ...prev, name: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Textarea
                                      id="edit-description"
                                      value={cakeForm.description}
                                      onChange={(e) => setCakeForm(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-price">Price</Label>
                                    <Input
                                      id="edit-price"
                                      type="number"
                                      step="0.01"
                                      value={cakeForm.price}
                                      onChange={(e) => setCakeForm(prev => ({ ...prev, price: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Input
                                      id="edit-category"
                                      value={cakeForm.category}
                                      onChange={(e) => setCakeForm(prev => ({ ...prev, category: e.target.value }))}
                                    />
                                  </div>
                                   <div>
                                     <Label htmlFor="edit-image_url">Image</Label>
                                     <Input
                                       id="edit-image_url"
                                       type="file"
                                       accept="image/*"
                                       onChange={handleImageUpload}
                                     />
                                     {cakeForm.image_url && (
                                       <div className="mt-2">
                                         <img src={cakeForm.image_url} alt="Preview" className="w-20 h-20 object-cover rounded" />
                                       </div>
                                     )}
                                   </div>
                                   <div>
                                     <Label htmlFor="edit-available">Available</Label>
                                     <Select onValueChange={(value) => setCakeForm(prev => ({ ...prev, available: value === 'true' }))}>
                                       <SelectTrigger>
                                         <SelectValue placeholder={cakeForm.available ? 'Available' : 'Unavailable'} />
                                       </SelectTrigger>
                                       <SelectContent>
                                         <SelectItem value="true">Available</SelectItem>
                                         <SelectItem value="false">Unavailable</SelectItem>
                                       </SelectContent>
                                      </Select>
                                    </div>
                                   <Button type="submit" className="w-full">Update Cake</Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteCake(cake.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;