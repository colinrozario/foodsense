'use client';

import { ScanLine, Image, ShieldCheck, Zap, Globe } from 'lucide-react';

interface HeroProps {
  onScanBarcode: () => void;
  onScanLabel: () => void;
  lastScanName?: string;
}

const features = [
  { metric: '93%', text: 'faster to spot hidden allergens', icon: ShieldCheck },
  { metric: '1000+', text: 'food additives instantly parsed', icon: Zap },
  { metric: '100%', text: 'personalized to your unique diet', icon: ScanLine },
];

export default function Hero({ onScanBarcode, onScanLabel, lastScanName }: HeroProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-5 pt-20 pb-10 relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[20%] right-[5%] w-96 h-96 bg-violet-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[50%] right-[15%] w-48 h-48 bg-amber-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-5xl mx-auto mt-6">
        <div className="max-w-md mx-auto space-y-8 px-4">
          {/* Headline */}
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-black tracking-tight text-gray-900 leading-[1.05]">
              Stop eating<br/><span className="relative">
                blind
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-emerald-300/40 -z-10 skew-x-[-3deg]" />
              </span>
              .
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed">
              Scan any barcode or food label. Get an instant analysis tailored to your diet.
            </p>
          </div>

          {/* Main CTAs */}
          <div className="space-y-3">
            <button
              onClick={onScanBarcode}
              className="w-full flex items-center gap-4 p-5 bg-black text-white rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg shadow-black/10 group"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0">
                <ScanLine className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Scan Barcode</div>
                <div className="text-white/60 text-sm">Point camera at product barcode</div>
              </div>
              <div className="ml-auto">→</div>
            </button>

            <button
              onClick={onScanLabel}
              className="w-full flex items-center gap-4 p-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl hover:border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                <Image className="w-6 h-6 text-gray-700" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Scan Label</div>
                <div className="text-gray-500 text-sm">Photo of ingredient list</div>
              </div>
              <div className="ml-auto text-gray-300">→</div>
            </button>
          </div>

          {/* Last scan info */}
          {lastScanName && (
            <div className="text-center text-sm text-gray-400 mt-4">
              Last scan: <span className="text-gray-600 font-medium">{lastScanName}</span>
            </div>
          )}
        </div>

        {/* Feature Cards Inspired by Apollo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-5 mt-16 max-w-4xl mx-auto">
          {features.map(f => (
            <div key={f.metric} className="bg-white rounded-[1.5rem] p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between min-h-[12rem] hover:shadow-[0_8px_25px_-4px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm font-semibold text-gray-500 max-w-[70%] leading-relaxed">{f.text}</span>
                <f.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-6xl font-semibold tracking-tighter text-gray-800 mt-6 opacity-90">
                {f.metric}
              </div>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <div className="max-w-md mx-auto pt-10">
          <p className="text-center text-xs text-gray-400 leading-relaxed">
            Works with products from any country • Labels in any language<br />
            Not medical advice — always read the label
          </p>
        </div>
      </div>
    </section>
  );
}
