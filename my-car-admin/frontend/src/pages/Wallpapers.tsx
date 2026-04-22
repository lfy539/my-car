import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Upload, message } from "antd";
import { useEffect, useState } from "react";
import type { Brand, Wallpaper } from "../types";
import {
  createWallpaper,
  deleteWallpaper,
  listBrands,
  listWallpapers,
  uploadWallpaperOrigin,
  updateWallpaper
} from "../services/content";

const defaultForm: Omit<Wallpaper, "_id"> = {
  title: "",
  coverUrl: "",
  originUrl: "",
  brandId: "",
  modelId: "",
  tags: [],
  resolution: "1080x1920",
  status: 1
};

export default function WallpapersPage() {
  const [rows, setRows] = useState<Wallpaper[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filterBrandId, setFilterBrandId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Wallpaper | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [form] = Form.useForm<any>();

  const fetchData = async (brandId: string = filterBrandId) => {
    const resp = await listWallpapers(brandId);
    setRows(resp.list);
  };

  useEffect(() => {
    fetchData();
    listBrands().then((resp) => setBrands(resp.list)).catch(() => {
      message.error("加载品牌列表失败");
    });
  }, []);

  const onCreate = () => {
    setEditing(null);
    form.setFieldsValue({ ...defaultForm, tagsText: "" });
    setOpen(true);
  };

  const onEdit = (row: Wallpaper) => {
    setEditing(row);
    form.setFieldsValue({ ...row, tagsText: row.tags.join(",") });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    const payload: Omit<Wallpaper, "_id"> = {
      title: values.title,
      coverUrl: values.originUrl,
      originUrl: values.originUrl,
      brandId: values.brandId,
      modelId: values.modelId || "",
      tags: values.tagsText ? values.tagsText.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      resolution: values.resolution,
      status: values.status
    };
    if (editing) {
      await updateWallpaper(editing._id, payload);
      message.success("壁纸更新成功");
    } else {
      await createWallpaper(payload);
      message.success("壁纸创建成功");
    }
    setOpen(false);
    fetchData();
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={onCreate}>
          新增壁纸
        </Button>
        <Select
          style={{ width: 220 }}
          allowClear
          placeholder="按品牌筛选"
          value={filterBrandId || undefined}
          options={brands.map((brand) => ({ label: brand.name, value: brand._id }))}
          onChange={(value) => {
            const next = value || "";
            setFilterBrandId(next);
            fetchData(next);
          }}
        />
      </Space>
      <Table
        rowKey="_id"
        dataSource={rows}
        columns={[
          { title: "标题", dataIndex: "title" },
          {
            title: "品牌",
            dataIndex: "brandId",
            render: (v: string) => brands.find((brand) => brand._id === v)?.name || "-"
          },
          { title: "分辨率", dataIndex: "resolution" },
          { title: "状态", dataIndex: "status", render: (v: number) => <Tag color={v === 1 ? "green" : "default"}>{v === 1 ? "上架" : "下架"}</Tag> },
          {
            title: "操作",
            render: (_, row: Wallpaper) => (
              <Space>
                <Button
                  size="small"
                  onClick={() => {
                    const url = row.originUrl || row.coverUrl;
                    if (!url) {
                      message.warning("该壁纸暂无可预览链接");
                      return;
                    }
                    setPreviewSrc(url);
                    setPreviewTitle(row.title);
                    setPreviewOpen(true);
                  }}
                >
                  查看
                </Button>
                <Button size="small" onClick={() => onEdit(row)}>编辑</Button>
                <Popconfirm
                  title="确认删除？"
                  onConfirm={async () => {
                    await deleteWallpaper(row._id);
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
        title={editing ? "编辑壁纸" : "新增壁纸"}
        open={open}
        onOk={onSubmit}
        onCancel={() => setOpen(false)}
        width={680}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="originUrl" label="原图URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="上传原图">
            <Upload
              showUploadList={false}
              beforeUpload={async (file) => {
                const url = await uploadWallpaperOrigin(file as File);
                form.setFieldValue("originUrl", url);
                form.setFieldValue("coverUrl", url);
                message.success("上传成功");
                return false;
              }}
            >
              <Button>上传原图</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="brandId" label="品牌" rules={[{ required: true, message: "请选择品牌" }]}>
            <Select
              placeholder="请选择品牌"
              options={brands.map((brand) => ({ label: brand.name, value: brand._id }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="modelId" label="车型ID">
            <Input />
          </Form.Item>
          <Form.Item name="tagsText" label="标签（逗号分隔）">
            <Input />
          </Form.Item>
          <Form.Item name="resolution" label="分辨率">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <InputNumber min={0} max={2} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={previewTitle || "壁纸预览"}
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={760}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={previewSrc}
            alt={previewTitle || "壁纸预览"}
            style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
          />
        </div>
      </Modal>
    </>
  );
}
