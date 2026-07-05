import { useState } from "react";
import { ChevronRight, LayoutGrid, CheckCircle2, QrCode, Store, Landmark, Compass, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OnboardingViewProps {
  onSkip: () => void;
  onFinish: () => void;
}

export default function OnboardingView({ onSkip, onFinish }: OnboardingViewProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      t: "Temukan Event\nPotensial",
      d: "Jelajahi berbagai bazaar, festival kuliner, pameran buku, dan expo kreatif yang sesuai dengan tipe produk serta target pasar bisnis Anda.",
      emoji: "🎪",
      color: "text-violet-600 border-violet-200 bg-violet-50/50",
      dotColor: "bg-violet-600",
      badgeText: "Bazaar & Festival",
      badgeColor: "bg-violet-50 text-violet-600 border-violet-100",
      meta: "RUANG KOLABORASI EO DAN TENANT"
    },
    {
      t: "Pilih Slot\nDenah Interaktif",
      d: "Pantau ketersediaan slot tenant ter-update secara real-time. Pilih lokasi strategis di sekitar panggung utama atau pintu masuk dengan peta visual terintegrasi.",
      emoji: "📍",
      color: "text-orange-600 border-orange-200 bg-orange-50/50",
      dotColor: "bg-orange-600",
      badgeText: "Denah Interaktif",
      badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
      meta: "BOOKING LANGSUNG DALAM SATU TAP"
    },
    {
      t: "Bayar Instan &\nTerkonfirmasi",
      d: "Melakukan transaksi sewa lewat QRIS otomatis atau transfer VA Bank dari mana saja. Status pesanan diverifikasi instan tanpa perlu berkas fisik.",
      emoji: "✅",
      color: "text-emerald-600 border-emerald-200 bg-emerald-50/50",
      dotColor: "bg-emerald-600",
      badgeText: "Instant Verifikasi",
      badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
      meta: "METODE PEMBAYARAN ELEKTRONIK AMAN"
    },
  ];

  const st = steps[step];

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="flex-1 min-h-[100dvh] md:min-h-0 bg-[#f4f6fb] flex flex-col justify-between relative overflow-hidden h-full">
      {/* Background Aesthetics */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden bg-[#f4f6fb]">
        {/* Aesthetic Animated Background Image */}
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

        {/* Soft centered ambient elements (keeping the rings but no grid) */}
        <div className="absolute inset-0 opacity-[0.05] bg-[#f4f6fb] pointer-events-none" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-dashed border-violet-200/50" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-dotted border-violet-200/50" />
        
        {/* Colorful visual backdrop overlay based on active slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.04 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, ${step === 0 ? '#7c3aed' : step === 1 ? '#ea580c' : '#10b981'} 0%, transparent 70%)`
            }}
          />
        </AnimatePresence>
      </div>

      {/* Top Header Row */}
      <div className="p-6 flex items-center justify-between relative z-10 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-black text-slate-400 tracking-[0.15em] bg-white border border-slate-200/85 px-3 py-1 rounded-xl shadow-sm">
            E-PANDUAN 0{step + 1} / 03
          </span>
        </div>

        <button
          onClick={onSkip}
          className="text-xs font-black text-slate-500 hover:text-slate-800 bg-white/95 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 cursor-pointer transition-all shadow-sm active:scale-95"
        >
          Lewati
        </button>
      </div>

      {/* Main Responsive Interactive Illustration Showcase */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center px-6 text-center md:text-left select-none max-w-md md:max-w-4xl mx-auto w-full gap-8 md:gap-16">
        
        <div className="w-full relative flex justify-center items-center min-h-[220px] md:min-h-[300px] mb-6 md:mb-0 md:w-1/2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -15 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-[280px] h-[200px] md:w-[360px] md:h-[260px]"
            >
              
              {/* ILLUSTRATION STEP 0: EO AND TENANT MATCHING */}
              {step === 0 && (
                <div className="relative w-full h-full bg-white border border-slate-200/80 rounded-[28px] p-4 shadow-xl flex flex-col justify-between overflow-hidden">
                  {/* Miniature decorative grid header */}
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 md:px-4 md:py-2">
                    <span className="text-[8px] md:text-[10px] font-mono font-bold text-slate-400">AKTIVITAS LANDING EVENT</span>
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="flex items-center justify-around gap-2 my-auto px-2 md:px-4">
                    {/* Event Organizer Entity Card */}
                    <div className="flex flex-col items-center text-center p-2 md:p-3 border border-violet-100 bg-violet-50/20 rounded-2xl w-24 md:w-28">
                      <img 
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150" 
                        alt="EO Avatar" 
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shadow-md shadow-violet-600/20 mb-2 md:mb-3" 
                      />
                      <span className="text-[10px] md:text-xs font-black text-slate-800 leading-none">Event Organizer</span>
                      <span className="text-[8px] md:text-[9px] text-violet-500 mt-1 font-bold">Kelola Lahan</span>
                    </div>

                    {/* Infinite ping connection line */}
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                      <div className="w-full h-0.5 border-t border-dashed border-slate-400 relative">
                        <div className="absolute -top-1 left-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-violet-600 animate-bounce" />
                      </div>
                      <span className="text-[7px] md:text-[8px] font-mono text-slate-400 mt-1 uppercase font-bold tracking-widest">Temu</span>
                    </div>

                    {/* Tenant Entity Card */}
                    <div className="flex flex-col items-center text-center p-2 md:p-3 border border-fuchsia-100 bg-fuchsia-50/20 rounded-2xl w-24 md:w-28">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-fuchsia-600 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-fuchsia-600/20 mb-2 md:mb-3">
                        <Store className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <span className="text-[10px] md:text-xs font-black text-slate-800 leading-none">Tenant UMKM</span>
                      <span className="text-[8px] md:text-[9px] text-fuchsia-500 mt-1 font-bold">Booking Slot</span>
                    </div>
                  </div>

                  {/* Micro label footer */}
                  <div className="flex justify-center items-center gap-1.5 md:gap-2 text-[8.5px] md:text-[10px] font-mono font-bold text-slate-400">
                    <Award className="w-3 h-3 md:w-4 md:h-4 text-violet-500" />
                    <span>Sinkronisasi G2G & UMKM Terintegrasi</span>
                  </div>
                </div>
              )}

              {/* ILLUSTRATION STEP 1: INTERACTIVE REALTIME FLOORPLAN BUILDER */}
              {step === 1 && (
                <div className="relative w-full h-full bg-white border border-slate-200/80 rounded-[28px] p-4 shadow-xl flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 md:pb-3">
                    <span className="text-[9px] md:text-[10px] font-mono font-extrabold text-slate-400">PETA STAND BOOTH SPASIAL</span>
                    <span className="text-[8px] md:text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 md:px-3 md:py-1 rounded-full">GRID A & B</span>
                  </div>

                  {/* Simulated floor plans booths */}
                  <div className="grid grid-cols-4 gap-2.5 md:gap-3.5 my-auto max-w-[220px] md:max-w-[280px] mx-auto w-full">
                    <div className="h-10 md:h-14 border border-slate-200 bg-slate-50 rounded-xl flex flex-col items-center justify-center relative shadow-inner">
                      <span className="text-[8px] md:text-[10px] font-mono font-black text-slate-400">A-01</span>
                      <span className="text-[7px] md:text-[8px] text-slate-400 font-bold leading-none">Terisi</span>
                    </div>
                    
                    <div className="h-10 md:h-14 border border-slate-250 bg-slate-50 rounded-xl flex flex-col items-center justify-center relative shadow-inner">
                      <span className="text-[8px] md:text-[10px] font-mono font-black text-slate-400">A-02</span>
                      <span className="text-[7px] md:text-[8px] text-slate-400 font-bold leading-none">Terisi</span>
                    </div>

                    <motion.div 
                      animate={{ scale: [1, 1.05, 1], borderColor: ["#ea580c", "#fdba74", "#ea580c"] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="h-10 md:h-14 border-2 border-orange-500 bg-orange-50 rounded-xl flex flex-col items-center justify-center relative shadow-sm cursor-pointer"
                    >
                      <span className="text-[8px] md:text-[10px] font-mono font-black text-orange-700">A-03</span>
                      <span className="text-[7.5px] md:text-[9px] text-orange-600 font-black leading-none animate-pulse">Dipilih</span>
                      {/* Interactive pointer mimicking mouse select click status */}
                      <span className="absolute -bottom-1 -right-1 scroll-smooth bg-orange-600 border border-white text-white w-3 h-3 md:w-4 md:h-4 rounded-full flex items-center justify-center text-[7px] md:text-[9px] font-black font-mono">✓</span>
                    </motion.div>

                    <div className="h-10 md:h-14 border border-dashed border-emerald-300 bg-emerald-50/20 rounded-xl flex flex-col items-center justify-center relative">
                      <span className="text-[8px] md:text-[10px] font-mono font-black text-emerald-600">A-04</span>
                      <span className="text-[7.5px] md:text-[9px] text-emerald-600 font-extrabold leading-none">Tersedia</span>
                    </div>
                  </div>

                  {/* Interconnected status details */}
                  <span className="text-[8.5px] md:text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center">
                    CUKUP TAP UNTUK MEMESAN BOOTH STRATEGIS
                  </span>
                </div>
              )}

              {/* ILLUSTRATION STEP 2: FINTECH VERIFICATION */}
              {step === 2 && (
                <div className="relative w-full h-full bg-white border border-slate-200/80 rounded-[28px] p-4 shadow-xl flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center bg-emerald-50/50 border border-emerald-100 rounded-xl p-2 md:p-3">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Landmark className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" />
                      <span className="text-[8.5px] md:text-[10px] font-mono font-bold text-emerald-700">GATEWAY ONLINE</span>
                    </div>
                    <span className="pill bg-emerald-600 text-white font-extrabold text-[7px] md:text-[8px] px-2 py-0.5 md:px-2.5 md:py-1 rounded">INSTANT</span>
                  </div>

                  <div className="flex items-center justify-center gap-4 md:gap-6 my-auto">
                    {/* Simulated Virtual Card Checkout */}
                    <div className="bg-slate-900 text-white rounded-2xl p-3 md:p-4 w-32 md:w-40 border border-slate-800 text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-full blur-sm" />
                      <p className="text-[6px] md:text-[8px] font-mono uppercase text-slate-400">Total Pembayaran</p>
                      <p className="text-xs md:text-sm font-black font-mono tracking-tight mt-0.5">Rp 1.500.000</p>
                      <div className="flex justify-between items-center mt-3.5 md:mt-5 border-t border-white/10 pt-1.5 md:pt-2">
                        <span className="text-[6.5px] md:text-[8px] font-mono text-slate-300">QRIS TERAUTORISASI</span>
                        <QrCode className="w-3 h-3 md:w-4 md:h-4 text-slate-300" />
                      </div>
                    </div>

                    {/* Success Verified Animation Circle */}
                    <div className="flex flex-col items-center gap-1 md:gap-1.5 text-center">
                      <motion.div
                        animate={{ scale: [0.95, 1.1, 0.95] }}
                        transition={{ repeat: Infinity, duration: 2.2 }}
                        className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                      </motion.div>
                      <span className="text-[8.5px] md:text-[10px] font-black text-slate-800">Lunas Instan</span>
                      <span className="text-[7px] md:text-[8px] text-slate-400 font-bold uppercase leading-none">Automated API</span>
                    </div>
                  </div>

                  {/* Decorative feedback text */}
                  <div className="flex justify-center items-center gap-1 text-[8px] md:text-[9.5px] font-mono font-black text-slate-450 uppercase">
                    <span>Sewa Terbit Tanpa Menunggu Konfirmasi Manual</span>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide description text cards */}
        <div className="mt-2 md:mt-0 min-h-[160px] md:min-h-auto md:w-1/2 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-3 md:space-y-5"
            >
              <span className="inline-block text-[8.5px] md:text-[10px] font-mono tracking-[0.2em] text-slate-450 uppercase font-black">
                {st.meta}
              </span>

              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-tight tracking-tight whitespace-pre-line">
                {st.t}
              </h2>

              <p className="text-slate-500 text-xs md:text-sm lg:text-base leading-relaxed max-w-[290px] md:max-w-md mx-auto md:mx-0 font-semibold md:font-medium">
                {st.d}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Button and Pager footer controls */}
      <div className="p-8 pb-10 relative z-10 shrink-0 max-w-md mx-auto w-full">
        <div className="flex justify-center gap-3 mb-6 select-none">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className="group py-1 focus:outline-none cursor-pointer"
              aria-label={`Go to slide ${i + 1}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step 
                    ? `${st.dotColor} w-9 shadow-sm` 
                    : "bg-slate-200 w-2.5 group-hover:bg-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
        
        <button
          onClick={handleNext}
          className="w-full h-13 rounded-2xl font-black font-sans text-xs tracking-wider bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 hover:shadow-violet-600/40 cursor-pointer active:scale-98 transition-all duration-200"
        >
          {step < 2 ? "Selanjutnya" : "Mulai Gunakan Aplikasi"}
          <ChevronRight className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
