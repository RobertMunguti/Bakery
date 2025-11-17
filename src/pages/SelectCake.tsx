import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Upload, ShoppingBag } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";

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

const SelectCake = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    category: "",
    weight: "",
    flavor: "",
    theme: "",
    icing: "",
    eventDate: "",
    deliveryOption: "",
    specialRequests: "",
    referenceImage: null as File | null,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
  });

  const categories = [
    "Wedding Cake",
    "Birthday Cake", 
    "Baby Shower Cake",
    "Graduation Cake",
    "Corporate Cake",
    "Anniversary Cake",
    "Custom Design"
  ];

  const weights = [
    "0.5kg", "1kg", "1.5kg", "2kg", "2.5kg", "3kg", "3.5kg", "4kg", "4.5kg", "5kg"
  ];

  const flavors = [
    "Vanilla",
    "Chocolate", 
    "Red Velvet",
    "Strawberry",
    "Lemon",
    "Carrot",
    "Black Forest",
    "Tiramisu",
    "Coconut",
    "Funfetti"
  ];

  const icingTypes = [
    "Buttercream",
    "Fondant", 
    "Cream Cheese",
    "Royal Icing",
    "Ganache",
    "Whipped Cream"
  ];

  // Fetch selected cake details and prefill form
  useEffect(() => {
    const cakeId = searchParams.get('cake');
    if (cakeId) {
      fetchCakeDetails(cakeId);
    }
    
    // Prefill customer information if user is logged in
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        customerName: profile.full_name || '',
        customerEmail: profile.email || user.email || '',
      }));
    }
  }, [searchParams, user, profile]);

  const fetchCakeDetails = async (cakeId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cakes')
        .select('*')
        .eq('id', cakeId)
        .single();

      if (error) throw error;
      
      setSelectedCake(data);
      
      // Prefill form with cake details
      setFormData(prev => ({
        ...prev,
        category: data.category || "",
        theme: `Based on: ${data.name} - ${data.description || 'Please specify your design preferences'}`
      }));
      
      toast({
        title: "Cake Selected",
        description: `${data.name} has been selected as your reference design.`
      });
    } catch (error) {
      console.error('Error fetching cake details:', error);
      toast({
        title: "Error",
        description: "Failed to load cake details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Basic validation
    if (!formData.category || !formData.weight || !formData.flavor || !formData.eventDate || 
        !formData.customerName || !formData.customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    if (formData.deliveryOption === "delivery" && !formData.deliveryAddress) {
      toast({
        title: "Missing Delivery Address",
        description: "Please provide a delivery address for home delivery.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload reference image if provided
      let imageUrl = null;
      if (formData.referenceImage) {
        try {
          const fileExt = formData.referenceImage.name.split('.').pop();
          const fileName = `customer-${Date.now()}.${fileExt}`;
          const filePath = `cake-images/customer-references/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('cake-images')
            .upload(filePath, formData.referenceImage);

          if (uploadError) throw uploadError;

          const { data: imageData } = supabase.storage
            .from('cake-images')
            .getPublicUrl(filePath);

          imageUrl = imageData.publicUrl;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Image Upload Failed",
            description: "Failed to upload reference image, but order will still be submitted.",
            variant: "destructive"
          });
        }
      }

      // Calculate estimated price based on weight (simplified pricing)
      const weightNum = parseFloat(formData.weight.replace('kg', ''));
      const estimatedPrice = weightNum * 2500; // KSH 2500 per kg base price

      const orderData = {
        user_id: user?.id || null,
        cake_id: selectedCake?.id || null,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone || null,
        delivery_date: formData.eventDate,
        delivery_address: formData.deliveryOption === "delivery" ? formData.deliveryAddress : null,
        total_amount: estimatedPrice,
        customer_reference_image: imageUrl,
        special_instructions: `Selected Cake: ${selectedCake?.name || 'Custom Design'}, Category: ${formData.category}, Weight: ${formData.weight}, Flavor: ${formData.flavor}, Icing: ${formData.icing || 'Not specified'}, Theme: ${formData.theme || 'Not specified'}, Delivery: ${formData.deliveryOption}, Special Requests: ${formData.specialRequests || 'None'}`,
        status: 'pending'
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) {
        console.error('Error creating order:', error);
        toast({
          title: "Order Failed",
          description: "There was an error submitting your order. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Order Submitted!",
        description: `Your cake order (est. KSH ${estimatedPrice}) has been submitted. We'll contact you within 24 hours to confirm.`,
      });

      // Reset form
      setFormData({
        category: "",
        weight: "",
        flavor: "",
        theme: "",
        icing: "",
        eventDate: "",
        deliveryOption: "",
        specialRequests: "",
        referenceImage: null,
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        deliveryAddress: "",
      });
      
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Order Failed",
        description: "There was an error submitting your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, referenceImage: file }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              {selectedCake ? `Customize: ${selectedCake.name}` : "Design Your Perfect Cake"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {selectedCake 
                ? `Based on your selected design. Estimated price: KSH ${selectedCake.price.toLocaleString()}` 
                : "Tell us about your dream cake and we'll bring it to life"}
            </p>
            {selectedCake && (
              <div className="mt-6">
                <Card className="max-w-md mx-auto shadow-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={selectedCake.image_url || "/placeholder.svg?height=80&width=80"} 
                        alt={selectedCake.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="text-left">
                        <h3 className="font-serif font-semibold">{selectedCake.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedCake.description}</p>
                        <p className="text-primary font-medium">Base: KSH {selectedCake.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="font-serif">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="category">Cake Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="weight">Cake Weight *</Label>
                    <Select value={formData.weight} onValueChange={(value) => setFormData(prev => ({ ...prev, weight: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select weight" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        {weights.map((weight) => (
                          <SelectItem key={weight} value={weight}>
                            {weight}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="flavor">Preferred Flavor *</Label>
                    <Select value={formData.flavor} onValueChange={(value) => setFormData(prev => ({ ...prev, flavor: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select flavor" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        {flavors.map((flavor) => (
                          <SelectItem key={flavor} value={flavor}>
                            {flavor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="icing">Icing Type</Label>
                    <Select value={formData.icing} onValueChange={(value) => setFormData(prev => ({ ...prev, icing: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select icing type" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        {icingTypes.map((icing) => (
                          <SelectItem key={icing} value={icing}>
                            {icing}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design Details */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="font-serif">Design Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="theme">Theme/Design Description</Label>
                  <Textarea
                    id="theme"
                    placeholder="Describe your desired theme, colors, decorations, etc."
                    value={formData.theme}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="reference-image">Reference Image (Optional)</Label>
                  <div className="mt-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-smooth">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload reference image
                        </p>
                        {formData.referenceImage && (
                          <p className="text-xs text-primary mt-2">
                            File selected: {formData.referenceImage.name}
                          </p>
                        )}
                      </div>
                      <Input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="font-serif">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="customer-name">Full Name *</Label>
                    <Input
                      id="customer-name"
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customer-email">Email Address *</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customer-phone">Phone Number</Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Event & Delivery */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="font-serif">Event & Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="event-date">Event Date *</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Delivery Option *</Label>
                    <RadioGroup 
                      className="mt-2"
                      onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryOption: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup">Store Pickup</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery">Home Delivery</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {formData.deliveryOption === "delivery" && (
                  <div>
                    <Label htmlFor="delivery-address">Delivery Address *</Label>
                    <Textarea
                      id="delivery-address"
                      placeholder="Enter complete delivery address..."
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="special-requests">Special Requests</Label>
                  <Textarea
                    id="special-requests"
                    placeholder="Any additional requests or dietary restrictions..."
                    value={formData.specialRequests}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button type="submit" variant="hero" size="lg" disabled={isSubmitting}>
                <ShoppingBag className="w-5 h-5" />
                {isSubmitting ? "Submitting..." : "Submit Cake Order"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SelectCake;