import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { Trip } from '@/entities/trip'
import { addDays, fleetDayStart, fleetTime } from '@/shared/lib/fleet-time'
import { useResolvedTheme } from '@/shared/lib/theme'
import { useNow } from '@/shared/lib/use-now'
import { Skeleton } from '@/shared/ui/skeleton'

import { onTheRoad, type DaySpan, type RoadSlot } from '../model/today'

// The blue of moving vehicles on the live map; a lighter step reads better on the dark surface
const SERIES_COLOR = { light: '#2563eb', dark: '#3b82f6' }
const THREE_HOURS = 3 * 60 * 60_000
const AXIS_TEXT = { fill: 'var(--muted-foreground)', fontSize: 12 }

const timeOf = (at: number) => fleetTime(new Date(at))

/** The part of what Recharts hands a tooltip that this one reads: the hovered point */
type RoadTooltipProps = { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> }

/** The quarter hour under the pointer and how many vehicles were out then */
function RoadTooltip({ active, payload }: RoadTooltipProps) {
  const slot = payload?.[0]?.payload as RoadSlot | undefined
  if (!active || !slot) return null

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium tabular-nums">{timeOf(slot.at)}</p>
      <p className="text-muted-foreground">{slot.vehicles} on the road</p>
    </div>
  )
}

interface RoadActivityProps {
  /** The day's trips; undefined while they load */
  trips: Trip[] | undefined
  day: string
}

/** How many vehicles are out on a trip through the day: what happened, and what's planned. */
export function RoadActivity({ trips, day }: RoadActivityProps) {
  const theme = useResolvedTheme()
  const now = useNow(60_000)
  const span = useMemo<DaySpan>(
    () => ({
      starts: fleetDayStart(day).getTime(),
      ends: fleetDayStart(addDays(day, 1)).getTime(),
    }),
    [day],
  )
  const slots = useMemo(() => (trips ? onTheRoad(trips, span) : undefined), [trips, span])
  const ticks = Array.from({ length: 9 }, (_, index) => span.starts + index * THREE_HOURS)
  const color = SERIES_COLOR[theme]

  return (
    <section aria-labelledby="on-the-road-today" className="rounded-lg border">
      <header className="border-b px-4 py-3">
        <h2 id="on-the-road-today" className="font-medium">
          Vehicles on the road today
        </h2>
        <p className="text-sm text-muted-foreground">
          Out on a trip at each quarter hour; past the red line it&apos;s the plan.
        </p>
      </header>

      <div className="p-4">
        {slots === undefined ? (
          <Skeleton className="h-[220px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={slots} margin={{ top: 16, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="at"
                type="number"
                domain={[span.starts, span.ends]}
                ticks={ticks}
                tickFormatter={timeOf}
                tick={AXIS_TEXT}
                tickLine={false}
                stroke="var(--border)"
              />
              <YAxis
                allowDecimals={false}
                width={40}
                tick={AXIS_TEXT}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '3 3' }}
                content={RoadTooltip}
              />
              {/* A vehicle is either out or not, so the count steps rather than slopes */}
              <Area
                type="stepAfter"
                dataKey="vehicles"
                stroke={color}
                strokeWidth={2}
                fill={color}
                fillOpacity={0.15}
                isAnimationActive={false}
              />
              {now >= span.starts && now < span.ends && (
                <ReferenceLine
                  x={now}
                  stroke="#ef4444"
                  label={{ value: 'Now', position: 'insideTopLeft', ...AXIS_TEXT }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {slots && (
        <table className="sr-only">
          <caption>Vehicles on the road at the start of each hour today</caption>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Vehicles</th>
            </tr>
          </thead>
          <tbody>
            {slots
              .filter((_, index) => index % 4 === 0)
              .map((slot) => (
                <tr key={slot.at}>
                  <td>{timeOf(slot.at)}</td>
                  <td>{slot.vehicles}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
