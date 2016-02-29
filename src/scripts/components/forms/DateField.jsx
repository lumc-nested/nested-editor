var DatePicker = require('react-date-picker');
// Prevent including the FA stylesheet by a deep require of Icon.
var Icon = require('react-fa/lib/Icon');
var moment = require('moment');
var React = require('react');
var {Button, Modal} = require('react-bootstrap');


var DateField = React.createClass({
  getInitialState: function() {
    return {datePickerOpened: false};
  },

  showDatePicker: function() {
    this.setState({datePickerOpened: true});
  },

  hideDatePicker: function() {
    this.setState({datePickerOpened: false});
  },

  onChange: function(date) {
    this.hideDatePicker();
    this.props.onChange(date);
  },

  render: function() {
    var display = this.props.value ? moment(this.props.value).format('dddd, MMMM Do YYYY') : <i>Not set</i>;

    return (
      <div className="input-group">
        <p className="form-control-static">{display}</p>
        <span className="input-group-btn">
          <Button onClick={this.showDatePicker} bsStyle="link"><Icon name="calendar" /></Button>
        </span>
        {this.renderPicker()}
      </div>
    );
  },

  renderPicker: function() {
    var footer = footerProps => (
      <div className="dp-footer">
        <div className="dp-footer-today" onClick={footerProps.gotoToday}>Today</div>
        <div className="dp-footer-selected" onClick={footerProps.gotoSelected}>Go to selected</div>
        <div className="dp-footer-clear" onClick={() => this.onChange('')}>Clear</div>
      </div>
    );

    return (
      <Modal
          show={this.state.datePickerOpened}
          onHide={this.hideDatePicker}
          animation={false}
          className="date-picker-modal">
        <Modal.Body>
          <DatePicker
            date={this.props.value}
            onChange={this.onChange}
            footerFactory={footer} />
        </Modal.Body>
      </Modal>
    );
  }
});


module.exports = DateField;
