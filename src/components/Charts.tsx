import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import type { StatistiquePointage, StatistiqueRole } from '@/lib/index';

interface PresenceChartProps {
  data: StatistiquePointage[];
}

export function PresenceChart({ data }: PresenceChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
    >
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Évolution des présences (7 derniers jours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))'
              }}
            />
            <Legend 
              wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line 
              type="monotone" 
              dataKey="entrees" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--chart-2))', r: 5 }}
              activeDot={{ r: 7 }}
              name="Entrées"
            />
            <Line 
              type="monotone" 
              dataKey="sorties" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 5 }}
              activeDot={{ r: 7 }}
              name="Sorties"
            />
            <Line 
              type="monotone" 
              dataKey="presents" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
              name="Présents"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}

interface RoleDistributionChartProps {
  data: StatistiqueRole[];
}

const ROLE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

export function RoleDistributionChart({ data }: RoleDistributionChartProps) {
  const chartData = data.map(item => ({
    name: item.role,
    value: item.total,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 35, delay: 0.1 }}
    >
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Répartition par rôle</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="hsl(var(--primary))"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}

interface PointageTimelineData {
  heure: string;
  entrees: number;
  sorties: number;
}

interface PointageTimelineChartProps {
  data: PointageTimelineData[];
}

export function PointageTimelineChart({ data }: PointageTimelineChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 35, delay: 0.2 }}
    >
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Pointages par heure</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="heure" 
              stroke="hsl(var(--muted-foreground))" 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))'
              }}
            />
            <Legend 
              wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar 
              dataKey="entrees" 
              fill="hsl(var(--chart-2))" 
              radius={[8, 8, 0, 0]}
              name="Entrées"
              animationBegin={0}
              animationDuration={800}
            />
            <Bar 
              dataKey="sorties" 
              fill="hsl(var(--primary))" 
              radius={[8, 8, 0, 0]}
              name="Sorties"
              animationBegin={100}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}