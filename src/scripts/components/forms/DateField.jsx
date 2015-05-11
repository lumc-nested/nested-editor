var DatePicker = require('react-date-picker');
// Prevent including the FA stylesheet to the document, we include it manually
// in the iframe.
var Icon = require('react-fa/dist/Icon');
var moment = require('moment');
var React = require('react');
var {Button, Modal, OverlayMixin} = require('react-bootstrap');


var DateField = React.createClass({
  mixins: [OverlayMixin],

  getInitialState: function() {
    return {datePickerOpened: false};
  },

  showDatePicker: function() {
    this.setState({datePickerOpened: true});
  },

  hideDatePicker: function() {
    this.setState({datePickerOpened: false});
  },

  handleChange: function(date) {
    this.hideDatePicker();
    this.props.update(this.props.path, date, date);
  },

  render: function() {
    var display = this.props.value ? moment(this.props.value).format('dddd, MMMM Do YYYY') : '';

    return (
      <div className="input-group">
        <p className="form-control-static">{display}</p>
        <span className="input-group-btn">
          <Button onClick={this.showDatePicker} bsStyle="link"><Icon name="calendar" /></Button>
        </span>
      </div>
    );
  },

  renderOverlay: function() {
    var footer;

    if (!this.state.datePickerOpened) {
      return null;
    }

    footer = footerProps => (
      <div className="dp-footer">
        <div className="dp-footer-today" onClick={footerProps.gotoToday}>Today</div>
        <div className="dp-footer-selected" onClick={footerProps.gotoSelected}>Go to selected</div>
        <div className="dp-footer-clear" onClick={() => this.handleChange()}>Clear</div>
      </div>
    );

    return (
      <Modal bsStyle="primary" onRequestHide={this.hideDatePicker} animation={false} className="date-picker-modal">
        <div className="modal-body">
          <DatePicker
            date={this.props.value}
            onChange={this.handleChange}
            footerFactory={footer} />
        </div>
      </Modal>
    );
  }
});


module.exports = DateField;
