var Immutable = require('immutable');
var React = require('react');
var {sortColumn, Table} = require('reactabular');
var {Col, Grid, Row} = require('react-bootstrap');
var sortByOrder = require('lodash.sortbyorder');

var AppConstants = require('../constants/AppConstants');


var genderTable = Immutable.fromJS(AppConstants.Gender).flip();


var createColumns = function(schemas) {
  var columns = schemas.map(
    (schema, field) => ({
      property: field,
      header: schema.get('title', field)
    })
  ).set('_key', {property: '_key', header: '#'});

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
    var columnNames = {
      onClick: column => {
        sortColumn(
          this.state.columns,
          column,
          this.setState.bind(this)
        );
      }
    };
    var sortingColumn = 'key';

    return {columns, data, columnNames, sortingColumn};
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
    var data = sortColumn.sort(this.state.data, this.state.sortingColumn, sortByOrder);

    return (
      <Grid fluid>
        <Row>
          <Col id="main" style={this.props.style} sm={12}>
            <Table
                className="table table-striped table-bordered table-sortable"
                columns={this.state.columns}
                data={data}
                columnNames={this.state.columnNames}
                rowKey={'key'} />
          </Col>
        </Row>
      </Grid>
    );
  }
});


module.exports = TableView;
