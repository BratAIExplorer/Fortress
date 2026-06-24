'use client'

import { useEffect, useState } from 'react'
import { Users, Eye, TrendingUp, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ActivityData {
  usersOnline: number
  mostPopular: Array<{ pagePath: string; count: number }>
  recentActivity: string
}

export function SocialProofWidget() {
  const [activity, setActivity] = useState<ActivityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/analytics/live-activity')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setActivity(data)
      } catch (error) {
        console.error('Failed to fetch activity:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivity()
    const interval = setInterval(fetchActivity, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getPageLabel = (path: string) => {
    const labels: Record<string, string> = {
      '/fortress-30': 'Fortress 30 List',
      '/intelligence': 'Intelligence Alpha',
      '/investment-genie': 'Investment Genie',
      '/macro': 'Market Pulse',
      '/': 'Fortress Terminal'
    }
    return labels[path] || path
  }

  if (isLoading || !activity) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden group"
    >
      {/* Premium Glassmorphism Container */}
      <div className="bg-gradient-to-br from-card/80 to-background/40 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 shadow-2xl shadow-primary/5">
        
        {/* Animated Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Live Users Counter */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
              <div className="relative bg-primary/20 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {activity.usersOnline}
                </span>
                <span className="text-xs font-bold text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded-full">
                  Live
                </span>
              </div>
              <p className="text-sm text-white/50 font-medium">Intellectuals browsing Fortress</p>
            </div>
          </div>

          {/* Vertical Divider (Desktop) */}
          <div className="hidden md:block w-px h-12 bg-white/10" />

          {/* trending section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Trending Now</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {activity.mostPopular.map((item, idx) => (
                  <motion.div
                    key={item.pagePath}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-default"
                  >
                    <span className="text-[10px] font-mono text-primary font-bold">#{idx + 1}</span>
                    <span className="text-xs font-medium text-white/80">{getPageLabel(item.pagePath)}</span>
                    <span className="text-[10px] text-white/40">{item.count} views</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex items-center">
            <button className="group/btn relative overflow-hidden bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] active:scale-95 flex items-center gap-2">
              Join the Alpha
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Background Glow */}
      <div className="absolute -z-10 top-1/2 left-0 -translate-y-1/2 w-32 h-32 bg-primary/10 blur-[100px] rounded-full" />
    </motion.div>
  )
}
