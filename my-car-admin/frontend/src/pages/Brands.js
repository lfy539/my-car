import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tag, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { createBrand, deleteBrand, listBrands, updateBrand, uploadBrandLogo } from "../services/content";
const defaultForm = { name: "", logo: "", sort: 0, status: 1 };
export default function BrandsPage() {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();
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
    const onEdit = (row) => {
        setEditing(row);
        form.setFieldsValue({ name: row.name, logo: row.logo, sort: row.sort, status: row.status });
        setOpen(true);
    };
    const onSubmit = async () => {
        const values = await form.validateFields();
        if (editing) {
            await updateBrand(editing._id, values);
            message.success("品牌更新成功");
        }
        else {
            await createBrand(values);
            message.success("品牌创建成功");
        }
        setOpen(false);
        fetchData();
    };
    return (_jsxs(_Fragment, { children: [_jsx(Space, { style: { marginBottom: 16 }, children: _jsx(Button, { type: "primary", onClick: onCreate, children: "\u65B0\u589E\u54C1\u724C" }) }), _jsx(Table, { rowKey: "_id", dataSource: rows, columns: [
                    { title: "名称", dataIndex: "name" },
                    {
                        title: "Logo",
                        dataIndex: "logo",
                        render: (v) => v ? (_jsx("img", { src: v, alt: "logo", style: { width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #f0f0f0" } })) : ("-")
                    },
                    { title: "排序", dataIndex: "sort" },
                    { title: "状态", dataIndex: "status", render: (v) => _jsx(Tag, { color: v === 1 ? "green" : "default", children: v === 1 ? "启用" : "停用" }) },
                    {
                        title: "操作",
                        render: (_, row) => (_jsxs(Space, { children: [_jsx(Button, { size: "small", onClick: () => onEdit(row), children: "\u7F16\u8F91" }), _jsx(Popconfirm, { title: "\u786E\u8BA4\u5220\u9664\uFF1F", onConfirm: async () => {
                                        await deleteBrand(row._id);
                                        message.success("删除成功");
                                        fetchData();
                                    }, children: _jsx(Button, { size: "small", danger: true, children: "\u5220\u9664" }) })] }))
                    }
                ] }), _jsx(Modal, { title: editing ? "编辑品牌" : "新增品牌", open: open, onOk: onSubmit, onCancel: () => setOpen(false), children: _jsxs(Form, { form: form, layout: "vertical", children: [_jsx(Form.Item, { name: "name", label: "\u54C1\u724C\u540D\u79F0", rules: [{ required: true }], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "logo", label: "Logo URL", children: _jsx(Input, {}) }), _jsx(Form.Item, { label: "\u4E0A\u4F20 Logo", children: _jsx(Upload, { showUploadList: false, beforeUpload: async (file) => {
                                    const url = await uploadBrandLogo(file);
                                    form.setFieldValue("logo", url);
                                    message.success("上传成功");
                                    return false;
                                }, children: _jsx(Button, { children: "\u4E0A\u4F20\u6587\u4EF6" }) }) }), _jsx(Form.Item, { name: "sort", label: "\u6392\u5E8F", children: _jsx(InputNumber, { min: 0, style: { width: "100%" } }) }), _jsx(Form.Item, { name: "status", label: "\u72B6\u6001", children: _jsx(InputNumber, { min: 0, max: 2, style: { width: "100%" } }) })] }) })] }));
}
