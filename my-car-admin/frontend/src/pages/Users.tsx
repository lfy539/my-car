import { Button, Input, Select, Space, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import { listUsers, updateUserStatus } from "../services/users";
import type { User } from "../types";

export default function UsersPage() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<number | undefined>(undefined);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await listUsers({ page: 1, pageSize: 100, keyword, status });
      setRows(resp.list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input
          style={{ width: 240 }}
          placeholder="按昵称/OpenID搜索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Select
          allowClear
          style={{ width: 160 }}
          placeholder="状态筛选"
          value={status}
          options={[
            { label: "正常", value: 1 },
            { label: "禁用", value: 2 }
          ]}
          onChange={(value) => setStatus(value)}
        />
        <Button type="primary" onClick={fetchData}>
          查询
        </Button>
      </Space>
      <Table
        loading={loading}
        rowKey="_id"
        dataSource={rows}
        columns={[
          { title: "昵称", dataIndex: "nickname", render: (v: string) => v || "-" },
          { title: "OpenID", dataIndex: "openId", ellipsis: true },
          {
            title: "状态",
            dataIndex: "status",
            render: (v: number) => (
              <Tag color={v === 1 ? "green" : "red"}>{v === 1 ? "正常" : "禁用"}</Tag>
            )
          },
          { title: "收藏数", dataIndex: "favoriteCount" },
          { title: "行为数", dataIndex: "eventCount" },
          {
            title: "操作",
            render: (_, row: User) => (
              <Button
                size="small"
                onClick={async () => {
                  const next = row.status === 1 ? 2 : 1;
                  await updateUserStatus(row._id, next);
                  message.success(next === 1 ? "已解禁" : "已封禁");
                  fetchData();
                }}
              >
                {row.status === 1 ? "封禁" : "解禁"}
              </Button>
            )
          }
        ]}
      />
    </>
  );
}
