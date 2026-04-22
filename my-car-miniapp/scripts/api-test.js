/**
 * API 测试脚本
 * 用于验证云函数的正确性
 * 
 * 使用方法：在微信开发者工具的云开发控制台中运行
 * 或者将测试用例复制到云函数调试面板中执行
 */

const testCases = {
  // ============================================
  // api-health 测试
  // ============================================
  'api-health': [
    {
      name: '健康检查 - 正常',
      input: {},
      expected: { code: 0 },
    },
  ],

  // ============================================
  // api-user 测试
  // ============================================
  'api-user': [
    {
      name: '登录 - 正常',
      input: { action: 'login' },
      expected: { code: 0, 'data._id': 'exists' },
    },
    {
      name: '获取用户信息',
      input: { action: 'getUserInfo' },
      expected: { code: 0 },
    },
    {
      name: '更新用户信息',
      input: { action: 'updateUserInfo', data: { nickname: '测试用户' } },
      expected: { code: 0 },
    },
  ],

  // ============================================
  // api-home 测试
  // ============================================
  'api-home': [
    {
      name: '获取首页数据',
      input: {},
      expected: { 
        code: 0,
        'data.brands': 'array',
        'data.hotWallpapers': 'array',
        'data.hotSounds': 'array',
      },
    },
  ],

  // ============================================
  // api-wallpapers 测试
  // ============================================
  'api-wallpapers': [
    {
      name: '获取壁纸列表 - 默认参数',
      input: { action: 'list' },
      expected: { code: 0, 'data.list': 'array' },
    },
    {
      name: '获取壁纸列表 - 带分页',
      input: { action: 'list', page: 1, pageSize: 5 },
      expected: { code: 0, 'data.page': 1, 'data.pageSize': 5 },
    },
    {
      name: '获取壁纸列表 - 按品牌筛选',
      input: { action: 'list', brandId: '1' },
      expected: { code: 0 },
    },
    {
      name: '获取壁纸列表 - 热门排序',
      input: { action: 'list', sortBy: 'hot' },
      expected: { code: 0 },
    },
    {
      name: '获取壁纸详情 - 缺少ID',
      input: { action: 'detail' },
      expected: { code: 1001 },
    },
    {
      name: '获取壁纸详情 - 不存在的ID',
      input: { action: 'detail', id: 'not_exist_id' },
      expected: { code: 3001 },
    },
  ],

  // ============================================
  // api-sounds 测试
  // ============================================
  'api-sounds': [
    {
      name: '获取音效列表 - 默认参数',
      input: { action: 'list' },
      expected: { code: 0, 'data.list': 'array' },
    },
    {
      name: '获取音效列表 - 按类型筛选',
      input: { action: 'list', soundType: '锁车声' },
      expected: { code: 0 },
    },
    {
      name: '获取音效详情 - 缺少ID',
      input: { action: 'detail' },
      expected: { code: 1001 },
    },
  ],

  // ============================================
  // api-favorites 测试
  // ============================================
  'api-favorites': [
    {
      name: '添加收藏 - 缺少参数',
      input: { action: 'add' },
      expected: { code: 1001 },
    },
    {
      name: '获取收藏列表',
      input: { action: 'list' },
      expected: { code: 0, 'data.list': 'array' },
    },
    {
      name: '检查收藏状态 - 缺少参数',
      input: { action: 'check' },
      expected: { code: 1001 },
    },
  ],

  // ============================================
  // api-search 测试
  // ============================================
  'api-search': [
    {
      name: '获取搜索建议 - 空关键词',
      input: { action: 'suggest', keyword: '' },
      expected: { code: 0, 'data.suggestions': 'array' },
    },
    {
      name: '获取搜索建议 - 有效关键词',
      input: { action: 'suggest', keyword: '特斯拉' },
      expected: { code: 0 },
    },
    {
      name: '搜索 - 缺少关键词',
      input: { action: 'search' },
      expected: { code: 1001 },
    },
    {
      name: '搜索 - 正常搜索',
      input: { action: 'search', keyword: '壁纸' },
      expected: { code: 0 },
    },
    {
      name: '获取热门关键词',
      input: { action: 'hot' },
      expected: { code: 0, 'data.keywords': 'array' },
    },
  ],

  // ============================================
  // api-events 测试
  // ============================================
  'api-events': [
    {
      name: '上报事件 - 缺少事件类型',
      input: { action: 'report' },
      expected: { code: 1001 },
    },
    {
      name: '上报事件 - 无效事件类型',
      input: { action: 'report', eventType: 'invalid' },
      expected: { code: 1001 },
    },
    {
      name: '上报事件 - 正常上报',
      input: { action: 'report', eventType: 'view', targetType: 'wallpaper', targetId: 'test123' },
      expected: { code: 0 },
    },
    {
      name: '批量上报 - 空数组',
      input: { action: 'batch', events: [] },
      expected: { code: 1001 },
    },
  ],

  // ============================================
  // api-stats 测试
  // ============================================
  'api-stats': [
    {
      name: '获取总览数据',
      input: { action: 'overview' },
      expected: { 
        code: 0,
        'data.totalUsers': 'number',
        'data.totalWallpapers': 'number',
      },
    },
    {
      name: '获取趋势数据 - 7天',
      input: { action: 'trend', days: 7 },
      expected: { code: 0, 'data.dates': 'array' },
    },
    {
      name: '获取热门内容',
      input: { action: 'topContent', limit: 5 },
      expected: { code: 0 },
    },
    {
      name: '获取用户统计',
      input: { action: 'userStats', page: 1, pageSize: 10 },
      expected: { code: 0, 'data.list': 'array' },
    },
  ],
};

/**
 * 验证响应是否符合预期
 */
function validateResponse(response, expected) {
  const errors = [];

  for (const [key, expectedValue] of Object.entries(expected)) {
    const actualValue = key.includes('.')
      ? key.split('.').reduce((obj, k) => obj?.[k], response)
      : response[key];

    if (expectedValue === 'exists') {
      if (actualValue === undefined || actualValue === null) {
        errors.push(`${key} 应该存在，但实际为 ${actualValue}`);
      }
    } else if (expectedValue === 'array') {
      if (!Array.isArray(actualValue)) {
        errors.push(`${key} 应该是数组，但实际为 ${typeof actualValue}`);
      }
    } else if (expectedValue === 'number') {
      if (typeof actualValue !== 'number') {
        errors.push(`${key} 应该是数字，但实际为 ${typeof actualValue}`);
      }
    } else if (actualValue !== expectedValue) {
      errors.push(`${key} 应该为 ${expectedValue}，但实际为 ${actualValue}`);
    }
  }

  return errors;
}

/**
 * 生成测试报告
 */
function generateTestReport() {
  console.log('='.repeat(60));
  console.log('API 测试用例清单');
  console.log('='.repeat(60));
  
  let totalCases = 0;
  
  for (const [funcName, cases] of Object.entries(testCases)) {
    console.log(`\n【${funcName}】`);
    cases.forEach((testCase, index) => {
      console.log(`  ${index + 1}. ${testCase.name}`);
      console.log(`     输入: ${JSON.stringify(testCase.input)}`);
      console.log(`     预期: code=${testCase.expected.code}`);
      totalCases++;
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`共 ${Object.keys(testCases).length} 个云函数，${totalCases} 个测试用例`);
  console.log('='.repeat(60));
}

// 打印测试报告
generateTestReport();

// 导出供其他脚本使用
module.exports = { testCases, validateResponse };
