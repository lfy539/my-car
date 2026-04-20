const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 初始化数据
const brandsData = [
  { _id: 'brand_tesla', name: '特斯拉', nameEn: 'Tesla', logo: 'https://img.icons8.com/color/96/tesla-logo.png', sort: 1, status: 1 },
  { _id: 'brand_byd', name: '比亚迪', nameEn: 'BYD', logo: 'https://img.icons8.com/color/96/byd.png', sort: 2, status: 1 },
  { _id: 'brand_nio', name: '蔚来', nameEn: 'NIO', logo: 'https://img.icons8.com/color/96/nio.png', sort: 3, status: 1 },
  { _id: 'brand_xpeng', name: '小鹏', nameEn: 'XPeng', logo: 'https://img.icons8.com/color/96/xpeng.png', sort: 4, status: 1 },
  { _id: 'brand_li', name: '理想', nameEn: 'Li Auto', logo: 'https://img.icons8.com/color/96/li-auto.png', sort: 5, status: 1 },
  { _id: 'brand_leap', name: '零跑', nameEn: 'Leapmotor', logo: 'https://img.icons8.com/color/96/leapmotor.png', sort: 6, status: 1 },
];

const bannersData = [
  { _id: 'banner_1', title: '精选壁纸推荐', imageUrl: 'https://picsum.photos/750/400?random=100', linkType: 'page', linkUrl: '/pages/wallpaper/index', sort: 1, status: 1 },
  { _id: 'banner_2', title: '热门音效合集', imageUrl: 'https://picsum.photos/750/400?random=101', linkType: 'page', linkUrl: '/pages/sound/index', sort: 2, status: 1 },
  { _id: 'banner_3', title: '新能源车主必备', imageUrl: 'https://picsum.photos/750/400?random=102', linkType: 'none', linkUrl: '', sort: 3, status: 1 },
];

const wallpapersData = [
  { _id: 'wp_1', title: '特斯拉 Model 3 极简壁纸', coverUrl: 'https://picsum.photos/400/600?random=1', originUrl: 'https://picsum.photos/1080/1920?random=1', brandId: 'brand_tesla', modelId: '', tags: ['极简', '科技'], resolution: '1080x1920', fileSize: 1024000, status: 1, publishAt: Date.now(), hotScore: 100, downloadCount: 520, favoriteCount: 88 },
  { _id: 'wp_2', title: '特斯拉 Model Y 夜景', coverUrl: 'https://picsum.photos/400/600?random=2', originUrl: 'https://picsum.photos/1080/1920?random=2', brandId: 'brand_tesla', modelId: '', tags: ['夜景', '城市'], resolution: '1080x1920', fileSize: 1536000, status: 1, publishAt: Date.now(), hotScore: 95, downloadCount: 430, favoriteCount: 72 },
  { _id: 'wp_3', title: '比亚迪汉 EV 星空', coverUrl: 'https://picsum.photos/400/600?random=3', originUrl: 'https://picsum.photos/1080/1920?random=3', brandId: 'brand_byd', modelId: '', tags: ['星空', '浪漫'], resolution: '1080x1920', fileSize: 1280000, status: 1, publishAt: Date.now(), hotScore: 92, downloadCount: 380, favoriteCount: 65 },
  { _id: 'wp_4', title: '比亚迪海豹 海洋主题', coverUrl: 'https://picsum.photos/400/600?random=4', originUrl: 'https://picsum.photos/1080/1920?random=4', brandId: 'brand_byd', modelId: '', tags: ['海洋', '清新'], resolution: '1080x1920', fileSize: 1100000, status: 1, publishAt: Date.now(), hotScore: 88, downloadCount: 320, favoriteCount: 55 },
  { _id: 'wp_5', title: '蔚来 ET7 未来感', coverUrl: 'https://picsum.photos/400/600?random=5', originUrl: 'https://picsum.photos/1080/1920?random=5', brandId: 'brand_nio', modelId: '', tags: ['未来', '科技'], resolution: '1080x1920', fileSize: 1400000, status: 1, publishAt: Date.now(), hotScore: 85, downloadCount: 290, favoriteCount: 48 },
  { _id: 'wp_6', title: '蔚来 ES6 自然风光', coverUrl: 'https://picsum.photos/400/600?random=6', originUrl: 'https://picsum.photos/1080/1920?random=6', brandId: 'brand_nio', modelId: '', tags: ['自然', '风光'], resolution: '1080x1920', fileSize: 1350000, status: 1, publishAt: Date.now(), hotScore: 82, downloadCount: 260, favoriteCount: 42 },
  { _id: 'wp_7', title: '小鹏 P7 赛道风格', coverUrl: 'https://picsum.photos/400/600?random=7', originUrl: 'https://picsum.photos/1080/1920?random=7', brandId: 'brand_xpeng', modelId: '', tags: ['赛道', '运动'], resolution: '1080x1920', fileSize: 1450000, status: 1, publishAt: Date.now(), hotScore: 80, downloadCount: 240, favoriteCount: 38 },
  { _id: 'wp_8', title: '小鹏 G9 都市夜景', coverUrl: 'https://picsum.photos/400/600?random=8', originUrl: 'https://picsum.photos/1080/1920?random=8', brandId: 'brand_xpeng', modelId: '', tags: ['夜景', '都市'], resolution: '1080x1920', fileSize: 1200000, status: 1, publishAt: Date.now(), hotScore: 78, downloadCount: 220, favoriteCount: 35 },
  { _id: 'wp_9', title: '理想 L9 家庭出行', coverUrl: 'https://picsum.photos/400/600?random=9', originUrl: 'https://picsum.photos/1080/1920?random=9', brandId: 'brand_li', modelId: '', tags: ['家庭', '温馨'], resolution: '1080x1920', fileSize: 1300000, status: 1, publishAt: Date.now(), hotScore: 75, downloadCount: 200, favoriteCount: 32 },
  { _id: 'wp_10', title: '理想 L7 公路旅行', coverUrl: 'https://picsum.photos/400/600?random=10', originUrl: 'https://picsum.photos/1080/1920?random=10', brandId: 'brand_li', modelId: '', tags: ['公路', '旅行'], resolution: '1080x1920', fileSize: 1250000, status: 1, publishAt: Date.now(), hotScore: 72, downloadCount: 180, favoriteCount: 28 },
  { _id: 'wp_11', title: '零跑 C11 简约白', coverUrl: 'https://picsum.photos/400/600?random=11', originUrl: 'https://picsum.photos/1080/1920?random=11', brandId: 'brand_leap', modelId: '', tags: ['简约', '白色'], resolution: '1080x1920', fileSize: 1150000, status: 1, publishAt: Date.now(), hotScore: 70, downloadCount: 160, favoriteCount: 25 },
  { _id: 'wp_12', title: '零跑 C01 科技蓝', coverUrl: 'https://picsum.photos/400/600?random=12', originUrl: 'https://picsum.photos/1080/1920?random=12', brandId: 'brand_leap', modelId: '', tags: ['科技', '蓝色'], resolution: '1080x1920', fileSize: 1180000, status: 1, publishAt: Date.now(), hotScore: 68, downloadCount: 140, favoriteCount: 22 },
];

