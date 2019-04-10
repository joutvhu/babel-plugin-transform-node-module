"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _helperPluginUtils = require("@babel/helper-plugin-utils");

var _helperModuleTransforms = require("@babel/helper-module-transforms");

var _helperSimpleAccess = _interopRequireDefault(require("@babel/helper-simple-access"));

var _core = require("@babel/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _templateObject3() {
  var data = _taggedTemplateLiteral(["\n                                const ", " = ", ";\n                                "]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["\n                                function ", "() {\n                                    const data = ", ";\n                                    ", " = function(){ return data; };\n                                    return data;\n                                }\n                                "]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n    (function(){\n        throw new Error(\n            \"The CommonJS '\" + \"", "\" + \"' variable is not available in ES6 modules.\" +\n            \"Consider setting setting sourceType:script or sourceType:unambiguous in your \" +\n            \"Babel config for this file.\");\n    })()\n    "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _default = (0, _helperPluginUtils.declare)(function (api, options) {
  api.assertVersion(7);
  var _options$loose = options.loose,
      loose = _options$loose === void 0 ? true : _options$loose,
      _options$strictNamesp = options.strictNamespace,
      strictNamespace = _options$strictNamesp === void 0 ? false : _options$strictNamesp,
      _options$mjsStrictNam = options.mjsStrictNamespace,
      mjsStrictNamespace = _options$mjsStrictNam === void 0 ? false : _options$mjsStrictNam,
      allowTopLevelThis = options.allowTopLevelThis,
      _options$strict = options.strict,
      strict = _options$strict === void 0 ? true : _options$strict,
      strictMode = options.strictMode,
      _options$noInterop = options.noInterop,
      noInterop = _options$noInterop === void 0 ? true : _options$noInterop,
      _options$lazy = options.lazy,
      lazy = _options$lazy === void 0 ? false : _options$lazy,
      _options$allowCommonJ = options.allowCommonJSExports,
      allowCommonJSExports = _options$allowCommonJ === void 0 ? true : _options$allowCommonJ;

  if (typeof lazy !== "boolean" && typeof lazy !== "function" && (!Array.isArray(lazy) || !lazy.every(function (item) {
    return typeof item === "string";
  }))) {
    throw new Error(".lazy must be a boolean, array of strings, or a function");
  }

  if (typeof strictNamespace !== "boolean") {
    throw new Error(".strictNamespace must be a boolean, or undefined");
  }

  if (typeof mjsStrictNamespace !== "boolean") {
    throw new Error(".mjsStrictNamespace must be a boolean, or undefined");
  }

  var getAssertion = function getAssertion(localName) {
    return _core.template.expression.ast(_templateObject(), localName);
  };

  var moduleExportsVisitor = {
    ReferencedIdentifier: function ReferencedIdentifier(path) {
      var localName = path.node.name;
      if (localName !== "module" && localName !== "exports") return;
      var localBinding = path.scope.getBinding(localName);
      var rootBinding = this.scope.getBinding(localName);

      if ( // redeclared in this scope
      rootBinding !== localBinding || path.parentPath.isObjectProperty({
        value: path.node
      }) && path.parentPath.parentPath.isObjectPattern() || path.parentPath.isAssignmentExpression({
        left: path.node
      }) || path.isAssignmentExpression({
        left: path.node
      })) {
        return;
      }

      path.replaceWith(getAssertion(localName));
    },
    AssignmentExpression: function AssignmentExpression(path) {
      var _this = this;

      var left = path.get("left");

      if (left.isIdentifier()) {
        var localName = path.node.name;
        if (localName !== "module" && localName !== "exports") return;
        var localBinding = path.scope.getBinding(localName);
        var rootBinding = this.scope.getBinding(localName); // redeclared in this scope

        if (rootBinding !== localBinding) return;
        var right = path.get("right");
        right.replaceWith(_core.types.sequenceExpression([right.node, getAssertion(localName)]));
      } else if (left.isPattern()) {
        var ids = left.getOuterBindingIdentifiers();
        var _localName = Object.keys(ids).filter(function (localName) {
          if (localName !== "module" && localName !== "exports") return false;
          return _this.scope.getBinding(localName) === path.scope.getBinding(localName);
        })[0];

        if (_localName) {
          var _right = path.get("right");

          _right.replaceWith(_core.types.sequenceExpression([_right.node, getAssertion(_localName)]));
        }
      }
    }
  };
  return {
    name: "transform-modules-commonjs",
    visitor: {
      Program: {
        exit: function exit(path, state) {
          if (!(0, _helperModuleTransforms.isModule)(path)) return; // Rename the bindings auto-injected into the scope so there is no
          // risk of conflict between the bindings.

          path.scope.rename("exports");
          path.scope.rename("module");
          path.scope.rename("require");
          path.scope.rename("__filename");
          path.scope.rename("__dirname"); // Rewrite references to 'module' and 'exports' to throw exceptions.
          // These objects are specific to CommonJS and are not available in
          // real ES6 implementations.

          if (!allowCommonJSExports) {
            (0, _helperSimpleAccess["default"])(path, new Set(["module", "exports"]));
            path.traverse(moduleExportsVisitor, {
              scope: path.scope
            });
          }

          var moduleName = this.getModuleName();
          if (moduleName) moduleName = _core.types.stringLiteral(moduleName);

          var _rewriteModuleStateme = (0, _helperModuleTransforms.rewriteModuleStatementsAndPrepareHeader)(path, {
            exportName: "module.exports",
            loose: loose,
            strict: strict,
            strictMode: strictMode,
            allowTopLevelThis: allowTopLevelThis,
            noInterop: noInterop,
            lazy: lazy,
            esNamespaceOnly: typeof state.filename === "string" && /\.mjs$/.test(state.filename) ? mjsStrictNamespace : strictNamespace
          }),
              meta = _rewriteModuleStateme.meta,
              headers = _rewriteModuleStateme.headers;

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = meta.source[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _step$value = _slicedToArray(_step.value, 2),
                  source = _step$value[0],
                  metadata = _step$value[1];

              var loadExpr = _core.types.callExpression(_core.types.identifier("require"), [_core.types.stringLiteral(source)]);

              var header = void 0;

              if ((0, _helperModuleTransforms.isSideEffectImport)(metadata)) {
                if (metadata.lazy) throw new Error("Assertion failure");
                header = _core.types.expressionStatement(loadExpr);
              } else {
                var init = (0, _helperModuleTransforms.wrapInterop)(path, loadExpr, metadata.interop) || loadExpr;

                if (metadata.lazy) {
                  header = _core.template.ast(_templateObject2(), metadata.name, init, metadata.name);
                } else {
                  header = _core.template.ast(_templateObject3(), metadata.name, init);
                }
              }

              header.loc = metadata.loc;
              headers.push(header);
              headers.push.apply(headers, _toConsumableArray((0, _helperModuleTransforms.buildNamespaceInitStatements)(meta, metadata, loose)));
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

          (0, _helperModuleTransforms.ensureStatementsHoisted)(headers);
          path.unshiftContainer("body", headers);
        }
      }
    }
  };
});

exports["default"] = _default;