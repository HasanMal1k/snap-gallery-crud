
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const EditPhoto = () => {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for user session
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to edit photos.",
          variant: "destructive",
          duration: 3000,
        });
        navigate('/login');
        return;
      }
      setUser(data.session.user);
    };
    checkUser();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!id || !user) return;
      
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
            description: "The photo you're trying to edit could not be found.",
            variant: "destructive",
            duration: 3000,
          });
          navigate('/gallery');
          return;
        }
        
        // Check if user is the owner
        if (data.user_id !== user.id) {
          toast({
            title: "Permission denied",
            description: "You don't have permission to edit this photo.",
            variant: "destructive",
            duration: 3000,
          });
          navigate('/gallery');
          return;
        }
        
        setPhoto(data);
        setName(data.name || '');
        setDescription(data.description || '');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photo || !id) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('photos')
        .update({
          name,
          description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Photo updated successfully",
        duration: 3000,
      });
      
      navigate(`/photo/${id}`);
    } catch (error) {
      console.error('Error updating photo:', error);
      toast({
        title: "Error updating photo",
        description: "Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading photo details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-3xl mx-auto py-32 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl border p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/photo/${id}`)}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Photo</h1>
              <p className="text-muted-foreground">
                Update details for your photo
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              {photo && photo.url && (
                <img
                  src={photo.url}
                  alt={name || "Photo"}
                  className="w-full aspect-square object-cover rounded-md shadow-md"
                />
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Photo Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name for your photo"
                  required
                  disabled={saving}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a brief description"
                  rows={3}
                  disabled={saving}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/photo/${id}`)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EditPhoto;
