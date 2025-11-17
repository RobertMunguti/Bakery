import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, Phone, User, LogOut, Settings } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut, isAdmin } = useAuth();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/gallery", label: "Gallery" },
    { path: "/select-cake", label: "Order Cake" },
    { path: "/faq", label: "FAQ" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">HB</span>
            </div>
            <span className="font-serif font-semibold text-xl text-foreground">
              Hadassah Bakes and bites
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-smooth hover:text-primary ${
                  isActive(item.path) ? "text-primary" : "text-foreground/70"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="soft" size="sm" asChild>
              <Link to="/select-cake">
                <ShoppingBag className="w-4 h-4" />
                Order Now
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="tel:+1234567890">
                <Phone className="w-4 h-4" />
              </a>
            </Button>
            
            {/* Auth Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4" />
                    {profile?.full_name || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">
                      {profile?.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-card">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block py-2 text-sm font-medium transition-smooth ${
                    isActive(item.path) ? "text-primary" : "text-foreground/70"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button variant="soft" className="w-full" asChild>
                  <Link to="/select-cake" onClick={() => setIsOpen(false)}>
                    <ShoppingBag className="w-4 h-4" />
                    Order Now
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <a href="tel:+1234567890">
                    <Phone className="w-4 h-4" />
                    Call Us
                  </a>
                </Button>
                
                {/* Mobile Auth Section */}
                {user ? (
                  <>
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">
                        {profile?.full_name || 'Account'} ({profile?.role === 'admin' ? 'Admin' : 'User'})
                      </p>
                      {isAdmin && (
                        <Button variant="outline" className="w-full mb-2" asChild>
                          <Link to="/admin" onClick={() => setIsOpen(false)}>
                            <Settings className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" className="w-full" onClick={() => { signOut(); setIsOpen(false); }}>
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <User className="w-4 h-4" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;