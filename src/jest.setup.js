const Enzyme = require('enzyme');
const EnzymeAdapter = require('enzyme-adapter-react-16');

const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html lang="en"><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
    Object.defineProperties(target, {
        ...Object.getOwnPropertyDescriptors(src),
        ...Object.getOwnPropertyDescriptors(target)
    });
}

global.window = window;
global.document = window.document;
global.navigator = {
    userAgent: 'node.js'
};
global.requestAnimationFrame = function (callback) {
    return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
    clearTimeout(id);
};
copyProps(window, global);

Enzyme.configure({ adapter: new EnzymeAdapter() });
