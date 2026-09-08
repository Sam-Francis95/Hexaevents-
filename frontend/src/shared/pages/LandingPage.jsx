import { Link } from 'react-router-dom';
import { Sparkles, Activity, Play, ChevronRight, Terminal } from 'lucide-react';
import { ROUTES } from '../utils/constants';

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas">
      {/* Background glowing blurs */}
      <div className="absolute top-0 left-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[120px]" />
      <div className="absolute top-1/2 right-0 h-96 w-96 -translate-y-1/2 translate-x-1/3 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-96 w-96 translate-y-1/2 -translate-x-1/3 rounded-full bg-accent-500/20 blur-[120px]" />

      {/* Hero Section */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 text-center z-10 py-20">
        
        {/* Pill banner */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-purple-300 backdrop-blur-md">
          <Sparkles className="size-3.5" />
          Certified Event Platform • Join over 120,500 active participants
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Forge Professional Coding Mastery in <span className="bg-hero-text bg-clip-text text-transparent">Python & Java</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-8 max-w-2xl text-lg text-ink-300 sm:text-xl leading-relaxed">
          SmartEvent AI is an advanced platform. Master core structures on our interactive browser sandbox with real-time automatic compiler execution, structured debugger logs, peer socratic assistance, and verifiable certificate transcripts.
        </p>

        {/* CTA Button */}
        <div className="mt-12">
          <Link
            to={ROUTES.LOGIN}
            className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] active:scale-95"
          >
            Resume Learning
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </main>

      {/* Floating Action Button (FAB) from the screenshot */}
      <button className="fixed bottom-8 right-8 z-50 flex size-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-transform hover:scale-110">
        <Terminal className="size-6" />
        <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-accent-400 border-2 border-canvas"></span>
      </button>
    </div>
  );
}
