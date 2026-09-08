import React, { useEffect, useState } from 'react';
import { useReputation } from '../../contexts/ReputationContext';
import { getMyAchievements } from '../../services/reputationService';
import { Trophy, Lock, Star, Shield, Zap, Medal } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';

const RARITY_COLORS = {
  COMMON: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  RARE: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  EPIC: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  LEGENDARY: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
};

const RARITY_ICONS = {
  COMMON: Shield,
  RARE: Star,
  EPIC: Zap,
  LEGENDARY: Trophy,
};

export default function Achievements() {
  const { reputation } = useReputation();
  const [achievementsData, setAchievementsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      const res = await getMyAchievements();
      if (res.success) {
        setAchievementsData(res.data);
      }
      setIsLoading(false);
    }
    fetchAchievements();
  }, []);

  if (isLoading || !reputation) {
    return (
      <div className="flex h-[calc(100vh-68px)] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-[#0056D2] border-t-transparent" />
      </div>
    );
  }

  const { summary, collection } = achievementsData || { summary: {}, collection: [] };

  return (
    <div className="mx-auto w-full max-w-5xl p-5 sm:p-7 pb-20">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Achievements</h1>
        <p className="mt-1 text-sm text-ink-500">Build your reputation by participating, competing and achieving.</p>
      </div>

      {/* Top Section: Current Level */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="bg-gradient-to-r from-[#0056D2] to-[#4F46E5] p-6 text-white relative">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md border border-white/20">
                {reputation.levelBadge}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-100 mb-0.5">Current Level</p>
                <h2 className="text-2xl font-bold tracking-tight">{reputation.levelName} <span className="text-blue-200 text-lg font-medium ml-1">Level {reputation.currentLevel}</span></h2>
              </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span>{reputation.totalXP.toLocaleString()} XP</span>
                <span className="text-blue-100">{reputation.nextLevelXP ? `${reputation.nextLevelXP.toLocaleString()} XP` : 'MAX'}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/20 inset-shadow-sm">
                {reputation.nextLevelXP ? (
                  <div 
                    className="h-full rounded-full bg-white transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                    style={{ width: `${Math.min(100, Math.max(0, ((reputation.totalXP - (reputation.nextLevelXP - reputation.xpToNextLevel)) / (reputation.xpToNextLevel + (reputation.totalXP - (reputation.nextLevelXP - reputation.xpToNextLevel)))) * 100))}%` }}
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                )}
              </div>
              
              <p className="mt-2 text-xs font-medium text-blue-100 text-right">
                {reputation.nextLevelXP ? `${reputation.xpToNextLevel.toLocaleString()} XP to next level` : 'You have reached the highest level!'}
              </p>
            </div>
            
          </div>
        </div>

        {/* Achievement Summary */}
        <div className="grid grid-cols-3 divide-x divide-border bg-canvas/50">
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-2xl font-bold text-ink-900">{summary.unlocked || 0}</span>
            <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mt-1">Unlocked</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.inProgress || 0}</span>
            <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mt-1">In Progress</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-2xl font-bold text-slate-400">{summary.locked || 0}</span>
            <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mt-1">Locked</span>
          </div>
        </div>
      </div>

      {/* Achievement Collection Grid */}
      <h3 className="mb-4 text-base font-bold text-ink-900">Achievement Collection</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {collection.map((ach) => {
          const isUnlocked = ach.status === 'UNLOCKED';
          const isInProgress = ach.status === 'IN_PROGRESS';
          const isLocked = ach.status === 'LOCKED';
          const RarityIcon = RARITY_ICONS[ach.rarity] || Shield;

          return (
            <div 
              key={ach.id} 
              className={cn(
                "relative flex flex-col rounded-2xl border bg-surface p-5 transition-all duration-300",
                isUnlocked ? "border-[#0056D2]/30 shadow-md hover:-translate-y-1 hover:shadow-lg" : 
                isInProgress ? "border-border shadow-sm" : 
                "border-border opacity-70 grayscale-[0.6] hover:grayscale-0"
              )}
            >
              {/* Rarity Pill */}
              <div className={cn(
                "absolute -top-2.5 right-4 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-sm",
                RARITY_COLORS[ach.rarity]
              )}>
                <RarityIcon className="size-3" />
                {ach.rarity}
              </div>

              {/* Icon Container */}
              <div className="mb-4 flex justify-center">
                <div className={cn(
                  "flex size-16 items-center justify-center rounded-2xl text-3xl shadow-inner",
                  isUnlocked ? "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-200 dark:border-blue-800" :
                  "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                )}>
                  {isLocked ? <Lock className="size-6 text-slate-400" /> : ach.icon}
                </div>
              </div>

              {/* Content */}
              <div className="text-center flex-1 flex flex-col">
                <h4 className="text-sm font-bold text-ink-900 mb-1">{ach.name}</h4>
                <p className="text-[11px] text-ink-500 mb-3 flex-1">{ach.description}</p>
                
                {/* Reward Pill */}
                <div className="mb-4 inline-flex items-center self-center rounded-md bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  +{ach.xp_reward} XP
                </div>

                {/* Progress / Status */}
                <div className="mt-auto border-t border-border pt-3">
                  {isUnlocked ? (
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                      ✓ Unlocked
                    </p>
                  ) : isInProgress ? (
                    <div className="w-full">
                      <div className="flex justify-between text-[9px] font-bold text-ink-500 mb-1.5">
                        <span>{ach.progress} / {ach.criteria.target}</span>
                        <span>In Progress</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, (ach.progress / ach.criteria.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1.5">
                      <Lock className="size-3" /> Locked
                    </p>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
