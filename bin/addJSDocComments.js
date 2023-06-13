var controlParser = require('./controlParser');
var esprima = require('esprima');
var estraverse = require('estraverse');
var fs = require('fs');
var templater = require('./templater');
var propertyAST = require('./propertyAST');
var fsp = require('fs-extra');
var extractFileName = require('./extractFileName');
var variableDeclaratorAST = require('./variableDeclaratorAST');
var callExpressionAST = require('./callExpressionAST');
var memberExpressionAST = require('./memberExpressionAST');
var fileHandler = require('./fileHandler');
var mkdirp = require('mkdirp');

module.exports = function(filePath, input, output) {
  var fileName = extractFileName.extract(filePath);
  //filePath file
  var file = fs.readFileSync(filePath, 'UTF8');
  //Get ast
  var ast = esprima.parse(file);

  var data = {
    metadata: null,
    properties: null,
    aggregations: null,
    events: null
  };
  //Parse js
  controlParser
    .getNode(variableDeclaratorAST, estraverse, ast, fileName, 'VariableDeclarator')
    .then(function(controlVariableDeclarator) {
      return controlParser.getNode(
        memberExpressionAST,
        estraverse,
        controlVariableDeclarator,
        'extend',
        'MemberExpression'
      );
    })
    .then(function(controlCallExpressionNode) {
      if (controlCallExpressionNode) {
        data.controlName = callExpressionAST.getFirstArgument(controlCallExpressionNode);
      }
      return controlParser.getNode(propertyAST, estraverse, ast, 'metadata', 'Property');
    })
    .then(function(metadata) {
      data.metadata = metadata;
      return controlParser.getNode(propertyAST, estraverse, data.metadata, 'properties', 'Property');
    })
    .then(function(properties) {
      data.properties = properties;
      return controlParser.getNode(propertyAST, estraverse, data.metadata, 'aggregations', 'Property');
    })
    .then(function(aggregations) {
      data.aggregations = aggregations;
      return controlParser.getNode(propertyAST, estraverse, data.metadata, 'events', 'Property');
    })
    .then(function(baseClass) {
      data.baseClass = baseClass;
      return fsp.readFile('node_modules/ui5-metadata-to-jsdoc/templates/template.HTML', {
        encoding: 'utf8'
      });
    })
    .then(function(template) {
      const propWildcard = templater.getWildcard('properties');
      const aggreWildcard = templater.getWildcard('aggregations');
      const eventsWildcard = templater.getWildcard('events');
      let result;

      result = templater.list(propertyAST, template, data.properties, propWildcard);
      result = templater.list(propertyAST, result, data.aggregations, aggreWildcard);
      result = templater.list(propertyAST, result, data.events, eventsWildcard);
      result = templater.clean(result);

      result = templater.transformToComment(result);

      //Replace comment @ui5JSDoc with template
      var newFile = templater.insertJSDocComment(file, result);
      return fileHandler.create(fs, mkdirp, newFile, filePath, input, output);
    })
    .then(function(filePath) {
      console.log('jsdoc data automatically created:', filePath);
    })
    .catch(function(err) {
      console.log(err);
    });
};
