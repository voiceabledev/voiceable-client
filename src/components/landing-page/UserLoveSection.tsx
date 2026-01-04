import { Heart } from "lucide-react";

const testimonials = [
  { name: "Sarah M.", role: "E-commerce Director", company: "StyleHub" },
  { name: "Jennifer K.", role: "Customer Success Manager", company: "Retail Pro" },
  { name: "Michelle R.", role: "Operations Manager", company: "QuickBite Restaurants" },
  { name: "Amanda T.", role: "COO", company: "Foodie Express" },
  { name: "Lisa P.", role: "Store Manager", company: "Urban Retail Co" },
  { name: "Rachel W.", role: "Restaurant Owner", company: "The Local Bistro" },
];

const UserLoveSection = () => {
  return (
    <section className="py-32 overflow-hidden">
      <div className="container mx-auto px-6 mb-12">
        <div className="text-center">
          {/* Badge */}
          <div className="feature-pill mb-8 inline-flex">
            <Heart className="w-4 h-4 fill-pink text-pink" />
            <span>User Love</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-purple">Loved by Retail & Restaurant Teams</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Retailers, e-commerce brands, restaurants, and QSR operators
            around the country all rely on Operator to handle their
            customer service and order management tasks.
          </p>
        </div>
      </div>

      {/* Testimonial photos carousel */}
      <div className="relative">
        <div className="flex gap-4 animate-scroll-left">
          {[...testimonials, ...testimonials].map((person, index) => (
            <div 
              key={index}
              className="flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden relative group"
            >
              {/* Placeholder gradient background for profile photos */}
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-card" />
              
              {/* Silhouette placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-secondary/50 flex items-center justify-center">
                  <svg className="w-16 h-16 text-muted-foreground/50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-semibold text-sm">{person.name}</p>
                  <p className="text-xs text-muted-foreground">{person.role}</p>
                  <p className="text-xs text-primary">{person.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserLoveSection;

