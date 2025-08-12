const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let flaskProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../assets/icons/icon.png'),
        show: false,
        titleBarStyle: 'default'
    });

    // Start Flask backend
    startFlaskServer();

    // Load the app
    mainWindow.loadFile(path.join(__dirname, '../web/index.html'));

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open DevTools in development mode
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (flaskProcess) {
            flaskProcess.kill();
        }
    });
}

function startFlaskServer() {
    const flaskAppPath = path.join(__dirname, '../web/api/app.py');
    
    try {
        flaskProcess = spawn('python', [flaskAppPath]);
        
        flaskProcess.stdout.on('data', (data) => {
            console.log(`Flask: ${data}`);
        });

        flaskProcess.stderr.on('data', (data) => {
            console.error(`Flask Error: ${data}`);
        });

        flaskProcess.on('close', (code) => {
            console.log(`Flask process exited with code ${code}`);
        });
    } catch (error) {
        console.error('Failed to start Flask server:', error);
    }
}

// Create application menu
const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Import Numbers...',
                accelerator: 'CmdOrCtrl+I',
                click: () => {
                    mainWindow.webContents.send('import-dialog');
                }
            },
            {
                label: 'Export Data...',
                accelerator: 'CmdOrCtrl+E',
                click: () => {
                    mainWindow.webContents.send('export-dialog');
                }
            },
            { type: 'separator' },
            {
                label: 'Backup Database...',
                click: () => {
                    mainWindow.webContents.send('backup-dialog');
                }
            },
            {
                label: 'Restore Database...',
                click: () => {
                    mainWindow.webContents.send('restore-dialog');
                }
            },
            { type: 'separator' },
            {
                label: 'Exit',
                accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                click: () => {
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            { role: 'undo', label: 'Undo' },
            { role: 'redo', label: 'Redo' },
            { type: 'separator' },
            { role: 'cut', label: 'Cut' },
            { role: 'copy', label: 'Copy' },
            { role: 'paste', label: 'Paste' },
            { role: 'selectall', label: 'Select All' }
        ]
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload', label: 'Reload' },
            { role: 'forceReload', label: 'Force Reload' },
            { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
            { type: 'separator' },
            { role: 'resetZoom', label: 'Reset Zoom' },
            { role: 'zoomIn', label: 'Zoom In' },
            { role: 'zoomOut', label: 'Zoom Out' },
            { type: 'separator' },
            { role: 'togglefullscreen', label: 'Toggle Full Screen' }
        ]
    },
    {
        label: 'Tools',
        submenu: [
            {
                label: 'Generate Report...',
                accelerator: 'CmdOrCtrl+R',
                click: () => {
                    mainWindow.webContents.send('generate-report');
                }
            },
            {
                label: 'Clear All Data...',
                click: () => {
                    mainWindow.webContents.send('clear-data-dialog');
                }
            },
            {
                label: 'Settings...',
                accelerator: 'CmdOrCtrl+,',
                click: () => {
                    mainWindow.webContents.send('settings-dialog');
                }
            }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'Documentation',
                click: () => {
                    mainWindow.webContents.send('show-documentation');
                }
            },
            {
                label: 'Check for Updates',
                click: () => {
                    mainWindow.webContents.send('check-updates');
                }
            },
            { type: 'separator' },
            {
                label: 'About',
                click: () => {
                    mainWindow.webContents.send('about-dialog');
                }
            }
        ]
    }
];

// Handle file dialogs
ipcMain.handle('show-open-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
});

// Handle window controls
ipcMain.handle('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.handle('close-window', () => {
    mainWindow.close();
});

app.whenReady().then(() => {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle app termination
app.on('before-quit', () => {
    if (flaskProcess) {
        flaskProcess.kill();
    }
});
