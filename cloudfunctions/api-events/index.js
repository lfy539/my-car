/**
 * 事件埋点云函数
 * 用于统计用户行为
 */
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const VALID_EVENT_TYPES = ['view', 'download', 'play', 'favorite', 'share', 'search'];
const VALID_TARGET_TYPES = ['wallpaper', 'sound'];

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  const { action, ...params } = event;

  switch (action) {
    case 'report':
      return reportEvent(OPENID, params);
    case 'batch':
      return batchReport(OPENID, params);
    default:
      return reportEvent(OPENID, event);
  }
};

/**
 * 上报单个事件
 */
async function reportEvent(userId, { eventType, targetType, targetId, ext }) {
  if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
    return { code: 1001, message: '无效的事件类型', data: null, timestamp: Date.now() };
  }

  if (targetType && !VALID_TARGET_TYPES.includes(targetType)) {
    return { code: 1001, message: '无效的目标类型', data: null, timestamp: Date.now() };
  }

  try {
    await db.collection('user_events').add({
      data: {
        userId: userId || 'anonymous',
        eventType,
        targetType: targetType || null,
        targetId: targetId || null,
        ext: ext || {},
        createdAt: Date.now(),
      },
    });

    if (targetType && targetId) {
      await updateContentStats(targetType, targetId, eventType);
    }

    return {
      code: 0,
      message: 'success',
      data: null,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('reportEvent error:', err);
    return { code: 5001, message: '事件上报失败', data: null, timestamp: Date.now() };
  }
}

/**
 * 批量上报事件
 */
async function batchReport(userId, { events }) {
  if (!events || !Array.isArray(events) || events.length === 0) {
    return { code: 1001, message: '无效的事件数据', data: null, timestamp: Date.now() };
  }

  if (events.length > 20) {
    return { code: 1001, message: '单次最多上报20条事件', data: null, timestamp: Date.now() };
  }

  try {
    const records = events
      .filter(e => e.eventType && VALID_EVENT_TYPES.includes(e.eventType))
      .map(e => ({
        userId: userId || 'anonymous',
        eventType: e.eventType,
        targetType: e.targetType || null,
        targetId: e.targetId || null,
        ext: e.ext || {},
        createdAt: e.timestamp || Date.now(),
      }));

    if (records.length > 0) {
      const tasks = records.map(record => 
        db.collection('user_events').add({ data: record })
      );
      await Promise.all(tasks);
    }

    return {
      code: 0,
      message: 'success',
      data: { count: records.length },
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('batchReport error:', err);
    return { code: 5001, message: '批量上报失败', data: null, timestamp: Date.now() };
  }
}

/**
 * 更新内容统计数据
 */
async function updateContentStats(targetType, targetId, eventType) {
  const collection = targetType === 'wallpaper' ? 'wallpapers' : 'sounds';
  
  const updateData = {};
  
  switch (eventType) {
    case 'view':
      updateData.hotScore = _.inc(1);
      break;
    case 'download':
      updateData.downloadCount = _.inc(1);
      updateData.hotScore = _.inc(5);
      break;
    case 'play':
      updateData.playCount = _.inc(1);
      updateData.hotScore = _.inc(2);
      break;
    case 'favorite':
      updateData.favoriteCount = _.inc(1);
      updateData.hotScore = _.inc(3);
      break;
    case 'share':
      updateData.hotScore = _.inc(10);
      break;
    default:
      return;
  }

  try {
    await db.collection(collection).doc(targetId).update({
      data: updateData,
    });
  } catch (err) {
    console.error('updateContentStats error:', err);
  }
}
