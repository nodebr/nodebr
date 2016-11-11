import ReactDOM from 'react-dom'
import React from 'react'
import { AppContainer } from 'react-hot-loader'

import routes from './routes'

ReactDOM.render(
  <AppContainer>{routes}</AppContainer>
, document.getElementById('app'))

// Se o HMR estiver ligado faz o patch do container principal habilitado
// para o desenvolvimento
if (module.hot) {
  module.hot.accept('./routes.js', () => {
    const { AppContainer } = require('react-hot-loader')
    const nextRoutes = require('./routes').default

    ReactDOM.render(
      <AppContainer>{nextRoutes}</AppContainer>
    , document.getElementById('app'))
  })
}
