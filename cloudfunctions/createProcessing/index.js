const cloud = require("wx-server-sdk");
const farm = require("./farm");

cloud.init({
  env: "cloud1-please-replace"
});

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const item = event.item;
  const processing = event.processing;
  const settings = { ...farm.DEFAULT_SETTINGS, ...(event.settings || {}) };
  if (!item || !processing) {
    throw new Error("缺少加工物或加工任务数据");
  }

  const startedAt = processing.startedAt || new Date().toISOString();
  const useHeroProcessing = !!settings.defaultUseHeroProcessing;
  const finishAt = farm.calculateProcessingFinishAt(startedAt, item, settings, useHeroProcessing).toISOString();
  const record = {
    ...processing,
    itemId: item.id,
    itemName: item.name,
    processingMinutes: item.processingMinutes,
    startedAt,
    finishAt,
    useHeroProcessing,
    processingReductionRate: farm.getProcessingReductionRate(settings, useHeroProcessing),
    weatherKey: settings.weatherKey,
    altarLevel: settings.altarLevel,
    openid: OPENID,
    reminded: false,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const result = await db.collection("processings").add({ data: record });
  return { _id: result._id, finishAt };
};
