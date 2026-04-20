import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import BasicLayout from "./layouts/BasicLayout";
import BannersPage from "./pages/Banners";
import BrandsPage from "./pages/Brands";
import DashboardPage from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import SoundsPage from "./pages/Sounds";
import UsersPage from "./pages/Users";
import WallpapersPage from "./pages/Wallpapers";
function ProtectedRoute({ children }) {
    const token = localStorage.getItem("admin_token");
    if (!token) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return children;
}
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(BasicLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "brands", element: _jsx(BrandsPage, {}) }), _jsx(Route, { path: "banners", element: _jsx(BannersPage, {}) }), _jsx(Route, { path: "wallpapers", element: _jsx(WallpapersPage, {}) }), _jsx(Route, { path: "sounds", element: _jsx(SoundsPage, {}) }), _jsx(Route, { path: "users", element: _jsx(UsersPage, {}) })] })] }));
}
