Nested Editor
=============

Pedigree editor component for [React](http://facebook.github.io/react/).

Actual rendering is done by [Madeline 2.0 PDE](http://madeline.med.umich.edu/).

Example usage:

```javascript
var Nested = require('nested-editor');
var React = require('react');
var ReactDOM = require('react-dom');

var Example = React.createClass({
  componentDidMount: function() {
    this.refs.editor.openDocument('... [ some pedigree ] ...', 'ped');
  },
  render: function() {
    <Nested ref="editor" />
  }
});

ReactDOM.render(<Example />, document.getElementById('content'));
```


Development
-----------

First install [Node.js](https://nodejs.org/). Then install package
dependencies with NPM:

    npm install

A live-reloading development webserver serves an example application when
running:

    npm run dev


Deployment
----------

To compile the component to a bundle, install the package dependencies as
above and run:

    npm run dist

The bundle can now be found in the `dist` subdirectory.

*Warning:* You most probably don't want to use the bundle. Instead, use the
 source package and your own bundling. In the future, the bundle may be a
 simple way to embed the editor in websites without using React.


Style guide
-----------

For JavaScript, we follow the
[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript). An
ESLint configuration for it can be found in `.eslintrc`.

We transpile JSX and ES6 constructs using Babel. For now, do not use any ES6
features not mentioned below.


### JSX: Multiline JSX

Multiline JSX elements should be in brackets and only have a single indent:

```
return (
  <OverlayTrigger placement="bottom" overlay={tooltip}>
    <Button key="undo" onClick={this.undo}><Icon name="undo" /></Button>
  </OverlayTrigger>
);
```


### ES6: Arrow functions

- Use `function` in the global scope and for `Object.prototype` properties.
- Use `class` for object constructors.
- Use `=>` everywhere else.

Rationale: http://stackoverflow.com/a/23045200


### ES6: Enhanced object literals

Use `{a, b, c}` instead of `{a: a, b: b, c: c}`.


### ES6: Computed property names

Objects with computed property names can directly be written as object
literals:

```
var i = 0;
var a = {
  ["foo" + ++i]: i,
  ["foo" + ++i]: i,
  ["foo" + ++i]: i
};
```


### ES6: Template strings

Use template strings instead of concatentation:

```
var name = "Bob", time = "today";
`Hello ${name}, how are you ${time}?`
```


### ES6: Destructuring assignment

Use simple destructuring patterns for unpacking objects and arrays (including
function arguments) and multiple return values. Some simple examples:

```
var [a, b] = [1, 2];

var o = {p: 42, q: true};
var {p, q} = o;

function g({name: x}) {
  console.log(x);
}
```

This is also the prefered way of importing several module attributes:

```
var {Someting, AnotherThing} = require('definitions/Things');
```
