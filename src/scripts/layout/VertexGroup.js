var VertexGroup = function(vertices) {
  this.vertices = vertices;
};

VertexGroup.prototype = {
  size: function() {
    return this.vertices.length;
  },

  width: function() {

    if (this.size() > 1) {
      return this.vertices[this.size() - 1].position - this.vertices[0].position;
    }

    return 0;
  },

  layout: function() {
    var width = this.width();
    return {
      position: this.vertices[0].position + width / 2,
      width: width
    };
  }
};

module.exports = VertexGroup;
