const cloud = require("wx-server-sdk");
const farm = require("./farm");

cloud.init({
  env: "cloud1-please-replace"
});

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const crop = event.crop;
  const planting = event.planting;
  if (!crop || !planting) {
    throw new Error("缺少作物或种植任务数据");
  }

  const startedAt = planting.startedAt || new Date().toISOString();
  const matureAt = farm.calculateMatureAt(startedAt, crop).toISOString();
  const record = {
    ...planting,
    cropId: crop.id,
    cropName: crop.name,
    category: crop.category,
    maturityMinutes: crop.maturityMinutes,
    wateringCooldownMinutes: crop.wateringCooldownMinutes,
    startedAt,
    matureAt,
    nextWaterAt: startedAt,
    openid: OPENID,
    reminded: false,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const result = await db.collection("plantings").add({ data: record });
  return { _id: result._id, matureAt };
};
