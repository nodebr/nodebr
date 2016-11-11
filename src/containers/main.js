import React from 'react'
import { Link } from 'react-router'

import Layout from '../components/layouts/default'
import Panel from '../components/widgets/panel'

const styles = {
  header: {
    border: 'none'
  }
}

export default class Main extends React.Component {
  render () {
    return <Layout>
      <div className='page-header' style={styles.header}>
        <h3>Notícias
          <Link to='/noticias/enviar' className='btn btn-default btn-sm pull-right'>
            <i className='fa fa-plus'></i> Enviar
          </Link>
        </h3>
      </div>
      <Panel />
      <Panel />
      <Panel />
      <Panel />
      <Panel />
      <Panel />
      <Panel />
      <Panel />
    </Layout>
  }
}
