import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Upload, message } from "antd";
import { useEffect, useRef, useState } from "react";
import type { Brand, Sound } from "../types";
import {
  createSound,
  deleteSound,
  listBrands,
  listSounds,
  updateSound,
  uploadSoundAudio,
  uploadSoundCover
} from "../services/content";

const defaultForm: Omit<Sound, "_id"> = {
  title: "",
  coverUrl: "",
  audioUrl: "",
  brandId: "",
  modelId: "",
  soundType: "提示音",
  duration: 0,
  bitrate: 320,
  status: 1
};

export default function SoundsPage() {
  const [rows, setRows] = useState<Sound[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filterBrandId, setFilterBrandId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sound | null>(null);
  const [playingId, setPlayingId] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [form] = Form.useForm<any>();

  const fetchData = async (brandId: string = filterBrandId) => {
    const resp = await listSounds(brandId);
    setRows(resp.list);
  };

  useEffect(() => {
    fetchData();
    listBrands().then((resp) => setBrands(resp.list)).catch(() => {
      message.error("加载品牌列表失败");
    });
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const onCreate = () => {
    setEditing(null);
    form.setFieldsValue({ ...defaultForm, duration: undefined });
    setOpen(true);
  };

  const onEdit = (row: Sound) => {
    setEditing(row);
    form.setFieldsValue({ ...row });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      duration: editing ? Number(values.duration || 0) : 0
    };
    if (editing) {
      await updateSound(editing._id, payload);
      message.success("音效更新成功");
    } else {
      await createSound(payload);
      message.success("音效创建成功");
    }
    setOpen(false);
    fetchData();
  };

  const onPlay = (row: Sound) => {
    if (!row.audioUrl) {
      message.warning("该音效暂无音频链接");
      return;
    }

    if (audioRef.current && playingId === row._id) {
      audioRef.current.pause();
      setPlayingId("");
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(row.audioUrl);
    audio.onended = () => setPlayingId("");
    audio.onerror = () => {
      message.error("音频播放失败");
      setPlayingId("");
    };
    audio
      .play()
      .then(() => {
        audioRef.current = audio;
        setPlayingId(row._id);
      })
      .catch(() => {
        message.error("音频播放失败");
      });
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={onCreate}>
          新增音效
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
          { title: "类型", dataIndex: "soundType" },
          { title: "时长(秒)", dataIndex: "duration" },
          { title: "状态", dataIndex: "status", render: (v: number) => <Tag color={v === 1 ? "green" : "default"}>{v === 1 ? "上架" : "下架"}</Tag> },
          {
            title: "操作",
            render: (_, row: Sound) => (
              <Space>
                <Button size="small" onClick={() => onPlay(row)}>
                  {playingId === row._id ? "暂停" : "播放"}
                </Button>
                <Button size="small" onClick={() => onEdit(row)}>编辑</Button>
                <Popconfirm
                  title="确认删除？"
                  onConfirm={async () => {
                    await deleteSound(row._id);
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
        title={editing ? "编辑音效" : "新增音效"}
        open={open}
        onOk={onSubmit}
        onCancel={() => setOpen(false)}
        width={680}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="coverUrl" label="封面URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="上传封面">
            <Upload
              showUploadList={false}
              beforeUpload={async (file) => {
                const url = await uploadSoundCover(file as File);
                form.setFieldValue("coverUrl", url);
                message.success("上传成功");
                return false;
              }}
            >
              <Button>上传封面图</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="audioUrl" label="音频URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="上传音频">
            <Upload
              showUploadList={false}
              beforeUpload={async (file) => {
                const url = await uploadSoundAudio(file as File);
                form.setFieldValue("audioUrl", url);
                message.success("上传成功");
                return false;
              }}
            >
              <Button>上传音频</Button>
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
          <Form.Item name="soundType" label="音效类型">
            <Input />
          </Form.Item>
          {editing ? (
            <Form.Item name="duration" label="时长（秒）">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          ) : (
            <Form.Item label="时长（秒）">
              <Input value="自动识别（上传音频后由后台写入）" disabled />
            </Form.Item>
          )}
          <Form.Item name="bitrate" label="比特率">
            <InputNumber min={64} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <InputNumber min={0} max={2} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
