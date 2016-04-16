var React = require('react');
var ReactDOM = require('react-dom');
var Immutable = require('immutable');
var classNames = require('classnames');
var Madeline = require('madeline');
var moment = require('moment');

var DocumentActions = require('../actions/DocumentActions');
var {Document, MatingKey, ObjectRef} = require('../common/Structures');


var drawSVG = function(document) {
  var content;
  var defs;
  var svg;

  svg = Madeline.draw(document.individuals.map((individual, individualKey) => {
    var dob;
    var deceased;
    var proband;
    var consultand;
    var sampled;
    var carrier;
    var fields

    if (individual.get('dateOfBirth')) {
      dob = moment(individual.get('dateOfBirth')).format('YYYY-MM-DD');
    }
    if (individual.get('dateOfDeath') || individual.get('deceased')) {
      deceased = 'yes';
    }
    if (individual.get('proband')) {
      proband = 'yes';
    }
    if (individual.get('consultand')) {
      consultand = 'yes';
    }
    if (individual.get('sampled')) {
      sampled = 'yes';
    }
    if (individual.get('carrier')) {
      carrier = 'yes';
    }

    fields = {
      IndividualId: individualKey,
      Familyid: document.fields.get('title'),
      Gender: individual.get('gender', 'unknown'),
      Mother: individual.get('mother', ''),
      Father: individual.get('father', ''),
      DZTwin: individual.get('dizygote', ''),
      MZTwin: individual.get('monozygote', ''),
      Name: individual.get('name') || `\n${individualKey}`,
      DOB: dob,
      Deceased: deceased,
      Proband: proband,
      Consultand: consultand,
      Sampled: sampled,
      Carrier: carrier
    };

    individual.filter((_, field) => field.toLowerCase().startsWith('affected')).forEach((value, field) => {
      fields[field.charAt(0).toUpperCase() + field.slice(1)] = value;
    });

    return Immutable.Map(fields);
  }).toList().toJS(), ['Name', 'DOB']);

  if (!svg) {
    // TODO: What to store in this.svg in this case? Perhaps Madeline should
    // always return a default empty SVG? We could also auto-undo the last
    // change?
    return;
  }

  // Ugly, but it is useful for us to have the defs and content separated
  // during render.
  [defs, content] = svg.split('<defs>')[1].split('</defs>');
  content = content.split('</svg>')[0];
  return {defs, content};
};


var updateFocus = function(svg, focus) {
  [].map.call(svg.querySelectorAll('.individual, .mating'), function(element) {
    element.classList.remove('selected');
  });

  switch (focus.type) {
    case 'individual':
      svg.getElementById(`individual-${focus.key}`).classList.add('selected');
      break;
    case 'mating':
      svg.getElementById(`mating-${focus.key.mother}:${focus.key.father}`).classList.add('selected');
      svg.getElementById(`individual-${focus.key.mother}`).classList.add('selected');
      svg.getElementById(`individual-${focus.key.father}`).classList.add('selected');
      break;
    case 'document':
    default:
  }
};


var Layout = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    scale: React.PropTypes.number.isRequired,
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    dragging: React.PropTypes.bool.isRequired,
    document: React.PropTypes.instanceOf(Document).isRequired,
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired,
    onMouseDown: React.PropTypes.func.isRequired,
    undo: React.PropTypes.string
  },

  contextTypes: {
    showMessage: React.PropTypes.func.isRequired
  },

  draw: function(document) {
    var svg = drawSVG(document);

    if (!svg) {
      if (this.props.undo !== undefined) {
        this.context.showMessage(`Sorry, this action (${this.props.undo}) is not supported on this pedigree.`);
        DocumentActions.undo();
      } else {
        this.context.showMessage('Sorry, Nested cannot render this pedigree.');
      }
      svg = {};
    }

    this.svg = svg;
  },

  handleMouseUp: function(event) {
    var individual;
    var mating;
    var fatherKey;
    var motherKey;
    // This has to be bound to `mouseup` instead of `click`, since otherwise
    // we cannot detect dragging state.
    if (!this.props.dragging) {
      // IE: Is Element.closest() supported?
      individual = event.nativeEvent.target.closest('.individual');
      mating = event.nativeEvent.target.closest('.mating');
      if (individual) {
        DocumentActions.setFocus(new ObjectRef({
          type: 'individual',
          key: individual.getAttribute('id').substr(11)
        }));
      } else if (mating) {
        [motherKey, fatherKey] = mating.getAttribute('id').substr(7).split(':')
        DocumentActions.setFocus(new ObjectRef({
          type: 'mating',
          key: new MatingKey({father: fatherKey, mother: motherKey})
        }));
      } else {
        DocumentActions.setFocus(new ObjectRef({type: 'document'}));
      }
    }
  },

  componentWillMount: function() {
    this.draw(this.props.document);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.document !== this.props.document) {
      this.draw(nextProps.document);
    }
  },

  componentDidMount: function() {
    updateFocus(ReactDOM.findDOMNode(this.refs.svg), this.props.focus);
  },

  componentDidUpdate: function(prevProps) {
    if (prevProps.focus !== this.props.focus || prevProps.document !== this.props.document) {
      updateFocus(ReactDOM.findDOMNode(this.refs.svg), this.props.focus);
    }
  },

  render: function() {
    var transform = `translate(${50 + this.props.x},${50 + this.props.y}) scale(${this.props.scale})`;
    /* eslint-disable react/no-danger */
    return (
      <svg
          ref="svg"
          version="1.1"
          id="layout"
          className={classNames({dragging: this.props.dragging})}
          onMouseDown={this.props.onMouseDown}
          onMouseUp={this.handleMouseUp}>
        <defs dangerouslySetInnerHTML={{__html: this.svg.defs}} />
        <g transform={transform}
           dangerouslySetInnerHTML={{__html: this.svg.content}} />
      </svg>
    );
    /* eslint-ensable react/no-danger */
  }
});


module.exports = Layout;
