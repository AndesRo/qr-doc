import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Car, FileStack, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { LogoWordmark } from "@/components/Logo";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/vehiculos", label: "Vehículos", icon: Car, end: false },
  { to: "/admin/documentos", label: "Documentos", icon: FileStack, end: false },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <LogoWordmark />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
                )
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
