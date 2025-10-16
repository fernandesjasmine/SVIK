import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'; 

import LoginPage from './pages/LoginPage';
import Dashboard from './components/Dashboard';
import Reportspage from './pages/Reportspage';
import MasterTablesPage from './pages/MasterTablesPage';
import LoginHistory from './pages/LoginHistory';
import AdminActivityLog from './pages/AdminActivityLog';
import UserActivityLog from './pages/UserActivityLog';
import SizeMasterPage from './pages/SizeMasterPage';
import ApplicationMasterPage from './pages/ApplicationMasterPage';
import TileMasterPage from './pages/TileMasterPage';
import ProfileMasterPage from './pages/ProfileMasterPage';
import ColorMasterPage from './pages/ColorMasterPage';
import CategoryMasterPage from './pages/CategoryMasterPage';
import SpaceMasterPage from './pages/SpaceMasterPage';
import FinishMasterPage from './pages/FinishMasterPage';
import UserMasterPage from './pages/UserMasterPage';
import CompanyMasterPage from './pages/CompanyMasterPage';
import PlanMasterPage from './pages/PlanMasterPage';
import RegisterPage from './pages/RegisterPage';
import AddTilePage from './pages/AddTilePage';
import EditTilePage from './pages/EditTilePage';
import ProductsImagePage from './pages/ProductsImagePage';
import ViewTilePage from './pages/ViewTilePage';

export default function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <BrowserRouter basename="/backoff">
          {/* ToastContainer added at root so all components can use toast */}
          <ToastContainer 
            
          />

          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/masterTables" element={<MasterTablesPage />} />
            <Route path="/reportsPage" element={<Reportspage />} />
            <Route path="/loginHistory" element={<LoginHistory />} />
            <Route path="/adminActivity" element={<AdminActivityLog />} />
            <Route path="/userActivity" element={<UserActivityLog />} />
            <Route path="/sizeMaster" element={<SizeMasterPage />} />
            <Route path="/applicationMaster" element={<ApplicationMasterPage />} />
            <Route path="/tileMaster" element={<TileMasterPage />} />
            <Route path="/tileImage" element={<ProductsImagePage />} />
            <Route path="/profileMaster" element={<ProfileMasterPage />} />
            <Route path="/colorMaster" element={<ColorMasterPage />} />
            <Route path="/categoryMaster" element={<CategoryMasterPage />} />
            <Route path="/spaceMaster" element={<SpaceMasterPage />} />
            <Route path="/finishMaster" element={<FinishMasterPage />} />
            <Route path="/userMaster" element={<UserMasterPage />} />
            <Route path="/companyMaster" element={<CompanyMasterPage />} />
            <Route path="/planMaster" element={<PlanMasterPage />} />
            <Route path="/add-tile" element={<AddTilePage />} />
            <Route path="/edit-tile/:tileId" element={<EditTilePage />} />
            <Route path="/view-tile/:tileId" element={<ViewTilePage />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  );
}
