import {
  CalendarRangeIcon,
  LayoutDashboardIcon,
  MapIcon,
  RouteIcon,
  SettingsIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
  WrenchIcon,
  type LucideIcon,
} from 'lucide-react'

import { paths } from '@/shared/routes'

export interface NavItemConfig {
  title: string
  to: string
  icon: LucideIcon
  /** Match the path exactly — needed for "/" so it isn't active on every page */
  end?: boolean
}

export interface NavGroupConfig {
  label: string
  items: NavItemConfig[]
}

export const NAV_GROUPS: NavGroupConfig[] = [
  {
    label: 'Operations',
    items: [
      { title: 'Dashboard', to: paths.dashboard, icon: LayoutDashboardIcon, end: true },
      { title: 'Live map', to: paths.liveMap, icon: MapIcon },
      { title: 'Trips', to: paths.trips, icon: RouteIcon },
      { title: 'Dispatch', to: paths.dispatch, icon: CalendarRangeIcon },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { title: 'Vehicles', to: paths.vehicles, icon: TruckIcon },
      { title: 'Maintenance', to: paths.maintenance, icon: WrenchIcon },
      { title: 'Drivers', to: paths.drivers, icon: UsersIcon },
    ],
  },
  {
    label: 'Finance',
    items: [{ title: 'Costs', to: paths.costs, icon: WalletIcon }],
  },
]

export const SETTINGS_NAV_ITEM: NavItemConfig = {
  title: 'Settings',
  to: paths.settings,
  icon: SettingsIcon,
}
