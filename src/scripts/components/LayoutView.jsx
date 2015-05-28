var EventListener = require('react-bootstrap/lib/utils/EventListener');
var React = require('react/addons');
var {Col, Grid, Row} = require('react-bootstrap');

var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var {Pedigree, ObjectRef, Schema, Symbol} = require('../common/Structures');
var PedigreeDefs = require('./SVG/PedigreeDefs');
var PedigreeSVG = require('./SVG/PedigreeSVG');
var Utils = require('./Utils');
var Sidebar = require('./Sidebar');


var LayoutView = React.createClass({
  propTypes: {
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired,
    pedigree: React.PropTypes.instanceOf(Pedigree).isRequired,
    symbol: React.PropTypes.instanceOf(Symbol).isRequired,
    documentSchema: React.PropTypes.instanceOf(Schema).isRequired,
    appSchema: React.PropTypes.instanceOf(Schema).isRequired,
    style: React.PropTypes.object
  },

  childContextTypes: {
    dragging: React.PropTypes.bool.isRequired
  },

  getChildContext: function() {
    return {dragging: this.state.dragging};
  },

  getInitialState: function() {
    return {
      // Dimensions of the SVG viewport, initialized in componentDidMount.
      width: 100,
      height: 100,

      // Current position in the viewport.
      x: 0,
      y: 0,

      // Current zoom level.
      zoomLevel: 1,

      // We are in a drag event.
      dragging: false,

      // Current drag position.
      dragX: 0,
      dragY: 0
    };
  },

  zoomStep: function(delta) {
    this.setState({zoomLevel: this.state.zoomLevel + delta});
  },

  zoomSlide: function(event) {
    this.setState({zoomLevel: parseFloat(event.target.value, 10)});
  },

  handleMouseUp: function() {
    // This has to be bound to `mouseup` instead of `click`, since otherwise
    // we cannot detect dragging state.
    if (!this.state.dragging) {
      DocumentActions.setFocus(new ObjectRef({type: AppConstants.ObjectType.Pedigree}));
    }
  },

  handleMouseDown: function (event) {
    if (event.button !== 0) {
      // Only left mouse button.
      return;
    }

    this.setState({
      dragging: false,
      dragX: event.pageX,
      dragY: event.pageY
    });

    this.addDragListeners();
    event.stopPropagation();
  },

  addDragListeners: function() {
    var doc = Utils.ownerDocument(this);

    // Prevents all kinds of frantic selection events when moving outside
    // the window. Doesn't help in Firefox unfortunately.
    this._onDocumentSelectStartListener = EventListener.listen(doc, 'selectstart', (event) => {
      event.preventDefault();
    });

    this._onDocumentMouseMoveListener = EventListener.listen(doc, 'mousemove', (event) => {
      this.setState({
        dragging: true,
        dragX: event.pageX,
        dragY: event.pageY,
        x: this.state.x + (event.pageX - this.state.dragX),
        y: this.state.y + (event.pageY - this.state.dragY)
      });
      event.stopPropagation();
    });

    this._onDocumentMouseUpListener = EventListener.listen(doc, 'mouseup', (event) => {
      this.setState({
        dragging: false
      });
      this.removeDragListeners();
      event.stopPropagation();
    });
  },

  removeDragListeners: function() {
    if (this._onDocumentSelectStartListener) {
      this._onDocumentSelectStartListener.remove();
    }
    if (this._onDocumentMouseMoveListener) {
      this._onDocumentMouseMoveListener.remove();
    }
    if (this._onDocumentMouseUpListener) {
      this._onDocumentMouseUpListener.remove();
    }
  },

  componentDidMount: function () {
    var style = Utils.getComputedStyles(this.refs.layout);
    this.setState({
      width: parseInt(style.width, 10),
      height: parseInt(style.height, 10)
    });
  },

  componentWillUnmount: function() {
    this.removeDragListeners();
  },

  render: function() {
    var zoomLevel = this.state.zoomLevel;
    var controls;
    var defs;

    controls = React.addons.createFragment({
      zoomIn: Utils.tooltipButton({
        tooltipText: `Zoom to ${Math.round(zoomLevel * 100)}%`,
        tooltipPlacement: 'right',
        onClickHandle: this.zoomStep.bind(this, 0.2),
        buttonClass: 'zoom-in',
        iconName: 'search-plus'
      }, zoomLevel >= 2),
      zoomOut: Utils.tooltipButton({
        tooltipText: `Zoom to ${Math.round(zoomLevel * 100)}%`,
        tooltipPlacement: 'right',
        onClickHandle: this.zoomStep.bind(this, -0.2),
        buttonClass: 'zoom-out',
        iconName: 'search-minus'
      }, zoomLevel <= 0.25) // 0.05 padding to avoid floating number errors.
    });

    if (this.props.symbol.scheme !== undefined) {
      defs = <PedigreeDefs symbol={this.props.symbol} />;
    }

    return (
      <Grid fluid>
        <Row>
          <Col id="main" style={this.props.style} sm={8} md={9} lg={10}>
            <div ref="layout" id="layout-view">
              <div id="controls">
                {controls}
                <input id="slider" type="range" min="0.2" max="2.0" step="0.2"
                       value={this.state.zoomLevel}
                       onChange={this.zoomSlide} />
              </div>
              <svg version="1.1" id="layout" className={this.state.dragging ? 'dragging' : ''}
                   onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp}>
                {defs}
                <PedigreeSVG data={this.props.pedigree}
                             width={this.state.width}
                             focus={this.props.focus}
                             scale={zoomLevel}
                             x={this.state.x}
                             y={this.state.y}
                             symbol={this.props.symbol} />
              </svg>
            </div>
          </Col>
          <Col id="sidebar" style={this.props.style} sm={4} smOffset={8} md={3} mdOffset={9} lg={2} lgOffset={10}>
            <Sidebar pedigree={this.props.pedigree}
                     focus={this.props.focus}
                     documentSchema={this.props.documentSchema}
                     appSchema={this.props.appSchema}
                     symbol={this.props.symbol} />
          </Col>
        </Row>
      </Grid>
    );
  }
});


module.exports = LayoutView;
