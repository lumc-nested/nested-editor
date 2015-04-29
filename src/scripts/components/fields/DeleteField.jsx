'use strict';


var React = require('react');
var {Button, Modal} = require('react-bootstrap');

var AppConstants = require('../../constants/AppConstants');
var DocumentActions = require('../../actions/DocumentActions');


var DeleteField = React.createClass({
  propTypes: {
    objectType: React.PropTypes.number.isRequired,
    field: React.PropTypes.string.isRequired,
    onRequestHide: React.PropTypes.func
  },

  onDelete: function() {
    console.log('deleting field');
    DocumentActions.deleteField(this.props.objectType, this.props.field);
    this.props.onRequestHide();
  },

  render: function() {
    var title;

    switch (this.props.objectType) {
      case AppConstants.ObjectType.Member:
        title = 'Remove member field';
        break;
      case AppConstants.ObjectType.Nest:
        title = 'Remove nest field';
        break;
      case AppConstants.ObjectType.Pedigree:
      default:
        title = 'Remove pedigree field';
    }

    return (
      <Modal {...this.props} bsStyle="primary" title={title}>
        <div className="modal-body">
          <p>Are you sure you want to remove the field <i>{this.props.field}</i>?</p>
          <p><strong>Warning:</strong> This will remove all values for this field from the current document.</p>
        </div>
        <div className="modal-footer">
          <Button onClick={this.props.onRequestHide}>Close</Button>
          <Button onClick={this.onDelete} bsStyle="primary">Remove field</Button>
        </div>
      </Modal>
    );
  }
});


module.exports = DeleteField;
