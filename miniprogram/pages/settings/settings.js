const farm = require("../../utils/farm");

const STORAGE_KEY = "farm.settings";

Page({
  data: {
    settings: farm.DEFAULT_SETTINGS,
    weatherNames: farm.WEATHER_TYPES.map((item) => item.name),
    weatherIndex: 3,
    bonuses: []
  },

  onShow() {
    this.selectTab();
    const settings = { ...farm.DEFAULT_SETTINGS, ...(wx.getStorageSync(STORAGE_KEY) || {}) };
    const weatherIndex = farm.WEATHER_TYPES.findIndex((item) => item.key === settings.weatherKey);
    this.setData({
      settings,
      weatherIndex: weatherIndex >= 0 ? weatherIndex : 0
    });
    this.refreshBonuses();
  },

  selectTab() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    const value = event.detail.value;
    this.setData({ [`settings.${field}`]: value });
    if (field === "altarLevel") {
      this.refreshBonuses(Number(value));
    }
  },

  onHeroChange(event) {
    this.setData({ "settings.defaultUseHero": event.detail.value });
  },

  onHeroProcessingChange(event) {
    this.setData({ "settings.defaultUseHeroProcessing": event.detail.value });
  },

  onWeatherChange(event) {
    const weatherIndex = Number(event.detail.value);
    this.setData({
      weatherIndex,
      "settings.weatherKey": farm.WEATHER_TYPES[weatherIndex].key
    });
  },

  refreshBonuses(level) {
    const altarLevel = level || Number(this.data.settings.altarLevel);
    const bonuses = farm.getAllWeatherBonuses(altarLevel).map((item) => ({
      ...item,
      percentText: `${(item.bonusRate * 100).toFixed(1)}%`
    }));
    this.setData({ bonuses });
  },

  saveSettings() {
    const settings = {
      ...this.data.settings,
      altarLevel: Number(this.data.settings.altarLevel) || 1,
      defaultUseHero: !!this.data.settings.defaultUseHero,
      defaultUseHeroProcessing: !!this.data.settings.defaultUseHeroProcessing,
      templateFields: this.data.settings.templateFields || farm.DEFAULT_SETTINGS.templateFields
    };
    wx.setStorageSync(STORAGE_KEY, settings);
    this.syncSettings(settings);
    wx.showToast({ title: "已保存" });
  },

  syncSettings(settings) {
    if (!getApp().globalData.cloudReady) return;
    const db = wx.cloud.database();
    db.collection("settings")
      .limit(1)
      .get()
      .then((res) => {
        if (res.data[0]) {
          return db.collection("settings").doc(res.data[0]._id).update({ data: settings });
        }
        return db.collection("settings").add({ data: settings });
      });
  }
});
