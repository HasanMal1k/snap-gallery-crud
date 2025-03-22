
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

const Index = () => {
  const [recentPhotos, setRecentPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentPhotos(data || []);
      } catch (error) {
        console.error('Error fetching recent photos:', error);
        toast({
          title: "Error loading recent photos",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentPhotos();
  }, [toast]);

  return (
    <div className="relative min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden px-4">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(236, 242, 253, 0.7), rgba(248, 250, 252, 0.8))",
          }}
        />
        
        <motion.div 
          className="relative z-10 max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="block">Your photos,</span>
            <span className="block">in stunning 3D space</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            PixelVault reimagines your photo gallery with immersive
            3D visualization. Upload, manage and experience your memories
            in a whole new dimension.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/gallery">
              <Button size="lg" className="px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                Explore Gallery
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 rounded-full">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="animate-bounce"
          >
            <div className="w-8 h-12 border-2 border-primary rounded-full flex justify-center items-start p-1">
              <div className="w-1 h-2 bg-primary rounded-full animate-ping"></div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Reimagine Your Photo Experience
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Combining minimalist design with cutting-edge technology
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "3D Visualization",
                description: "Experience your photos in an interactive three-dimensional space.",
                icon: "📐"
              },
              {
                title: "Cloud Storage",
                description: "Securely store and access your photos from anywhere.",
                icon: "☁️"
              },
              {
                title: "Intuitive Management",
                description: "Easily organize, edit, and share your photo collection.",
                icon: "🔍"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-secondary/30 rounded-2xl p-8 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <div className="w-12 h-12 mb-6 text-3xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Recent Photos Section */}
      {!isLoading && recentPhotos.length > 0 && (
        <section className="py-24 px-4 bg-secondary/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Recently Added
              </motion.h2>
              <motion.p 
                className="text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Discover the latest additions to our gallery
              </motion.p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {recentPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <Link to={`/photo/${photo.id}`}>
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt={photo.name || 'Photo'} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium truncate">{photo.name || 'Untitled'}</h3>
                      {photo.description && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {photo.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/gallery">
                <Button variant="outline" size="lg" className="rounded-full">
                  View All Photos
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="py-24 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to experience your photos in 3D?
          </motion.h2>
          <motion.p 
            className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Create your account today and start uploading your memories
            to our immersive 3D gallery.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/login">
              <Button 
                size="lg" 
                variant="secondary"
                className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 bg-background border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-semibold">PixelVault</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Your photos in a new dimension
              </p>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/gallery" className="text-muted-foreground hover:text-foreground transition-colors">
                Gallery
              </Link>
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PixelVault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
