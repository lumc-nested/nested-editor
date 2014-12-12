var Kinetic = require('kinetic');
var PC = require('../constants/PedigreeConstants.js');


// TODO: Constants, or user defined?
var size = 40;
var padding = 2;
var strokeWidth = 2;
var themeColor = 'indigo';

var Member = function(member) {
  this.member = member;
  this.shape = undefined;
  this.deathStrike = undefined;
  this.init();
};

Member.prototype = {
  init: function() {

    // inherit from Kinetic.Group
    Kinetic.Group.call(this, {});

    this._drawGender();
    //this._drawDeath();

    // for debug.
    var hitArea = new Kinetic.Rect({
      position: {x: 0, y: 0},
      width: size,
      height: size,
      stroke: 'grey',
      strokeWidth: 1
    });

    this.add(hitArea);
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
    this.add(this.shape);
  },

  _drawDeath: function() {
    this.deathStrike = new Kinetic.Line({
      points: [size, 0, 0, size],
      stroke: themeColor
    });

    this.add(this.deathStrike);
  }
};

Kinetic.Util.extend(Member, Kinetic.Group);

module.exports = Member;