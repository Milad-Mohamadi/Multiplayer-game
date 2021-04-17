const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        main: './src/client/main.js',
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new CopyPlugin([
            { from: './src/client/favicon.png' },
            { from: 'src/client/assets', to: 'assets' },
            { from: 'src/server/main.js', to: 'server.js' },
        ]),
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            title: 'Javascript',
            subtitle: '',
            contact: 'https://www.linkedin.com/in/miladmohamadi/',
            template: './src/client/index.hbs',
            files: {
                css: [
                    'https://fonts.googleapis.com/css?family=Roboto:400,500,700,900&display=swap',
                    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
                ],
                js: [
                    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js',
                    // 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js',
                    // 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.5.3/handlebars.min.js',
                ],
            },
        }),
        new CleanWebpackPlugin(),
        new NodemonPlugin({
            watch: path.resolve('./src'),
            script: './dist/server.js',
        }),
    ],
    module: {
        rules: [{
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            { test: /\.hbs$/, loader: 'handlebars-loader' },
            {
                test: /\.html$/i,
                loader: 'html-loader',
                options: {
                    attributes: false,
                },
            },
            {
                test: /\.(png|jpe?g|gif)/,
                use: ['file-loader']
            },
        ],
    },

    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        port: 8080,
    },
};