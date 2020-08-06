/* eslint-disable @typescript-eslint/no-var-requires */
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const forkTsCheckerOptions = {
    async: false,
    eslint: {
        files: './src/**/*.{ts,tsx,js,jsx}'
    }
};

module.exports = [new ForkTsCheckerWebpackPlugin(forkTsCheckerOptions)];
