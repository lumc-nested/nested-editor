'use strict';

var React = require('react');

var AppConstants = require('../constants/AppConstants');

var getFatherAndMother = function(nestKey, members) {
  var [father, mother] = [undefined, undefined];

  if (nestKey) {
    [father, mother] = nestKey.toArray();
  }

  // do our best to figure out which one is the father
  if (members.getIn([father, 'fields', 'gender']) === AppConstants.Gender.Female ||
      members.getIn([mother, 'fields', 'gender']) === AppConstants.Gender.Male) {
    [father, mother] = [mother, father];
  }

  return [father, mother];
};



/**
 * Get elements owner document
 *
 * @param {ReactComponent|HTMLElement} componentOrElement
 * @returns {HTMLElement}
 */
function ownerDocument(componentOrElement) {
  var elem = React.findDOMNode(componentOrElement);
  return (elem && elem.ownerDocument) || document;
}

/**
 * Shortcut to compute ReactComponent style
 *
 * @param {ReactComponent} component
 * @returns {CssStyle}
 */
function getComputedStyles(component) {
  return ownerDocument(component).defaultView.getComputedStyle(React.findDOMNode(component), null);
}



module.exports = {getFatherAndMother, getComputedStyles};
