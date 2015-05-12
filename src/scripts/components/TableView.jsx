var Immutable = require('immutable');
var React = require('react');
var {sortColumn, Table} = require('reactabular');
var {Col, Grid, Row} = require('react-bootstrap');

var AppConstants = require('../constants/AppConstants');


var genderTable = Immutable.fromJS(AppConstants.Gender).flip();


var createColumns = function(schemas) {
  var columns = schemas.map(
    (schema, field) => ({
      property: field,
      header: schema.get('title', field)
    })
  ).set('_key', {'property': '_key', 'header': '#'});

  columns.get('gender').cell = gender => genderTable.get(gender, AppConstants.Gender.Unknown);

  return columns.toArray();
};


var createData = function(members) {
  return members.map(
    (member, key) => member.fields.set('_key', key)
  ).toList().toJS();
};


var TableView = React.createClass({
  propTypes: {
    members: React.PropTypes.object.isRequired,
    schemas: React.PropTypes.object.isRequired,
    style: React.PropTypes.object
  },

  getInitialState: function() {
    var columns = createColumns(this.props.schemas);
    var data = createData(this.props.members);
    var header = {
      onClick: column => {
        sortColumn(
          this.state.columns,
          column,
          this.state.data,
          this.setState.bind(this)
        );
      }
    };

    return {columns, data, header};
  },

  componentWillReceiveProps: function(nextProps) {
    var is = Immutable.is;

    if (!is(nextProps.members, this.props.members)) {
      this.setState({data: createData(nextProps.members)});
    }

    if (!is(nextProps.schemas, this.props.schemas)) {
      this.setState({columns: createColumns(nextProps.schemas)});
    }
  },

  render: function() {
    return (
      <Grid fluid>
        <Row>
          <Col id="main" style={this.props.style} sm={12}>
            <Table
              className="table table-striped table-bordered table-sortable"
              columns={this.state.columns}
              data={this.state.data}
              header={this.state.header} />
          </Col>
        </Row>
      </Grid>
    );
  }
});


module.exports = TableView;
