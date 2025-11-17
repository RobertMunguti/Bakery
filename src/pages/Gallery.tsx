import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Filter } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCakes();
  }, []);

  const fetchCakes = async () => {
    try {
      const { data, error } = await supabase
        .from('cakes')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCakes(data || []);
      
      // Extract unique categories from cakes
      const uniqueCategories = ["All", ...new Set(data?.map(cake => cake.category).filter(Boolean) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching cakes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cakes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCakes = selectedCategory === "All" 
    ? cakes 
    : cakes.filter(cake => cake.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              Our Cake Gallery
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse through our collection of beautifully crafted cakes for every occasion
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "soft" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="transition-smooth"
              >
                <Filter className="w-4 h-4" />
                {category}
              </Button>
            ))}
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading cakes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCakes.map((cake) => (
                <Card key={cake.id} className="group overflow-hidden shadow-card hover:shadow-hero transition-smooth border-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={cake.image_url || "/placeholder.svg?height=400&width=400"}
                      alt={cake.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-smooth"
                    />
                    <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-smooth opacity-0 group-hover:opacity-100">
                      <Heart className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </button>
                    {cake.category && (
                      <div className="absolute top-4 left-4 bg-cake-gold text-foreground px-2 py-1 rounded-full text-xs font-medium">
                        {cake.category}
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
                      {cake.name}
                    </h3>
                    {cake.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {cake.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary">
                        KSH {cake.price.toLocaleString()}
                      </span>
                    </div>
                    <Link to={`/select-cake?cake=${cake.id}`}>
                      <Button variant="soft" size="sm" className="w-full">
                        Select This Design
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredCakes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No cakes found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;