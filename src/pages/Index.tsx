import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturedCakes from "@/components/FeaturedCakes";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeaturedCakes />
      
      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-foreground mb-6">
                About Hadassah Bakes and bites
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                For over 10 years, we've been creating magical moments through our custom-designed cakes. 
                Every cake is handcrafted with love, using only the finest ingredients and attention to detail 
                that makes your special occasion truly unforgettable.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                From intimate birthday celebrations to grand wedding receptions, we specialize in bringing 
                your cake dreams to life with beautiful designs that taste as amazing as they look.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/gallery" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
                >
                  View Our Work
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-smooth"
                >
                  Get In Touch
                </a>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/placeholder.svg?height=500&width=500" 
                alt="Our bakery" 
                className="rounded-lg shadow-hero w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Ready to Create Your Dream Cake?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's work together to design and create the perfect cake for your special occasion.
          </p>
          <a 
            href="/select-cake" 
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-md hover:bg-white/90 transition-smooth font-medium text-lg"
          >
            Start Your Order
          </a>
        </div>
      </section>
    </div>
  );
};

export default Index;
