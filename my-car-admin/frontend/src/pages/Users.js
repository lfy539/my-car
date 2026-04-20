import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button, Input, Select, Space, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import { listUsers, updateUserStatus } from "../services/users";
export default function UsersPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState(undefined);
    const fetchData = async () => {
        setLoading(true);
        try {
            const resp = await listUsers({ page: 1, pageSize: 100, keyword, status });
            setRows(resp.list);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);
    return (_jsxs(_Fragment, { children: [_jsxs(Space, { style: { marginBottom: 16 }, children: [_jsx(Input, { style: { width: 240 }, placeholder: "\u6309\u6635\u79F0/OpenID\u641C\u7D22", value: keyword, onChange: (e) => setKeyword(e.target.value) }), _jsx(Select, { allowClear: true, style: { width: 160 }, placeholder: "\u72B6\u6001\u7B5B\u9009", value: status, options: [
                            { label: "正常", value: 1 },
                            { label: "禁用", value: 2 }
                        ], onChange: (value) => setStatus(value) }), _jsx(Button, { type: "primary", onClick: fetchData, children: "\u67E5\u8BE2" })] }), _jsx(Table, { loading: loading, rowKey: "_id", dataSource: rows, columns: [
                    { title: "昵称", dataIndex: "nickname", render: (v) => v || "-" },
                    { title: "OpenID", dataIndex: "openId", ellipsis: true },
                    {
                        title: "状态",
                        dataIndex: "status",
                        render: (v) => (_jsx(Tag, { color: v === 1 ? "green" : "red", children: v === 1 ? "正常" : "禁用" }))
                    },
                    { title: "收藏数", dataIndex: "favoriteCount" },
                    { title: "行为数", dataIndex: "eventCount" },
                    {
                        title: "操作",
                        render: (_, row) => (_jsx(Button, { size: "small", onClick: async () => {
                                const next = row.status === 1 ? 2 : 1;
                                await updateUserStatus(row._id, next);
                                message.success(next === 1 ? "已解禁" : "已封禁");
                                fetchData();
                            }, children: row.status === 1 ? "封禁" : "解禁" }))
                    }
                ] })] }));
}
