/**
 * 数据统计云函数
 * 供后台管理系统使用
 */
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { action, ...params } = event;

  switch (action) {
    case 'overview':
      return getOverview();
    case 'trend':
      return getTrend(params);
    case 'topContent':
      return getTopContent(params);
    case 'userStats':
      return getUserStats(params);
    default:
      return { code: 1001, message: '未知操作', data: null, timestamp: Date.now() };
  }
};

/**
 * 获取总览数据
 */
async function getOverview() {
  try {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    const [
      usersCount,
      wallpapersCount,
      soundsCount,
      todayViewsCount,
      todayDownloadsCount,
      todayNewUsersCount,
      yesterdayViewsCount,
    ] = await Promise.all([
      db.collection('users').count(),
      db.collection('wallpapers').where({ status: 1 }).count(),
      db.collection('sounds').where({ status: 1 }).count(),
      db.collection('user_events').where({
        eventType: 'view',
        createdAt: _.gte(todayStart),
      }).count(),
      db.collection('user_events').where({
        eventType: 'download',
        createdAt: _.gte(todayStart),
      }).count(),
      db.collection('users').where({
        createdAt: _.gte(todayStart),
      }).count(),
      db.collection('user_events').where({
        eventType: 'view',
        createdAt: _.and(_.gte(yesterdayStart), _.lt(todayStart)),
      }).count(),
    ]);

    const viewsGrowth = yesterdayViewsCount.total > 0
      ? ((todayViewsCount.total - yesterdayViewsCount.total) / yesterdayViewsCount.total * 100).toFixed(1)
      : 0;

    return {
      code: 0,
      message: 'success',
      data: {
        totalUsers: usersCount.total,
        totalWallpapers: wallpapersCount.total,
        totalSounds: soundsCount.total,
        todayViews: todayViewsCount.total,
        todayDownloads: todayDownloadsCount.total,
        todayNewUsers: todayNewUsersCount.total,
        viewsGrowth: parseFloat(viewsGrowth),
      },
      timestamp: now,
    };
  } catch (err) {
    console.error('getOverview error:', err);
    return { code: 5001, message: '获取统计数据失败', data: null, timestamp: Date.now() };
  }
}

/**
 * 获取趋势数据
 */
async function getTrend({ days = 7 }) {
  try {
    const now = Date.now();
    const dates = [];
    const views = [];
    const downloads = [];
    const newUsers = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date().setHours(0, 0, 0, 0) - i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const date = new Date(dayStart);
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`);

      const [viewsCount, downloadsCount, usersCount] = await Promise.all([
        db.collection('user_events').where({
          eventType: 'view',
          createdAt: _.and(_.gte(dayStart), _.lt(dayEnd)),
        }).count(),
        db.collection('user_events').where({
          eventType: 'download',
          createdAt: _.and(_.gte(dayStart), _.lt(dayEnd)),
        }).count(),
        db.collection('users').where({
          createdAt: _.and(_.gte(dayStart), _.lt(dayEnd)),
        }).count(),
      ]);

      views.push(viewsCount.total);
      downloads.push(downloadsCount.total);
      newUsers.push(usersCount.total);
    }

    return {
      code: 0,
      message: 'success',
      data: { dates, views, downloads, newUsers },
      timestamp: now,
    };
  } catch (err) {
    console.error('getTrend error:', err);
    return { code: 5001, message: '获取趋势数据失败', data: null, timestamp: Date.now() };
  }
}

/**
 * 获取热门内容排行
 */
async function getTopContent({ limit = 10 }) {
  try {
    const [wallpapersRes, soundsRes] = await Promise.all([
      db.collection('wallpapers')
        .where({ status: 1 })
        .orderBy('hotScore', 'desc')
        .limit(limit)
        .field({ title: true, coverUrl: true, hotScore: true, downloadCount: true, favoriteCount: true })
        .get(),
      db.collection('sounds')
        .where({ status: 1 })
        .orderBy('hotScore', 'desc')
        .limit(limit)
        .field({ title: true, coverUrl: true, hotScore: true, playCount: true, downloadCount: true })
        .get(),
    ]);

    return {
      code: 0,
      message: 'success',
      data: {
        wallpapers: wallpapersRes.data,
        sounds: soundsRes.data,
      },
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('getTopContent error:', err);
    return { code: 5001, message: '获取热门内容失败', data: null, timestamp: Date.now() };
  }
}

/**
 * 获取用户统计
 */
async function getUserStats({ page = 1, pageSize = 20 }) {
  try {
    const skip = (page - 1) * pageSize;

    const [countRes, listRes] = await Promise.all([
      db.collection('users').count(),
      db.collection('users')
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .field({ openId: false })
        .get(),
    ]);

    const users = await Promise.all(
      listRes.data.map(async (user) => {
        const [favoritesCount, eventsCount] = await Promise.all([
          db.collection('user_favorites').where({ userId: user._id }).count(),
          db.collection('user_events').where({ userId: user._id }).count(),
        ]);

        return {
          ...user,
          favoritesCount: favoritesCount.total,
          eventsCount: eventsCount.total,
        };
      })
    );

    return {
      code: 0,
      message: 'success',
      data: {
        list: users,
        total: countRes.total,
        page,
        pageSize,
      },
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('getUserStats error:', err);
    return { code: 5001, message: '获取用户统计失败', data: null, timestamp: Date.now() };
  }
}
