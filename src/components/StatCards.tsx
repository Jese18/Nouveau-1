import { motion } from "framer-motion"
import { ReactNode } from "react"
import { hoverLift } from "@/lib/motion"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  icon: ReactNode
  title: string
  value: number
  variation?: number
  color?: string
}

export function StatCard({ icon, title, value, variation, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 border-primary/30",
    success: "from-green-500/20 to-green-500/5 border-green-500/30",
    warning: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
    destructive: "from-destructive/20 to-destructive/5 border-destructive/30",
  }

  const iconColorClasses = {
    primary: "text-primary",
    success: "text-green-500",
    warning: "text-orange-500",
    destructive: "text-destructive",
  }

  const variationColor = variation && variation > 0 ? "text-green-500" : "text-destructive"

  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-gradient-to-br ${
        colorClasses[color as keyof typeof colorClasses] || colorClasses.primary
      }`}
      style={{
        boxShadow: "0 8px 30px -6px color-mix(in srgb, var(--primary) 15%, transparent)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-4xl font-bold text-foreground mb-2">{value.toLocaleString()}</p>
            
            {variation !== undefined && (
              <div className="flex items-center gap-1">
                {variation > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className={`text-sm font-medium ${variationColor}`}>
                  {variation > 0 ? "+" : ""}{variation}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs hier</span>
              </div>
            )}
          </div>

          <div
            className={`p-3 rounded-xl bg-background/50 backdrop-blur-sm ${
              iconColorClasses[color as keyof typeof iconColorClasses] || iconColorClasses.primary
            }`}
            style={{
              boxShadow: "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgba(255,255,255, 0.1), inset 0 -1px 0 rgba(0,0,0, 0.1)",
            }}
          >
            {icon}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        style={{
          boxShadow: "0 0 12px color-mix(in srgb, var(--primary) 50%, transparent)",
        }}
      />
    </motion.div>
  )
}

export function StatCards(): JSX.Element {
  return <div>StatCards placeholder</div>
}
