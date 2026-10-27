import { PageHeader } from '@/shared/ui/page-header'
import { FleetMap } from '@/widgets/fleet-map'

export function LiveMapPage() {
  return (
    <>
      <PageHeader
        title="Live map"
        description="Where every vehicle is right now. The demo fleet is simulated: it drives real roads on a timetable."
      />
      <FleetMap className="min-h-[420px] flex-1" />
    </>
  )
}
