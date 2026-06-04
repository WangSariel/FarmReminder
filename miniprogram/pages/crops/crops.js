const farm = require("../../utils/farm");

const STORAGE_KEYS = {
  crops: "farm.crops",
  processItems: "farm.processItems"
};
const CATEGORIES = farm.CATEGORIES.filter((category) => category !== "工坊");

function emptyCropForm() {
  return {
    name: "",
    category: "水果",
    maturityMinutes: 960,
    wateringCooldownMinutes: 226
  };
}

function emptyProcessForm() {
  return {
    name: "",
    processingMinutes: 60
  };
}

function decorateCrops(crops) {
  return crops.map((crop) => ({
    ...crop,
    maturityText: farm.formatTableDuration(crop.maturityMinutes),
    wateringCooldownText: farm.formatTableDuration(crop.wateringCooldownMinutes)
  }));
}

function decorateProcessItems(items) {
  return items.map((item) => ({
    ...item,
    processingText: farm.formatTableDuration(item.processingMinutes)
  }));
}

Page({
  data: {
    mode: "crops",
    crops: [],
    processItems: [],
    categories: CATEGORIES,
    categoryIndex: 0,
    editingId: "",
    editingProcessId: "",
    form: emptyCropForm(),
    processForm: emptyProcessForm()
  },

  onShow() {
    this.selectTab();
    this.loadData();
  },

  selectTab() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  setMode(event) {
    this.setData({ mode: event.currentTarget.dataset.mode });
  },

  loadData() {
    const crops = farm.normalizeCrops(wx.getStorageSync(STORAGE_KEYS.crops));
    const processItems = farm.normalizeProcessItems(wx.getStorageSync(STORAGE_KEYS.processItems));
    wx.setStorageSync(STORAGE_KEYS.crops, crops);
    wx.setStorageSync(STORAGE_KEYS.processItems, processItems);
    this.setData({
      crops: decorateCrops(crops),
      processItems: decorateProcessItems(processItems)
    });
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  onProcessInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`processForm.${field}`]: event.detail.value });
  },

  onCategoryChange(event) {
    const categoryIndex = Number(event.detail.value);
    this.setData({
      categoryIndex,
      "form.category": CATEGORIES[categoryIndex]
    });
  },

  saveCrop() {
    const form = this.data.form;
    if (!form.name.trim()) {
      wx.showToast({ title: "填写作物名", icon: "none" });
      return;
    }
    const crop = {
      id: this.data.editingId || `crop_${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      maturityMinutes: Number(form.maturityMinutes),
      wateringCooldownMinutes: Number(form.wateringCooldownMinutes)
    };
    const crops = this.data.editingId
      ? this.data.crops.map((item) => (item.id === this.data.editingId ? crop : item))
      : this.data.crops.concat(crop);
    const plainCrops = crops.map(({ maturityText, wateringCooldownText, ...item }) => item);
    wx.setStorageSync(STORAGE_KEYS.crops, plainCrops);
    this.setData({
      crops: decorateCrops(plainCrops),
      editingId: "",
      form: emptyCropForm(),
      categoryIndex: 0
    });
    this.syncCrop(crop);
  },

  editCrop(event) {
    const crop = this.data.crops.find((item) => item.id === event.currentTarget.dataset.id);
    if (!crop) return;
    this.setData({
      editingId: crop.id,
      form: { ...crop },
      categoryIndex: Math.max(0, CATEGORIES.indexOf(crop.category))
    });
  },

  deleteCrop(event) {
    const id = event.currentTarget.dataset.id;
    const crops = this.data.crops.filter((item) => item.id !== id);
    const plainCrops = crops.map(({ maturityText, wateringCooldownText, ...item }) => item);
    wx.setStorageSync(STORAGE_KEYS.crops, plainCrops);
    this.setData({ crops: decorateCrops(plainCrops) });
  },

  saveProcessItem() {
    const form = this.data.processForm;
    if (!form.name.trim()) {
      wx.showToast({ title: "填写加工物名", icon: "none" });
      return;
    }
    const item = {
      id: this.data.editingProcessId || `process_${Date.now()}`,
      name: form.name.trim(),
      processingMinutes: Number(form.processingMinutes)
    };
    const processItems = this.data.editingProcessId
      ? this.data.processItems.map((entry) => (entry.id === this.data.editingProcessId ? item : entry))
      : this.data.processItems.concat(item);
    const plainItems = processItems.map(({ processingText, ...entry }) => entry);
    wx.setStorageSync(STORAGE_KEYS.processItems, plainItems);
    this.setData({
      processItems: decorateProcessItems(plainItems),
      editingProcessId: "",
      processForm: emptyProcessForm()
    });
    this.syncProcessItem(item);
  },

  editProcessItem(event) {
    const item = this.data.processItems.find((entry) => entry.id === event.currentTarget.dataset.id);
    if (!item) return;
    this.setData({
      editingProcessId: item.id,
      processForm: { ...item }
    });
  },

  deleteProcessItem(event) {
    const id = event.currentTarget.dataset.id;
    const processItems = this.data.processItems.filter((item) => item.id !== id);
    const plainItems = processItems.map(({ processingText, ...entry }) => entry);
    wx.setStorageSync(STORAGE_KEYS.processItems, plainItems);
    this.setData({ processItems: decorateProcessItems(plainItems) });
  },

  syncCrop(crop) {
    if (!getApp().globalData.cloudReady) return;
    const db = wx.cloud.database();
    db.collection("crops")
      .where({ id: crop.id })
      .get()
      .then((res) => {
        if (res.data[0]) {
          return db.collection("crops").doc(res.data[0]._id).update({ data: crop });
        }
        return db.collection("crops").add({ data: crop });
      });
  },

  syncProcessItem(item) {
    if (!getApp().globalData.cloudReady) return;
    const db = wx.cloud.database();
    db.collection("processItems")
      .where({ id: item.id })
      .get()
      .then((res) => {
        if (res.data[0]) {
          return db.collection("processItems").doc(res.data[0]._id).update({ data: item });
        }
        return db.collection("processItems").add({ data: item });
      });
  }
});
