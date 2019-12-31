const ipcRenderer = {
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn()
};

const ipcMain = {
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn()
};

module.exports = {
    ipcMain,
    ipcRenderer
};
