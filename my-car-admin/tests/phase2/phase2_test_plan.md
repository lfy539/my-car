# Phase 2 测试计划

## 测试范围

- 后端内容管理接口：`brands`、`banners`、`wallpapers`、`sounds`
- 每个模块的完整 CRUD 流程：创建、列表、更新、删除

## 测试方式

- 自动化：执行 `python tests/phase2/content_api_test.py`
- 手工：后台页面校验四个模块是否可增删改查

## 测试结论

- 自动化测试已执行：
  - `python tests/phase2/content_api_test.py`
  - 4 大模块 CRUD 共 17 项断言全部通过
- 结论：PASS
