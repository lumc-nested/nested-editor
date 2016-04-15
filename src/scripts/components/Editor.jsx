// Prevent including the FA stylesheet by a deep require of Icon.
var Icon = require('react-fa/lib/Icon');
var React = require('react');
var {Button, ButtonGroup, ButtonToolbar} = require('react-bootstrap');

var CsvReader = require('../readers/CsvReader');
var ExcelReader = require('../readers/ExcelReader');
var FamReader = require('../readers/FamReader');
var JsonReader = require('../readers/JsonReader');
var PedReader = require('../readers/PedReader');

var AppStore = require('../stores/AppStore');
var DocumentActions = require('../actions/DocumentActions');
var DocumentStore = require('../stores/DocumentStore');

var DocumentControls = require('./DocumentControls');
var LayoutView = require('./LayoutView');
var TableView = require('./TableView');


var VIEWS = {
  LAYOUT: 0,
  TABLE: 1
};


// [{a: 1, b: [x, y]},
//  {a: 2, b: [z]}]
// =>
// {x: {a: 1, b: [x, y]},
//  y: {a: 1, b: [x, y]},
//  z: {a: 2, b: [z]}}
var indexByArray = function(objects, property) {
  var byArray = {};
  var i;
  var j;

  for (i = 0; i < objects.length; i++) {
    for (j = 0; j < objects[i][property].length; j++) {
      byArray[objects[i][property][j]] = objects[i];
    }
  }

  return byArray;
};


var readers = indexByArray([CsvReader, ExcelReader, FamReader, JsonReader, PedReader], 'accept');


var getAppState = function() {
  return {
    documentFieldSchemas: AppStore.getDocumentFieldSchemas(),
    memberFieldSchemas: AppStore.getMemberFieldSchemas()
  };
};


var getDocumentState = function() {
  return {
    focus: DocumentStore.getFocus(),
    undo: DocumentStore.getUndo(),
    redo: DocumentStore.getRedo(),
    document: DocumentStore.getDocument()
  };
};


var Editor = React.createClass({
  propTypes: {
    /**
     * This is applied to the main layout scaffolds (having `postion: fixed`)
     * so they can make some space for other elements on the page. We hope
     * this is temporary until IFrame mode is usable.
     * https://git.lumc.nl/nested/nested-editor/issues/49
     */
    style: React.PropTypes.object
  },

  childContextTypes: {
    showMessage: React.PropTypes.func.isRequired
  },

  getChildContext: function() {
    return {showMessage: this.showMessage};
  },

  getInitialState: function() {
    return {
      view: VIEWS.LAYOUT,
      app: getAppState(),
      document: getDocumentState(),
      message: undefined
    };
  },

  _onChange: function() {
    this.setState({
      app: getAppState(),
      document: getDocumentState()
    });
  },

  componentDidMount: function() {
    DocumentStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    DocumentStore.removeChangeListener(this._onChange);
    clearTimeout(this.messageTimeout);
  },

  openDocument: function(document, filetype) {
    DocumentActions.openDocument(readers[filetype].readString(document));
  },

  changeView: function(view) {
    this.setState({view});
  },

  showMessage: function(message) {
    this.setState({message});
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => this.setState({message: undefined}), 3000);
  },

  render: function() {
    var document = this.state.document.document;
    var focus = this.state.document.focus;
    var redo = this.state.document.redo;
    var undo = this.state.document.undo;
    var message;
    var view;

    if (this.state.message) {
      message = (
        <p className="text-danger message btn-group">
          <Icon name="exclamation-triangle" /> {this.state.message}
        </p>
      );
    }

    if (this.state.view === VIEWS.TABLE) {
      view = <TableView style={this.props.style}
                        document={document}
                        focus={focus}
                        documentFieldSchemas={this.state.app.documentFieldSchemas}
                        memberFieldSchemas={this.state.app.memberFieldSchemas} />;
    } else {
      view = <LayoutView style={this.props.style}
                         undo={undo}
                         document={document}
                         focus={focus}
                         documentFieldSchemas={this.state.app.documentFieldSchemas}
                         memberFieldSchemas={this.state.app.memberFieldSchemas} />;
    }

    return (
      <div id="nested-editor">
        <ButtonToolbar id="toolbar" className="container-fluid">
          <div className="pull-left">
            <DocumentControls document={document} focus={focus} undo={undo} redo={redo} />
          </div>
          <div className="pull-right">
            {message}
            <ButtonGroup>
              <Button
                  key="layout"
                  onClick={this.changeView.bind(this, VIEWS.LAYOUT)}
                  active={this.state.view === VIEWS.LAYOUT}>
                <Icon name="sitemap" />
              </Button>
              <Button
                  key="table"
                  onClick={this.changeView.bind(this, VIEWS.TABLE)}
                  active={this.state.view === VIEWS.TABLE}>
                <Icon name="table" />
              </Button>
            </ButtonGroup>
          </div>
        </ButtonToolbar>
        {view}
      </div>
    );
  }
});


module.exports = Editor;
