/**
 * 用户相关云函数
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const usersCollection = db.collection('users');

const ErrorCodes = {
  SUCCESS: 0,
  INVALID_PARAMS: 1001,
  NOT_LOGGED_IN: 2001,
  SERVER_ERROR: 5000,
  DATABASE_ERROR: 5001,
};

function success(data) {
  return {
    code: ErrorCodes.SUCCESS,
    message: 'success',
    data,
    timestamp: Date.now(),
  };
}

function error(code, message) {
  return {
    code,
    message,
    data: null,
    timestamp: Date.now(),
  };
}

async function login(event, context) {
  const wxContext = cloud.getWXContext();
  const { OPENID, UNIONID } = wxContext;
  
  if (!OPENID) {
    return error(ErrorCodes.NOT_LOGGED_IN, '无法获取用户标识');
  }
  
  try {
    // 查找用户
    const { data: users } = await usersCollection
      .where({ openid: OPENID })
      .limit(1)
      .get();
    
    let userInfo;
    
    if (users.length > 0) {
      // 用户已存在，更新登录时间
      userInfo = users[0];
      await usersCollection.doc(userInfo._id).update({
        data: {
          updatedAt: Date.now(),
        },
      });
    } else {
      // 创建新用户
      const now = Date.now();
      const newUser = {
        openid: OPENID,
        unionid: UNIONID || '',
        nickname: '',
        avatar: '',
        createdAt: now,
        updatedAt: now,
      };
      
      const { _id } = await usersCollection.add({ data: newUser });
      userInfo = { _id, ...newUser };
    }
    
    return success(userInfo);
  } catch (err) {
    console.error('Login error:', err);
    return error(ErrorCodes.DATABASE_ERROR, '登录失败');
  }
}

async function getUserInfo(event, context) {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  if (!OPENID) {
    return error(ErrorCodes.NOT_LOGGED_IN, '未登录');
  }
  
  try {
    const { data: users } = await usersCollection
      .where({ openid: OPENID })
      .limit(1)
      .get();
    
    if (users.length === 0) {
      return error(ErrorCodes.NOT_LOGGED_IN, '用户不存在');
    }
    
    return success(users[0]);
  } catch (err) {
    console.error('Get user info error:', err);
    return error(ErrorCodes.DATABASE_ERROR, '获取用户信息失败');
  }
}

async function updateUserInfo(event, context) {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  const { data } = event;
  
  if (!OPENID) {
    return error(ErrorCodes.NOT_LOGGED_IN, '未登录');
  }
  
  if (!data) {
    return error(ErrorCodes.INVALID_PARAMS, '参数错误');
  }
  
  try {
    const { data: users } = await usersCollection
      .where({ openid: OPENID })
      .limit(1)
      .get();
    
    if (users.length === 0) {
      return error(ErrorCodes.NOT_LOGGED_IN, '用户不存在');
    }
    
    const updateData = {};
    if (data.nickname) updateData.nickname = data.nickname;
    if (data.avatar) updateData.avatar = data.avatar;
    updateData.updatedAt = Date.now();
    
    await usersCollection.doc(users[0]._id).update({ data: updateData });
    
    const updatedUser = { ...users[0], ...updateData };
    return success(updatedUser);
  } catch (err) {
    console.error('Update user info error:', err);
    return error(ErrorCodes.DATABASE_ERROR, '更新用户信息失败');
  }
}

exports.main = async (event, context) => {
  const { action } = event;
  
  switch (action) {
    case 'login':
      return login(event, context);
    case 'getUserInfo':
      return getUserInfo(event, context);
    case 'updateUserInfo':
      return updateUserInfo(event, context);
    default:
      return error(ErrorCodes.INVALID_PARAMS, '未知操作');
  }
};
