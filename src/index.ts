import { app, BrowserWindow } from 'electron';
import Main from './main/Main';

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null;

const createWindow = async () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 768,
        width: 1024,
        title: 'ezgpg',
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    await mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // BrowserWindow.removeDevToolsExtension('React Developer Tools');
    // BrowserWindow.removeDevToolsExtension('MobX Developer Tools');

    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', async () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        await createWindow();
    }
});

app.allowRendererProcessReuse = true;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
Main.setup();
