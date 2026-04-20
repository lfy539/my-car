import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tag, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { createBanner, deleteBanner, listBanners, updateBanner, uploadBannerImage } from "../services/content";
const defaultForm = {
    imageUrl: "",
    linkType: "none",
    linkUrl: "",
    targetId: "",
    title: "",
    sort: 0,
    status: 1
};
export default function BannersPage() {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();
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
    const onEdit = (row) => {
        setEditing(row);
        form.setFieldsValue({ ...row });
        setOpen(true);
    };
    const onSubmit = async () => {
        const values = await form.validateFields();
        if (editing) {
            await updateBanner(editing._id, values);
            message.success("轮播图更新成功");
        }
        else {
            await createBanner(values);
            message.success("轮播图创建成功");
        }
        setOpen(false);
        fetchData();
    };
    return (_jsxs(_Fragment, { children: [_jsx(Space, { style: { marginBottom: 16 }, children: _jsx(Button, { type: "primary", onClick: onCreate, children: "\u65B0\u589E\u8F6E\u64AD\u56FE" }) }), _jsx(Table, { rowKey: "_id", dataSource: rows, columns: [
                    { title: "标题", dataIndex: "title" },
                    {
                        title: "图片",
                        dataIndex: "imageUrl",
                        render: (v) => v ? (_jsx("img", { src: v, alt: "banner", style: { width: 96, height: 54, objectFit: "cover", borderRadius: 6, border: "1px solid #f0f0f0" } })) : ("-")
                    },
                    { title: "跳转类型", dataIndex: "linkType" },
                    { title: "排序", dataIndex: "sort" },
                    { title: "状态", dataIndex: "status", render: (v) => _jsx(Tag, { color: v === 1 ? "green" : "default", children: v === 1 ? "启用" : "停用" }) },
                    {
                        title: "操作",
                        render: (_, row) => (_jsxs(Space, { children: [_jsx(Button, { size: "small", onClick: () => onEdit(row), children: "\u7F16\u8F91" }), _jsx(Popconfirm, { title: "\u786E\u8BA4\u5220\u9664\uFF1F", onConfirm: async () => {
                                        await deleteBanner(row._id);
                                        message.success("删除成功");
                                        fetchData();
                                    }, children: _jsx(Button, { size: "small", danger: true, children: "\u5220\u9664" }) })] }))
                    }
                ] }), _jsx(Modal, { title: editing ? "编辑轮播图" : "新增轮播图", open: open, onOk: onSubmit, onCancel: () => setOpen(false), children: _jsxs(Form, { form: form, layout: "vertical", children: [_jsx(Form.Item, { name: "title", label: "\u6807\u9898", children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "imageUrl", label: "\u56FE\u7247URL", rules: [{ required: true }], children: _jsx(Input, {}) }), _jsx(Form.Item, { label: "\u4E0A\u4F20\u8F6E\u64AD\u56FE", children: _jsx(Upload, { showUploadList: false, beforeUpload: async (file) => {
                                    const url = await uploadBannerImage(file);
                                    form.setFieldValue("imageUrl", url);
                                    message.success("上传成功");
                                    return false;
                                }, children: _jsx(Button, { children: "\u4E0A\u4F20\u56FE\u7247" }) }) }), _jsx(Form.Item, { name: "linkType", label: "\u8DF3\u8F6C\u7C7B\u578B", children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "linkUrl", label: "\u8DF3\u8F6C\u94FE\u63A5", children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "targetId", label: "\u76EE\u6807ID", children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "sort", label: "\u6392\u5E8F", children: _jsx(InputNumber, { min: 0, style: { width: "100%" } }) }), _jsx(Form.Item, { name: "status", label: "\u72B6\u6001", children: _jsx(InputNumber, { min: 0, max: 2, style: { width: "100%" } }) })] }) })] }));
}
