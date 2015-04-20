'use strict';


// Prevent including the FA stylesheet to the document, we include it manually
// in the iframe.
var Icon = require('react-fa/dist/Icon');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var AppConstants = require('../../constants/AppConstants');
var AddField = require('./AddField');
var DeleteField = require('./DeleteField');


var Button = ReactBootstrap.Button;
var ModalTrigger = ReactBootstrap.ModalTrigger;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Table = ReactBootstrap.Table;
var Tooltip = ReactBootstrap.Tooltip;


var schemaAsString = function(schema) {
  switch (schema.get('type')) {
    case 'boolean':
      return 'Yes / No';
    case 'integer':
      return 'Whole number';
    case 'number':
      return 'Any number';
    case 'string':
    default:
      if (schema.get('format') === 'date') {
        return 'Date';
      }
      return 'Text';
  }
};


var Schemas = React.createClass({
  propTypes: {
    objectType: React.PropTypes.number.isRequired,
    // TODO: Use appSchemas as a blacklist for allowed field names. Perhaps
    //   also show them in the list (non-editable).
    appSchemas: React.PropTypes.object.isRequired,
    documentSchemas: React.PropTypes.object.isRequired,
    onClose: React.PropTypes.func
  },

  renderHeading: function() {
    var title;

    switch (this.props.objectType) {
      case AppConstants.ObjectType.Member:
        title = 'Custom member fields';
        break;
      case AppConstants.ObjectType.Nest:
        title = 'Custom nest fields';
        break;
      case AppConstants.ObjectType.Pedigree:
      default:
        title = 'Custom pedigree fields';
    }

    return (
      <h1>
        {title}
        <OverlayTrigger placement="left" overlay={<Tooltip>Back</Tooltip>}>
          <a onClick={this.props.onClose} className="pull-right">
            <Icon name="close" />
          </a>
        </OverlayTrigger>
      </h1>
    );
  },

  renderSchema: function(field, schema) {
    // Note: OverlayTrigger and ModalTrigger cannot be mixed yet, so for now
    //   we just add a title attribute on the remove field link.
    //   https://github.com/react-bootstrap/react-bootstrap/pull/569
    return (
      <tr key={field}>
        <td>
          <ModalTrigger modal={<DeleteField objectType={this.props.objectType} field={field} />}>
            <a title="Remove field"><Icon name="remove" /></a>
          </ModalTrigger>
        </td>
        <td>{schema.get('title')}</td>
        <td>{schemaAsString(schema)}</td>
      </tr>
    );
  },

  renderSchemas: function() {
    var rows;

    if (!this.props.documentSchemas.size) {
      return <span />;
    }

    rows = this.props.documentSchemas.map(
      (schema, field) => this.renderSchema(field, schema)
    ).toArray();

    return (
      <div className="table-editable">
        <Table striped hover>
          <thead>
            <tr>
              <th></th>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </div>
    );
  },

  render: function() {
    return (
      <div>
        {this.renderHeading()}
        {this.renderSchemas()}
        <ModalTrigger modal={<AddField objectType={this.props.objectType} />}>
          <Button bsStyle="link"><Icon name="plus" /> Add field</Button>
        </ModalTrigger>
      </div>
    );
  }
});


module.exports = Schemas;
