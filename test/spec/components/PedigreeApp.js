'use strict';

describe('Main', function () {
  var React, PedigreeApp, component;

  beforeEach(function () {
    var container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    React = require('react');
    PedigreeApp = React.createFactory(require('../../../src/scripts/components/PedigreeApp.jsx'));
    component = PedigreeApp();
  });

  it('should create a new instance of PedigreeApp', function () {
    expect(component).toBeDefined();
  });
});
