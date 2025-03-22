
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeJsViewerProps {
  imageUrl: string;
  className?: string;
}

const ThreeJsViewer = ({ imageUrl, className = '' }: ThreeJsViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { clientWidth, clientHeight } = container;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf5f5f5);

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      clientWidth / clientHeight, 
      0.1, 
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 1.5;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    rendererRef.current = renderer;
    renderer.setSize(clientWidth, clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Load image texture
    textureLoader.load(
      imageUrl,
      (texture) => {
        textureRef.current = texture;
        
        const aspectRatio = texture.image.width / texture.image.height;
        
        // Create geometry for the image plane
        let geometry;
        if (aspectRatio >= 1) {
          // Landscape or square
          geometry = new THREE.PlaneGeometry(1, 1 / aspectRatio);
        } else {
          // Portrait
          geometry = new THREE.PlaneGeometry(aspectRatio, 1);
        }
        
        // Create material with the loaded texture
        const material = new THREE.MeshBasicMaterial({ 
          map: texture,
          side: THREE.DoubleSide
        });
        materialRef.current = material;
        
        // Create mesh and add to scene
        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;
        scene.add(mesh);
        
        // Add subtle ambient animation
        const animate = () => {
          if (!meshRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
          
          if (!isDraggingRef.current) {
            meshRef.current.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1;
            meshRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.05;
          }
          
          rendererRef.current.render(sceneRef.current, cameraRef.current);
          animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animate();
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
      }
    );

    // Event listeners for interaction
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !meshRef.current) return;
      
      const deltaMove = {
        x: e.clientX - previousMousePositionRef.current.x,
        y: e.clientY - previousMousePositionRef.current.y
      };
      
      meshRef.current.rotation.y += deltaMove.x * 0.01;
      meshRef.current.rotation.x += deltaMove.y * 0.01;
      
      previousMousePositionRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!cameraRef.current) return;
      
      // Zoom in/out
      cameraRef.current.position.z += e.deltaY * 0.001;
      
      // Limit zoom range
      cameraRef.current.position.z = Math.max(0.5, Math.min(3, cameraRef.current.position.z));
    };

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const { clientWidth, clientHeight } = containerRef.current;
      
      cameraRef.current.aspect = clientWidth / clientHeight;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(clientWidth, clientHeight);
    };

    // Add event listeners
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose of resources
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
      }
      
      if (materialRef.current) {
        materialRef.current.dispose();
      }
      
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, [imageUrl]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className}`}
    />
  );
};

export default ThreeJsViewer;
