import React from 'react'
import { merge } from 'lodash'

const styles = {
  warn: {
    color: 'red'
  },
  small: {
    color: '#828282'
  },
  preview: {
    height: '50px',
    width: '50px',
    backgroundSize: 'cover'
  }
}

export default class NewsPanelWidget extends React.Component {
  static get propTypes () {
    return {
      url: React.PropTypes.string.isRequired,
      rank: React.PropTypes.number.isRequired,
      title: React.PropTypes.string.isRequired,
      domain: React.PropTypes.string.isRequired,
      points: React.PropTypes.number.isRequired,
      previewUrl: React.PropTypes.string,
      onThumbsUp: React.PropTypes.func.isRequired,
      onThumbsDown: React.PropTypes.func.isRequired,
      username: React.PropTypes.string.isRequired,
      onUsernameClick: React.PropTypes.func.isRequired,
      comments: React.PropTypes.number.isRequired,
      onCommentsClick: React.PropTypes.func.isRequired,
      onReport: React.PropTypes.func.isRequired
    }
  }

  render () {
    // Seta a thumb de preview correta
    const previewStyle = this.props.previewUrl && merge(styles.preview, {
      backgroundImage: `url("${this.props.previewUrl}")`
    })

    return (
      <div className='panel panel-default'>
        <div className='panel-body'>
          {previewStyle && <div className='img-rounded pull-right' style={styles.preview} />}
          <p>
            <strong>
              <a href={this.props.url}>{this.props.rank}. {title}</a>
            </strong>
            {this.props.domain && <small style={styles.small}>({this.props.domain})</small>}
          </p>
          <div className='btn-group' role='group'>
            <a className='btn btn-default btn-xs disabled'>{this.props.points}</a>
            <a className='btn btn-default btn-xs' onClick={e => e.preventDefault() && this.props.onThumbsUp(e)}>
              <i className='fa fa-thumbs-o-up' aria-hidden='true'></i>
            </a>
            <a className='btn btn-default btn-xs' onClick={e => e.preventDefault() && this.props.onThumbsDown(e)}>
              <i className='fa fa-thumbs-o-down' aria-hidden='true'></i>
            </a>
            <a className='btn btn-default btn-xs' onClick={e => e.preventDefault() && this.props.onUsernameClick(e)}>
              <i className='fa fa-user' aria-hidden='true'></i> {this.props.username}
            </a>
            <a className='btn btn-default btn-xs' onClick={e => e.preventDefault() && this.props.onCommentsClick(e)}>
              <i className='fa fa-comment-o' aria-hidden='true'></i> {this.props.comments}
            </a>
            <a className='btn btn-default btn-xs' onClick={e => e.preventDefault() && this.props.onReport(e)}>
              <i className='fa fa-exclamation-triangle' aria-hidden='true' style={styles.warn}></i> Reportar
            </a>
          </div>
        </div>
      </div>
    )
  }
}
