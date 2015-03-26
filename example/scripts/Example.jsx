'use strict';


var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Nested = require('../../src/scripts/index');


var examples = {
  json: [
    ['Example', require('!raw!../../data/json/example.json')],
    ['Simple family', require('!raw!../../data/json/simpleFamily.json')],
    ['Twins', require('!raw!../../data/json/twins.json')],
    ['Two roots', require('!raw!../../data/json/twoRoots.json')],
    ['Complex', require('!raw!../../data/json/complex.json')]
  ],
  ped: [
    ['Example', require('!raw!../../data/ped/example.ped')],
    ['SI 003', require('!raw!../../data/ped/si_003.ped')],
    ['SI 004', require('!raw!../../data/ped/si_004.ped')]
  ],
  fam: [
    ['Example', require('!binary!../../data/fam/example.fam')]
  ],
  xlsx: [
    ['XLSX (Excel 2007+)', require('!binary!../../data/spreadsheet/example.xlsx')],
    ['ODS (OpenDocument)', require('!binary!../../data/spreadsheet/example.ods')]
  ]
};


var Col = ReactBootstrap.Col;
var Grid = ReactBootstrap.Grid;
var Panel = ReactBootstrap.Panel;
var Row = ReactBootstrap.Row;


var FileInput = React.createClass({
  render: function() {
    var accept = this.props.extensions.map(e => '.' + e).join(',');

    return (
      <a className="file-input" href="#">
        Browse ... <input type="file" accept={accept} onChange={this.props.onChange} />
      </a>
    );
  }
});


var Example = React.createClass({
  openJson: function(event) {
    this.openFile(event, 'json');
  },

  openPed: function(event) {
    this.openFile(event, 'ped');
  },

  openFam: function(event) {
    this.openFile(event, 'fam', true);
  },

  openSpreadsheet: function(event) {
    this.openFile(event, 'xlsx', true);
  },

  openFile: function(event, filetype, binary) {
    var file = event.target.files[0];
    var reader = new FileReader();

    // Clear input element so we are called again even when re-opening the
    // same file.
    event.target.value = null;

    reader.onload = (e) => {
      this.refs.editor.openDocument(e.target.result, filetype);
    };

    if (file) {
      if (binary) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    }
  },

  render: function() {
    var links = (filetype) => examples[filetype].map(([name, data]) => {
      var onClick = () => this.refs.editor.openDocument(data, filetype);
      return <a onClick={onClick} href="#">{name}</a>;
    });

    return (
      <div>
        <Nested ref="editor" />
        <Panel header={<h3>Example pedigrees</h3>}>
          <Grid>
            <Row>
              <Col md={3}>
                <p>Nested</p>
                <ul>
                  {links('json').map(l => <li>{l}</li>)}
                  <li><FileInput extensions={['json']} onChange={this.openJson} /></li>
                </ul>
              </Col>
              <Col md={3}>
                <p>PED format</p>
                <ul>
                  {links('ped').map(l => <li>{l}</li>)}
                  <li><FileInput extensions={['ped']} onChange={this.openPed} /></li>
                </ul>
              </Col>
              <Col md={3}>
                <p>FAM format</p>
                <ul>
                  {links('fam').map(l => <li>{l}</li>)}
                  <li><FileInput extensions={['fam']} onChange={this.openFam} /></li>
                </ul>
              </Col>
              <Col md={3}>
                <p>Spreadsheets</p>
                <ul>
                  {links('xlsx').map(l => <li>{l}</li>)}
                  <li><FileInput extensions={['xlsx', 'ods']} onChange={this.openSpreadsheet} /></li>
                </ul>
              </Col>
            </Row>
          </Grid>
        </Panel>
      </div>
    );
  }
});


module.exports = Example;
