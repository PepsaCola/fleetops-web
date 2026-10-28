import { format, parseISO } from 'date-fns'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { CostReport } from '@/entities/cost'
import { formatUah } from '@/shared/lib/money'
import { useResolvedTheme } from '@/shared/lib/theme'

// Blue for fuel, teal for the workshop: checked to stay apart for colour-blind readers on both
// surfaces. The legend names them and a thin gap divides them, so colour isn't the only cue.
const SERIES_COLORS = {
  light: { fuel: '#2563eb', maintenance: '#0d9488' },
  dark: { fuel: '#3b82f6', maintenance: '#0d9488' },
}
const AXIS_TEXT = { fill: 'var(--muted-foreground)', fontSize: 12 }

type CostDay = CostReport['days'][number]

const dayLabel = (day: string) => format(parseISO(day), 'EEE d MMM')
const thousands = (amount: number) =>
  amount >= 1000 ? `${Math.round(amount / 1000)}k` : String(amount)

/** The part of what Recharts hands a tooltip that this one reads: the hovered day */
type DayTooltipProps = { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> }

function DayTooltip({ active, payload }: DayTooltipProps) {
  const day = payload?.[0]?.payload as CostDay | undefined
  if (!active || !day) return null

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{dayLabel(day.day)}</p>
      <p className="text-muted-foreground tabular-nums">Fuel {formatUah(day.fuelUah)}</p>
      <p className="text-muted-foreground tabular-nums">
        Maintenance {formatUah(day.maintenanceUah)}
      </p>
      <p className="font-medium tabular-nums">
        Total {formatUah(day.fuelUah + day.maintenanceUah)}
      </p>
    </div>
  )
}

/** What the fleet spent each day, fuel and the workshop stacked. */
export function DailyCostsChart({ days }: { days: CostDay[] }) {
  const colors = SERIES_COLORS[useResolvedTheme()]

  return (
    <section aria-labelledby="daily-costs" className="rounded-lg border">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <h2 id="daily-costs" className="font-medium">
          Spent each day
        </h2>
        <ul className="flex gap-4 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-3 rounded-sm"
              style={{ backgroundColor: colors.fuel }}
            />
            Fuel
          </li>
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-3 rounded-sm"
              style={{ backgroundColor: colors.maintenance }}
            />
            Maintenance
          </li>
        </ul>
      </header>

      <div className="p-4">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="day"
              tickFormatter={(day: string) => format(parseISO(day), 'd MMM')}
              tick={AXIS_TEXT}
              tickLine={false}
              stroke="var(--border)"
              minTickGap={16}
            />
            <YAxis
              tickFormatter={thousands}
              width={44}
              tick={AXIS_TEXT}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.5 }} content={DayTooltip} />
            {/* A thin edge in the surface colour keeps the two parts of a bar apart */}
            <Bar
              dataKey="fuelUah"
              stackId="spent"
              fill={colors.fuel}
              stroke="var(--background)"
              strokeWidth={1}
              isAnimationActive={false}
            />
            <Bar
              dataKey="maintenanceUah"
              stackId="spent"
              fill={colors.maintenance}
              stroke="var(--background)"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>What the fleet spent each day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Fuel</th>
            <th scope="col">Maintenance</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.day}>
              <td>{dayLabel(day.day)}</td>
              <td>{formatUah(day.fuelUah)}</td>
              <td>{formatUah(day.maintenanceUah)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
