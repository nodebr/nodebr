import React from 'react'
import { Route, Router, browserHistory } from 'react-router'

import Main from './containers/main'
import EnviarNoticia from './containers/enviar-noticia'

// Mapeia os containers para as rotas
const routes = <Router history={browserHistory}>
  <Route path='/' component={Main} />
  <Route path='/noticias/enviar' component={EnviarNoticia} />
</Router>

export default routes
