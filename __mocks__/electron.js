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

const remote = {
    dialog: {
        showOpenDialogSync: jest.fn()
    }
};

module.exports = {
    ipcMain,
    ipcRenderer,
    remote
};
