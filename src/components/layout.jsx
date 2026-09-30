import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/navbar'

export function Layout() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <Outlet />
    </div>
  )
}
