/* eslint-disable no-console */
process.env.ADMIN_API_BASE_URL = process.env.ADMIN_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const path = require("path");

const apiHome = require(path.resolve(__dirname, "../../../cloudfunctions/api-home/index.js"));
const apiWallpapers = require(path.resolve(__dirname, "../../../cloudfunctions/api-wallpapers/index.js"));
const apiSounds = require(path.resolve(__dirname, "../../../cloudfunctions/api-sounds/index.js"));
const apiSearch = require(path.resolve(__dirname, "../../../cloudfunctions/api-search/index.js"));

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

async function run() {
  const home = await apiHome.main({}, {});
  assert(home.code === 0 && home.data && home.data.brands, "api-home 云函数代理成功");

  const wallpapers = await apiWallpapers.main({ action: "list", page: 1, pageSize: 5 }, {});
  assert(wallpapers.code === 0 && wallpapers.data && Array.isArray(wallpapers.data.list), "api-wallpapers 列表代理成功");

  const sounds = await apiSounds.main({ action: "list", page: 1, pageSize: 5 }, {});
  assert(sounds.code === 0 && sounds.data && Array.isArray(sounds.data.list), "api-sounds 列表代理成功");

  const suggest = await apiSearch.main({ action: "suggest", keyword: "Phase4" }, {});
  assert(suggest.code === 0 && suggest.data && Array.isArray(suggest.data.suggestions), "api-search suggest 代理成功");

  const search = await apiSearch.main({ action: "search", keyword: "Phase4", type: "all", page: 1, pageSize: 10 }, {});
  assert(search.code === 0 && search.data && Array.isArray(search.data.wallpapers), "api-search search 代理成功");

  const hot = await apiSearch.main({ action: "hot" }, {});
  assert(hot.code === 0 && hot.data && Array.isArray(hot.data.keywords), "api-search hot 代理成功");

  console.log("\nAll phase4 cloudfunction proxy tests passed.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
