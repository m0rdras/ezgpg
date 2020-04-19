const ipcRenderer = {
    invoke: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn()
};

const ipcMain = {
    handle: jest.fn(),
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
