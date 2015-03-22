'use strict';

var Pregnancy = function(zygotes) {
  this.zygotes = zygotes;
};

Pregnancy.prototype = {
  size: function() {
    return this.zygotes.length;
  },

  width: function() {

    if (this.size() > 1) {
      return this.zygotes[this.size() - 1].location.x - this.zygotes[0].location.x;
    }

    return 0;
  },

  layout: function() {
    var width = this.width();
    return {
      x: this.zygotes[0].location.x + width / 2,
      width: width
    };
  }
};

module.exports = Pregnancy;
