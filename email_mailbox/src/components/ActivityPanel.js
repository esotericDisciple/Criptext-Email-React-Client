import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './activitypanel.css';
import Feed from './../containers/Feed';

class ActivityPanel extends Component {
  render() {
    return (
      <aside className="navigation-feed">
        <header>
          <div className="header-content">
            {this.renderHeaderIcon()}
            <div className="header-title">ACTIVITY FEED</div>
            <div className="header-button">
              <i className="icon-next" />
            </div>
            <div className="header-clear" />
          </div>
        </header>
        <nav>
          {this.renderFeedSection(this.props.newFeeds, this.props.oldFeeds)}
        </nav>
      </aside>
    );
  }

  componentDidMount() {
    this.props.onLoadFeeds();
  }

  renderHeaderIcon = () => {
    return (
      <div className="feed-header-icon">
        <i className={'icon-bell'} />
      </div>
    );
  };

  renderFeedSection = (newFeeds, oldFeeds) => {
    if (newFeeds.size < 1 && oldFeeds.size < 1) {
      return <div>{this.renderEmptyFeedSection()}</div>;
    }
    return (
      <div>
        {this.renderFeedList(newFeeds, 'NEW')}
        {this.renderFeedList(oldFeeds, 'OLDER')}
      </div>
    );
  };

  renderFeedList = (feedList, listName) => {
    if (feedList && feedList.size > 0) {
      return (
        <ul className="new-feeds">
          <li className="feed-section-title">
            <p className="text">{listName}</p>
          </li>
          {feedList.map((feed, index) => {
            return <Feed key={index} feed={feed} />;
          })}
        </ul>
      );
    }
    return null;
  };

  renderEmptyFeedSection = () => {
    return (
      <div className="empty-feed-content">
        <div className="empty-list-image">
          <div className="empty-icon" />
        </div>
        <div className="text">
          <p className="title">There&#39;s nothing new yet</p>
          <p className="subtitle">Enjoy your day</p>
        </div>
      </div>
    );
  };
}

ActivityPanel.propTypes = {
  newFeeds: PropTypes.object,
  oldFeeds: PropTypes.object,
  onLoadFeeds: PropTypes.func
};

export default ActivityPanel;
