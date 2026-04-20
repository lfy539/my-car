import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
export default function LoginPage() {
    const navigate = useNavigate();
    const onFinish = async (values) => {
        try {
            const resp = await login(values);
            localStorage.setItem("admin_token", resp.access_token);
            message.success("登录成功");
            navigate("/");
        }
        catch (error) {
            message.error("登录失败，请检查账号密码");
        }
    };
    return (_jsx("div", { style: {
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f6f8"
        }, children: _jsxs(Card, { style: { width: 380 }, children: [_jsx(Typography.Title, { level: 4, style: { textAlign: "center" }, children: "\u8F66\u673A\u7F8E\u5316\u5E93\u7BA1\u7406\u540E\u53F0" }), _jsxs(Form, { layout: "vertical", onFinish: onFinish, children: [_jsx(Form.Item, { label: "\u8D26\u53F7", name: "username", rules: [{ required: true, message: "请输入账号" }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u7BA1\u7406\u5458\u8D26\u53F7" }) }), _jsx(Form.Item, { label: "\u5BC6\u7801", name: "password", rules: [{ required: true, message: "请输入密码" }], children: _jsx(Input.Password, { placeholder: "\u8BF7\u8F93\u5165\u5BC6\u7801" }) }), _jsx(Button, { type: "primary", htmlType: "submit", block: true, children: "\u767B\u5F55" })] })] }) }));
}
