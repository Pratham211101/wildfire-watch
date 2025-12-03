import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import heroImage from '@/assets/hero-wildfire.jpg';

const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Mask reveal animation - grows as user scrolls
  const clipPath = useTransform(
    scrollYProgress, 
    [0, 0.5], 
    ["circle(0% at 50% 50%)", "circle(150% at 50% 50%)"]
  );
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  return (
    <section 
      ref={containerRef}
      className="relative h-[90vh] w-full overflow-hidden bg-background"
    >
      {/* Background with mask reveal */}
      <motion.div 
        className="absolute inset-0"
        style={{ scale }}
      >
        {/* Dark overlay base */}
        <div className="absolute inset-0 bg-background z-10" />
        
        {/* Image with radial clip-path that grows on scroll */}
        <motion.div 
          className="absolute inset-0 z-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath
          }}
        />
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 z-30 bg-gradient-to-b from-background/60 via-transparent to-background" />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="relative z-40 flex flex-col items-center justify-center h-full px-4 text-center"
        style={{ y: textY, opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium tracking-wider uppercase rounded-full bg-primary/20 text-primary border border-primary/30">
            Real-time Monitoring
          </span>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="fire-text">Wildfire</span>
          <br />
          <span className="text-foreground">Prediction System</span>
        </motion.h1>

        <motion.p 
          className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Advanced satellite-based detection using MODIS FIRMS data. 
          Monitor fire hotspots in real-time and protect what matters most.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a 
            href="#map" 
            className="px-8 py-4 font-semibold rounded-lg fire-gradient text-primary-foreground hover:opacity-90 transition-all duration-300 ember-glow"
          >
            View Live Map
          </a>
          <a 
            href="#hotspots" 
            className="px-8 py-4 font-semibold rounded-lg bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-all duration-300"
          >
            See Hotspots
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
        style={{ opacity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-muted-foreground">Scroll to explore</span>
          <motion.div 
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/50 flex justify-center pt-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1.5 h-3 rounded-full bg-primary" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
