const farm = require("../../utils/farm");

const STORAGE_KEYS = {
  crops: "farm.crops",
  settings: "farm.settings",
  plantings: "farm.plantings",
  processings: "farm.processings"
};

Page({
  data: {
    settings: farm.DEFAULT_SETTINGS,
    weather: farm.getWeatherByKey(farm.DEFAULT_SETTINGS.weatherKey),
    weatherBonusText: "0%",
    wateringModeText: "男主浇灌",
    processingModeText: "男主加工",
    tasks: []
  },

  onShow() {
    this.selectTab();
    this.reload();
    this.startTicker();
  },

  onHide() {
    this.stopTicker();
  },

  onUnload() {
    this.stopTicker();
  },

  selectTab() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  startTicker() {
    this.stopTicker();
    this.timer = setInterval(() => this.refreshView(), 1000);
  },

  stopTicker() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  reload() {
    const settings = { ...farm.DEFAULT_SETTINGS, ...(wx.getStorageSync(STORAGE_KEYS.settings) || {}) };
    const weather = farm.getWeatherByKey(settings.weatherKey);
    const weatherBonusText = `${(farm.getWeatherBonusRate(settings.altarLevel, weather.index) * 100).toFixed(1)}%`;
    const wateringModeText = settings.defaultUseHero ? "男主浇灌" : "自己浇灌";
    const processingModeText = settings.defaultUseHeroProcessing ? "男主加工" : "自己加工";
    this.setData({ settings, weather, weatherBonusText, wateringModeText, processingModeText });
    this.refreshView();
  },

  buildPlantingTask(planting, crops, settings, now) {
    const crop = crops.find((item) => item.id === planting.cropId) || planting;
    const matureAt = new Date(planting.matureAt).getTime();
    const nextWaterAt = planting.nextWaterAt ? new Date(planting.nextWaterAt).getTime() : now;
    const isDone = matureAt <= now;
    const autoEnabled = !!planting.autoWateringEnabled;
    const schedule = planting.autoWateringSchedule || [];
    const nextAutoWaterAt = farm.getNextWaterAtFromSchedule(schedule, now);
    const nextAutoTime = nextAutoWaterAt ? new Date(nextAutoWaterAt).getTime() : 0;
    const remainingAutoCount = schedule.filter((item) => {
      return item.type === "auto" && new Date(item.wateredAt).getTime() > now;
    }).length;
    const reductionMs = planting.singleReductionMs || farm.getWateringReductionMs(crop, settings, !!settings.defaultUseHero);

    return {
      ...planting,
      taskType: "planting",
      displayName: crop.name || planting.cropName || "未知作物",
      subTitle: `${crop.category || planting.category || ""} · ${farm.formatDateTime(planting.startedAt)} 开始`,
      isDone,
      autoEnabled,
      canWater: !autoEnabled && nextWaterAt <= now,
      statusText: isDone ? "已成熟" : autoEnabled ? "自动浇灌中" : "待浇灌",
      remainingText: isDone ? "已经成熟" : farm.formatDuration(matureAt - now),
      finishAtText: farm.formatDateTime(matureAt),
      finishLabel: "预计成熟",
      nextWaterText: autoEnabled
        ? (nextAutoTime ? farm.formatDateTime(nextAutoTime) : "已排完，等待成熟")
        : (nextWaterAt <= now ? "现在" : farm.formatDateTime(nextWaterAt)),
      nextWaterLabel: autoEnabled ? "下次自动浇灌" : "可开始浇灌",
      reductionText: farm.formatDuration(reductionMs),
      autoWateringCountText: autoEnabled ? `${remainingAutoCount} 次` : "未开启",
      sortTime: matureAt
    };
  },

  buildProcessingTask(processing, now) {
    const finishAt = new Date(processing.finishAt).getTime();
    const isDone = finishAt <= now;
    const reductionRate = Number(processing.processingReductionRate || 0);
    const useHeroText = processing.useHeroProcessing ? "男主加工" : "自己加工";
    return {
      ...processing,
      taskType: "processing",
      displayName: processing.itemName || "未知加工物",
      subTitle: `${useHeroText} · ${farm.formatDateTime(processing.startedAt)} 开始`,
      isDone,
      statusText: isDone ? "已完成" : "加工中",
      remainingText: isDone ? "已经完成" : farm.formatDuration(finishAt - now),
      finishAtText: farm.formatDateTime(finishAt),
      finishLabel: "预计完成",
      processingRateText: `${(reductionRate * 100).toFixed(1)}%`,
      sortTime: finishAt
    };
  },

  refreshView() {
    const settings = this.data.settings;
    const crops = farm.normalizeCrops(wx.getStorageSync(STORAGE_KEYS.crops));
    const plantings = wx.getStorageSync(STORAGE_KEYS.plantings) || [];
    const processings = wx.getStorageSync(STORAGE_KEYS.processings) || [];
    const now = Date.now();
    const tasks = plantings
      .map((planting) => this.buildPlantingTask(planting, crops, settings, now))
      .concat(processings.map((processing) => this.buildProcessingTask(processing, now)))
      .sort((a, b) => a.sortTime - b.sortTime);
    this.setData({ tasks });
  },

  waterPlanting(event) {
    const id = event.currentTarget.dataset.id;
    const settings = { ...farm.DEFAULT_SETTINGS, ...(wx.getStorageSync(STORAGE_KEYS.settings) || {}) };
    const crops = farm.normalizeCrops(wx.getStorageSync(STORAGE_KEYS.crops));
    const plantings = wx.getStorageSync(STORAGE_KEYS.plantings) || [];
    const index = plantings.findIndex((item) => item.id === id);
    if (index < 0 || plantings[index].autoWateringEnabled) return;

    const crop = crops.find((item) => item.id === plantings[index].cropId) || plantings[index];
    const useHero = !!settings.defaultUseHero;
    plantings[index] = farm.startAutoWatering(plantings[index], crop, settings, new Date(), useHero);
    wx.setStorageSync(STORAGE_KEYS.plantings, plantings);
    this.refreshView();

    if (getApp().globalData.cloudReady && plantings[index]._id) {
      wx.cloud.callFunction({
        name: "waterPlanting",
        data: { plantingId: plantings[index]._id, useHero },
        success: (res) => {
          if (!res.result) return;
          const current = wx.getStorageSync(STORAGE_KEYS.plantings) || [];
          const currentIndex = current.findIndex((item) => item.id === id);
          if (currentIndex >= 0) {
            current[currentIndex] = { ...current[currentIndex], ...res.result };
            wx.setStorageSync(STORAGE_KEYS.plantings, current);
            this.refreshView();
          }
        }
      });
    }
  },

  removeTask(event) {
    const id = event.currentTarget.dataset.id;
    const type = event.currentTarget.dataset.type;
    if (type === "processing") {
      const processings = (wx.getStorageSync(STORAGE_KEYS.processings) || []).filter((item) => item.id !== id);
      wx.setStorageSync(STORAGE_KEYS.processings, processings);
    } else {
      const plantings = (wx.getStorageSync(STORAGE_KEYS.plantings) || []).filter((item) => item.id !== id);
      wx.setStorageSync(STORAGE_KEYS.plantings, plantings);
    }
    this.refreshView();
  }
});
