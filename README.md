Nested Editor
=============

Pedigree editor component for [React](http://facebook.github.io/react/).


Development
-----------

To get started, first install all dependencies:

    npm install

During development you can run the example page with webpack-dev-server:

    npm run dev

Point your browser to http://localhost:8000/webpack-dev-server/ and code
changes will hot reload.

To run the test suite:

    npm test

To build a minified bundle:

    npm run dist

The result can be found in `dist/bundle.min.js`.


Style guide
-----------

For JavaScript, we follow the
[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript). An
ESLint configuration for it can be found in `.eslintrc`.

We transpile ES6 constructs using Babel. For now, do not use any ES6 features
not mentioned below.


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
