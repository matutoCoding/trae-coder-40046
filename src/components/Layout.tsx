import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Scale,
  Warehouse,
  Droplets,
  Flame,
  Snowflake,
  Truck,
  ClipboardCheck,
  Menu,
  X,
  ChevronRight,
  Factory,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: '首页', icon: LayoutDashboard },
  { path: '/weighing', label: '进泥过磅', icon: Scale },
  { path: '/storage', label: '暂存堆棚', icon: Warehouse },
  { path: '/dewatering', label: '调理脱水', icon: Droplets },
  { path: '/thermal-drying', label: '热干化', icon: Flame },
  { path: '/low-temp-drying', label: '低温干燥', icon: Snowflake },
  { path: '/transport', label: '出泥外运', icon: Truck },
  { path: '/ledger', label: '台账监管', icon: ClipboardCheck },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative z-50 h-full bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out',
          collapsed ? 'w-[68px]' : 'w-[220px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-700/50 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <Factory className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white whitespace-nowrap">污泥处置中心</h1>
              <p className="text-[10px] text-slate-400 whitespace-nowrap">运营管理系统</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-primary-700/20 text-primary-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive && 'text-primary-400')} />
                  {!collapsed && (
                    <>
                      <span className="whitespace-nowrap">{item.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-12 border-t border-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <Factory className="w-3.5 h-3.5" />
              <span>污泥处置中心 · 市政污泥业务管理</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
              管
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
