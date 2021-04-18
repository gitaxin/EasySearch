module.exports = {
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        "appId": "cn.giteasy.es",
        "copyright":"Copyright © 2021",//版权信息
        "directories":{
           "output":"./dist_electron"//输出文件路径
        },
        "win":{//win相关配置
            "icon":"./favicon.ico",//图标，当前图标在根目录下，注意这里有两个坑
            "target": [
                {
                    "target": "nsis",//利用nsis制作安装程序
                    "arch": [
                        // "x64"//64位
                        "ia32"//32位
                    ]
                }
            ]
        },
        "nsis": {
          "oneClick": false, // 是否一键安装
          "allowElevation": true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          "allowToChangeInstallationDirectory": true, // 允许修改安装目录
          "installerIcon": "./favicon.ico",// 安装图标
          "uninstallerIcon": "./favicon.ico",//卸载图标
          "installerHeaderIcon": "./favicon.ico", // 安装时头部图标
          "createDesktopShortcut": true, // 创建桌面图标
          "createStartMenuShortcut": true,// 创建开始菜单图标
          "shortcutName": "EasySearch", // 图标名称
      },
      publish: [
        {
         provider: "generic",
         channel: "latest",
         url: ""
        }
      ]
      }
    }
  }
};


//打包
//https://www.jianshu.com/p/dfcf2a6a497c
// https://www.jianshu.com/p/1dbb96bc8f37
//https://www.electron.build/