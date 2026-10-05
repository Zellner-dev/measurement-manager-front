import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '../utils/format'

export interface ChartPoint {
  label: string
  value: number
}

interface ProgressChartProps {
  data: ChartPoint[]
  unit: string
  /** Accessible summary, read instead of the SVG */
  title: string
}

export function ProgressChart({ data, unit, title }: ProgressChartProps) {
  return (
    <figure className="h-60 w-full sm:h-72" aria-label={title}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid stroke="#292929" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#a3a3a3"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            stroke="#a3a3a3"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={48}
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => formatNumber(v)}
          />
          <Tooltip
            cursor={{ stroke: '#3a3a3a' }}
            contentStyle={{ background: '#1e1e1e', border: '1px solid #292929', borderRadius: 12 }}
            labelStyle={{ color: '#a3a3a3' }}
            itemStyle={{ color: '#ffd600', fontWeight: 600 }}
            formatter={(v) => [`${formatNumber(Number(v))} ${unit}`, '']}
            separator=""
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ffd600"
            strokeWidth={3}
            dot={{ r: 4, fill: '#ffd600', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#ffd600', stroke: '#0b0b0b', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  )
}
