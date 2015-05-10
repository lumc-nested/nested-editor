var React = require('react');
var {Button, Input, Modal} = require('react-bootstrap');

var AppConstants = require('../../constants/AppConstants');
var DocumentActions = require('../../actions/DocumentActions');


// TODO: Validation. We could probably use plexus-form for all our forms to
//   have them all behave similarly and will do the validation for us.


var AddField = React.createClass({
  propTypes: {
    objectType: React.PropTypes.number.isRequired,
    onRequestHide: React.PropTypes.func
  },

  onSubmit: function(e) {
    var schema;
    var type;

    e.preventDefault();

    if (['submit', 'button'].includes(e.target.type)) {
      type = this.refs.type.getValue();
      schema = {
        title: this.refs.field.getValue(),
        type: type
      };

      if (type === 'date') {
        schema.type = 'string';
        schema.format = 'date';
      }

      DocumentActions.addField(
        this.props.objectType,
        this.refs.field.getValue(),
        schema
      );

      this.props.onRequestHide();
    }
  },

  render: function() {
    var title;

    switch (this.props.objectType) {
      case AppConstants.ObjectType.Member:
        title = 'Add member field';
        break;
      case AppConstants.ObjectType.Nest:
        title = 'Add nest field';
        break;
      case AppConstants.ObjectType.Pedigree:
      default:
        title = 'Add pedigree field';
    }

    return (
      <Modal {...this.props} bsStyle="primary" title={title}>
        <div className="modal-body">
          <form className="form-horizontal" onSubmit={this.onSubmit}>
            <Input ref="field" type="text" label="Field" labelClassName="col-xs-2" wrapperClassName="col-xs-10" />
            <Input ref="type" type="select" label="Type" labelClassName="col-xs-2" wrapperClassName="col-xs-10">
              <option value="string">Text</option>
              <option value="integer">Whole number</option>
              <option value="number">Any number</option>
              <option value="boolean">Yes / No</option>
              <option value="date">Date</option>
            </Input>
          </form>
        </div>
        <div className="modal-footer">
          <Button onClick={this.props.onRequestHide}>Close</Button>
          <Button onClick={this.onSubmit} bsStyle="primary">Add field</Button>
        </div>
      </Modal>
    );
  }
});


module.exports = AddField;
