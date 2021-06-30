const electron = require('electron')
const server = require('./server');

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const dialog =electron.dialog
app.showExitPrompt = true

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  server;
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 770,
    height: 500,
    resizable: false,
    autoHideMenuBar: true,
    'standard-window': false,
    icon: '../img/',
    webPreferences: {
      nodeIntegration: true
    }
  })
    
  
    // and load the index.html of the app.
  mainWindow.loadFile('./public/html/index.html');  
  
  // mainWindow.loadURL(url.format({
  //   pathname: path.join(__dirname, '../html/index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('close', (e) => {
    if (app.showExitPrompt) {
        e.preventDefault() // Prevents the window from closing 
        dialog.showMessageBox({
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Confirm',
            message: 'Are you sure you want to quit?'
        }, function (response) {
            if (response === 0) { // Runs the following if 'Yes' is clicked
                app.showExitPrompt = false
                mainWindow.close()
            }
        })
    }
})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
