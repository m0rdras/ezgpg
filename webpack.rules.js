// noinspection WebpackConfigHighlighting
module.exports = [
    // Add support for native node modules
    {
        test: /\.node$/,
        use: 'node-loader'
    },
    {
        test: /\.(m?js|node)$/,
        parser: { amd: false },
        use: {
            loader: '@marshallofsound/webpack-asset-relocator-loader',
            options: {
                outputAssetBase: 'native_modules'
            }
        }
    },
    {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
        loader: 'url-loader'
    },
    {
        test: /\.([jt]sx?)$/,
        exclude: /(node_modules|.webpack)/,
        loaders: [
            {
                loader: 'babel-loader'
            }
        ]
    }
];
