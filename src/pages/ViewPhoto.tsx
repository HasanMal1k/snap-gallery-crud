
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import ThreeJsViewer from '@/components/ThreeJsViewer';
import Navbar from '@/components/Navbar';
import { ChevronLeft, Download, Trash2, Edit2, Share } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const ViewPhoto = () => {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
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
    const fetchPhoto = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Photo not found",
            description: "The requested photo could not be found.",
            variant: "destructive",
            duration: 3000,
          });
          navigate('/gallery');
          return;
        }
        
        setPhoto(data);
        setIsOwner(user?.id === data.user_id);
      } catch (error) {
        console.error('Error fetching photo:', error);
        toast({
          title: "Error loading photo",
          description: "Please try again later.",
          variant: "destructive",
          duration: 3000,
        });
        navigate('/gallery');
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id, navigate, toast, user]);

  useEffect(() => {
    if (photo && user) {
      setIsOwner(user.id === photo.user_id);
    }
  }, [photo, user]);

  const handleDelete = async () => {
    if (!photo || !isOwner) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this photo?');
    if (!confirmed) return;
    
    try {
      // Delete from the database
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);
        
      if (error) throw error;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([`${photo.user_id}/${photo.id}`]);
        
      if (storageError) throw storageError;
      
      toast({
        title: "Photo deleted successfully",
        duration: 3000,
      });
      
      navigate('/gallery');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error deleting photo",
        description: "Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDownload = () => {
    if (!photo) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      duration: 3000,
    });
  };

  const handleShare = async () => {
    if (!photo) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: photo.name || 'Shared Photo',
          text: photo.description || 'Check out this photo!',
          url: window.location.href,
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied to clipboard",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading photo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Photo not found</h2>
            <p className="text-muted-foreground mb-6">
              The photo you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/gallery')}>
              Return to Gallery
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/gallery')}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{photo.name || 'Untitled'}</h1>
                <p className="text-muted-foreground text-sm">
                  {photo.created_at && format(new Date(photo.created_at), 'PPP')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              {isOwner && (
                <>
                  <Link to={`/edit/${photo.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <motion.div 
              className="lg:col-span-3 bg-white/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden h-[500px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ThreeJsViewer imageUrl={photo.url} className="w-full h-full" />
            </motion.div>
            
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                    <p>{photo.name || 'Untitled'}</p>
                  </div>
                  
                  {photo.description && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                      <p>{photo.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Added</h3>
                    <p>{photo.created_at && format(new Date(photo.created_at), 'PPP')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Interactions</h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-full p-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 15L21 9M21 9H15M21 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>Drag to rotate the image</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-full p-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3V21M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>Scroll to zoom in/out</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-full p-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 12H3M3 12L9 6M3 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>Click back button to return to gallery</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewPhoto;
