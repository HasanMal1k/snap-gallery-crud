
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PhotoCardProps {
  photo: {
    id: string;
    name: string;
    description?: string;
    url: string;
    created_at: string;
    user_id: string;
  };
  onDelete: (id: string) => void;
  currentUserId?: string;
}

const PhotoCard = ({ photo, onDelete, currentUserId }: PhotoCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const isOwner = currentUserId && photo.user_id === currentUserId;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('Deleting photo:', photo.id);
      
      // Extract file name from the URL
      const url = new URL(photo.url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `${photo.user_id}/${fileName}`;
      
      console.log('Deleting file at path:', filePath);
      
      // Delete the photo from the database first
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);
        
      if (error) {
        console.error('Database deletion error:', error);
        throw error;
      }
      
      // Delete the photo from storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([filePath]);
        
      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue even if storage deletion fails
        console.warn('Database record deleted but file removal failed');
      } else {
        console.log('File removed successfully');
      }
      
      onDelete(photo.id);
      toast({
        title: "Photo deleted successfully",
        duration: 3000,
      });
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

  return (
    <Link 
      to={`/photo/${photo.id}`}
      className="group"
    >
      <div 
        className="relative overflow-hidden rounded-lg bg-secondary/30 aspect-square transition-transform duration-300 group-hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />
        
        <img
          src={photo.url}
          alt={photo.name || "Photo"}
          className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
          onLoad={() => setIsLoading(false)}
          style={{ opacity: isLoading ? 0 : 1 }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        
        <div className={`absolute bottom-0 left-0 w-full p-4 transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-10 opacity-0'}`}>
          <h3 className="text-white font-medium text-sm truncate shadow-sm">
            {photo.name || "Untitled"}
          </h3>
          {photo.description && (
            <p className="text-white/80 text-xs truncate mt-1">
              {photo.description}
            </p>
          )}
        </div>
        
        {isOwner && (
          <div className={`absolute top-2 right-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem asChild>
                  <Link to={`/edit/${photo.id}`} className="flex items-center cursor-pointer">
                    <Edit2 className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive flex items-center cursor-pointer" 
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PhotoCard;
