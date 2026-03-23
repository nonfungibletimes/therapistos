import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { NotesPage } from './pages/NotesPage';
import { BillingPage } from './pages/BillingPage';
import { ClientPortalPage } from './pages/ClientPortalPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuth } from './hooks/useAuth';

const client = new QueryClient();

function AppRoutes() {
  const { user, practitioner, loading, signIn, signOut } = useAuth();
  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <>
      {!user && (
        <div className="bg-amber-50 p-3 text-center text-sm">
          Demo mode: enter your email for secure sign-in.
          <button className="ml-2 rounded bg-slate-900 px-2 py-1 text-white" onClick={() => signIn(prompt('Email for magic link:') || '')}>Sign in</button>
        </div>
      )}
      {user && <div className="bg-emerald-50 p-2 text-center text-xs">Signed in as {user.email} <button onClick={() => signOut()} className="underline">Sign out</button></div>}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/portal" element={<ClientPortalPage practitionerId={practitioner?.id} />} />
        <Route path="/app" element={<AppShell />}>
          <Route path="dashboard" element={<DashboardPage practitionerId={practitioner?.id} />} />
          <Route path="clients" element={<ClientsPage practitionerId={practitioner?.id} />} />
          <Route path="appointments" element={<AppointmentsPage practitionerId={practitioner?.id} />} />
          <Route path="notes" element={<NotesPage practitionerId={practitioner?.id} userId={user?.id} />} />
          <Route path="billing" element={<BillingPage practitionerId={practitioner?.id} />} />
          <Route path="settings" element={<SettingsPage practitionerId={practitioner?.id} userId={user?.id} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
