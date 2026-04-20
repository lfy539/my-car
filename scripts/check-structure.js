#!/usr/bin/env node

/**
 * 项目结构检查脚本
 * 验证 Phase 0 的所有必要文件是否已创建
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const requiredFiles = [
  // 项目配置
  'project.config.json',
  'tsconfig.json',
  'typings/index.d.ts',
  
  // 小程序入口
  'miniprogram/app.json',
  'miniprogram/app.ts',
  'miniprogram/app.scss',
  'miniprogram/sitemap.json',
  
  // 样式系统
  'miniprogram/styles/variables.scss',
  'miniprogram/styles/mixins.scss',
  
  // 工具函数
  'miniprogram/utils/error-codes.ts',
  'miniprogram/utils/request.ts',
  
  // API 服务
  'miniprogram/services/api.ts',
  
  // 状态管理
  'miniprogram/stores/index.ts',
  'miniprogram/stores/user.ts',
  'miniprogram/stores/app.ts',
  
  // 组件
  'miniprogram/components/tab-bar/index.ts',
  'miniprogram/components/card/index.ts',
  'miniprogram/components/empty/index.ts',
  'miniprogram/components/error/index.ts',
  'miniprogram/components/loading/index.ts',
  
  // 页面
  'miniprogram/pages/index/index.ts',
  'miniprogram/pages/wallpaper/index.ts',
  'miniprogram/pages/sound/index.ts',
  'miniprogram/pages/mine/index.ts',
  
  // 云函数
  'cloudfunctions/api-health/index.js',
  'cloudfunctions/api-health/package.json',
  'cloudfunctions/api-user/index.js',
  'cloudfunctions/api-user/package.json',
  
  // 文档
  'docs/API_ERROR_CODES.md',
  'docs/STORAGE_SPEC.md',
  'docs/DEVELOPMENT.md',
  'README.md',
];

console.log('🔍 检查项目结构...\n');

let passed = 0;
let failed = 0;

for (const file of requiredFiles) {
  const fullPath = path.join(ROOT, file);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`✅ ${file}`);
    passed++;
  } else {
    console.log(`❌ ${file} (缺失)`);
    failed++;
  }
}

console.log('\n' + '='.repeat(50));
console.log(`📊 检查结果: ${passed} 通过, ${failed} 失败`);

if (failed === 0) {
  console.log('🎉 所有文件检查通过！Phase 0 基础结构完整。\n');
  console.log('📋 下一步:');
  console.log('   1. 在微信开发者工具中打开项目');
  console.log('   2. 配置 AppID 和云开发环境 ID');
  console.log('   3. 部署云函数');
  console.log('   4. 创建数据库集合');
  console.log('   5. 在"我的"页面点击"接口健康检查"验证');
  process.exit(0);
} else {
  console.log('⚠️  部分文件缺失，请检查上述列表。');
  process.exit(1);
}
