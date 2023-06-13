module.exports = (function() {
  var wildcards = {
      properties: '#__PROPERTIES__#',
      aggregations: '#__AGGREGATIONS__#',
      events: '#__EVENTS__#'
    },
    getWildcard = function(key) {
      return wildcards[key];
    },
    list = function(astHandler, template, node, wildcard) {
      if (!node) {
        return template;
      }

      //var list = _createHTMLList(astHandler, node);
      const propertyList = _createPropertyList(astHandler, node);
      if (!propertyList) {
        //when node doesnt have any properties inside
        return template;
      }
      return _replace(template, propertyList, wildcard);
    },
    clean = function(template) {
      for (key in wildcards) {
        var wildcard = wildcards[key];
        template = template.replace(new RegExp(wildcard, 'g'), 'no value');
      }

      return template;
    },
    transformToComment = function(str) {
      var lines = str.split('\n');
      var transformedLines = lines.map(function(line) {
        return '*' + ' ' + line;
      });
      transformedLines = transformedLines.join('\n');
      return transformedLines;
    },
    insertJSDocComment = function(file, comments) {
      return file.replace('* @ui5JSDoc', comments);
    },
    _createPropertyList = function(astHandler, node) {
      const generatedPropertyList = [];
      const values = astHandler.getValues(node);
      const category = node.key.name;

      values.forEach(function(property) {
        //itemsTemplate
        const propertyNamePart = property.key.name;
        const subProperties = astHandler.getValues(property);

        const descriptionProperty = subProperties.find(subProperty => subProperty.key.name === 'Description');
        const descriptionPart =
          descriptionProperty && descriptionProperty.value ? ` - ${descriptionProperty.value.value}` : '';

        // there is still a problem here that its sometimes undefined, when there is an empty array or object set
        const defaultValueProperty = subProperties.find(subProperty => subProperty.key.name === 'defaultValue');
        const defaultValuePart = _handleDefaultValue(defaultValueProperty);

        const typeProperty = subProperties.find(subProperty => subProperty.key.name === 'type');
        const typePart = typeProperty && typeProperty.value ? `{${typeProperty.value.value}} ` : '';

        const row = `@property ${typePart} metadata.${category}.${propertyNamePart}${defaultValuePart}${descriptionPart}`;
        generatedPropertyList.push(row);
      });

      const finishedList = generatedPropertyList.join('\n ');
      return finishedList;
    },
    _handleDefaultValue = function(defaultValueProperty) {
      if (defaultValueProperty && defaultValueProperty.value) {
        if (defaultValueProperty.value.type === 'ArrayExpression') {
          return `=${JSON.stringify(defaultValueProperty.value.elements.map(item => item.value))}]`;
        } else if (defaultValueProperty.value.type === 'Literal') {
          return `=${defaultValueProperty.value.value}`;
        }
      } else {
        return '';
      }
    },
    _replace = function(template, list, wildcard) {
      return template.replace(new RegExp(wildcard, 'g'), list);
    };

  return {
    list: list,
    getWildcard: getWildcard,
    clean: clean,
    transformToComment: transformToComment,
    insertJSDocComment: insertJSDocComment
  };
})();
