'use strict';

describe('Main', function () {
  var PedigreeApp, component;

  beforeEach(function () {
    var container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    PedigreeApp = require('../../../src/scripts/components/PedigreeApp.jsx');
    component = PedigreeApp();
  });

  it('should create a new instance of PedigreeApp', function () {
    expect(component).toBeDefined();
  });
});
