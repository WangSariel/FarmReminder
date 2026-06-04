const farm = require("../../utils/farm");

const STORAGE_KEYS = {
  crops: "farm.crops",
  processItems: "farm.processItems",
  settings: "farm.settings",
  plantings: "farm.plantings",
  processings: "farm.processings"
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function dateValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function timeValue(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

Page({
  data: {
    mode: "planting",
    categories: farm.CATEGORIES.filter((category) => category !== "工坊"),
    categoryIndex: 0,
    crops: [],
    filteredCrops: [],
    cropNames: [],
    cropIndex: 0,
    processItems: [],
    processItemNames: [],
    processItemIndex: 0,
    date: "",
    time: "",
    dateTouched: false,
    timeTouched: false,
    remind: true
  },

  onShow() {
    this.selectTab();
    const now = new Date();
    const crops = farm.normalizeCrops(wx.getStorageSync(STORAGE_KEYS.crops));
    const processItems = farm.normalizeProcessItems(wx.getStorageSync(STORAGE_KEYS.processItems));
    wx.setStorageSync(STORAGE_KEYS.crops, crops);
    wx.setStorageSync(STORAGE_KEYS.processItems, processItems);
    const categories = farm.CATEGORIES.filter((category) => {
      return category !== "工坊" && crops.some((crop) => crop.category === category);
    });
    this.setData({
      crops,
      processItems,
      processItemNames: processItems.map((item) => item.name),
      categories,
      categoryIndex: 0,
      cropIndex: 0,
      processItemIndex: 0,
      date: dateValue(now),
      time: timeValue(now),
      dateTouched: false,
      timeTouched: false
    });
    this.refreshFilteredCrops();
  },

  selectTab() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  setMode(event) {
    this.setData({ mode: event.currentTarget.dataset.mode });
  },

  refreshFilteredCrops() {
    const category = this.data.categories[this.data.categoryIndex];
    const filteredCrops = this.data.crops.filter((item) => item.category === category);
    this.setData({
      filteredCrops,
      cropNames: filteredCrops.map((item) => item.name),
      cropIndex: 0
    });
  },

  onCategoryChange(event) {
    this.setData({
      categoryIndex: Number(event.detail.value),
      cropIndex: 0
    });
    this.refreshFilteredCrops();
  },

  onCropChange(event) {
    this.setData({ cropIndex: Number(event.detail.value) });
  },

  onProcessItemChange(event) {
    this.setData({ processItemIndex: Number(event.detail.value) });
  },

  onDateChange(event) {
    this.setData({ date: event.detail.value, dateTouched: true });
  },

  onTimeChange(event) {
    this.setData({ time: event.detail.value, timeTouched: true });
  },

  onRemindChange(event) {
    this.setData({ remind: event.detail.value });
  },

  getStartedAt() {
    const now = new Date();
    const date = this.data.dateTouched ? this.data.date : dateValue(now);
    const time = this.data.timeTouched ? this.data.time : timeValue(now);
    return new Date(`${date}T${time}:00`);
  },

  createTask() {
    if (this.data.mode === "processing") {
      this.createProcessing();
      return;
    }
    this.createPlanting();
  },

  createPlanting() {
    const crop = this.data.filteredCrops[this.data.cropIndex];
    if (!crop) return;

    const startedAt = this.getStartedAt();
    const matureAt = farm.calculateMatureAt(startedAt, crop);
    const planting = {
      id: `planting_${Date.now()}`,
      cropId: crop.id,
      cropName: crop.name,
      category: crop.category,
      maturityMinutes: crop.maturityMinutes,
      wateringCooldownMinutes: crop.wateringCooldownMinutes,
      startedAt: startedAt.toISOString(),
      matureAt: matureAt.toISOString(),
      nextWaterAt: startedAt.toISOString(),
      remind: this.data.remind,
      reminded: false,
      wateringRecords: []
    };

    const saveLocal = (cloudId) => {
      const plantings = wx.getStorageSync(STORAGE_KEYS.plantings) || [];
      wx.setStorageSync(STORAGE_KEYS.plantings, plantings.concat({ ...planting, _id: cloudId || "" }));
      wx.showToast({ title: "已创建" });
      wx.switchTab({ url: "/pages/home/home" });
    };

    if (this.data.remind) {
      this.requestSubscribe();
    }

    if (getApp().globalData.cloudReady) {
      wx.cloud.callFunction({
        name: "createPlanting",
        data: {
          crop,
          settings: wx.getStorageSync(STORAGE_KEYS.settings) || farm.DEFAULT_SETTINGS,
          planting
        },
        success: (res) => saveLocal(res.result && res.result._id),
        fail: () => saveLocal("")
      });
    } else {
      saveLocal("");
    }
  },

  createProcessing() {
    const item = this.data.processItems[this.data.processItemIndex];
    if (!item) return;

    const settings = { ...farm.DEFAULT_SETTINGS, ...(wx.getStorageSync(STORAGE_KEYS.settings) || {}) };
    const useHeroProcessing = !!settings.defaultUseHeroProcessing;
    const startedAt = this.getStartedAt();
    const finishAt = farm.calculateProcessingFinishAt(startedAt, item, settings, useHeroProcessing);
    const processing = {
      id: `processing_${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      processingMinutes: item.processingMinutes,
      startedAt: startedAt.toISOString(),
      finishAt: finishAt.toISOString(),
      useHeroProcessing,
      processingReductionRate: farm.getProcessingReductionRate(settings, useHeroProcessing),
      weatherKey: settings.weatherKey,
      altarLevel: settings.altarLevel,
      remind: this.data.remind,
      reminded: false
    };

    const saveLocal = (cloudId, cloudFinishAt) => {
      const processings = wx.getStorageSync(STORAGE_KEYS.processings) || [];
      wx.setStorageSync(STORAGE_KEYS.processings, processings.concat({
        ...processing,
        _id: cloudId || "",
        finishAt: cloudFinishAt || processing.finishAt
      }));
      wx.showToast({ title: "已创建" });
      wx.switchTab({ url: "/pages/home/home" });
    };

    if (this.data.remind) {
      this.requestSubscribe();
    }

    if (getApp().globalData.cloudReady) {
      wx.cloud.callFunction({
        name: "createProcessing",
        data: { item, settings, processing },
        success: (res) => saveLocal(res.result && res.result._id, res.result && res.result.finishAt),
        fail: () => saveLocal("")
      });
    } else {
      saveLocal("");
    }
  },

  requestSubscribe() {
    const settings = wx.getStorageSync(STORAGE_KEYS.settings) || farm.DEFAULT_SETTINGS;
    if (!settings.templateId || !wx.requestSubscribeMessage) {
      return;
    }
    wx.requestSubscribeMessage({
      tmplIds: [settings.templateId]
    });
  }
});
