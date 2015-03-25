'use strict';

var Pregnancy = function(children) {
  this.children = children;
};

Pregnancy.prototype = {
  size: function() {
    return this.children.length;
  },

  width: function() {

    if (this.size() > 1) {
      return this.children[this.size() - 1].location.x - this.children[0].location.x;
    }

    return 0;
  },

  layout: function() {
    var width = this.width();
    return {
      x: this.children[0].location.x + width / 2,
      width: width
    };
  }
};

module.exports = Pregnancy;
