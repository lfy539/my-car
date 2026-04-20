import { Navigate, Route, Routes } from "react-router-dom";
import BasicLayout from "./layouts/BasicLayout";
import BannersPage from "./pages/Banners";
import BrandsPage from "./pages/Brands";
import DashboardPage from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import SoundsPage from "./pages/Sounds";
import UsersPage from "./pages/Users";
import WallpapersPage from "./pages/Wallpapers";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <BasicLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="brands" element={<BrandsPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="wallpapers" element={<WallpapersPage />} />
        <Route path="sounds" element={<SoundsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}
