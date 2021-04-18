import { app, protocol, dialog,Menu,BrowserWindow,ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
const path = require('path')
const xlsx = require('node-xlsx');
const fs = require('fs');

const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  Menu.setApplicationMenu(null)
  const win = new BrowserWindow({
    icon: path.join(__static, './favicon.ico'),
    title:'EasySearch位置搜索神器',
    width: 800,
    height: 600,
    useContentSize:true,
    show:false,
    webPreferences: {
     
     
  
     
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      enableRemoteModule: true
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
   // win.webContents.openDevTools();
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }



  
  win.on('ready-to-show',() => {
    win.show();
    win.maximize()
    // win.setFullScreen(true);

  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    //   await installExtension(VUEJS_DEVTOOLS);
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString());
    // }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

ipcMain.on('save',(event,list)=>{

  dialog.showSaveDialog({ title:'保存',properties: ['createDirectory'],filters: [
    { name: 'Excel', extensions: ['xls', 'xlsx'] }] }).then(result => {
      if(!result.canceled){
        if(result.filePath){

          let excelPath = result.filePath;

          var index = excelPath.lastIndexOf(".");
          if(index > 0){
            var ext = excelPath.substr(index+1);
            if(ext != 'xls' && ext != 'xlsx'){
              excelPath += '.xls';
            }
          }else{
            excelPath += '.xls';
          }
          
   

          let tempData = [];
          tempData.push(['名称','地址','电话','类别','纬度','经度','行政区划代码','省','市','区'])
          
          for(let i in list){
            let item = list[i];
            tempData.push([item.title, 
             item.address, 
             item.tel, 
             item.category, 
             item.lat,
             item.lng, 
             item.adcode,
             item.province, 
             item.city, 
             item.district]);
          }
          let xlsData = [
            {
              name:'sheet1',
              data:tempData
            }
          ];
        
        
        
          var buffer = xlsx.build(xlsData);
          fs.writeFile(excelPath,buffer,function(err){
            if(err){
              console.log(err);
            }
          })











        }
      }
    
  }).catch(err => {
    console.log(err)
  })






})
