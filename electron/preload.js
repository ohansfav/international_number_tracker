const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // File dialogs
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    
    // Listen for main process messages
    onImportDialog: (callback) => ipcRenderer.on('import-dialog', callback),
    onExportDialog: (callback) => ipcRenderer.on('export-dialog', callback),
    onBackupDialog: (callback) => ipcRenderer.on('backup-dialog', callback),
    onRestoreDialog: (callback) => ipcRenderer.on('restore-dialog', callback),
    onGenerateReport: (callback) => ipcRenderer.on('generate-report', callback),
    onClearDataDialog: (callback) => ipcRenderer.on('clear-data-dialog', callback),
    onSettingsDialog: (callback) => ipcRenderer.on('settings-dialog', callback),
    onShowDocumentation: (callback) => ipcRenderer.on('show-documentation', callback),
    onCheckUpdates: (callback) => ipcRenderer.on('check-updates', callback),
    onAboutDialog: (callback) => ipcRenderer.on('about-dialog', callback),
    
    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Console log for debugging
console.log('Preload script loaded');
