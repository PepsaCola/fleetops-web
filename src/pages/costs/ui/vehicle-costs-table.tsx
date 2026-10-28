import { Link } from 'react-router'

import type { CostReport } from '@/entities/cost'
import { VEHICLE_TYPE_LABELS } from '@/entities/vehicle'
import { formatUah } from '@/shared/lib/money'
import { vehiclePath } from '@/shared/routes'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

const kilometres = new Intl.NumberFormat('uk-UA')

/** What each vehicle cost over the period, the dearest first. */
export function VehicleCostsTable({ rows }: { rows: CostReport['vehicles'] }) {
  return (
    <section aria-labelledby="vehicle-costs" className="rounded-lg border">
      <header className="border-b px-4 py-3">
        <h2 id="vehicle-costs" className="font-medium">
          By vehicle
        </h2>
      </header>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Nothing spent in this period.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">Fuel</TableHead>
              <TableHead className="text-right">Maintenance</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.vehicle.id}>
                <TableCell>
                  <Link
                    to={vehiclePath(row.vehicle.id)}
                    className="font-mono font-medium underline-offset-4 hover:underline"
                  >
                    {row.vehicle.plate}
                  </Link>
                </TableCell>
                <TableCell>{VEHICLE_TYPE_LABELS[row.vehicle.type]}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {kilometres.format(row.km)} km
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatUah(row.fuelUah)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatUah(row.maintenanceUah)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatUah(row.fuelUah + row.maintenanceUah)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  )
}
