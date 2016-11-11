const webpack = require('webpack')
const { set } = require('lodash')
const AppcacheWebpackPlugin = require('appcache-webpack-plugin')

module.exports = config => {
  config.plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.optimize.LimitChunkCountPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    }),
    new AppcacheWebpackPlugin({
      settings: ['prefer-online'],
      output: 'web.appcache'
    })
  )

  set(config, 'resolve.alias.react', 'react-lite')
  set(config, 'resolve.alias.react-dom', 'react-lite')
  config.devtool = 'source-map'
}
