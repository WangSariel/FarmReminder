const assert = require("assert");
const farm = require("../miniprogram/utils/farm");

function percent(rate) {
  return Number((rate * 100).toFixed(1));
}

function seconds(ms) {
  return Math.round(ms / 1000);
}

assert.deepStrictEqual(
  farm.getAllWeatherBonuses(1).map((item) => percent(item.bonusRate)),
  [1.2, 1, 1, 1, 1],
  "1 级时第 1 种天气为 1.2%，其余天气为 1%"
);

assert.deepStrictEqual(
  farm.getAllWeatherBonuses(60).map((item) => percent(item.bonusRate)),
  [3.4, 3.4, 3.4, 3.4, 3.4],
  "60 级天气加成应按 (等级 - X)//5 + 1 计算"
);

assert.deepStrictEqual(
  farm.getAllWeatherBonuses(61).map((item) => percent(item.bonusRate)),
  [3.6, 3.4, 3.4, 3.4, 3.4],
  "61 级时第 1 种天气为 3.6%，其余为 3.4%"
);

assert.strictEqual(farm.DEFAULT_CROPS.length, 45, "默认作物表应包含 45 个作物");
assert.strictEqual(farm.DEFAULT_PROCESS_ITEMS.length, 24, "默认加工物表应包含 24 个加工物");

const grape = farm.DEFAULT_CROPS.find((item) => item.name === "葡萄");
assert.strictEqual(grape.maturityMinutes, 10);
assert.strictEqual(seconds(farm.getActualCooldownMinutes(grape) * 60 * 1000), 124);
assert.strictEqual(farm.formatTableDuration(grape.wateringCooldownMinutes), "2m4s");

const cabbage = farm.DEFAULT_CROPS.find((item) => item.name === "白菜");
const sunSettings = { ...farm.DEFAULT_SETTINGS, weatherKey: "sun", altarLevel: 60 };
assert.strictEqual(
  seconds(farm.getWateringReductionMs(cabbage, sunSettings, false)),
  302,
  "60 级幸运烈日，蔬菜 1h，自己浇灌应约减少 5m2s"
);
assert.strictEqual(
  seconds(farm.getWateringReductionMs(cabbage, sunSettings, true)),
  446,
  "60 级幸运烈日，蔬菜 1h，男主浇灌应约减少 7m26s"
);
assert.strictEqual(
  seconds(farm.getActualCooldownMinutes(cabbage) * 60 * 1000),
  753,
  "浇灌间隔保持作物表原始 12m33s"
);
assert.strictEqual(farm.formatTableDuration(cabbage.wateringCooldownMinutes), "12m33s");

const melon = farm.DEFAULT_CROPS.find((item) => item.name === "甜瓜");
const clearSettings = { ...farm.DEFAULT_SETTINGS, weatherKey: "clear", altarLevel: 60 };
assert.strictEqual(
  seconds(farm.getWateringReductionMs(melon, clearSettings, true)),
  7142,
  "60 级幸运晴天，甜瓜男主浇灌应约减少 1h59m2s"
);
assert.strictEqual(farm.formatTableDuration(melon.wateringCooldownMinutes), "3h46m");

const mushroom = farm.DEFAULT_CROPS.find((item) => item.name === "牛肝菌");
assert.strictEqual(
  percent(farm.getWateringReductionRate(mushroom, sunSettings, true)),
  9,
  "菌菇男主浇灌只按 9%，不叠加天气"
);

const wheat = farm.DEFAULT_CROPS.find((item) => item.name === "小麦");
assert.strictEqual(farm.formatTableDuration(wheat.maturityMinutes), "40s");
assert.strictEqual(farm.formatTableDuration(wheat.wateringCooldownMinutes), "13s");

const startedAt = new Date("2026-05-27T08:00:00.000Z");
const matureAt = farm.calculateMatureAt(startedAt, melon);
assert.strictEqual(matureAt.toISOString(), "2026-05-28T00:00:00.000Z");

const normalBait = farm.DEFAULT_PROCESS_ITEMS.find((item) => item.name === "普通饵料");
const nonRainSettings = { ...farm.DEFAULT_SETTINGS, weatherKey: "clear", altarLevel: 60 };
const rainSettings = { ...farm.DEFAULT_SETTINGS, weatherKey: "rain", altarLevel: 60 };
assert.strictEqual(
  seconds(farm.getProcessingDurationMs(normalBait, nonRainSettings, false)),
  360,
  "普通饵料不开男主、非雨天时仍为 6m"
);
assert.strictEqual(
  seconds(farm.getProcessingDurationMs(normalBait, nonRainSettings, true)),
  302,
  "普通饵料男主加工减少 16%，约 5m2s"
);
assert.strictEqual(
  percent(farm.getProcessingReductionRate(rainSettings, true)),
  19.4,
  "60 级幸运雨天，男主加工减时率应为 16% + 3.4%"
);
assert.strictEqual(
  farm.calculateProcessingFinishAt(startedAt, normalBait, rainSettings, true).toISOString(),
  "2026-05-27T08:04:50.160Z"
);

const grapeStartedAt = new Date("2026-05-28T05:40:00.000Z");
const grapePlanting = {
  id: "planting_grape",
  cropId: grape.id,
  cropName: grape.name,
  category: grape.category,
  maturityMinutes: grape.maturityMinutes,
  wateringCooldownMinutes: grape.wateringCooldownMinutes,
  startedAt: grapeStartedAt.toISOString(),
  matureAt: farm.calculateMatureAt(grapeStartedAt, grape).toISOString(),
  nextWaterAt: grapeStartedAt.toISOString(),
  wateringRecords: []
};
const grapePlan = farm.startAutoWatering(grapePlanting, grape, clearSettings, grapeStartedAt, true);
assert.strictEqual(grapePlan.matureAt, "2026-05-28T05:46:12.000Z");
assert.strictEqual(grapePlan.autoWateringEnabled, true);
assert.strictEqual(grapePlan.autoWateringSchedule.length, 4);
assert.strictEqual(grapePlan.autoWateringFutureCount, 3);
assert.strictEqual(grapePlan.nextWaterAt, "2026-05-28T05:42:04.000Z");

const nearlyMaturePlanting = {
  ...grapePlanting,
  matureAt: new Date(grapeStartedAt.getTime() + 90 * 1000).toISOString()
};
const nearlyMaturePlan = farm.startAutoWatering(nearlyMaturePlanting, grape, clearSettings, grapeStartedAt, true);
assert.strictEqual(nearlyMaturePlan.matureAt, "2026-05-28T05:40:15.600Z");
assert.strictEqual(nearlyMaturePlan.autoWateringSchedule.length, 1);
assert.strictEqual(nearlyMaturePlan.nextWaterAt, "");

console.log("farm rules ok");
