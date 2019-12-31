const ipcRenderer = {
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn()
};

module.exports = {
    remote: { dialog: { showErrorBox: jest.fn() } },
    ipcRenderer
};
