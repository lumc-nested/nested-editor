var Kinetic = require('kinetic');
var PC = require('../constants/PedigreeConstants.js');
var AppActions = require('../actions/AppActions.js');


// TODO: Constants, or user defined?
var size = PC.MemberSize;
var padding = 2;
var strokeWidth = 2;
var themeColor = PC.ThemeColor;

var Member = function(member) {
  this.member = member;
  this.id = member.id;
  this.shape = undefined;
  this.deathStrike = undefined;
  this.init();
};

Member.prototype = {
  init: function() {

    // inherit from Kinetic.Group
    Kinetic.Group.call(this, {});

    this._drawGender();
    if (this.isDead()) {
      this._drawDeath();
    }

    this.on('click', this.click);
  },

  // TODO: this usage of dateOfDeath and deceased should be documented in the file schema.
  // TODO: what if dateOfDeath is a boolean?
  // TODO: do we want to use a custom column?
  isDead: function() {
    return this.member.dateOfDeath !== undefined ||
          (this.member.deceased !== undefined && this.member.deceased);
  },

  _drawGender: function() {
    var shapeSize;

    switch(this.member.gender) {
      case PC.Gender.Male:
        shapeSize = size - strokeWidth * 2 - padding * 2;
        this.shape = new Kinetic.Rect({
          position: {x: padding + strokeWidth, y: padding + strokeWidth},
          width: shapeSize,
          height: shapeSize
        });
        break;
      case PC.Gender.Female:
        this.shape = new Kinetic.Circle({
          position: {x: size / 2, y: size / 2},
          radius: size / 2 - padding - strokeWidth
        });
        break;
      case PC.Gender.Unknown:
      default:
        shapeSize = (size - padding * 2) / Math.sqrt(2) - strokeWidth;
        this.shape = new Kinetic.Rect({
          position: {x: size / 2, y: padding + strokeWidth},
          width: shapeSize,
          height: shapeSize,
          rotation: 45
        });
        break;
    }
    this.shape.stroke(themeColor);
    this.shape.fill('#ffffff');
    this.add(this.shape);
  },

  _drawDeath: function() {
    this.deathStrike = new Kinetic.Line({
      points: [size, 0, 0, size],
      stroke: themeColor
    });

    this.add(this.deathStrike);
  },

  _showHitArea: function() {// for debug.
    var hitArea = new Kinetic.Rect({
      position: {x: 0, y: 0},
      width: size,
      height: size,
      stroke: 'grey',
      strokeWidth: 1
    });

    this.add(hitArea);
  },

  click: function() {
    AppActions.changeFocus(this.id);
  },

  focus: function() {
    this.shape.strokeWidth(3);
  }
};

Kinetic.Util.extend(Member, Kinetic.Group);

module.exports = Member;
