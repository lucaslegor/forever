import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ProfileEdit } from './pages/ProfileEdit';
import { DebtStatus } from './pages/DebtStatus';
import { HistorialPagos } from './pages/HistorialPagos';
import { PagosResult } from './pages/PagosResult';
import { GrupoFamiliar } from './pages/GrupoFamiliar';
import { Noticias } from './pages/Noticias';
import { NoticiaDetalle } from './pages/NoticiaDetalle';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminDeportistas } from './pages/admin/AdminDeportistas';
import { AdminCuotas } from './pages/admin/AdminCuotas';
import { AdminGruposFamiliares } from './pages/admin/AdminGruposFamiliares';
import { AdminBecas } from './pages/admin/AdminBecas';
import { AdminAdmins } from './pages/admin/AdminAdmins';
import { AdminDisciplinas } from './pages/admin/AdminDisciplinas';
import { AdminNoticias } from './pages/admin/AdminNoticias';
import { AdminNoticiasCrear } from './pages/admin/AdminNoticiasCrear';
import { AdminNoticiasEditar } from './pages/admin/AdminNoticiasEditar';
import { AdminRestablecerContrasena } from './pages/admin/AdminRestablecerContrasena';
import { AdminPerfil } from './pages/admin/AdminPerfil';
import { AdminCancha } from './pages/admin/AdminCancha';
import { AdminReportes } from './pages/admin/AdminReportes';
import { AdminAuditoria } from './pages/admin/AdminAuditoria';
import { AlquilarCancha } from './pages/AlquilarCancha';
import { OpcionesAdminProvider } from './context/OpcionesAdminContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { SeoByRoute } from './components/SeoByRoute';

function App() {
  return (
    <ConfirmProvider>
    <BrowserRouter>
      <SeoByRoute />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        <Route path="/estado-deuda" element={<ProtectedRoute><DebtStatus /></ProtectedRoute>} />
        <Route path="/pagos/success" element={<ProtectedRoute><PagosResult /></ProtectedRoute>} />
        <Route path="/pagos/failure" element={<ProtectedRoute><PagosResult /></ProtectedRoute>} />
        <Route path="/pagos/pending" element={<ProtectedRoute><PagosResult /></ProtectedRoute>} />
        <Route path="/historial-pagos" element={<ProtectedRoute><HistorialPagos /></ProtectedRoute>} />
        <Route path="/grupo-familiar" element={<ProtectedRoute><GrupoFamiliar /></ProtectedRoute>} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/noticias/:id" element={<NoticiaDetalle />} />
        <Route path="/alquilar-cancha" element={<AlquilarCancha />} />

        <Route path="/admin" element={<ProtectedAdminRoute><ConfirmProvider><OpcionesAdminProvider><AdminLayout /></OpcionesAdminProvider></ConfirmProvider></ProtectedAdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="deportistas" element={<AdminDeportistas />} />
          <Route path="cuotas" element={<AdminCuotas />} />
          <Route path="grupos-familiares" element={<AdminGruposFamiliares />} />
          <Route path="becas" element={<AdminBecas />} />
          <Route path="admins" element={<AdminAdmins />} />
          <Route path="disciplinas" element={<AdminDisciplinas />} />
          <Route path="noticias" element={<AdminNoticias />} />
          <Route path="noticias/crear" element={<AdminNoticiasCrear />} />
          <Route path="noticias/editar/:id" element={<AdminNoticiasEditar />} />
          <Route path="restablecer-contrasena" element={<AdminRestablecerContrasena />} />
          <Route path="perfil" element={<AdminPerfil />} />
          <Route path="cancha" element={<AdminCancha />} />
          <Route path="reportes" element={<AdminReportes />} />
          <Route path="auditoria" element={<AdminAuditoria />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ConfirmProvider>
  );
}

export default App;
