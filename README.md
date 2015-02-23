Pedigree webapp
===============

Needs a name.


Style guide
-----------

For JavaScript, we follow the
[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript). An
ESLint configuration for it can be found in `.eslintrc`.

We transpile ES6 constructs using Babel. For now, do not use any ES6 features
not mentioned here.

**ES6 arrow functions**

- Use `function` in the global scope and for `Object.prototype` properties.
- Use `class` for object constructors.
- Use `=>` everywhere else.

Rationale: http://stackoverflow.com/a/23045200

**ES6 enhanced object literals**

Use `{a, b, c}` instead of `{a: a, b: b, c: c}`.

**ES6 template strings**

Use template strings instead of concatentation:

```javascript
var name = "Bob", time = "today";
`Hello ${name}, how are you ${time}?`
```

**ES6 destructuring assignment**

Use simple destructuring patterns for unpacking objects and arrays (including
function arguments) and multiple return values. Some simple examples:

```javascript
var [a, b] = [1, 2];

var o = {p: 42, q: true};
var {p, q} = o;

function g({name: x}) {
  console.log(x);
}
```
