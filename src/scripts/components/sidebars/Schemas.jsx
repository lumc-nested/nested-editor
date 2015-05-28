// Prevent including the FA stylesheet to the document, we include it manually
// in the iframe.
var Icon = require('react-fa/dist/Icon');
var React = require('react');
var {Button, ModalTrigger, OverlayTrigger, Table, Tooltip} = require('react-bootstrap');

var AppConstants = require('../../constants/AppConstants');
var AddFieldModal = require('../modals/AddFieldModal');
var DeleteFieldModal = require('../modals/DeleteFieldModal');


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
      if (schema.get('format') === 'multiline') {
        return 'Multi-line text';
      }
      return 'Text';
  }
};


var SchemasSidebar = React.createClass({
  propTypes: {
    objectType: React.PropTypes.number.isRequired,
    appSchemas: React.PropTypes.object.isRequired,
    documentSchemas: React.PropTypes.object.isRequired,
    showFields: React.PropTypes.func.isRequired
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
          <a onClick={this.props.showFields} className="pull-right">
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
          <ModalTrigger modal={<DeleteFieldModal objectType={this.props.objectType} field={field} />}>
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
      return null;
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
    // Disallowed are any predefined as well as custom field names and titles.
    // TODO: I think we should also blacklist some other field names (e.g.,
    //   'members' and 'nests' on the pedigree level, '_key' on the member
    //   level which we use as a special field in the table view, etc).
    var reservedFields = this.props.appSchemas.keySeq().concat(
      this.props.appSchemas.toList().map(schema => schema.get('title')),
      this.props.documentSchemas.keySeq(),
      this.props.documentSchemas.toList().map(schema => schema.get('title')),
    ).toSet().filter(field => field).toArray();

    return (
      <div>
        {this.renderHeading()}
        {this.renderSchemas()}
        <ModalTrigger modal={<AddFieldModal objectType={this.props.objectType} reservedFields={reservedFields} />}>
          <Button bsStyle="link"><Icon name="plus" /> Add field</Button>
        </ModalTrigger>
      </div>
    );
  }
});


module.exports = SchemasSidebar;