"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _helperPluginUtils = require("@babel/helper-plugin-utils");

var _core = require("@babel/core");

var _default = (0, _helperPluginUtils.declare)(function (api, options) {
  var _options$kind = options.kind,
      kind = _options$kind === void 0 ? 'const' : _options$kind,
      _options$module = options.module,
      module = _options$module === void 0 ? true : _options$module;
  if (kind !== 'const' && kind !== 'let' && kind !== 'var') throw new Error(".kind must be one of the following values: ['const', 'let', 'var'].");
  if (typeof module !== 'boolean') throw new Error(".module must be a boolean.");
  var exportProperty = module ? _core.types.memberExpression(_core.types.identifier('module'), _core.types.identifier('exports')) : _core.types.identifier('exports');
  var moduleExport = module ? 'module.exports' : 'exports';
  var buildExport = (0, _core.template)("".concat(moduleExport, ".NAME = RESOURCE;"));
  var buildExports = (0, _core.template)("(function(__s) { CODE }(require(SOURCE)));");
  return {
    name: 'transform-node-module',
    visitor: {
      ImportDeclaration: function ImportDeclaration(path, state) {
        var i,
            declarators,
            properties = [],
            left,
            right = _core.types.callExpression(_core.types.identifier('require'), [path.node.source]);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = path.node.specifiers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            i = _step.value;

            if (i.type === 'ImportSpecifier') {
              if (i.imported.name == i.local.name) properties.push(_core.types.objectProperty(i.imported, i.local, false, true));else properties.push(_core.types.objectProperty(i.imported, i.local));
            } else if (i.type === 'ImportDefaultSpecifier') properties.push(_core.types.objectProperty(_core.types.identifier('default'), i.local));else if (i.type === 'ImportNamespaceSpecifier') left = i.local;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        if (left !== undefined) {
          if (path.node.specifiers.length > 1) {
            declarators = [_core.types.variableDeclarator(left, right), _core.types.variableDeclarator(_core.types.objectPattern(properties), left)];
          } else declarators = [_core.types.variableDeclarator(left, right)];
        } else if (properties.length > 0) declarators = [_core.types.variableDeclarator(_core.types.objectPattern(properties), right)];

        if (declarators !== undefined) {
          path.replaceWith(_core.types.variableDeclaration(kind, declarators));
        } else path.replaceWith(_core.types.expressionStatement(right));
      },
      ExportAllDeclaration: function ExportAllDeclaration(path, state) {
        var ast = (0, _core.template)("\n                (function (__s) {\n                    Object.keys(__s).forEach(function (_k) {\n                        if (_k !== 'default' && _k !== '__esModule' && !Object.prototype.hasOwnProperty.call(".concat(moduleExport, ", _k)) ").concat(moduleExport, "[_k] = e[_k];\n                    });\n                }(require(SOURCE)));\n                "))({
          SOURCE: path.node.source
        });
        path.replaceWith(ast);
      },
      ExportDefaultDeclaration: function ExportDefaultDeclaration(path, state) {
        var declaration = path.node.declaration;
        var result;

        if (declaration.type === 'Identifier') {
          result = [buildExport({
            NAME: 'default',
            RESOURCE: declaration
          })];
        } else if (declaration.id) {
          result = [declaration, buildExport({
            NAME: 'default',
            RESOURCE: declaration.id
          })];
        } else if (declaration.type === 'FunctionDeclaration') {
          result = [_core.types.expressionStatement(_core.types.assignmentExpression('=', _core.types.memberExpression(exportProperty, _core.types.identifier('default')), _core.types.functionExpression(declaration.id, declaration.params, declaration.body, declaration.generator, declaration.async)))];
        } else {
          result = [buildExport({
            NAME: 'default',
            RESOURCE: declaration
          })];
        }

        if (result && result.length > 0) path.replaceWithMultiple(result);
      },
      ExportNamedDeclaration: function ExportNamedDeclaration(path, state) {
        var result = [],
            i,
            properties = [];

        if (!path.node.source) {
          if (path.node.specifiers.length === 0 && path.node.declaration) {
            i = path.node.declaration;

            if (i.type === 'VariableDeclaration') {
              result = [i];
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = i.declarations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var j = _step2.value;
                  result.push(buildExport({
                    NAME: j.id,
                    RESOURCE: j.id
                  }));
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                    _iterator2["return"]();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }
            } else if (i.type === 'FunctionDeclaration' || i.type === 'ClassDeclaration') {
              result = [i, buildExport({
                NAME: i.id,
                RESOURCE: i.id
              })];
            }
          } else if (path.node.specifiers.length > 0 && !path.node.declaration) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = path.node.specifiers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                i = _step3.value;

                if (i.type === 'ExportSpecifier') {
                  result.push(buildExport({
                    NAME: i.exported,
                    RESOURCE: i.local
                  }));
                }
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                  _iterator3["return"]();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
          }
        } else if (path.node.specifiers.length > 0) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = path.node.specifiers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              i = _step4.value;
              result.push(buildExport({
                NAME: i.exported,
                RESOURCE: _core.types.memberExpression(_core.types.identifier('__s'), i.local)
              }));
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                _iterator4["return"]();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          result = [buildExports({
            CODE: result,
            SOURCE: path.node.source
          })];
        }

        if (result && result.length > 0) path.replaceWithMultiple(result);
      }
    }
  };
});

exports["default"] = _default;