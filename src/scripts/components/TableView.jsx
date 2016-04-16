var Immutable = require('immutable');
var React = require('react');
var {sortColumn, Table} = require('reactabular');
var {Col, Grid, Row} = require('react-bootstrap');
var sortByOrder = require('lodash.sortbyorder');

var {Document, ObjectRef} = require('../common/Structures');


var createColumns = function(schemas) {
  var columns = schemas.map(
    (schema, field) => ({
      property: field,
      header: schema.get('title', field)
    })
  ).set('_key', {property: '_key', header: '#'});
  return columns.toArray();
};


var createData = function(individuals) {
  return individuals.map(
    (individual, key) => individual.set('_key', key)
  ).toList().toJS();
};


var TableView = React.createClass({
  propTypes: {
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired,
    document: React.PropTypes.instanceOf(Document).isRequired,
    documentFieldSchemas: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    individualFieldSchemas: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    style: React.PropTypes.object
  },

  getInitialState: function() {
    var columns = createColumns(
      this.props.document.customIndividualFieldSchemas.merge(this.props.individualFieldSchemas)
    );
    var data = createData(this.props.document.individuals);
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

    if (!is(nextProps.document, this.props.document)) {
      this.setState({data: createData(nextProps.document)});
    }

    if (!is(nextProps.individualFieldSchemas, this.props.individualFieldSchemas) ||
        !is(nextProps.document.customIndividualFieldSchemas, this.props.document.customIndividualFieldSchemas)) {
      this.setState({columns: createColumns(
        nextProps.document.customIndividualFieldSchemas.merge(nextProps.individualFieldSchemas))}
      );
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
