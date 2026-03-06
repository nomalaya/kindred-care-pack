import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-cta fill-cta" />
          <span className="text-xl font-bold text-foreground">CashForCause</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/causes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Causes
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                My Donations
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                <User className="h-4 w-4 mr-1" /> Sign in
              </Button>
            </Link>
          )}
          <Link to="/causes">
            <Button className="bg-cta hover:bg-cta/90 text-cta-foreground" size="sm">
              Start helping
            </Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-b p-4 space-y-3">
          <Link to="/causes" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Causes</Link>
          <Link to="/how-it-works" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>How it works</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>My Donations</Link>
              <button className="block text-sm font-medium py-2" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</button>
            </>
          ) : (
            <Link to="/auth" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Sign in</Link>
          )}
          <Link to="/causes" onClick={() => setMobileOpen(false)}>
            <Button className="w-full bg-cta hover:bg-cta/90 text-cta-foreground">Start helping</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
