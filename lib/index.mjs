import {declare} from '@babel/helper-plugin-utils';
import {template, types as t} from '@babel/core';

export default declare((api, options) => {
    const {
        kind = 'const',
        module = true
    } = options;

    if (kind !== 'const' && kind !== 'let' && kind !== 'var')
        throw new Error(`.kind must be one of the following values: ['const', 'let', 'var'].`);
    if (typeof module !== 'boolean')
        throw new Error(`.module must be a boolean.`);

    const exportProperty = module ? t.memberExpression(t.identifier('module'), t.identifier('exports')) :
        t.identifier('exports');
    const moduleExport = module ? 'module.exports' : 'exports';
    const buildExport = template(`${moduleExport}.NAME = RESOURCE;`);
    const buildExports = template(`(function(__s) { CODE }(require(SOURCE)));`);

    return {
        name: 'transform-node-module',
        visitor: {
            ImportDeclaration(path, state) {
                let i, declarators, properties = [], left, right = t.callExpression(
                    t.identifier('require'),
                    [path.node.source]
                );

                for (i of path.node.specifiers) {
                    if (i.type === 'ImportSpecifier') {
                        if (i.imported.name == i.local.name)
                            properties.push(t.objectProperty(i.imported, i.local, false, true));
                        else properties.push(t.objectProperty(i.imported, i.local));
                    } else if (i.type === 'ImportDefaultSpecifier')
                        properties.push(t.objectProperty(t.identifier('default'), i.local));
                    else if (i.type === 'ImportNamespaceSpecifier')
                        left = i.local;
                }

                if (left !== undefined) {
                    if (path.node.specifiers.length > 1) {
                        declarators = [
                            t.variableDeclarator(left, right),
                            t.variableDeclarator(t.objectPattern(properties), left)
                        ];
                    } else declarators = [t.variableDeclarator(left, right)];
                } else if (properties.length > 0)
                    declarators = [t.variableDeclarator(t.objectPattern(properties), right)];

                if (declarators !== undefined) {
                    path.replaceWith(t.variableDeclaration(kind, declarators));
                } else path.replaceWith(t.expressionStatement(right));
            },
            ExportAllDeclaration(path, state) {
                const ast = template(`
                (function (__s) {
                    Object.keys(__s).forEach(function (_k) {
                        if (_k !== 'default' && _k !== '__esModule' && !Object.prototype.hasOwnProperty.call(${moduleExport}, _k)) ${moduleExport}[_k] = e[_k];
                    });
                }(require(SOURCE)));
                `)({SOURCE: path.node.source});

                path.replaceWith(ast);
            },
            ExportDefaultDeclaration(path, state) {
                const declaration = path.node.declaration;
                let result;

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
                    result = [t.expressionStatement(t.assignmentExpression(
                        '=',
                        t.memberExpression(exportProperty, t.identifier('default')),
                        t.functionExpression(declaration.id, declaration.params, declaration.body,
                            declaration.generator, declaration.async)
                    ))];
                } else {
                    result = [buildExport({
                        NAME: 'default',
                        RESOURCE: declaration
                    })];
                }

                if (result && result.length > 0)
                    path.replaceWithMultiple(result);
            },
            ExportNamedDeclaration(path, state) {
                let result = [], i, properties = [];

                if (!path.node.source) {
                    if (path.node.specifiers.length === 0 && path.node.declaration) {
                        i = path.node.declaration;
                        if (i.type === 'VariableDeclaration') {
                            result = [i];
                            for (let j of i.declarations) {
                                result.push(buildExport({
                                    NAME: j.id,
                                    RESOURCE: j.id
                                }));
                            }
                        } else if (i.type === 'FunctionDeclaration' || i.type === 'ClassDeclaration') {
                            result = [i, buildExport({
                                NAME: i.id,
                                RESOURCE: i.id
                            })];
                        }
                    } else if (path.node.specifiers.length > 0 && !path.node.declaration) {
                        for (i of path.node.specifiers) {
                            if (i.type === 'ExportSpecifier') {
                                result.push(buildExport({
                                    NAME: i.exported,
                                    RESOURCE: i.local
                                }));
                            }
                        }
                    }
                } else if (path.node.specifiers.length > 0) {
                    for (i of path.node.specifiers) {
                        result.push(buildExport({
                            NAME: i.exported,
                            RESOURCE: t.memberExpression(t.identifier('__s'), i.local)
                        }));
                    }

                    result = [buildExports({
                        CODE: result,
                        SOURCE: path.node.source
                    })]
                }

                if (result && result.length > 0)
                    path.replaceWithMultiple(result);
            }
        }
    }
});
