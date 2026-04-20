import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Layout, Menu } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
const { Header, Content, Sider } = Layout;
export default function BasicLayout() {
    const navigate = useNavigate();
    return (_jsxs(Layout, { style: { minHeight: "100vh" }, children: [_jsxs(Sider, { children: [_jsx("div", { style: { color: "#fff", padding: 16, fontWeight: 600 }, children: "\u7BA1\u7406\u540E\u53F0" }), _jsx(Menu, { theme: "dark", mode: "inline", items: [
                            { key: "dashboard", label: _jsx(Link, { to: "/", children: "\u6570\u636E\u770B\u677F" }) },
                            { key: "brands", label: _jsx(Link, { to: "/brands", children: "\u54C1\u724C\u7BA1\u7406" }) },
                            { key: "banners", label: _jsx(Link, { to: "/banners", children: "\u8F6E\u64AD\u56FE\u7BA1\u7406" }) },
                            { key: "wallpapers", label: _jsx(Link, { to: "/wallpapers", children: "\u58C1\u7EB8\u7BA1\u7406" }) },
                            { key: "sounds", label: _jsx(Link, { to: "/sounds", children: "\u97F3\u6548\u7BA1\u7406" }) },
                            { key: "users", label: _jsx(Link, { to: "/users", children: "\u7528\u6237\u7BA1\u7406" }) }
                        ] })] }), _jsxs(Layout, { children: [_jsx(Header, { style: {
                            background: "#fff",
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center"
                        }, children: _jsx("a", { onClick: () => {
                                localStorage.removeItem("admin_token");
                                navigate("/login");
                            }, children: "\u9000\u51FA\u767B\u5F55" }) }), _jsx(Content, { style: { margin: 16 }, children: _jsx(Outlet, {}) })] })] }));
}
