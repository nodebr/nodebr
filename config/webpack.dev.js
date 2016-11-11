const path = require('path')

module.exports = (config, root) => {
  config.entry.app = [
    'react-hot-loader/patch',
    path.resolve(root, './src/main.js')
  ]

  config.devtool = 'eval'
}
