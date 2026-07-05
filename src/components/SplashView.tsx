import { useEffect, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { motion } from "motion/react";

interface SplashViewProps {
  onLoadComplete: () => void;
}

export default function SplashView({ onLoadComplete }: SplashViewProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 2000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onLoadComplete();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  return (
    <div className="flex-1 min-h-[100dvh] md:min-h-0 h-full relative overflow-hidden flex flex-col items-center justify-center bg-[#f4f6fb] text-slate-800 font-sans select-none">
      
      {/* Aesthetic Animated Background Image */}
      <div className="absolute inset-0 select-none pointer-events-none z-0 overflow-hidden bg-[#f4f6fb]">
        <motion.img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560"
          alt="Animated Abstract Background"
          className="w-[200%] h-full object-cover opacity-35 max-w-none"
          animate={{ x: ["-50%", "0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        />
        {/* Gradient overlays to smoothly blend and frame the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f4f6fb] via-white/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f4f6fb]/90 via-white/50 to-transparent" />
      </div>

      {/* Soft centered ambient flow to enhance logo */}
      <div className="absolute inset-0 select-none pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-violet-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Center Animated Logo Grid (Moving Elements) */}
      <div className="z-10 flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center w-52 h-52">
          {/* Subtle soft gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-400 rounded-full blur-xl opacity-25 scale-105" />
          
          {/* Orbiting Container */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Top Icon - EO */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute top-0 left-1/2 -ml-6 -mt-6 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md shadow-lg border border-violet-100 rounded-xl p-1 w-12 h-12"
            >
              <span className="text-lg leading-none mb-0.5">🎪</span>
              <span className="text-[7px] font-black text-violet-700 uppercase tracking-wider">EO</span>
            </motion.div>

            {/* Bottom Icon - Tenant */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute bottom-0 left-1/2 -ml-6 -mb-6 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md shadow-lg border border-emerald-100 rounded-xl p-1 w-12 h-12"
            >
              <span className="text-lg leading-none mb-0.5">🏪</span>
              <span className="text-[7px] font-black text-emerald-700 uppercase tracking-wider">Tenant</span>
            </motion.div>

            {/* Left Icon - Event */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute left-0 top-1/2 -mt-6 -ml-6 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md shadow-lg border border-fuchsia-100 rounded-xl p-1 w-12 h-12"
            >
              <span className="text-lg leading-none mb-0.5">🎫</span>
              <span className="text-[7px] font-black text-fuchsia-700 uppercase tracking-wider">Event</span>
            </motion.div>

            {/* Right Icon - Space */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute right-0 top-1/2 -mt-6 -mr-6 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md shadow-lg border border-blue-100 rounded-xl p-1 w-12 h-12"
            >
              <span className="text-lg leading-none mb-0.5">🏢</span>
              <span className="text-[7px] font-black text-blue-700 uppercase tracking-wider">Space</span>
            </motion.div>
          </motion.div>

          {/* Pristine Floating Logo Block */}
          <motion.div 
            animate={{ 
              y: [0, -6, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3, 
              ease: "easeInOut" 
            }}
            className="relative z-10 w-20 h-20 bg-white border border-slate-200/80 rounded-[24px] flex items-center justify-center shadow-xl overflow-hidden p-3"
          >
            <img src="/logo.svg" alt="Event Space Logo" className="w-full h-full object-contain rounded-xl" />
          </motion.div>
        </div>

        {/* Minimalist Brand Name */}
        <div className="text-center relative z-10 mt-2">
          <h1 className="text-[26px] font-black text-slate-800 tracking-tight leading-none drop-shadow-sm">
            Event<span className="text-violet-600">Space</span>
          </h1>
          <motion.div 
            className="text-[9px] font-extrabold text-slate-500 mt-2 tracking-widest uppercase flex items-center justify-center gap-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <span className="text-violet-600">EO</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-emerald-600">TENANT</span>
          </motion.div>
        </div>

        {/* High Premium Minimalist Track Bar */}
        <div className="w-32 mt-1 flex flex-col items-center gap-2 relative z-10">
          <div className="w-full h-[3px] bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-sm shadow-violet-500/50"
              style={{ width: `${progress}%` }}
              layout
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

    </div>
  );
}
