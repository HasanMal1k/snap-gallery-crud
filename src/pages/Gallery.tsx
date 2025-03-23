
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client'; 
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhotoCard from '@/components/PhotoCard';
import { Grid, List, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

const Gallery = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for user session
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPhotos(data || []);
      } catch (error) {
        console.error('Error fetching photos:', error);
        toast({
          title: "Error loading gallery",
          description: "Please try again later.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [toast]);

  const handleDeletePhoto = (id: string) => {
    setPhotos(photos.filter(photo => photo.id !== id));
  };

  const filteredPhotos = photos.filter(photo => {
    const nameMatch = photo.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const descriptionMatch = photo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || descriptionMatch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Photo Gallery</h1>
              <p className="text-muted-foreground">Browse and manage your photo collection</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted/50'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              
              {user && (
                <Button onClick={() => navigate('/upload')}>
                  Upload
                </Button>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Loading gallery...</p>
              </div>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-secondary/30 rounded-lg p-8">
              <div className="text-4xl mb-4">📷</div>
              <h3 className="text-xl font-semibold mb-2">No photos found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {searchQuery 
                  ? "No photos match your search. Try a different search term."
                  : "Your gallery is empty. Upload some photos to get started."}
              </p>
              {user && !searchQuery && (
                <Button onClick={() => navigate('/upload')}>
                  Upload Your First Photo
                </Button>
              )}
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
              {!user && (
                <Button onClick={() => navigate('/login')}>
                  Sign In to Upload
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                : "flex flex-col space-y-4"
              }
            >
              {filteredPhotos.map((photo) => (
                <motion.div key={photo.id} variants={itemVariants}>
                  <PhotoCard 
                    photo={photo} 
                    onDelete={handleDeletePhoto} 
                    currentUserId={user?.id}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Gallery;
