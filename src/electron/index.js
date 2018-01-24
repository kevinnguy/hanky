const electron = require('electron');
const path = require('path');
const url = require('url');

const { app, BrowserWindow } = electron;
let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({width: 480, height: 500});

  const startUrl = url.format({
    pathname: path.join(__dirname, '../../build/index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);
  mainWindow.on('closed', () => {
    mainWindow = null
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
});