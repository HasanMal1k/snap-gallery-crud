
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import { Upload, X, ImagePlus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

const UploadPage = () => {
  const [user, setUser] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for user session and redirect if not logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload photos.",
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

  // Create a preview when file is selected
  useEffect(() => {
    if (!uploadedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(uploadedFile);
    setPreview(objectUrl);

    // Set name from filename by default if not set
    if (!name) {
      const fileName = uploadedFile.name.split('.').slice(0, -1).join('.');
      setName(fileName);
    }

    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [uploadedFile, name]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setUploadedFile(null);
      return;
    }
    setUploadedFile(e.target.files[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile || !user) return;
    
    setUploading(true);
    
    try {
      // Generate a unique ID for the photo
      const photoId = uuidv4();
      const fileExt = uploadedFile.name.split('.').pop();
      const filePath = `${user.id}/${photoId}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, uploadedFile);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData.publicUrl;
      
      // Store photo metadata in the database
      const { error: dbError } = await supabase
        .from('photos')
        .insert([
          {
            id: photoId,
            name,
            description,
            url: publicUrl,
            user_id: user.id,
          },
        ]);
        
      if (dbError) throw dbError;
      
      toast({
        title: "Photo uploaded successfully",
        duration: 3000,
      });
      
      navigate('/gallery');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error uploading photo",
        description: "Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setPreview(null);
    setName('');
    setDescription('');
  };

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Upload Photo</h1>
            <p className="text-muted-foreground">
              Add a new photo to your 3D gallery
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {!preview ? (
                <div className="py-12">
                  <div className="flex justify-center mb-4">
                    <ImagePlus className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">
                    Drag and drop your photo here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Supports: JPG, PNG, WebP (Max 10MB)
                  </p>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-md"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Photo Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name for your photo"
                  required
                  disabled={uploading}
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
                  disabled={uploading}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/gallery')}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!uploadedFile || uploading}
              >
                {uploading ? "Uploading..." : "Upload Photo"}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default UploadPage;
