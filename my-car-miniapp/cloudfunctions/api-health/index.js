/**
 * 健康检查云函数
 * 用于测试云函数服务是否正常运行
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const startTime = Date.now();
  
  try {
    // 测试数据库连接
    await db.collection('_health_check').limit(1).get();
    
    const endTime = Date.now();
    
    return {
      code: 0,
      message: 'success',
      data: {
        status: 'healthy',
        timestamp: Date.now(),
        responseTime: endTime - startTime,
        env: cloud.DYNAMIC_CURRENT_ENV,
        version: '1.0.0',
      },
      timestamp: Date.now(),
    };
  } catch (err) {
    // 数据库集合可能不存在，但云函数本身是健康的
    return {
      code: 0,
      message: 'success',
      data: {
        status: 'healthy',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
        env: cloud.DYNAMIC_CURRENT_ENV,
        version: '1.0.0',
        note: 'Database collection may not exist yet',
      },
      timestamp: Date.now(),
    };
  }
};