const soundsData = [
  { _id: 'sound_1', title: '特斯拉经典锁车声', coverUrl: 'https://picsum.photos/200/200?random=20', audioUrl: '', brandId: 'brand_tesla', modelId: '', soundType: '锁车声', duration: 2, bitrate: 320, fileSize: 128000, status: 1, publishAt: Date.now(), hotScore: 100, playCount: 1200, downloadCount: 450, favoriteCount: 120 },
  { _id: 'sound_2', title: '特斯拉科幻解锁声', coverUrl: 'https://picsum.photos/200/200?random=21', audioUrl: '', brandId: 'brand_tesla', modelId: '', soundType: '解锁声', duration: 1.5, bitrate: 320, fileSize: 96000, status: 1, publishAt: Date.now(), hotScore: 95, playCount: 1050, downloadCount: 380, favoriteCount: 98 },
  { _id: 'sound_3', title: '比亚迪迎宾曲', coverUrl: 'https://picsum.photos/200/200?random=22', audioUrl: '', brandId: 'brand_byd', modelId: '', soundType: '迎宾音', duration: 4, bitrate: 320, fileSize: 256000, status: 1, publishAt: Date.now(), hotScore: 92, playCount: 920, downloadCount: 320, favoriteCount: 85 },
  { _id: 'sound_4', title: '比亚迪启动声效', coverUrl: 'https://picsum.photos/200/200?random=23', audioUrl: '', brandId: 'brand_byd', modelId: '', soundType: '启动声', duration: 3, bitrate: 320, fileSize: 192000, status: 1, publishAt: Date.now(), hotScore: 88, playCount: 850, downloadCount: 280, favoriteCount: 72 },
  { _id: 'sound_5', title: '蔚来NOMI语音', coverUrl: 'https://picsum.photos/200/200?random=24', audioUrl: '', brandId: 'brand_nio', modelId: '', soundType: '语音', duration: 5, bitrate: 320, fileSize: 320000, status: 1, publishAt: Date.now(), hotScore: 85, playCount: 780, downloadCount: 250, favoriteCount: 65 },
  { _id: 'sound_6', title: '蔚来充电提示音', coverUrl: 'https://picsum.photos/200/200?random=25', audioUrl: '', brandId: 'brand_nio', modelId: '', soundType: '提示音', duration: 2, bitrate: 320, fileSize: 128000, status: 1, publishAt: Date.now(), hotScore: 82, playCount: 720, downloadCount: 220, favoriteCount: 58 },
  { _id: 'sound_7', title: '小鹏电子锁车声', coverUrl: 'https://picsum.photos/200/200?random=26', audioUrl: '', brandId: 'brand_xpeng', modelId: '', soundType: '锁车声', duration: 1.5, bitrate: 320, fileSize: 96000, status: 1, publishAt: Date.now(), hotScore: 80, playCount: 680, downloadCount: 200, favoriteCount: 52 },
  { _id: 'sound_8', title: '小鹏智能语音', coverUrl: 'https://picsum.photos/200/200?random=27', audioUrl: '', brandId: 'brand_xpeng', modelId: '', soundType: '语音', duration: 6, bitrate: 320, fileSize: 384000, status: 1, publishAt: Date.now(), hotScore: 78, playCount: 620, downloadCount: 180, favoriteCount: 45 },
  { _id: 'sound_9', title: '理想家庭迎宾音', coverUrl: 'https://picsum.photos/200/200?random=28', audioUrl: '', brandId: 'brand_li', modelId: '', soundType: '迎宾音', duration: 4, bitrate: 320, fileSize: 256000, status: 1, publishAt: Date.now(), hotScore: 75, playCount: 560, downloadCount: 160, favoriteCount: 38 },
  { _id: 'sound_10', title: '理想启动旋律', coverUrl: 'https://picsum.photos/200/200?random=29', audioUrl: '', brandId: 'brand_li', modelId: '', soundType: '启动声', duration: 3.5, bitrate: 320, fileSize: 224000, status: 1, publishAt: Date.now(), hotScore: 72, playCount: 500, downloadCount: 140, favoriteCount: 32 },
  { _id: 'sound_11', title: '零跑简约锁车声', coverUrl: 'https://picsum.photos/200/200?random=30', audioUrl: '', brandId: 'brand_leap', modelId: '', soundType: '锁车声', duration: 1.5, bitrate: 320, fileSize: 96000, status: 1, publishAt: Date.now(), hotScore: 70, playCount: 450, downloadCount: 120, favoriteCount: 28 },
  { _id: 'sound_12', title: '零跑电子提示音', coverUrl: 'https://picsum.photos/200/200?random=31', audioUrl: '', brandId: 'brand_leap', modelId: '', soundType: '提示音', duration: 2, bitrate: 320, fileSize: 128000, status: 1, publishAt: Date.now(), hotScore: 68, playCount: 400, downloadCount: 100, favoriteCount: 22 },
];

