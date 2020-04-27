/* eslint-disable @typescript-eslint/no-var-requires */
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const forkTsCheckerOptions = {
    async: false,
    eslint: true
};

module.exports = [new ForkTsCheckerWebpackPlugin(forkTsCheckerOptions)];
