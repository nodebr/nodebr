import React from 'react'
import Header from '../widgets/header'

export default class DefaultLayout extends React.Component {
  render () {
    return <div>
      <Header />
      <div className='container'>
        {this.props.children}
      </div>
    </div>
  }
}
