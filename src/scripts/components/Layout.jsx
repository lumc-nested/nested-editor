var React = require('react');
var Immutable = require('immutable');
var classNames = require('classnames');
var Madeline = require('madeline');

var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var {Pedigree, ObjectRef} = require('../common/Structures');
var getFatherAndMother = require('../common/Utils').getFatherAndMother;


var genderTable = Immutable.fromJS(AppConstants.Gender).flip();


var drawSVG = function(pedigree) {
  var columns;
  var content;
  var data;
  var defs;
  var svg;

  // The following blob of code flattens our pedigree to a list of tabular
  // structure, basically a list of members each consisting of a list of field
  // values. It takes into account various differences between our data model
  // and the Madeline data model.
  // TODO: This is not pretty and should be refactored.
  columns = ['Individualid', 'Familyid', 'Gender', 'Mother', 'Father', 'DZTwin', 'MZTwin', 'DOB'];
  data = pedigree.members
    // A list of fields per member, much like the Excel and PED encodings.
    .map((member, memberKey) => {
      var father, mother, pregnancyIndex, pregnancy, zygote, zygoteSize, monozygote, dizygote, dob;
      dob = '.';

      [father, mother] = getFatherAndMother(member.parents, pedigree.members);
      if (member.parents.size) {
        [pregnancyIndex, pregnancy] = pedigree.nests.get(member.parents).pregnancies.findEntry(
          p => p.children.contains(memberKey));
        if (pregnancy.zygotes) {
          zygote = pregnancy.zygotes.get(pregnancy.children.findEntry(c => c === memberKey)[0]);
          zygoteSize = pregnancy.zygotes.filter(z => z === zygote).size
          monozygote = zygoteSize > 1;
          dizygote = zygoteSize === 1 && pregnancy.zygotes.size > 1;
        } else if (pregnancy.children.size > 1) {
          dob = (pregnancyIndex + 1) + '-01-01';
        }
      }
      return [
        'member-' + memberKey,
        'Family',
        genderTable.get(member.fields.get('gender'), AppConstants.Gender.Unknown).toString(),
        father ? 'member-' + father : '.',
        mother ? 'member-' + mother : '.',
        monozygote ? String.fromCharCode(97 + pregnancyIndex) : '.',
        dizygote ? String.fromCharCode(97 + pregnancyIndex) : '.',
        dob
      ];
    }).toList()
    // Nests without children are encoded by a dummy child (starting with a ^
    // character).
    .concat(
      pedigree.nests.filter(nest => nest.pregnancies.size === 0)
      .map((nest, nestKey) => {
        var [father, mother] = getFatherAndMother(nestKey, pedigree.members);
        return [
          '^no-child-' + nestKey.join('-'),
          'Family',
          AppConstants.Gender.Unknown.toString(),
          'member-' + father,
          'member-' + mother,
          '.',
          '.',
          '.'
        ];
      })
      .toList()
    )
    // Madeline expects a flattened list of member data.
    .toArray().reduce((a, b) => a.concat(b));

  svg = Madeline.draw(columns, data);

  if (!svg) {
    console.log('Could not render pedigree:', data);
    // TODO: What to store in this.svg in this case?
    return {}
  }

  // Ugly, but it is useful for us to have the defs and content separated
  // during render.
  [defs, content] = svg.split('<defs>')[1].split('</defs>');
  content = content.split('</svg>')[0];
  return {defs, content};
};


var StaticSVG = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    scale: React.PropTypes.number.isRequired,
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    dragging: React.PropTypes.bool.isRequired,
    pedigree: React.PropTypes.instanceOf(Pedigree).isRequired,
    onMouseDown: React.PropTypes.func.isRequired
  },

  handleMouseUp: function(event) {
    var element;
    // This has to be bound to `mouseup` instead of `click`, since otherwise
    // we cannot detect dragging state.
    if (!this.props.dragging) {
      // TODO: Check browser support for .closest().
      element = event.nativeEvent.target.closest('.individual');
      if (element) {
        DocumentActions.setFocus(new ObjectRef({
          type: AppConstants.ObjectType.Member,
          key: element.getAttribute('id').substr(7)
        }));
      } else if (event.nativeEvent.target.getAttribute('class') === 'mating') {
        DocumentActions.setFocus(new ObjectRef({
          type: AppConstants.ObjectType.Nest,
          key: Immutable.Set(event.nativeEvent.target.getAttribute('id').split(':').map(s => s.substr(7)))
        }));
      } else {
        DocumentActions.setFocus(new ObjectRef({type: AppConstants.ObjectType.Pedigree}));
      }
    }
  },

  componentWillMount() {
    this.svg = drawSVG(this.props.pedigree);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.pedigree !== this.props.pedigree) {
      this.svg = drawSVG(nextProps.pedigree);
    }
  },

  render: function() {
    var transform = `translate(${50 + this.props.x},${50 + this.props.y}) scale(${this.props.scale})`;
    /* eslint-disable react/no-danger */
    return (
      <svg
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


module.exports = StaticSVG;
