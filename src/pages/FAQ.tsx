import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Navigation from "@/components/Navigation";

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    {
      question: "How far in advance should I place my cake order?",
      answer: "We recommend placing your order at least 1-2 weeks in advance for simple designs, and 2-4 weeks for complex wedding cakes or large events. This ensures we have enough time to create your perfect cake and accommodate any specific requirements."
    },
    {
      question: "Do you offer delivery services?",
      answer: "Yes! We offer delivery within a 30km radius of our bakery. Delivery fees start at KSH 1,500 and vary based on distance and cake size. We also offer convenient pickup options at our store."
    },
    {
      question: "Can you accommodate dietary restrictions?",
      answer: "Absolutely! We can create gluten-free, sugar-free, vegan, and dairy-free options. Please mention any dietary restrictions when placing your order, and we'll work with you to create a delicious cake that meets your needs."
    },
    {
      question: "What are your cake sizes and serving portions?",
      answer: "Our cakes range from 0.5kg to 5kg. As a general guide: 0.5kg serves 4-6 people, 1kg serves 8-10 people, 2kg serves 16-20 people, and 3kg serves 24-30 people. We can provide specific serving recommendations based on your event size."
    },
    {
      question: "Can I see my cake design before it's made?",
      answer: "For complex custom designs, we can provide sketches or digital mockups for your approval before starting. This service is included for wedding cakes and available for other custom orders upon request."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash, credit cards, debit cards, and mobile payments. A 50% deposit is required when placing your order, with the balance due upon pickup or delivery."
    },
    {
      question: "How should I store my cake?",
      answer: "Most of our cakes should be stored in the refrigerator and brought to room temperature 30 minutes before serving for the best taste and texture. Fondant cakes should be stored at room temperature. We'll provide specific storage instructions with your cake."
    },
    {
      question: "Do you offer cake tastings?",
      answer: "Yes! We offer cake tasting sessions by appointment, especially for wedding cakes. Contact us to schedule a tasting where you can try different flavors and discuss your design ideas with our bakers."
    },
    {
      question: "What's included in the cake price?",
      answer: "Our prices include the cake, basic decoration, and packaging. Additional charges may apply for complex designs, special dietary requirements, or premium ingredients like fresh flowers or imported chocolates."
    },
    {
      question: "Can you replicate a cake from a photo?",
      answer: "We love working from inspiration photos! While we may not be able to create an exact replica due to copyright and technical constraints, we can create a beautiful cake inspired by your photo that captures the same style and feel."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about our cakes and services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card rounded-lg shadow-card border-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-smooth rounded-lg"
                >
                  <h3 className="text-lg font-serif font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12 p-8 bg-gradient-card rounded-lg">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-6">
              Don't hesitate to reach out! We're here to help make your cake dreams come true.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+1234567890"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
              >
                Call Us Now
              </a>
              <a
                href="mailto:hello@sweetdreamsbakery.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-smooth"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;