var React = require('react');
// Prevent including the FA stylesheet by a deep require of Icon.
var Icon = require('react-fa/lib/Icon');
var {Button, OverlayTrigger, Tooltip} = require('react-bootstrap');
var createChainedFunction = require('react-bootstrap/lib/utils/createChainedFunction');


/**
 * Get elements owner document
 *
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
var ownerDocument = function(element) {
  return (element && element.ownerDocument) || document;
};


/**
 * Shortcut to get computed style
 *
 * @param {HTMLelement} element
 * @returns {CssStyle}
 */
var getComputedStyles = function(element) {
  return ownerDocument(element).defaultView.getComputedStyle(element, null);
};


/**
 * Shortcut to create a disable-able button with tooltips.
 *
 * @param {object} config
 * @param {boolean} isDisabled
 * @returns {Button}
 */
var tooltipButton = function(config, isDisabled) {
  if (isDisabled) {
    return <Button className={config.buttonClass} disabled><Icon name={config.iconName} /></Button>;
  } else {
    return <OverlayTrigger
             placement={config.tooltipPlacement}
             overlay={<Tooltip id={config.tooltipId}>{config.tooltipText}</Tooltip>}>
             <Button className={config.buttonClass} onClick={config.onClickHandle}>
               <Icon name={config.iconName} />
             </Button>
           </OverlayTrigger>;
  }
};


var ModalTrigger = React.createClass({
  propTypes: {
    modal: React.PropTypes.node.isRequired
  },

  getInitialState: function() {
    return {showModal: false};
  },

  close: function() {
    this.setState({showModal: false});
  },

  open: function() {
    this.setState({showModal: true});
  },

  render: function() {
    var modal = React.cloneElement(this.props.modal, {
      show: this.state.showModal,
      onHide: this.close
    });
    var child = React.Children.only(this.props.children);
    var trigger = React.cloneElement(child, {
      onClick: createChainedFunction(child.props.onClick, this.open)
    });
    return (
      <div>
        {modal}
        {trigger}
      </div>
    );
  }
});


module.exports = {ownerDocument, getComputedStyles, tooltipButton, ModalTrigger};
