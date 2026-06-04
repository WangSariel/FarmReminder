Component({
  data: {
    selected: 0,
    color: "#8c6f76",
    selectedColor: "#4d7c54",
    list: [
      {
        pagePath: "/pages/home/home",
        text: "农场",
        iconPath: "/assets/tabbar/home.svg",
        selectedIconPath: "/assets/tabbar/home-active.svg"
      },
      {
        pagePath: "/pages/planting/planting",
        text: "种植",
        iconPath: "/assets/tabbar/planting.svg",
        selectedIconPath: "/assets/tabbar/planting-active.svg"
      },
      {
        pagePath: "/pages/crops/crops",
        text: "作物",
        iconPath: "/assets/tabbar/crops.svg",
        selectedIconPath: "/assets/tabbar/crops-active.svg"
      },
      {
        pagePath: "/pages/settings/settings",
        text: "设置",
        iconPath: "/assets/tabbar/settings.svg",
        selectedIconPath: "/assets/tabbar/settings-active.svg"
      }
    ]
  },

  methods: {
    switchTab(event) {
      const data = event.currentTarget.dataset;
      wx.switchTab({ url: data.path });
    }
  }
});
