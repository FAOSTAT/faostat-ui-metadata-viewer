define(['jquery',
        'text!../../tests/schema.json',
        'text!../../tests/GN.json', 'text!template/template.hbs', 'handlebars', 'alpaca', 'bootstrap'],
    function ($, SCHEMA, DATA, Template, Handlebars, Alpaca) {

        'use strict';


        var s = {
            defaultOptions: {
                LANG: 'fr',
                DEFAULT_LANG: 'en',
                TITLE_ATTRIBUTE: 'title',
                DESCRIPTION_ATTRIBUTE: 'description',
                NOVALUE_OBJECT: {
                    'noValue': true
                }
            },
            metadataOptions: {
                PROPERTIES_ATTR : 'properties',
                TYPE_ATTRIBUTE : 'type',
                SORTABLE_ATTRIBUTE: 'propertyOrder',
                STRING_TYPE: 'string',
                NUMBER_TYPE: 'number',
                BOOLEAN_TYPE: 'boolean',
                OBJECT_TYPE: 'object',
                ARRAY_TYPE: 'array',
                REF_TYPE: '$ref',
                PATTERN_PROPERTIES: "patternProperties",
                SYMBOL_PATTERN_PROPERTIES: ".{1,}",
                TITLE_I18N: 'title_i18n',
                TITLE_DEFAULT: 'title',
                DESC_I18N: 'description_i18n',
                DESC_DEFAULT: 'description',
                ITEMS_PROPERTIES : 'items',
                SUBSTR_ROOT_DEFINITIONS : 14

            }

        }

            function ModelCreator() {
        };

        /*
         ModelCreator.prototype.initAlpaca = function (plugin) {


         var data = {

         }
         var data = {
         "person": {
         "name": "Inigo",
         "surname": "Montoya"
         },
         "age": 29,
         "phone": "414-111-2222",
         "country": "usa"
         };

         /!**
         * JSON-schema for the form
         *
         * The form schema defines the data types, validation logic and other constraints that need to be satisfied in
         * order for the form to be considered valid.
         *
         * This should follow the JSON-schema convention.
         * @see http://json-schema.org
         *
         * Full schema settings are listed here:
         * @see http://www.alpacajs.org
         *
         *!/
         var schema = {
         "type": "object",
         "properties": {
         "person": {
         "title": "Person",
         "type": "object",
         properties: {
         name: {
         "title": "Name",
         "type": "string"
         },
         surname: {
         "title": "Surname",
         "type": "string"
         }
         }

         },
         "age": {
         "title": "Age",
         "type": "number",
         "minimum": 0,
         "maximum": 50
         },
         "phone": {
         "title": "Phone",
         "type": "string"
         },
         "country": {
         "title": "Country",
         "descriptions": "descrption is",
         "type": "string",
         "required": true
         }
         }
         };

         /!**
         * Layout options for the form
         *
         * These options describe UI configuration for the controls that are rendered for the data and schema.  You can
         * tweak the layout and presentation aspects of the form in this section.
         *
         * Full options settings are listed here:
         * @see http://www.alpacajs.org
         *
         *!/
         var options = {
         "fields": {
         "name": {
         "readonly": true

         },
         "age": {
         "readonly": true
         },
         "phone": {
         "readonly": true
         },
         "country": {
         "readonly": true
         }
         }
         };

         /!**
         * This is an optional post render callback that Alpaca will call once the form finishes rendering.  The form
         * rendering itself is asynchronous as it may load templates or other resources for use in generating the UI.
         *
         * Once the render is completed, this callback is fired and the top-level Alpaca control is handed back.
         *
         * @param control
         *!/
         var postRenderCallback = function (control) {

         };

         /!**
         * Render the form.
         *
         * We call alpaca() with the data, schema and options to tell Alpaca to render into the selected dom element(s).
         *
         *!/

         var newTemplate = ' \
         <script type="text/x-handlebars-template"> \
         <div class="wow" type="text" id="" placeholder="" size="" readonly="readonly" name="" data-=""/> \
         </script>';

         Alpaca.registerView({
         "id": "my-view",
         "parent": "bootstrap-display",
         "templates": {
         "control-text": newTemplate
         }
         });


         $("#form").alpaca({
         "data": data,
         "schema": schema,
         "options": options,
         view: "my-view"


         /!*
         "postRender": postRenderCallback
         *!/
         });

         /!*
         $("#form").alpaca({
         "data":JSON.parse(DATA),
         "schema": JSON.parse(SCHEMA)

         /!*    "options": options,

         "view": 'web-display'
         *!/

         /!*
         "postRender": postRenderCallback
         *!/
         });*!/
         };*/


        ModelCreator.prototype.init = function (plugin) {

            this._initVariables();

            if (this._checkValidityOfData()) {

                var data = JSON.parse(DATA);
                var schema = JSON.parse(SCHEMA);
                this.$definitions = schema.definitions;
                this.$properties = schema.properties;
                this.$title = this._getTitleFromData(data)
                this.$internDataModel = this._prepareInternModelData(data, schema.properties);
                console.log(this.$internDataModel);
            } else {
                this.$internModel = s.defaultOptions.NOVALUE_OBJECT;
            }

        };

        ModelCreator.prototype._initVariables = function () {
            this.$lang = 'fr';
        };

        ModelCreator.prototype._checkValidityOfData = function () {
            return true;
        };

        ModelCreator.prototype._getTitleFromData = function (data) {
            var result = (data[s.defaultOptions.TITLE_ATTRIBUTE][this.$lang]) ? data[s.defaultOptions.TITLE_ATTRIBUTE][this.$lang] : data[s.defaultOptions.TITLE_ATTRIBUTE][s.defaultOptions.DEFAULT_LANG];
            delete data[s.defaultOptions.TITLE_ATTRIBUTE];
            return result;
        };


        ModelCreator.prototype._prepareInternModelData = function (data, metadata) {

            var result = {};
            //1 : sort
            //2 : identification fo case:
            //3: handle different cases
            /*
             this._sortPropertyOrder(metadata);
             */

            for (var attribute in metadata) {

                if(data[attribute]) {
                    if (this._isCaseBase(metadata[attribute])) {
                        result[attribute] = this._addBaseModel(metadata[attribute], data[attribute], attribute);
                    }

                    else if (this._isObjectAttribute(metadata[attribute])) {

                        // 1: exists properties attribute
                        // 2: exists pattern properties
                        // 3: exists a reference
                        if (this._existsPropertiesAttribute(metadata[attribute])) {
                            result[attribute] = this._addRecursiveModel(metadata[attribute], attribute);
                            result[attribute]['value'] = this._prepareInternModelData(data[attribute], metadata[attribute][s.metadataOptions.PROPERTIES_ATTR])

                        }

                        else if (this._existsPatternProperties(metadata[attribute])) {
                            result[attribute] = this._addPatternModel(metadata[attribute], data[attribute], attribute);
                            result[attribute]['value'] = (data[attribute][(this.$lang).toUpperCase()])?  data[attribute][(this.$lang).toUpperCase()] :  data[attribute][(s.defaultOptions.DEFAULT_LANG).toUpperCase()];
                        }

                        else if (this._existsAReference(metadata[attribute])) {
                            result[attribute] = this._addRecursiveModel(metadata[attribute], attribute);
                            var refAttribute = this._getAttributeFromReference(metadata[attribute]);
                            result[attribute]['value'] = this._prepareInternModelData(data[attribute], this.$definitions[refAttribute]);

                        }

                    }
                    else if(this._isAnArrayAttribute(metadata[attribute])) {
                        result[attribute] = this._addRecursiveModel(metadata[attribute], attribute);

                        if(this._isASimpleArrayItem(metadata[attribute])){
                            result[attribute]['value'] = data[attribute];
                        }
                        else if(this._isARefArrayItem(metadata[attribute])){
                            result[attribute]['value'] = [];
                            var refAttribute = this._getAttributeFromReference(metadata[attribute][s.metadataOptions.ITEMS_PROPERTIES]);
                            for(var i= 0, length = data[attribute].length; i<length; i++) {
                                result[attribute]['value'].push(this._prepareInternModelData(data[attribute][i],this.$definitions[refAttribute][s.metadataOptions.PROPERTIES_ATTR]));
                            }
                        }

                    }
                }
            }
            return result;

        };


        ModelCreator.prototype._existsPropertiesAttribute = function (objectMetadata) {
            return objectMetadata.hasOwnProperty(s.metadataOptions.PROPERTIES_ATTR) && Object.keys(objectMetadata[s.metadataOptions.PROPERTIES_ATTR]).length > 0
        };


        ModelCreator.prototype._existsPatternProperties = function (objectMetadata) {
            return objectMetadata.hasOwnProperty(s.metadataOptions.PATTERN_PROPERTIES) && Object.keys(objectMetadata[s.metadataOptions.PATTERN_PROPERTIES]).length > 0
        };


        ModelCreator.prototype._existsAReference = function (objectMetadata) {
            return objectMetadata.hasOwnProperty(s.metadataOptions.REF_TYPE) && Object.keys(objectMetadata[s.metadataOptions.REF_TYPE]).length > 0
        };


        ModelCreator.prototype._isObjectAttribute = function( objectMetadata) {
            return objectMetadata.hasOwnProperty(s.metadataOptions.TYPE_ATTRIBUTE) &&  objectMetadata[s.metadataOptions.TYPE_ATTRIBUTE] === s.metadataOptions.OBJECT_TYPE;
        };

        ModelCreator.prototype._isAnArrayAttribute = function (objectMetadata) {
            return objectMetadata.hasOwnProperty(s.metadataOptions.TYPE_ATTRIBUTE) &&  objectMetadata[s.metadataOptions.TYPE_ATTRIBUTE] === s.metadataOptions.ARRAY_TYPE;
        };

        ModelCreator.prototype._addRecursiveModel = function (metadata,  attribute) {
            var result = {};
            this._fillTitle(metadata, attribute, result);
            this._fillDescription(metadata, attribute, result);
            return result;
        };


        ModelCreator.prototype._addBaseModel = function (metadata, data, attribute) {
            var result = {};
            this._fillTitle(metadata, attribute, result);
            this._fillDescription(metadata, attribute, result);
            result['value'] = data;
            return result;
        };

        ModelCreator.prototype._addPatternModel = function (metadata, data, attribute) {
            var result = {};
            this._fillTitle(metadata, attribute, result);
            this._fillDescription(metadata, attribute, result);
            result['value'] = (data[this.$lang])? data[this.$lang] : (data[s.defaultOptions.DEFAULT_LANG]) ;
            return result;
        };

        ModelCreator.prototype._fillTitle = function (metadata, attribute, result) {

            if (metadata[s.metadataOptions.TITLE_I18N] && metadata[s.metadataOptions.TITLE_I18N][this.$lang] && metadata[s.metadataOptions.TITLE_I18N][this.$lang] != '') {
                result[s.defaultOptions.TITLE_ATTRIBUTE] = metadata[s.metadataOptions.TITLE_I18N][this.$lang];
            } else if (metadata[s.metadataOptions.TITLE_DEFAULT]) {
                result[s.defaultOptions.TITLE_ATTRIBUTE] = metadata[s.metadataOptions.TITLE_DEFAULT]
            } else {
                result[s.defaultOptions.TITLE_ATTRIBUTE] = attribute;
            }
        };

        ModelCreator.prototype._fillDescription = function (metadata, attribute, result) {

            if (metadata[s.metadataOptions.DESC_I18N] && metadata[s.metadataOptions.DESC_I18N][this.$lang] && metadata[s.metadataOptions.DESC_I18N][this.$lang] != '') {
                result[s.defaultOptions.DESCRIPTION_ATTRIBUTE] = metadata[s.metadataOptions.DESC_I18N][this.$lang];
            } else if (metadata[s.metadataOptions.DESC_DEFAULT]) {
                result[s.defaultOptions.DESCRIPTION_ATTRIBUTE] = metadata[s.metadataOptions.DESC_DEFAULT]
            } else {
                result[s.defaultOptions.DESCRIPTION_ATTRIBUTE] = '';
            }
        };

        ModelCreator.prototype._getAttributeFromReference = function (objectMetadata) {
            return objectMetadata[s.metadataOptions.REF_TYPE].substr(s.metadataOptions.SUBSTR_ROOT_DEFINITIONS)
        };


        ModelCreator.prototype._isCaseBase = function (objectMetadata) {

            return objectMetadata.hasOwnProperty('type') && (
                objectMetadata[s.metadataOptions.TYPE_ATTRIBUTE] === s.metadataOptions.STRING_TYPE ||
                objectMetadata[s.metadataOptions.TYPE_ATTRIBUTE] === s.metadataOptions.NUMBER_TYPE ||
                objectMetadata[s.metadataOptions.TYPE_ATTRIBUTE] === s.metadataOptions.BOOLEAN_TYPE)
        };


        ModelCreator.prototype._isASimpleArrayItem = function (objectMetadata) {
            return objectMetadata.hasOwnProperty(s.metadataOptions.ITEMS_PROPERTIES) && (
                objectMetadata[s.metadataOptions.ITEMS_PROPERTIES][s.metadataOptions.TYPE_ATTRIBUTE] === s.metadataOptions.STRING_TYPE ||
                objectMetadata[s.metadataOptions.ITEMS_PROPERTIES][s.metadataOptions.TYPE_ATTRIBUTE] === s.metadataOptions.NUMBER_TYPE ||
                objectMetadata[s.metadataOptions.ITEMS_PROPERTIES][s.metadataOptions.TYPE_ATTRIBUTE] === s.metadataOptions.BOOLEAN_TYPE)
        };


        ModelCreator.prototype._isARefArrayItem = function (objectMetadata) {
            return objectMetadata.hasOwnProperty(s.metadataOptions.ITEMS_PROPERTIES) &&
                objectMetadata[s.metadataOptions.ITEMS_PROPERTIES][s.metadataOptions.REF_TYPE]  &&
                Object.keys( objectMetadata[s.metadataOptions.ITEMS_PROPERTIES][s.metadataOptions.REF_TYPE]).length >0
        };



        /*  ModelCreator.prototype._sortPropertyOrder = function (values) {
         debugger;


         for(var attributes in values) {

         }
         values.sort(function (a, b) {
         return a[s.SORTABLE_ATTRIBUTE] - b[s.SORTABLE_ATTRIBUTE]
         })
         };*/

        return ModelCreator;
    })