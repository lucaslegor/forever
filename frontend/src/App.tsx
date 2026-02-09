import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
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
import { AdminAdmins } from './pages/admin/AdminAdmins';
import { AdminDisciplinas } from './pages/admin/AdminDisciplinas';
import { AdminNoticiasCrear } from './pages/admin/AdminNoticiasCrear';
import { AdminRestablecerContrasena } from './pages/admin/AdminRestablecerContrasena';
import { OpcionesAdminProvider } from './context/OpcionesAdminContext';
import { ConfirmProvider } from './context/ConfirmContext';

// Placeholder pages
const Cuotas = () => <div style={{ padding: '2rem', textAlign: 'center' }}><h1>Cuotas</h1><p>Página en construcción</p></div>;

function App() {
  return (
    <ConfirmProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/perfil" element={<ProfileEdit />} />
        <Route path="/estado-deuda" element={<DebtStatus />} />
        <Route path="/pagos/success" element={<PagosResult />} />
        <Route path="/pagos/failure" element={<PagosResult />} />
        <Route path="/pagos/pending" element={<PagosResult />} />
        <Route path="/cuotas" element={<Cuotas />} />
        <Route path="/historial-pagos" element={<HistorialPagos />} />
        <Route path="/grupo-familiar" element={<GrupoFamiliar />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/noticias/:id" element={<NoticiaDetalle />} />
        <Route path="/registrarse" element={<div style={{ padding: '2rem', textAlign: 'center' }}><h1>Registrarse</h1><p>Página en construcción</p></div>} />

        <Route path="/admin" element={<ProtectedAdminRoute><ConfirmProvider><OpcionesAdminProvider><AdminLayout /></OpcionesAdminProvider></ConfirmProvider></ProtectedAdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="deportistas" element={<AdminDeportistas />} />
          <Route path="cuotas" element={<AdminCuotas />} />
          <Route path="grupos-familiares" element={<AdminGruposFamiliares />} />
          <Route path="admins" element={<AdminAdmins />} />
          <Route path="disciplinas" element={<AdminDisciplinas />} />
          <Route path="noticias/crear" element={<AdminNoticiasCrear />} />
          <Route path="restablecer-contrasena" element={<AdminRestablecerContrasena />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ConfirmProvider>
  );
}

export default App;
