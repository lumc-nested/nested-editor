var Icon = require('react-fa/dist/Icon');
var React = require('react');
var {Button, OverlayTrigger, Tooltip} = require('react-bootstrap');


/**
 * Get elements owner document
 *
 * @param {ReactComponent|HTMLElement} componentOrElement
 * @returns {HTMLElement}
 */
var ownerDocument = function(componentOrElement) {
  var elem = React.findDOMNode(componentOrElement);
  return (elem && elem.ownerDocument) || document;
};


/**
 * Shortcut to compute ReactComponent style
 *
 * @param {ReactComponent} component
 * @returns {CssStyle}
 */
var getComputedStyles = function(component) {
  return ownerDocument(component).defaultView.getComputedStyle(React.findDOMNode(component), null);
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
             overlay={<Tooltip>{config.tooltipText}</Tooltip>}>
             <Button className={config.buttonClass} onClick={config.onClickHandle}>
               <Icon name={config.iconName} />
             </Button>
           </OverlayTrigger>;
  }
};


module.exports = {ownerDocument, getComputedStyles, tooltipButton};
