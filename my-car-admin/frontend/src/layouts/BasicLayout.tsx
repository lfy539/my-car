import { Layout, Menu } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";

const { Header, Content, Sider } = Layout;

export default function BasicLayout() {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div style={{ color: "#fff", padding: 16, fontWeight: 600 }}>管理后台</div>
        <Menu
          theme="dark"
          mode="inline"
          items={[
            { key: "dashboard", label: <Link to="/">数据看板</Link> },
            { key: "brands", label: <Link to="/brands">品牌管理</Link> },
            { key: "banners", label: <Link to="/banners">轮播图管理</Link> },
            { key: "wallpapers", label: <Link to="/wallpapers">壁纸管理</Link> },
            { key: "sounds", label: <Link to="/sounds">音效管理</Link> },
            { key: "users", label: <Link to="/users">用户管理</Link> }
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center"
          }}
        >
          <a
            onClick={() => {
              localStorage.removeItem("admin_token");
              navigate("/login");
            }}
          >
            退出登录
          </a>
        </Header>
        <Content style={{ margin: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
