import { NavLink, Outlet } from 'react-router-dom';

const links = [
  ['Dashboard', '/app/dashboard'],
  ['Clients', '/app/clients'],
  ['Appointments', '/app/appointments'],
  ['Notes', '/app/notes'],
  ['Billing', '/app/billing'],
  ['Client Portal', '/portal'],
  ['Settings', '/app/settings'],
] as const;

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">TherapistOS</h1>
          <nav className="flex gap-2 overflow-x-auto">
            {links.map(([name, to]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `rounded px-3 py-1 text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                {name}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
