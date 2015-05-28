var colors = require('css-color-names');
// Prevent including the FA stylesheet to the document, we include it manually
// in the iframe.
var Icon = require('react-fa/dist/Icon');
var React = require('react');
var {Button, Modal} = require('react-bootstrap');
var validate = require('plexus-validate');

var {Symbol} = require('../../common/Structures');
var DocumentActions = require('../../actions/DocumentActions');

var Form = require('../forms/Form');


var PartitionFillModal = React.createClass({
  propTypes: {
    symbol: React.PropTypes.instanceOf(Symbol).isRequired,
    partition: React.PropTypes.number.isRequired,
    onRequestHide: React.PropTypes.func
  },

  getInitialState: function() {
    return {message: undefined};
  },

  componentWillUnmount: function() {
    clearTimeout(this.messageTimeout);
  },

  showMessage: function(message) {
    this.setState({message});
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => this.setState({message: undefined}), 3000);
  },

  onSubmit: function(output, value, errors) {
    if (Object.keys(errors).length) {
      this.showMessage('Please correct all errors in the form.');
      return;
    }

    DocumentActions.setSymbol(
      this.props.symbol
        .setIn(['color', this.props.partition], output.color)
        .setIn(['pattern', this.props.partition], output.pattern)
    );

    this.props.onRequestHide();
  },

  handleSubmit: function(e) {
    this.refs.form.handleSubmit(e);
  },

  render: function() {
    var message;
    var schema;
    var values;

    if (this.state.message) {
      message = (
        <span className="text-danger pull-left message">
          <Icon name="exclamation-triangle" /> {this.state.message}
        </span>
      );
    }

    // TODO: We should use a real color picker.
    schema = {
      type: 'object',
      'x-ordering': ['color', 'pattern'],
      properties: {
        color: {
          title: 'Color',
          description: 'Fill color',
          type: 'string',
          'enum': Object.keys(colors),
          enumNames: Object.keys(colors).map(c => c.charAt(0).toUpperCase() + c.substring(1))
        },
        pattern: {
          title: 'Pattern',
          description: 'Fill pattern',
          type: 'string',
          'enum': ['solid', 'dotted', 'vertical', 'horizontal'],
          enumNames: ['Solid', 'Dotted', 'Striped vertically', 'Striped horizontally']
        }
      }
    };

    values = {
      color: this.props.symbol.color.get(this.props.partition),
      pattern: this.props.symbol.pattern.get(this.props.partition)
    };

    return (
      <Modal {...this.props} bsStyle="primary" title={`Partition ${this.props.partition + 1} filling`}>
        <div className="modal-body">
          <Form
            ref="form"
            buttons={[]}
            schema={schema}
            values={values}
            horizontal={true}
            validate={validate}
            onSubmit={this.onSubmit} />
        </div>
        <div className="modal-footer">
          {message}
          <Button onClick={this.props.onRequestHide}>Close</Button>
          <Button onClick={this.handleSubmit} bsStyle="primary">Update filling</Button>
        </div>
      </Modal>
    );
  }
});


module.exports = PartitionFillModal;
