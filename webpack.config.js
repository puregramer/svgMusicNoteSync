/***
 * file name : webpack.config.js
 * description : webcade webpack config
 * create date : 2018-04-24
 * creator : saltgamer
 ***/

const path = require('path');

module.exports = {
    mode: 'development', // "production" | "development" | "none"
    entry: ['babel-polyfill', 'whatwg-fetch', './src/js/main.js'],
    output: {
        filename: 'musicNote.js',
        path: path.resolve(__dirname, 'dist')
    },
    // devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        // openPage: 'wiseCamp',
        openPage: 'index.html',
        port: 7777
    },
    module: {
        rules: [
            {
                test: /\.json$/,
                use: ['json-loader']
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: '../../include/images/musicFlash/'
                    }
                }]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['file-loader']
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['env', {
                                targets: {
                                    browsers: ['last 2 versions']
                                }
                            }]
                        ],
                        // plugins: ['transform-remove-console']
                    }
                }
            }
        ]
    },
    optimization: {},
    resolve: {
        modules: [
            'node_modules'
        ],
        extensions: ['.js', '.json', '.css']
    }
};