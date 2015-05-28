var React = require('react');

var AppConstants = require('../constants/AppConstants');
var {Pedigree, Schema, Symbol, ObjectRef} = require('../common/Structures');

var FieldsSidebar = require('./sidebars/FieldsSidebar');
var SymbolSidebar = require('./sidebars/SymbolSidebar');


var Sidebar = React.createClass({
  propTypes: {
    pedigree: React.PropTypes.instanceOf(Pedigree).isRequired,
    documentSchema: React.PropTypes.instanceOf(Schema).isRequired,
    appSchema: React.PropTypes.instanceOf(Schema).isRequired,
    symbol: React.PropTypes.instanceOf(Symbol).isRequired,
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired
  },

  render: function() {
    var {symbol, ...restProps} = this.props;
    var memberFields = restProps.documentSchema.member.mergeDeep(
      restProps.appSchema.member
    ).map(schema => schema.get('title'));

    if (this.props.focus.type === AppConstants.ObjectType.Symbol) {
      return <SymbolSidebar symbol={symbol} memberFields={memberFields} />;
    } else {
      return <FieldsSidebar {...restProps} />;
    }
  }
});


module.exports = Sidebar;
