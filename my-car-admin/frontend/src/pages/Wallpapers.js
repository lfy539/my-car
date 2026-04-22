import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { createWallpaper, deleteWallpaper, listBrands, listWallpapers, uploadWallpaperOrigin, updateWallpaper } from "../services/content";
const defaultForm = {
    title: "",
    coverUrl: "",
    originUrl: "",
    brandId: "",
    modelId: "",
    tags: [],
    resolution: "",
    status: 1
};
export default function WallpapersPage() {
    const [rows, setRows] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filterBrandId, setFilterBrandId] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewSrc, setPreviewSrc] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [form] = Form.useForm();
    const fetchData = async (brandId = filterBrandId) => {
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
    const onEdit = (row) => {
        setEditing(row);
        form.setFieldsValue({ ...row, tagsText: row.tags.join(",") });
        setOpen(true);
    };
    const onSubmit = async () => {
        const values = await form.validateFields();
        const payload = {
            title: values.title,
            coverUrl: values.originUrl,
            originUrl: values.originUrl,
            brandId: values.brandId,
            modelId: values.modelId || "",
            tags: values.tagsText ? values.tagsText.split(",").map((s) => s.trim()).filter(Boolean) : [],
            resolution: values.resolution,
            status: values.status
        };
        if (editing) {
            await updateWallpaper(editing._id, payload);
            message.success("壁纸更新成功");
        }
        else {
            await createWallpaper(payload);
            message.success("壁纸创建成功");
        }
        setOpen(false);
        fetchData();
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Space, { style: { marginBottom: 16 }, children: [_jsx(Button, { type: "primary", onClick: onCreate, children: "\u65B0\u589E\u58C1\u7EB8" }), _jsx(Select, { style: { width: 220 }, allowClear: true, placeholder: "\u6309\u54C1\u724C\u7B5B\u9009", value: filterBrandId || undefined, options: brands.map((brand) => ({ label: brand.name, value: brand._id })), onChange: (value) => {
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
                    { title: "分辨率", dataIndex: "resolution" },
                    { title: "状态", dataIndex: "status", render: (v) => _jsx(Tag, { color: v === 1 ? "green" : "default", children: v === 1 ? "上架" : "下架" }) },
                    {
                        title: "操作",
                        render: (_, row) => (_jsxs(Space, { children: [_jsx(Button, { size: "small", onClick: () => {
                                        const url = row.originUrl || row.coverUrl;
                                        if (!url) {
                                            message.warning("该壁纸暂无可预览链接");
                                            return;
                                        }
                                        setPreviewSrc(url);
                                        setPreviewTitle(row.title);
                                        setPreviewOpen(true);
                                    }, children: "\u67E5\u770B" }), _jsx(Button, { size: "small", onClick: () => onEdit(row), children: "\u7F16\u8F91" }), _jsx(Popconfirm, { title: "\u786E\u8BA4\u5220\u9664\uFF1F", onConfirm: async () => {
                                        await deleteWallpaper(row._id);
                                        message.success("删除成功");
                                        fetchData();
                                    }, children: _jsx(Button, { size: "small", danger: true, children: "\u5220\u9664" }) })] }))
                    }
                ] }), _jsx(Modal, { title: editing ? "编辑壁纸" : "新增壁纸", open: open, onOk: onSubmit, onCancel: () => setOpen(false), width: 680, children: _jsxs(Form, { form: form, layout: "vertical", children: [_jsx(Form.Item, { name: "title", label: "\u6807\u9898", rules: [{ required: true }], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "originUrl", label: "\u539F\u56FEURL", rules: [{ required: true }], children: _jsx(Input, {}) }), _jsx(Form.Item, { label: "\u4E0A\u4F20\u539F\u56FE", children: _jsx(Upload, { showUploadList: false, beforeUpload: async (file) => {
                                    const uploaded = await uploadWallpaperOrigin(file);
                                    form.setFieldValue("originUrl", uploaded.url);
                                    form.setFieldValue("coverUrl", uploaded.url);
                                    if (uploaded.resolution) {
                                        form.setFieldValue("resolution", uploaded.resolution);
                                    }
                                    message.success("上传成功");
                                    return false;
                                }, children: _jsx(Button, { children: "\u4E0A\u4F20\u539F\u56FE" }) }) }), _jsx(Form.Item, { name: "brandId", label: "\u54C1\u724C", rules: [{ required: true, message: "请选择品牌" }], children: _jsx(Select, { placeholder: "\u8BF7\u9009\u62E9\u54C1\u724C", options: brands.map((brand) => ({ label: brand.name, value: brand._id })), showSearch: true, optionFilterProp: "label" }) }), _jsx(Form.Item, { name: "modelId", label: "\u8F66\u578BID", children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "tagsText", label: "\u6807\u7B7E\uFF08\u9017\u53F7\u5206\u9694\uFF09", children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "resolution", label: "\u5206\u8FA8\u7387\uFF08\u81EA\u52A8\u8BC6\u522B\uFF09", children: _jsx(Input, { disabled: true, placeholder: "\u4E0A\u4F20\u539F\u56FE\u540E\u81EA\u52A8\u586B\u5145" }) }), _jsx(Form.Item, { name: "status", label: "\u72B6\u6001", children: _jsx(InputNumber, { min: 0, max: 2, style: { width: "100%" } }) })] }) }), _jsx(Modal, { title: previewTitle || "壁纸预览", open: previewOpen, footer: null, onCancel: () => setPreviewOpen(false), width: 760, children: _jsx("div", { style: { textAlign: "center" }, children: _jsx("img", { src: previewSrc, alt: previewTitle || "壁纸预览", style: { maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" } }) }) })] }));
}
