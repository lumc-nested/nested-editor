var EventListener = require('react-bootstrap/lib/utils/EventListener');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var TransitionEvents = require('react/lib/ReactTransitionEvents');

// Provided by webpack.
// var Nested = require('../../src/scripts/index');


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
    ['Example', require('!binary!../../data/fam/example.fam')],
    ['Simple', require('!binary!../../data/fam/simple.fam')],
    ['Twins', require('!binary!../../data/fam/twins.fam')]
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


// Component can use `this.state.size`, which is populated by `this.getSize`,
// which should be implemented by the component.
var ResizeMixin = {
  _resized: true,

  getInitialState: function() {
    return {size: 0};
  },

  resize: function() {
    this._resized = true;
  },

  componentDidMount: function() {
    this._onWindowResizeListener = EventListener.listen(window, 'resize', this.resize);

    this._resizeInterval = setInterval(() => {
      if (this._resized) {
        this._resized = false;
        this.setState({size: this.getSize()});
      }
    }, 250);
  },

  componentWillUnmount: function() {
    if (this._onWindowResizeListener) {
      this._onWindowResizeListener.remove();
    }

    if (this._resizeInterval) {
      this._resizeInterval.clearInterval();
    }
  }
};


var Example = React.createClass({
  mixins: [ResizeMixin],

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

  getSize: function() {
    return parseInt(
      document.defaultView.getComputedStyle(React.findDOMNode(this.refs.panel), null).height,
      10
    );
  },

  componentDidMount: function() {
    TransitionEvents.addEndEventListener(this.refs.panel.getCollapsableDOMNode(), this.resize);
  },

  componentWillUnmount: function() {
    TransitionEvents.removeEndEventListener(this.refs.panel.getCollapsableDOMNode(), this.resize);
  },

  render: function() {
    var editorStyle = {
      bottom: this.state.size + 15
    };

    var links = (filetype) => examples[filetype].map(([name, data]) => {
      var onClick = () => this.refs.editor.openDocument(data, filetype);
      return <li key={name}><a onClick={onClick} href="#">{name}</a></li>;
    });

    var panelProps = {
      header: <h3>Example pedigrees</h3>,
      collapsable: true,
      defaultExpanded: true
    };

    return (
      <div>
        <Nested ref="editor" style={editorStyle} />
        <Panel ref="panel" bsStyle="primary" {...panelProps}>
          <Grid>
            <Row>
              <Col md={3}>
                <p>Nested</p>
                <ul>
                  {links('json')}
                  <li><FileInput extensions={['json']} onChange={this.openJson} /></li>
                </ul>
              </Col>
              <Col md={3}>
                <p>PED format</p>
                <ul>
                  {links('ped')}
                  <li><FileInput extensions={['ped']} onChange={this.openPed} /></li>
                </ul>
              </Col>
              <Col md={3}>
                <p>FAM format</p>
                <ul>
                  {links('fam')}
                  <li><FileInput extensions={['fam']} onChange={this.openFam} /></li>
                </ul>
              </Col>
              <Col md={3}>
                <p>Spreadsheets</p>
                <ul>
                  {links('xlsx')}
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
