var React = require('react');
var {Button, Modal} = require('react-bootstrap');

var DocumentActions = require('../actions/DocumentActions');


var DeleteCustomMemberField = React.createClass({
  propTypes: {
    field: React.PropTypes.string.isRequired,
    onHide: React.PropTypes.func
  },

  onDelete: function() {
    DocumentActions.deleteCustomMemberField(this.props.field);
    this.props.onHide();
  },

  render: function() {
    return (
      <Modal {...this.props}>
        <Modal.Header className="bg-primary text-primary" closeButton>
          <Modal.Title>Remove field</Modal.Title>
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


module.exports = DeleteCustomMemberField;
