'use strict';

describe('Main', function () {
  var React, TestUtils, PedigreeApp, component;

  beforeEach(function () {
    React = require('react/addons');
    TestUtils = React.addons.TestUtils;
    PedigreeApp = React.createFactory(require('../../../src/scripts/components/PedigreeApp.jsx'));
    component = PedigreeApp();
  });

  it('should create a new instance of PedigreeApp', function() {
    expect(component).toBeDefined();
    expect(TestUtils.isElement(component)).toBe(true);
    expect(TestUtils.isElementOfType(component, PedigreeApp)).toBe(true);
  });

});
