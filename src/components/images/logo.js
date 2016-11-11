import React from 'react'
import logo from '../../assets/logo.png'

export default class LogoImage extends React.Component {
  render () {
    return <img
      {...this.props}
      className='img-responsive'
      src={logo} />
  }
}
