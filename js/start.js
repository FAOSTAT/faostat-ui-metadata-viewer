/*global define, JSONEditor, amplify*/
define(['jquery',
        'loglevel',
        'faostat-ui/globals/Common',
        'faostat-ui/config/Events',
        'text!fenix_ui_metadata_viewer/html/templates.hbs',
        'i18n!fenix_ui_metadata_viewer/nls/translate',
        'q',
        'jsonEditor',
        'amplify'
    ], function ($, log, Common, E, templates, translate, Q) {

    'use strict';

    function FUIMDV() {

        this.CONFIG = {

            // TODO: pass the configuration!

            lang: 'en',
            edit: false,
            domain: 'GT',
            schema: null,
            data: null,
            application_name: 'faostat',
            placeholder_id: 'placeholder',
            url_mdsd: 'http://faostat3.fao.org/d3s2/v2/mdsd',
            url_pdf_service: 'http://fenixapps2.fao.org/fenixExport',
            url_wds_table: 'http://fenixapps2.fao.org/wds_5.1/rest/table/json',
            url_d3s: 'http://faostat3.fao.org/d3s2/v2/msd/resources/metadata/uid',
            rendered: false,
            url_get_metadata: 'http://faostat3.fao.org/mdfaostat/getmd/',
            url_get_domain: 'http://faostat3.fao.org/mdfaostat/getdomain/',

            /* Events to destroy. */
            callback: {
                onMetadataRendered: null
            }

        };

    }

    FUIMDV.prototype.init = function (config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang !== null ? this.CONFIG.lang : 'en';

        /* This... */
        var that = this;

        /* Clear previous editor, if any. */
        if (that.CONFIG.hasOwnProperty('placeholder')) {
            that.CONFIG.container =  $(that.CONFIG.placeholder);
        } else {
            that.CONFIG.container =   $('#' + that.CONFIG.placeholder_id);
        }
        that.CONFIG.container.empty();

        amplify.publish(E.LOADING_SHOW, {container: that.CONFIG.container});

        /* Get metadata structure. */
        this.get_metadata_structure().then(function (response) {

            /* Cast response, if required. */
            if (typeof response === 'string') {
                response = $.parseJSON(response);
            }

            /* Create JSON schema. */
            var schema = that.create_json_schema(response);

            /* Fetch data. */
            that.get_metadata().then(function (response) {

                /* hiding loading and cleaning the container */
                amplify.publish(E.LOADING_HIDE, {container: that.CONFIG.container});
                that.CONFIG.container.empty();

                /* Cast response, if required. */
                if (typeof response === 'string') {
                    response = $.parseJSON(response);
                }

                /* Create data. */
                if (response !== null && response !== undefined) {

                    /* Create data. */
                    var data = that.create_data(response);

                    /* Create JSON editor. */
                    that.create_json_editor(schema, data);

                } else {
                    that.CONFIG.container.html('<h1 class="text-center">' + translate.no_metadata_available + '</h1>');
                }

            });

        });

    };

    FUIMDV.prototype.create_json_editor = function (schema, data) {

        /* Init editor. */
        var editor = new JSONEditor(this.CONFIG.container[0], {
            schema: schema,
            theme: 'bootstrap3',
            iconlib: 'fontawesome4',
            disable_edit_json: true,
            disable_properties: true,
            collapsed: true,
            disable_array_add: true,
            disable_array_delete: true,
            disable_array_reorder: true,
            disable_collapse: false,
            remove_empty_properties: false,
            expand_height: true
        });
        editor.setValue(data);
        editor.disable();

        /* Remove unwanted labels. */
        this.CONFIG.container.find('div:first').find('h3:first').empty();
        this.CONFIG.container.find('div:first').find('p:first').empty();

        /* Collapse editor. */
        this.CONFIG.container.find('.btn.btn-default.json-editor-btn-collapse').click();

    };

    FUIMDV.prototype.create_data = function (metadata) {
        var data = {}, i;
        for (i = 0; i < metadata.length; i += 1) {
            if (data[parseInt(metadata[i].MetadataCode, 10)] === undefined) {
                data[parseInt(metadata[i].MetadataCode, 10)] = {};
            }
            data[parseInt(metadata[i].MetadataCode, 10)][metadata[i].MetadataCode] = metadata[i].MetadataText;
        }
        return data;
    };

    FUIMDV.prototype.create_json_schema = function (metadata_structure) {

        /* Variables. */
        var schema, i, tmp, section;

        /* Create schema. */
        schema = {};
        schema.$schema = 'http://json-schema.org/draft-04/hyper-schema#';
        schema.type = 'object';
        schema.properties = {};

        /* Iterate over the metadata structure. */
        for (i = 0; i < metadata_structure.length; i += 1) {
            section = parseInt(metadata_structure[i].MetadataCode, 10);
            if (schema.properties[section] === undefined) {
                schema.properties[section] = {
                    type: 'object',
                    propertyOrder: section,
                    title: 'Section ' + parseInt(metadata_structure[i].MetadataCode, 10),
                    properties: {}
                };
            }
            tmp = {};
            tmp.type = 'string';
            tmp.format = 'textarea';
            tmp.title = metadata_structure[i].Label;
            tmp.description = metadata_structure[i].Description;
            schema.properties[parseInt(metadata_structure[i].MetadataCode, 10)].properties[metadata_structure[i].MetadataCode] = tmp;
        }

        /* Return the schema definition. */
        return schema;

    };

    FUIMDV.prototype.get_metadata_structure = function () {
        return Q($.ajax({
            url: this.CONFIG.url_get_metadata,
            type: 'GET'
        }));
    };

    FUIMDV.prototype.get_metadata = function () {
        return Q($.ajax({
            url: this.CONFIG.url_get_domain,
            type: 'GET',
            data: {
                domaincode: this.CONFIG.domain
            }
        }));
    };

    FUIMDV.prototype.isRendered = function () {
        return this.CONFIG.rendered;
    };

    FUIMDV.prototype.isNotRendered = function () {
        return !this.CONFIG.rendered;
    };

    FUIMDV.prototype.dispose = function () {
        $('#export_pdf_button').off();
    };

    return FUIMDV;

});