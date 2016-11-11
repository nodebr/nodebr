import React from 'react'
import { Link } from 'react-router'

import Layout from '../components/layouts/default'
import Panel from '../components/widgets/panel'

const styles = {
  header: {
    border: 'none'
  }
}

export default class EnviarNoticiaContainer extends React.Component {
  render () {
    return <Layout>
      <div className='page-header' style={styles.header}>
        <h3>Enviar Notícia</h3>
      </div>
      <Panel />
    </Layout>
  }
}
