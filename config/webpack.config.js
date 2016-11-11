const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const root = path.resolve(__dirname, '../')

const config = {
  entry: {
    app: path.resolve(root, './src/main.js'),
    vendors: path.resolve(root, './src/vendors.js')
  },
  output: {
    path: path.resolve(root, './dist'),
    filename: '/static/js/[name]-[hash].js'
  },
  resolve: {},
  module: {
    loaders: [
      {
        test: /\.js?/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: '/static/img/[name].[hash].[ext]'
        }
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: '/static/fonts/[name].[hash].[ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist', 'build'], { root }),
    new HtmlWebpackPlugin({
      template: path.resolve(root, './src/index.html'),
      inject: 'body'
    }),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) }
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new ExtractTextPlugin('/static/css/[name].[hash].css')
  ]
}

if (process.env.NODE_ENV === 'production') {
  require('./webpack.prod')(config, root)
} else if (process.env.NODE_ENV === 'development') {
  require('./webpack.dev')(config, root)
}

module.exports = config
