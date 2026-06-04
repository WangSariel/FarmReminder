const cloud = require("wx-server-sdk");
const farm = require("./farm");

cloud.init({
  env: "cloud1-please-replace"
});

const db = cloud.database();
const _ = db.command;

async function getUserSettings(openid) {
  const result = await db.collection("settings").where(_.or([{ openid }, { _openid: openid }])).limit(1).get();
  return result.data[0] || farm.DEFAULT_SETTINGS;
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const plantingId = event.plantingId;
  if (!plantingId) {
    throw new Error("缺少种植任务 ID");
  }

  const planting = (await db.collection("plantings").doc(plantingId).get()).data;
  if (!planting || planting.openid !== OPENID) {
    throw new Error("种植任务不存在");
  }
  if (planting.autoWateringEnabled) {
    return planting;
  }

  const cropResult = await db.collection("crops").where(
    _.or([
      { openid: OPENID, id: planting.cropId },
      { _openid: OPENID, id: planting.cropId }
    ])
  ).limit(1).get();
  const crop = cropResult.data[0] || {
    id: planting.cropId,
    name: planting.cropName,
    category: planting.category,
    maturityMinutes: planting.maturityMinutes,
    wateringCooldownMinutes: planting.wateringCooldownMinutes
  };
  const settings = await getUserSettings(OPENID);
  const patch = farm.startAutoWatering(planting, crop, settings, new Date(), !!event.useHero);

  await db.collection("plantings").doc(plantingId).update({
    data: {
      ...patch,
      reminded: false,
      updatedAt: db.serverDate()
    }
  });

  return patch;
};
