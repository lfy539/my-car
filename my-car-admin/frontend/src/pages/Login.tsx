import { Button, Card, Form, Input, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const resp = await login(values);
      localStorage.setItem("admin_token", resp.access_token);
      message.success("登录成功");
      navigate("/");
    } catch (error) {
      message.error("登录失败，请检查账号密码");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f6f8"
      }}
    >
      <Card style={{ width: 380 }}>
        <Typography.Title level={4} style={{ textAlign: "center" }}>
          车机美化库管理后台
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: "请输入账号" }]}
          >
            <Input placeholder="请输入管理员账号" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}
