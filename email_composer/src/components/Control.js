import React from 'react';
import PropTypes from 'prop-types';
import './control.css';

const Control = props => (
  <div className="control-container">
    <button
      className={
        'button-a button-send ' +
        (props.displayLoadingSendButton ? 'button-send-loading' : '')
      }
      onClick={props.onClickSendMessage}
      disabled={props.displayLoadingSendButton || props.disabledSendButton}
    >
      {props.displayLoadingSendButton
        ? renderSendLoadingButton()
        : renderSendNormalButton()}
    </button>
    <div>
      <div className="buttons-container">
        <div className="button-editor">
          <i className="icon-attach" />
        </div>
        <div
          className="button-editor button-editor-border-left button-editor-border-right"
          onClick={props.onClickTextEditor}
        >
          <i className="icon-text-edit" />
        </div>
      </div>
      <div className="buttons-container">
        <div className="button-editor">
          <i className="icon-trash" />
        </div>
      </div>
    </div>
  </div>
);

const renderSendNormalButton = () => (
  <div>
    <i className="icon-sent" />
    <span>send</span>
  </div>
);

const renderSendLoadingButton = () => (
  <div className="loading">
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
  </div>
);

Control.propTypes = {
  disabledSendButton: PropTypes.bool,
  displayLoadingSendButton: PropTypes.bool,
  onClickSendMessage: PropTypes.func,
  onClickTextEditor: PropTypes.func
};

export default Control;
