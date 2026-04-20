import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tag, Upload, message } from "antd";
import { useEffect, useState } from "react";
import type { Brand } from "../types";
import { createBrand, deleteBrand, listBrands, updateBrand, uploadBrandLogo } from "../services/content";

const defaultForm: Omit<Brand, "_id"> = { name: "", logo: "", sort: 0, status: 1 };

export default function BrandsPage() {
  const [rows, setRows] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form] = Form.useForm<Omit<Brand, "_id">>();

  const fetchData = async () => {
    const resp = await listBrands();
    setRows(resp.list);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onCreate = () => {
    setEditing(null);
    form.setFieldsValue(defaultForm);
    setOpen(true);
  };

  const onEdit = (row: Brand) => {
    setEditing(row);
    form.setFieldsValue({ name: row.name, logo: row.logo, sort: row.sort, status: row.status });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateBrand(editing._id, values);
      message.success("品牌更新成功");
    } else {
      await createBrand(values);
      message.success("品牌创建成功");
    }
    setOpen(false);
    fetchData();
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={onCreate}>
          新增品牌
        </Button>
      </Space>
      <Table
        rowKey="_id"
        dataSource={rows}
        columns={[
          { title: "名称", dataIndex: "name" },
          {
            title: "Logo",
            dataIndex: "logo",
            render: (v: string) =>
              v ? (
                <img
                  src={v}
                  alt="logo"
                  style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #f0f0f0" }}
                />
              ) : (
                "-"
              )
          },
          { title: "排序", dataIndex: "sort" },
          { title: "状态", dataIndex: "status", render: (v: number) => <Tag color={v === 1 ? "green" : "default"}>{v === 1 ? "启用" : "停用"}</Tag> },
          {
            title: "操作",
            render: (_, row: Brand) => (
              <Space>
                <Button size="small" onClick={() => onEdit(row)}>编辑</Button>
                <Popconfirm
                  title="确认删除？"
                  onConfirm={async () => {
                    await deleteBrand(row._id);
                    message.success("删除成功");
                    fetchData();
                  }}
                >
                  <Button size="small" danger>删除</Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
      <Modal
        title={editing ? "编辑品牌" : "新增品牌"}
        open={open}
        onOk={onSubmit}
        onCancel={() => setOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="品牌名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="logo" label="Logo URL">
            <Input />
          </Form.Item>
          <Form.Item label="上传 Logo">
            <Upload
              showUploadList={false}
              beforeUpload={async (file) => {
                const url = await uploadBrandLogo(file as File);
                form.setFieldValue("logo", url);
                message.success("上传成功");
                return false;
              }}
            >
              <Button>上传文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <InputNumber min={0} max={2} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
