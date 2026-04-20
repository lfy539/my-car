import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Upload, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { createSound, deleteSound, listBrands, listSounds, updateSound, uploadSoundAudio, uploadSoundCover } from "../services/content";
const defaultForm = {
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
    const [rows, setRows] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filterBrandId, setFilterBrandId] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [playingId, setPlayingId] = useState("");
    const audioRef = useRef(null);
    const [form] = Form.useForm();
    const fetchData = async (brandId = filterBrandId) => {
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
    const onEdit = (row) => {
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
        }
        else {
            await createSound(payload);
            message.success("音效创建成功");
        }
        setOpen(false);
        fetchData();
    };
    const onPlay = (row) => {
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
    return (_jsxs(_Fragment, { children: [_jsxs(Space, { style: { marginBottom: 16 }, children: [_jsx(Button, { type: "primary", onClick: onCreate, children: "\u65B0\u589E\u97F3\u6548" }), _jsx(Select, { style: { width: 220 }, allowClear: true, placeholder: "\u6309\u54C1\u724C\u7B5B\u9009", value: filterBrandId || undefined, options: brands.map((brand) => ({ label: brand.name, value: brand._id })), onChange: (value) => {
                            const next = value || "";
                            setFilterBrandId(next);
                            fetchData(next);
                        } })] }), _jsx(Table, { rowKey: "_id", dataSource: rows, columns: [
                    { title: "标题", dataIndex: "title" },
                    {
                        title: "品牌",
                        dataIndex: "brandId",
                        render: (v) => brands.find((brand) => brand._id === v)?.name || "-"
                    },
                    { title: "类型", dataIndex: "soundType" },
                    { title: "时长(秒)", dataIndex: "duration" },
                    { title: "状态", dataIndex: "status", render: (v) => _jsx(Tag, { color: v === 1 ? "green" : "default", children: v === 1 ? "上架" : "下架" }) },
                    {
                        title: "操作",
                        render: (_, row) => (_jsxs(Space, { children: [_jsx(Button, { size: "small", onClick: () => onPlay(row), children: playingId === row._id ? "暂停" : "播放" }), _jsx(Button, { size: "small", onClick: () => onEdit(row), children: "\u7F16\u8F91" }), _jsx(Popconfirm, { title: "\u786E\u8BA4\u5220\u9664\uFF1F", onConfirm: async () => {
                                        await deleteSound(row._id);
                                        message.success("删除成功");
                                        fetchData();
                                    }, children: _jsx(Button, { size: "small", danger: true, children: "\u5220\u9664" }) })] }))
                    }
                ] }), _jsx(Modal, { title: editing ? "编辑音效" : "新增音效", open: open, onOk: onSubmit, onCancel: () => setOpen(false), width: 680, children: _jsxs(Form, { form: form, layout: "vertical", children: [_jsx(Form.Item, { name: "title", label: "\u6807\u9898", rules: [{ required: true }], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "coverUrl", label: "\u5C01\u9762URL", rules: [{ required: true }], children: _jsx(Input, {}) }), _jsx(Form.Item, { label: "\u4E0A\u4F20\u5C01\u9762", children: _jsx(Upload, { showUploadList: false, beforeUpload: async (file) => {
                                    const url = await uploadSoundCover(file);
                                    form.setFieldValue("coverUrl", url);
                                    message.success("上传成功");
                                    return false;
                                }, children: _jsx(Button, { children: "\u4E0A\u4F20\u5C01\u9762\u56FE" }) }) }), _jsx(Form.Item, { name: "audioUrl", label: "\u97F3\u9891URL", rules: [{ required: true }], children: _jsx(Input, {}) }), _jsx(Form.Item, { label: "\u4E0A\u4F20\u97F3\u9891", children: _jsx(Upload, { showUploadList: false, beforeUpload: async (file) => {
                                    const url = await uploadSoundAudio(file);
                                    form.setFieldValue("audioUrl", url);
                                    message.success("上传成功");
                                    return false;
                                }, children: _jsx(Button, { children: "\u4E0A\u4F20\u97F3\u9891" }) }) }), _jsx(Form.Item, { name: "brandId", label: "\u54C1\u724C", rules: [{ required: true, message: "请选择品牌" }], children: _jsx(Select, { placeholder: "\u8BF7\u9009\u62E9\u54C1\u724C", options: brands.map((brand) => ({ label: brand.name, value: brand._id })), showSearch: true, optionFilterProp: "label" }) }), _jsx(Form.Item, { name: "modelId", label: "\u8F66\u578BID", children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "soundType", label: "\u97F3\u6548\u7C7B\u578B", children: _jsx(Input, {}) }), editing ? (_jsx(Form.Item, { name: "duration", label: "\u65F6\u957F\uFF08\u79D2\uFF09", children: _jsx(InputNumber, { min: 0, style: { width: "100%" } }) })) : (_jsx(Form.Item, { label: "\u65F6\u957F\uFF08\u79D2\uFF09", children: _jsx(Input, { value: "\u81EA\u52A8\u8BC6\u522B\uFF08\u4E0A\u4F20\u97F3\u9891\u540E\u7531\u540E\u53F0\u5199\u5165\uFF09", disabled: true }) })), _jsx(Form.Item, { name: "bitrate", label: "\u6BD4\u7279\u7387", children: _jsx(InputNumber, { min: 64, style: { width: "100%" } }) }), _jsx(Form.Item, { name: "status", label: "\u72B6\u6001", children: _jsx(InputNumber, { min: 0, max: 2, style: { width: "100%" } }) })] }) })] }));
}
