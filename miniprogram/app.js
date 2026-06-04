App({
  globalData: {
    cloudReady: false
  },

  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: "cloud1-please-replace",
        traceUser: true
      });
      this.globalData.cloudReady = true;
    }
  }
});