const searchKeywordsData = [
  { _id: 'kw_1', keyword: '特斯拉', searchCount: 1200, isHot: true, sort: 1 },
  { _id: 'kw_2', keyword: '锁车声', searchCount: 980, isHot: true, sort: 2 },
  { _id: 'kw_3', keyword: '比亚迪', searchCount: 850, isHot: true, sort: 3 },
  { _id: 'kw_4', keyword: '极简壁纸', searchCount: 720, isHot: true, sort: 4 },
  { _id: 'kw_5', keyword: '蔚来', searchCount: 650, isHot: true, sort: 5 },
  { _id: 'kw_6', keyword: '科技风', searchCount: 580, isHot: false, sort: 6 },
  { _id: 'kw_7', keyword: '夜景', searchCount: 520, isHot: false, sort: 7 },
  { _id: 'kw_8', keyword: '小鹏', searchCount: 480, isHot: false, sort: 8 },
];

async function initCollection(collectionName, data) {
  const collection = db.collection(collectionName);
  const results = { added: 0, skipped: 0, errors: [] };
  
  for (const item of data) {
    try {
      const existing = await collection.doc(item._id).get().catch(() => null);
      if (existing && existing.data) {
        results.skipped++;
      } else {
        await collection.add({ data: { ...item, createdAt: db.serverDate(), updatedAt: db.serverDate() } });
        results.added++;
      }
    } catch (err) {
      if (err.errCode === -1) {
        await collection.add({ data: { ...item, createdAt: db.serverDate(), updatedAt: db.serverDate() } });
        results.added++;
      } else {
        results.errors.push({ id: item._id, error: err.message });
      }
    }
  }
  
  return results;
}

exports.main = async (event, context) => {
  const { action = 'all' } = event;
  const results = {};
  
  try {
    if (action === 'all' || action === 'brands') {
      results.brands = await initCollection('brands', brandsData);
    }
    if (action === 'all' || action === 'banners') {
      results.banners = await initCollection('banners', bannersData);
    }
    if (action === 'all' || action === 'wallpapers') {
      results.wallpapers = await initCollection('wallpapers', wallpapersData);
    }
    if (action === 'all' || action === 'sounds') {
      results.sounds = await initCollection('sounds', soundsData);
    }
    if (action === 'all' || action === 'search_keywords') {
      results.search_keywords = await initCollection('search_keywords', searchKeywordsData);
    }
    
    return {
      success: true,
      message: '数据初始化完成',
      results,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
      error: err,
    };
  }
};
