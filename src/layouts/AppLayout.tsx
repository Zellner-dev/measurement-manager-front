import { NavLink, Outlet } from 'react-router-dom'
import { ChartIcon, DumbbellIcon, HistoryIcon, HomeIcon, LogoutIcon, RulerIcon, UserIcon } from '../components/Icons'
import { Logo } from '../components/Logo'
import { useAuth } from '../hooks/useAuth'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: HomeIcon, mobile: true },
  { to: '/workouts', label: 'Treinos', icon: DumbbellIcon, mobile: true },
  { to: '/history', label: 'Histórico', icon: HistoryIcon, mobile: false },
  { to: '/progress', label: 'Progresso', icon: ChartIcon, mobile: true },
  { to: '/measurements', label: 'Medidas', icon: RulerIcon, mobile: true },
  { to: '/profile', label: 'Perfil', icon: UserIcon, mobile: true },
]

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface p-5 lg:flex">
        <Logo className="mb-10 px-2" />
        <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex h-12 items-center gap-3 rounded-xl px-3 font-medium transition-colors ${
                  isActive ? 'bg-brand text-black' : 'text-muted hover:bg-surface-2 hover:text-fg'
                }`
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line pt-4">
          <p className="truncate px-3 text-sm font-semibold">{user?.name}</p>
          <p className="truncate px-3 text-xs text-muted">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg"
          >
            <LogoutIcon className="size-5" /> Sair
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV_ITEMS.filter((item) => item.mobile).map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-brand' : 'text-muted hover:text-fg'
                  }`
                }
              >
                <Icon className="size-6" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
