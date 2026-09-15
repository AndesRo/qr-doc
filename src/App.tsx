import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/AdminLayout";

import Home from "@/pages/Home";
import PublicVehicle from "@/pages/PublicVehicle";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/admin/Dashboard";
import VehiclesList from "@/pages/admin/VehiclesList";
import VehicleForm from "@/pages/admin/VehicleForm";
import DocumentsList from "@/pages/admin/DocumentsList";
import QrPage from "@/pages/admin/QrPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/v/:patente" element={<PublicVehicle />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="vehiculos" element={<VehiclesList />} />
            <Route path="vehiculos/nuevo" element={<VehicleForm />} />
            <Route path="vehiculos/:id" element={<VehicleForm />} />
            <Route path="documentos" element={<DocumentsList />} />
            <Route path="qr/:id" element={<QrPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
