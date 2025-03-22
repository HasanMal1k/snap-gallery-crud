
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    checkSession();

    // Set up auth subscription
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    // Scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-white/90 backdrop-blur-md shadow-sm' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="text-xl font-semibold tracking-tight transition-opacity duration-200 hover:opacity-80"
        >
          PixelVault
        </Link>
        
        <div className="flex items-center space-x-1 md:space-x-4">
          <Link 
            to="/gallery" 
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 
              ${location.pathname === '/gallery' 
                ? 'bg-secondary text-primary' 
                : 'hover:bg-secondary/50'}`}
          >
            Gallery
          </Link>
          
          {user ? (
            <>
              <Link 
                to="/upload" 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 
                  ${location.pathname === '/upload' 
                    ? 'bg-secondary text-primary' 
                    : 'hover:bg-secondary/50'}`}
              >
                Upload
              </Link>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-sm font-medium"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button 
                variant="outline" 
                size="sm"
                className="text-sm font-medium"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
