import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './Settings';
import { mySettings, myAccount } from '../utils/electronInterface';
import string from '../lang';

class SettingsWrapper extends Component {
  constructor(props) {
    super(props);
    const sectionSelected =
      props.sectionSelected &&
      props.sectionSelected.params &&
      props.sectionSelected.params.tabSelected
        ? props.sectionSelected.params.tabSelected
        : string.settings.account;
    this.state = {
      sectionSelected
    };
  }

  render() {
    return (
      <Settings
        {...this.props}
        customerType={myAccount.customerType}
        sectionSelected={this.state.sectionSelected}
        isFromStore={mySettings.isFromStore}
        onClickCheckForUpdates={this.props.onCheckForUpdates}
        onClickSection={this.handleClickSection}
      />
    );
  }

  handleClickSection = section => {
    this.setState({ sectionSelected: section });
  };
}

SettingsWrapper.propTypes = {
  onCheckForUpdates: PropTypes.func,
  onLogout: PropTypes.func,
  onRemoveDevice: PropTypes.func,
  sectionSelected: PropTypes.object
};

export default SettingsWrapper;
