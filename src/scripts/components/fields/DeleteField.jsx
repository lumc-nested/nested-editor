var React = require('react');
var {Button, Modal} = require('react-bootstrap');

var AppConstants = require('../../constants/AppConstants');
var DocumentActions = require('../../actions/DocumentActions');


var DeleteField = React.createClass({
  propTypes: {
    objectType: React.PropTypes.number.isRequired,
    field: React.PropTypes.string.isRequired,
    onHide: React.PropTypes.func
  },

  onDelete: function() {
    console.log('deleting field');
    DocumentActions.deleteField(this.props.objectType, this.props.field);
    this.props.onHide();
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
      <Modal {...this.props}>
        <Modal.Header className="bg-primary text-primary" closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove the field <i>{this.props.field}</i>?</p>
          <p><strong>Warning:</strong> This will remove all values for this field from the current document.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
          <Button onClick={this.onDelete} bsStyle="primary">Remove field</Button>
        </Modal.Footer>
      </Modal>
    );
  }
});


module.exports = DeleteField;
