# babel-plugin-transform-node-module
This plugin transforms ES2015 modules to Node.js module system.

## Installation

```bash
npm install --save-dev babel-plugin-transform-node-module
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-node-module"]
}
```

#### Options

- *`kind`* - A string value, specifying the type of variable used to import is "const", "let" or "var"..

```json
{
  "plugins": [
    ["transform-node-module", { "kind": "const" }]
  ]
}
```

- *`module`* - A boolean value, that if true will use `module.exports` instead of `exports`.

```json
{
  "plugins": [
    ["transform-node-module", { "module": true }]
  ]
}
```

### Via CLI

```bash
babel --plugins transform-node-module script.js
```
