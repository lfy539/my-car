import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tag, Upload, message } from "antd";
import { useEffect, useState } from "react";
import type { Banner } from "../types";
import { createBanner, deleteBanner, listBanners, updateBanner, uploadBannerImage } from "../services/content";

const defaultForm: Omit<Banner, "_id"> = {
  imageUrl: "",
  linkType: "none",
  linkUrl: "",
  targetId: "",
  title: "",
  sort: 0,
  status: 1
};

export default function BannersPage() {
  const [rows, setRows] = useState<Banner[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form] = Form.useForm<Omit<Banner, "_id">>();

  const fetchData = async () => {
    const resp = await listBanners();
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

  const onEdit = (row: Banner) => {
    setEditing(row);
    form.setFieldsValue({ ...row });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateBanner(editing._id, values);
      message.success("轮播图更新成功");
    } else {
      await createBanner(values);
      message.success("轮播图创建成功");
    }
    setOpen(false);
    fetchData();
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={onCreate}>
          新增轮播图
        </Button>
      </Space>
      <Table
        rowKey="_id"
        dataSource={rows}
        columns={[
          { title: "标题", dataIndex: "title" },
          {
            title: "图片",
            dataIndex: "imageUrl",
            render: (v: string) =>
              v ? (
                <img
                  src={v}
                  alt="banner"
                  style={{ width: 96, height: 54, objectFit: "cover", borderRadius: 6, border: "1px solid #f0f0f0" }}
                />
              ) : (
                "-"
              )
          },
          { title: "跳转类型", dataIndex: "linkType" },
          { title: "排序", dataIndex: "sort" },
          { title: "状态", dataIndex: "status", render: (v: number) => <Tag color={v === 1 ? "green" : "default"}>{v === 1 ? "启用" : "停用"}</Tag> },
          {
            title: "操作",
            render: (_, row: Banner) => (
              <Space>
                <Button size="small" onClick={() => onEdit(row)}>编辑</Button>
                <Popconfirm
                  title="确认删除？"
                  onConfirm={async () => {
                    await deleteBanner(row._id);
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
        title={editing ? "编辑轮播图" : "新增轮播图"}
        open={open}
        onOk={onSubmit}
        onCancel={() => setOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题">
            <Input />
          </Form.Item>
          <Form.Item name="imageUrl" label="图片URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="上传轮播图">
            <Upload
              showUploadList={false}
              beforeUpload={async (file) => {
                const url = await uploadBannerImage(file as File);
                form.setFieldValue("imageUrl", url);
                message.success("上传成功");
                return false;
              }}
            >
              <Button>上传图片</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="linkType" label="跳转类型">
            <Input />
          </Form.Item>
          <Form.Item name="linkUrl" label="跳转链接">
            <Input />
          </Form.Item>
          <Form.Item name="targetId" label="目标ID">
            <Input />
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
