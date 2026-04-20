# Phase 4 联调测试用例

## 用例 1：首页数据链路

1. 小程序调用 `api-home`
2. 云函数代理后台 `/public/home`
3. 预期：返回 `banners/brands/hotWallpapers/hotSounds`

## 用例 2：壁纸模块链路

1. 小程序调用 `api-wallpapers list/detail`
2. 云函数代理后台 `/public/wallpapers` 与 `/public/wallpapers/{id}`
3. 预期：列表和详情结构兼容旧接口，详情访问热度 +1

## 用例 3：音效模块链路

1. 小程序调用 `api-sounds list/detail`
2. 云函数代理后台 `/public/sounds` 与 `/public/sounds/{id}`
3. 预期：列表和详情结构兼容旧接口，详情访问热度 +1

## 用例 4：搜索链路

1. 小程序调用 `api-search suggest/search/hot`
2. 云函数代理后台 `/public/search/*`
3. 预期：建议、搜索结果、热门关键词均可返回
