import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation after 2.5 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // Navigate after exit animation completes
    const navTimer = setTimeout(() => {
      navigate('/login');
    }, 3200);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="splash"
        initial={{ opacity: 0, scale: 1 }}
        animate={{ 
          opacity: isExiting ? 0 : 1,
          scale: isExiting ? 1.5 : 1,
          filter: isExiting ? 'blur(20px)' : 'blur(0px)'
        }}
        exit={{ opacity: 0, scale: 2, filter: 'blur(30px)' }}
        transition={{ 
          duration: 0.7,
          ease: [0.43, 0.13, 0.23, 0.96] // Custom ease for smooth feel
        }}
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
          animate={{ 
            scale: isExiting ? 0.8 : 1, 
            opacity: isExiting ? 0 : 1,
            rotateY: isExiting ? 180 : 0
          }}
          transition={{ 
            delay: 0.2, 
            duration: isExiting ? 0.6 : 0.9,
            ease: "easeOut"
          }}
          className="text-center relative z-10"
        >
          {/* Animated glow effect */}
          <motion.div
            className="absolute inset-0 blur-3xl opacity-30"
            animate={{
              background: [
                'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          <motion.h1
            className="text-8xl md:text-9xl font-bold mb-6 gradient-text relative"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            MyVision
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isExiting ? 0 : 1, 
              y: isExiting ? -20 : 0 
            }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-2xl md:text-3xl text-muted-foreground font-light"
          >
            AI-Powered Accessibility
          </motion.p>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 flex justify-center"
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-primary"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Expanding circle transition effect */}
        <AnimatePresence>
          {isExiting && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 3, opacity: 1 }}
              exit={{ scale: 5, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100vmax',
                height: '100vmax',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
