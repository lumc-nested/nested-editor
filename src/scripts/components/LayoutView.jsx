var EventListener = require('react-bootstrap/lib/utils/EventListener');
var React = require('react');
var ReactDOM = require('react-dom');
var createFragment = require('react-addons-create-fragment');
var {Col, Grid, Row} = require('react-bootstrap');
var Immutable = require('immutable');

var {Document, ObjectRef} = require('../common/Structures');
var Layout = require('./Layout');
var Utils = require('./Utils');
var LayoutSidebar = require('./LayoutSidebar');


var LayoutView = React.createClass({
  propTypes: {
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired,
    document: React.PropTypes.instanceOf(Document).isRequired,
    documentFieldSchemas: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    memberFieldSchemas: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    undo: React.PropTypes.string,
    style: React.PropTypes.object
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
    // TODO: There is still a subtle bug in Firefox, where sometimes we get
    // stuck in dragging mode.
    // Here we are attaching event listeners to the browser DOM that interact
    // with (synthetic) event listeners attached on React components. These
    // are not the same and I guess this might lead to bugs?!
    var doc = Utils.ownerDocument(ReactDOM.findDOMNode(this));

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
    /* eslint-disable react/no-did-mount-set-state */
    // TODO: This is an anti-pattern.
    this.setState({
      width: parseInt(style.width, 10),
      height: parseInt(style.height, 10)
    });
    /* eslint-enable react/no-did-mount-set-state */
  },

  componentWillUnmount: function() {
    this.removeDragListeners();
  },

  render: function() {
    var zoomLevel = this.state.zoomLevel;
    var controls;

    controls = createFragment({
      zoomIn: Utils.tooltipButton({
        tooltipId: 'tooltip-zoom-in',
        tooltipText: `Zoom to ${Math.round(zoomLevel * 100)}%`,
        tooltipPlacement: 'right',
        onClickHandle: this.zoomStep.bind(this, 0.2),
        buttonClass: 'zoom-in',
        iconName: 'search-plus'
      }, zoomLevel >= 2),
      zoomOut: Utils.tooltipButton({
        tooltipId: 'tooltip-zoom-out',
        tooltipText: `Zoom to ${Math.round(zoomLevel * 100)}%`,
        tooltipPlacement: 'right',
        onClickHandle: this.zoomStep.bind(this, -0.2),
        buttonClass: 'zoom-out',
        iconName: 'search-minus'
      }, zoomLevel <= 0.25) // 0.05 padding to avoid floating number errors.
    });

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
              <Layout width={this.state.width}
                      scale={zoomLevel}
                      x={this.state.x}
                      y={this.state.y}
                      dragging={this.state.dragging}
                      document={this.props.document}
                      focus={this.props.focus}
                      onMouseDown={this.handleMouseDown}
                      undo={this.props.undo} />
            </div>
          </Col>
          <Col id="sidebar" style={this.props.style} sm={4} smOffset={8} md={3} mdOffset={9} lg={2} lgOffset={10}>
            <LayoutSidebar document={this.props.document}
                           focus={this.props.focus}
                           documentFieldSchemas={this.props.documentFieldSchemas}
                           memberFieldSchemas={this.props.memberFieldSchemas} />
          </Col>
        </Row>
      </Grid>
    );
  }
});


module.exports = LayoutView;
