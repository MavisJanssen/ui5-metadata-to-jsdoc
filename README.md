# ui5-metadata-tojsdoc
Creates automatic documentation for control libraries done in ui5, based on the ui5-jsdoc generator from JS Labs

## Install
`npm install github:sorefang/ui5-metadata-to-jsdoc", --save-dev`
 
## Setup  
`node ./node_modules/ui5-metadata-to-jsdoc/bin/ui5-metadata-to-jsdoc.js --input=inputFolder --output=outputFolder`


# JSDoc integration 
__ui5-metadata-to-jsdoc__ can be easily integrated with jsdoc using an npm script:

Run the following commands 

* `npm init` (_note: we're creating package.json_)
* `npm install jsdoc --save-dev`
* `npm install ui5-metadata-to-jsdoc --save-dev`

Edit the script tag of the package.json with the following information 
```json    
    {
      "name": "test",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        "ui5JSDoc":"node ./node_modules/ui5-jsdoc-generator/bin/ui5-jsdoc-generator.js --input=inputControlFolder --output=tmpJSDoc",
         "jsdoc":"./node_modules/.bin/jsdoc -r tmpJSDoc -d tmp ",
          "doc": "npm run ui5JSDoc && npm run jsdoc"
      },
      "author": "",
      "license": "ISC"
    }
```
And finally, execute `npm run doc`

# Why ?
A common ui5 control looks like the following code - 
```javascript
    sap.ui.define(['sap/ui/core/Control'], function(base) {
        'use strict';
    
        var Control = base.extend('namespace.controlname', {
            metadata: {
                properties: {
                    property1: { type: "boolean", defaultValue: true }, 
                    property2: { type: "string", defaultValue: "defaultValueString" }
                },
                aggregations: { 
                    agg1: { type: 'namespace.aggregation' }
                },
                events: { click: {} },
            }
        });
        Control.prototype.init = function() {};
        return Control;
    }, true);
```
Everything is fine until the alarm rings with the following sound 'where is the documentation?'. No problem sir! We have a "quick" solution on mind. You go through every control in your library adding the jsdoc annotations manually. Now everything looks like:
```javascript
    sap.ui.define(['sap/ui/core/Control'], function(base) {
        'use strict';
    		/** 
            * @class
            * @property {boolean} metadata.properties.property1=true - Description for this property
            * @property {string} metadata.properties.property2=defaultValueString - Description for this property
            **/ 
        var Control = base.extend('namespace.controlname', {
            metadata: {
                properties: {
                    property1: { type: "boolean", defaultValue: true, Description: 'Description for this property' }, 
                    property2: { type: "string", defaultValue: "defaultValueString", Description: 'Description for this property' }
                },
                aggregations: { 
                    agg1: { type: 'namespace.aggregation' }
                },
                events: { click: {} },
            }
        });
        Control.prototype.init = function() {};
        return Control;
    }, true);
```
Why are we adding all that information manually when ui5 stores everything into the metadata ? Isn't it unnecessary ? What happends if we add a new property? We need to change the header comments once again!
To avoid all those problems just change the control in the following way - 

```javascript
    sap.ui.define(['sap/ui/core/Control'], function(base) {
        'use strict';
    
        /**
         *  @ui5JSDoc
         */
        var Control = base.extend('namespace.controlname', {
            metadata: {
                properties: {
                    property1: { type: "boolean", defaultValue: true }, 
                    property2: { type: "string", defaultValue: "defaultValueString" }
                },
                aggregations: { 
                    agg1: { type: 'namespace.aggregation' }
                },
                events: { click: {} }
            }
        });
        Control.prototype.init = function() {};
        return Control;
    }, true);
```
ui5-metadata-to-jsdoc will parse the metadata structure and generate the necessary notations for jsdoc automagically :sparkles:
