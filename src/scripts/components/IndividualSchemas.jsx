// Prevent including the FA stylesheet by a deep require of Icon.
var Icon = require('react-fa/lib/Icon');
var Immutable = require('immutable');
var React = require('react');
var {Button, OverlayTrigger, Table, Tooltip} = require('react-bootstrap');

var {ModalTrigger} = require('./Utils');
var AddCustomIndividualField = require('./AddCustomIndividualField');
var DeleteCustomIndividualField = require('./DeleteCustomIndividualField');


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


var IndividualSchemas = React.createClass({
  propTypes: {
    schemas: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    customSchemas: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    showFields: React.PropTypes.func.isRequired
  },

  renderHeading: function() {
    var backTooltip = <Tooltip id="tooltip-back">Back</Tooltip>;

    return (
      <h1>
        Custom fields
        <OverlayTrigger placement="left" overlay={backTooltip}>
          <a onClick={this.props.showFields} className="pull-right">
            <Icon name="close" />
          </a>
        </OverlayTrigger>
      </h1>
    );
  },

  renderSchema: function(field, schema) {
    // We add some top margin to fix incorrect tooltip placement (hack).
    var deleteTooltip = <Tooltip id="tooltip-remove" style={{marginTop: 10}}>Remove field</Tooltip>;
    var deleteModal = <DeleteCustomIndividualField field={field} />;
    return (
      <tr key={field}>
        <td>
          <ModalTrigger modal={deleteModal}>
            <OverlayTrigger placement="left" overlay={deleteTooltip}>
              <a><Icon name="remove" /></a>
            </OverlayTrigger>
          </ModalTrigger>
        </td>
        <td>{schema.get('title')}</td>
        <td>{schemaAsString(schema)}</td>
      </tr>
    );
  },

  renderSchemas: function() {
    var rows;

    if (!this.props.customSchemas.size) {
      return null;
    }

    rows = this.props.customSchemas.map(
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
    // '_key' which we use as a special field in the table view, etc).
    var reservedFields = this.props.schemas.keySeq().concat(
      this.props.schemas.toList().map(schema => schema.get('title')),
      this.props.customSchemas.keySeq(),
      this.props.customSchemas.toList().map(schema => schema.get('title')),
    ).toSet().filter(field => field).toArray();

    var addModal = <AddCustomIndividualField reservedFields={reservedFields} />;

    return (
      <div>
        {this.renderHeading()}
        {this.renderSchemas()}
        <ModalTrigger modal={addModal}>
          <Button bsStyle="link"><Icon name="plus" /> Add field</Button>
        </ModalTrigger>
      </div>
    );
  }
});


module.exports = IndividualSchemas;
