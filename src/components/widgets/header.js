import React from 'react'
import { Link } from 'react-router'

import logo from '../../assets/logo.png'

const styles = {
  nav: {
    backgroundColor: '#333',
    borderRadius: 0,
    border: 0
  },
  logo: {
    height: '100%'
  },
  link: {
    padding: '10px 15px'
  },
  menu: {
    color: 'white'
  }
}

export default class HeaderWidget extends React.Component {
  render () {
    return <nav className='navbar navbar-default' style={styles.nav}>
      <div className='container'>
        <div className='navbar-header'>
          <Link className='navbar-brand' to='/' style={styles.link}>
            <img src={logo} style={styles.logo} />
          </Link>
          <button type='button' className='navbar-toggle collapsed pull-right' data-toggle='collapse' data-target='#menu-collapse' aria-expanded='false'>
            <span className='sr-only'>Menu</span>
            <span className='icon-bar'></span>
            <span className='icon-bar'></span>
            <span className='icon-bar'></span>
          </button>
        </div>
        <div className='collapse navbar-collapse navbar-right' id='menu-collapse'>
          <ul className='nav navbar-nav'>
            <li><a href='#' style={styles.menu}>News</a></li>
            <li><a href='#' style={styles.menu}>Eventos</a></li>
            <li><a href='#' style={styles.menu}>Vagas</a></li>
            <li><a href='#' style={styles.menu}>Comunidade</a></li>
            <li><a href='#' style={styles.menu}>Login</a></li>
          </ul>
        </div>
      </div>
    </nav>
  }
}
