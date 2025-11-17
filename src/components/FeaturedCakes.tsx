import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FeaturedCakes = () => {
  const cakes = [
    {
      id: 1,
      name: "Elegant Rose Wedding Cake",
      category: "Wedding",
      rating: 5,
      reviews: 24,
      price: "From KSH 12,000",
      image: "/placeholder.svg?height=300&width=300",
      description: "Three-tier masterpiece with delicate sugar roses"
    },
    {
      id: 2,
      name: "Rainbow Unicorn Birthday",
      category: "Birthday",
      rating: 5,
      reviews: 18,
      price: "From KSH 8,500",
      image: "/placeholder.svg?height=300&width=300",
      description: "Magical unicorn design with rainbow layers"
    },
    {
      id: 3,
      name: "Baby Shower Delight",
      category: "Baby Shower",
      rating: 5,
      reviews: 12,
      price: "From KSH 6,500",
      image: "/placeholder.svg?height=300&width=300",
      description: "Adorable baby-themed cake with pastel colors"
    }
  ];

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
            Featured Creations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular cake designs, each crafted with love and attention to detail
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {cakes.map((cake) => (
            <Card key={cake.id} className="group overflow-hidden shadow-card hover:shadow-hero transition-smooth border-0">
              <div className="relative overflow-hidden">
                <img
                  src={cake.image}
                  alt={cake.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-smooth"
                />
                <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-smooth">
                  <Heart className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </button>
                <div className="absolute top-4 left-4 bg-cake-gold text-foreground px-2 py-1 rounded-full text-xs font-medium">
                  {cake.category}
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[...Array(cake.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-cake-gold text-cake-gold" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({cake.reviews} reviews)
                  </span>
                </div>
                
                <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
                  {cake.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {cake.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">
                    {cake.price}
                  </span>
                  <Button variant="soft" size="sm">
                    Order Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="elegant" size="lg" asChild>
            <Link to="/gallery">
              View All Cakes
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCakes;