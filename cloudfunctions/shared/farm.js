const WEATHER_TYPES = [
  { index: 1, key: "sun", name: "幸运烈日", targetCategory: "蔬菜", effect: "watering" },
  { index: 2, key: "wind", name: "幸运微风", targetCategory: "谷物", effect: "watering" },
  { index: 3, key: "cloudy", name: "幸运阴天", targetCategory: "花卉", effect: "watering" },
  { index: 4, key: "clear", name: "幸运晴天", targetCategory: "水果", effect: "watering" },
  { index: 5, key: "rain", name: "幸运雨天", targetCategory: "工坊", effect: "craft" }
];

const CATEGORIES = ["水果", "蔬菜", "菌菇", "谷物", "花卉", "工坊"];

const DEFAULT_SETTINGS = {
  altarLevel: 60,
  weatherKey: "clear",
  defaultUseHero: true,
  defaultUseHeroProcessing: true,
  templateId: "",
  templateFields: {
    cropName: "thing1",
    reminderType: "thing2",
    finishTime: "time3",
    note: "thing4"
  }
};

const DEFAULT_CROPS = [
  crop("grape", "水果", "葡萄", minutes(10), duration({ minutes: 2, seconds: 4 })),
  crop("pear", "水果", "刺梨", hours(12), duration({ hours: 2, minutes: 31 })),
  crop("blueberry", "水果", "蓝莓", hours(12), duration({ hours: 2, minutes: 31 })),
  crop("pineapple", "水果", "菠萝", hours(12), duration({ hours: 2, minutes: 31 })),
  crop("banana", "水果", "香蕉", hours(12), duration({ hours: 2, minutes: 31 })),
  crop("passion_fruit", "水果", "百香果", hours(16), duration({ hours: 3, minutes: 46 })),
  crop("melon", "水果", "甜瓜", hours(16), duration({ hours: 3, minutes: 46 })),
  crop("strawberry", "水果", "草莓", hours(16), duration({ hours: 3, minutes: 46 })),
  crop("pomegranate", "水果", "石榴", hours(16), duration({ hours: 3, minutes: 46 })),

  crop("cucumber", "蔬菜", "黄瓜", minutes(2), duration({ seconds: 24 })),
  crop("cabbage", "蔬菜", "白菜", hours(1), duration({ minutes: 12, seconds: 33 })),
  crop("asparagus", "蔬菜", "芦笋", hours(1), duration({ minutes: 12, seconds: 33 })),
  crop("tomato", "蔬菜", "番茄", hours(1), duration({ minutes: 12, seconds: 33 })),
  crop("heart_cabbage", "蔬菜", "卷心菜", hours(1), duration({ minutes: 12, seconds: 33 })),
  crop("eggplant", "蔬菜", "茄子", hours(2), duration({ minutes: 25, seconds: 8 })),
  crop("potato", "蔬菜", "马铃薯", hours(2), duration({ minutes: 25, seconds: 8 })),
  crop("onion", "蔬菜", "洋葱", hours(2), duration({ minutes: 25, seconds: 8 })),
  crop("carrot", "蔬菜", "胡萝卜", hours(2), duration({ minutes: 25, seconds: 8 })),

  crop("oyster_mushroom", "菌菇", "平菇", minutes(4), duration({ seconds: 48 })),
  crop("wood_ear", "菌菇", "木耳", hours(2), duration({ minutes: 25, seconds: 8 })),
  crop("porcini", "菌菇", "牛肝菌", hours(3), duration({ minutes: 37, seconds: 46 })),
  crop("chanterelle", "菌菇", "鸡油菌", hours(3), duration({ minutes: 37, seconds: 46 })),
  crop("button_mushroom", "菌菇", "口蘑", hours(3), duration({ minutes: 37, seconds: 46 })),
  crop("fruit_mushroom", "菌菇", "果味菇", hours(6), duration({ hours: 1, minutes: 17 })),
  crop("silver_ear", "菌菇", "银耳", hours(6), duration({ hours: 1, minutes: 17 })),
  crop("tea_tree_mushroom", "菌菇", "茶树菇", hours(6), duration({ hours: 1, minutes: 17 })),
  crop("king_oyster_mushroom", "菌菇", "杏鲍菇", hours(6), duration({ hours: 1, minutes: 17 })),

  crop("wheat", "谷物", "小麦", duration({ seconds: 40 }), duration({ seconds: 13 })),
  crop("sticky_rice", "谷物", "糯米", minutes(25), duration({ minutes: 5, seconds: 12 })),
  crop("buckwheat", "谷物", "荞麦", minutes(30), duration({ minutes: 6, seconds: 15 })),
  crop("soybean", "谷物", "大豆", minutes(30), duration({ minutes: 6, seconds: 15 })),
  crop("oat", "谷物", "燕麦", minutes(30), duration({ minutes: 6, seconds: 15 })),
  crop("corn", "谷物", "玉米", minutes(30), duration({ minutes: 6, seconds: 15 })),
  crop("coix", "谷物", "薏米", minutes(40), duration({ minutes: 8, seconds: 22 })),
  crop("millet", "谷物", "小米", minutes(40), duration({ minutes: 8, seconds: 22 })),
  crop("rice", "谷物", "水稻", minutes(40), duration({ minutes: 8, seconds: 22 })),

  crop("star_grass", "花卉", "栖星草", hours(20), duration({ hours: 4, minutes: 11 })),
  crop("jasmine", "花卉", "茉莉花", hours(24), duration({ hours: 5, minutes: 2 })),
  crop("tulip", "花卉", "郁金香", hours(24), duration({ hours: 5, minutes: 2 })),
  crop("lotus", "花卉", "荷花", hours(24), duration({ hours: 5, minutes: 2 })),
  crop("honeysuckle", "花卉", "金银花", hours(24), duration({ hours: 5, minutes: 2 })),
  crop("rose", "花卉", "月季", hours(32), duration({ hours: 6, minutes: 43, seconds: 10 })),
  crop("golden_chrysanthemum", "花卉", "金丝菊", hours(35), duration({ hours: 7, minutes: 20, seconds: 5 })),
  crop("mint_flower", "花卉", "薄荷花", hours(36), duration({ hours: 7, minutes: 33 })),
  crop("tuberose", "花卉", "晚香玉", hours(36), duration({ hours: 7, minutes: 33 }))
];

const DEFAULT_PROCESS_ITEMS = [
  processItem("flour", "现磨面粉", minutes(5)),
  processItem("thick_cucumber_dry", "厚切黄瓜干", minutes(7)),
  processItem("fresh_oyster_mushroom", "鲜美平菇", minutes(15)),
  processItem("honey_grape", "蜜酿葡萄", minutes(30)),
  processItem("normal_bait", "普通饵料", minutes(6)),
  processItem("grain_flour", "现磨谷物粉", hours(3)),
  processItem("crispy_mushroom", "爽脆菌菇", hours(3)),
  processItem("fish_bait", "鱼类饵料", minutes(18)),
  processItem("shrimp_bait", "虾类饵料", minutes(24)),
  processItem("crispy_pineapple_dry", "香脆菠萝干", hours(6)),
  processItem("natural_oil", "天然食用油", hours(6)),
  processItem("aquatic_bait", "水生物饵料", minutes(30)),
  processItem("grain_tea_bag", "谷物茶包", hours(9)),
  processItem("crab_bait", "蟹类饵料", minutes(36)),
  processItem("salted_vegetables", "盐腌菜", hours(10)),
  processItem("sweet_fruit_dry", "甜蜜水果干", hours(12)),
  processItem("flower_bundle", "缤纷花束", hours(8)),
  processItem("mushroom_umami", "菌味鲜", hours(18)),
  processItem("wild_mushroom_sauce", "野菌菇酱", hours(20)),
  processItem("fruit_vinegar", "水果甜醋", hours(15)),
  processItem("vegetable_can", "蔬菜罐头", hours(24)),
  processItem("fresh_preserves", "鲜制蜜饯", hours(24)),
  processItem("aroma_oil", "芳香精油", hours(26)),
  processItem("fireless_incense", "无火香薰", hours(28))
];

function crop(id, category, name, maturityMinutes, wateringCooldownMinutes) {
  return { id, category, name, maturityMinutes, wateringCooldownMinutes };
}

function processItem(id, name, processingMinutes) {
  return { id, name, processingMinutes };
}

function hours(value) {
  return value * 60;
}

function minutes(value) {
  return value;
}

function duration({ hours: h = 0, minutes: m = 0, seconds: s = 0 }) {
  return h * 60 + m + s / 60;
}

function clampNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getWeatherByKey(weatherKey) {
  return WEATHER_TYPES.find((item) => item.key === weatherKey) || WEATHER_TYPES[0];
}

function normalizeCrops(crops) {
  if (!Array.isArray(crops) || crops.length < DEFAULT_CROPS.length) {
    return DEFAULT_CROPS;
  }
  return crops;
}

function normalizeProcessItems(items) {
  if (!Array.isArray(items) || items.length < DEFAULT_PROCESS_ITEMS.length) {
    return DEFAULT_PROCESS_ITEMS;
  }
  return items;
}

function getWeatherBonusRate(altarLevel, weatherIndex) {
  const level = Math.max(1, Math.floor(clampNumber(altarLevel, 1)));
  const index = Math.max(1, Math.floor(clampNumber(weatherIndex, 1)));
  const steps = Math.max(0, Math.floor((level - index) / 5) + 1);
  return 0.01 + steps * 0.002;
}

function getAllWeatherBonuses(altarLevel) {
  return WEATHER_TYPES.map((weather) => ({
    ...weather,
    bonusRate: getWeatherBonusRate(altarLevel, weather.index)
  }));
}

function appliesWeatherToCrop(weather, crop) {
  return weather.effect === "watering" && weather.targetCategory === crop.category;
}

function getWeatherReductionRate(crop, settings) {
  const weather = getWeatherByKey(settings.weatherKey);
  if (!appliesWeatherToCrop(weather, crop)) {
    return 0;
  }
  return getWeatherBonusRate(settings.altarLevel, weather.index);
}

function getProcessingWeatherReductionRate(settings) {
  const weather = getWeatherByKey(settings.weatherKey);
  if (weather.key !== "rain") {
    return 0;
  }
  return getWeatherBonusRate(settings.altarLevel, weather.index);
}

function getProcessingReductionRate(settings, useHeroProcessing) {
  return (useHeroProcessing ? 0.16 : 0) + getProcessingWeatherReductionRate(settings);
}

function getProcessingDurationMs(item, settings, useHeroProcessing) {
  const baseMs = clampNumber(item.processingMinutes, 0) * 60 * 1000;
  const reductionRate = Math.min(0.95, getProcessingReductionRate(settings, useHeroProcessing));
  return Math.max(0, Math.round(baseMs * (1 - reductionRate)));
}

function calculateProcessingFinishAt(startedAt, item, settings, useHeroProcessing) {
  const durationMs = getProcessingDurationMs(item, settings, useHeroProcessing);
  return new Date(new Date(startedAt).getTime() + durationMs);
}

function getActualCooldownMinutes(crop) {
  return Math.max(0, clampNumber(crop.wateringCooldownMinutes, 0));
}

function getWateringReductionRate(crop, settings, useHero) {
  return 0.05 + (useHero ? 0.04 : 0) + getWeatherReductionRate(crop, settings);
}

function getWateringReductionMs(crop, settings, useHero) {
  const maturityMs = clampNumber(crop.maturityMinutes, 0) * 60 * 1000;
  return Math.round(maturityMs * getWateringReductionRate(crop, settings, useHero));
}

function calculateMatureAt(startedAt, crop) {
  return new Date(new Date(startedAt).getTime() + clampNumber(crop.maturityMinutes, 0) * 60 * 1000);
}

function applyWatering(planting, crop, settings, wateredAt, useHero) {
  return startAutoWatering(planting, crop, settings, wateredAt, useHero);
}

function getSettingsSnapshot(settings, useHero) {
  return {
    altarLevel: Math.max(1, Math.floor(clampNumber(settings.altarLevel, 1))),
    weatherKey: getWeatherByKey(settings.weatherKey).key,
    defaultUseHero: !!useHero
  };
}

function buildWateringRecord(wateredTime, useHero, reductionMs, type) {
  return {
    wateredAt: new Date(wateredTime).toISOString(),
    useHero: !!useHero,
    reductionMs,
    type
  };
}

function getNextWaterAtFromSchedule(schedule, nowLike) {
  const now = new Date(nowLike || Date.now()).getTime();
  const future = (schedule || [])
    .map((item) => new Date(item.wateredAt).getTime())
    .filter((time) => time > now)
    .sort((a, b) => a - b);
  return future.length ? new Date(future[0]).toISOString() : "";
}

function startAutoWatering(planting, crop, settings, wateredAt, useHero) {
  const wateredTime = new Date(wateredAt).getTime();
  const reductionMs = getWateringReductionMs(crop, settings, useHero);
  const cooldownMs = getActualCooldownMinutes(crop) * 60 * 1000;
  const existingRecords = planting.wateringRecords || [];
  const schedule = [buildWateringRecord(wateredTime, useHero, reductionMs, "manual")];
  let matureTime = Math.max(wateredTime, new Date(planting.matureAt).getTime() - reductionMs);
  let nextWaterTime = wateredTime + cooldownMs;
  let guard = 0;

  while (cooldownMs > 0 && nextWaterTime < matureTime && guard < 10000) {
    matureTime = Math.max(nextWaterTime, matureTime - reductionMs);
    schedule.push(buildWateringRecord(nextWaterTime, useHero, reductionMs, "auto"));
    nextWaterTime += cooldownMs;
    guard += 1;
  }

  const matureAt = new Date(matureTime);
  const nextWaterAt = getNextWaterAtFromSchedule(schedule, wateredTime);

  return {
    ...planting,
    autoWateringEnabled: true,
    autoWateringStartedAt: new Date(wateredTime).toISOString(),
    autoWateringUseHero: !!useHero,
    autoWateringSchedule: schedule,
    autoWateringSettingsSnapshot: getSettingsSnapshot(settings, useHero),
    autoWateringCount: schedule.length,
    autoWateringFutureCount: Math.max(0, schedule.length - 1),
    singleReductionMs: reductionMs,
    matureAt: matureAt.toISOString(),
    nextWaterAt,
    wateringRecords: existingRecords.concat(schedule)
  };
}

function formatDuration(ms) {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (days) parts.push(`${days}天`);
  if (hours) parts.push(`${hours}时`);
  if (minutes) parts.push(`${minutes}分`);
  if (!parts.length || seconds) parts.push(`${seconds}秒`);
  return parts.join("");
}

function formatTableDuration(minutesValue) {
  const totalSeconds = Math.max(0, Math.round(clampNumber(minutesValue, 0) * 60));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!parts.length || seconds) parts.push(`${seconds}s`);
  return parts.join("");
}

function formatDateTime(dateLike) {
  const date = new Date(dateLike);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

module.exports = {
  WEATHER_TYPES,
  CATEGORIES,
  DEFAULT_SETTINGS,
  DEFAULT_CROPS,
  DEFAULT_PROCESS_ITEMS,
  normalizeCrops,
  normalizeProcessItems,
  getWeatherByKey,
  getWeatherBonusRate,
  getAllWeatherBonuses,
  getWeatherReductionRate,
  getProcessingWeatherReductionRate,
  getProcessingReductionRate,
  getProcessingDurationMs,
  calculateProcessingFinishAt,
  getWateringReductionRate,
  getActualCooldownMinutes,
  getWateringReductionMs,
  calculateMatureAt,
  applyWatering,
  startAutoWatering,
  getNextWaterAtFromSchedule,
  formatDuration,
  formatTableDuration,
  formatDateTime
};
