/*global define, console, amplify */
define([
        'jquery',
        'loglevel',
        'config/Config',
        'config/Events',
        //'fs-m-v/config/Config',
        'text!fs-m-v/html/templates.hbs',
        'i18n!fs-m-v/nls/translate',
        'handlebars',
        'underscore',
        'q',
        'faostatapiclient',
        //'jspdf',
        'amplify'

    ],
    function ($, log, C, E, templates, i18nLabels, Handlebars, _, Q, API
             // jsPDF
    ) {

        'use strict';

        var s = {

                MODAL: '#fs-metadata-modal',
                MODAL_METADATA_CONTAINER: '[data-role="metadata"]',
                EXPORT_METADATA: '[data-role="export"]'

            },
            defaultOptions = {

                /* lang: 'en',
                  code: 'QC',
               */
                addHeader: true,
                modal: false

            };

        function MetadataViewer() {

            return this;
        }

        MetadataViewer.prototype.init = function (config) {

            this.o = $.extend(true, {}, defaultOptions, C, config);
            this.api = new API();

            log.info("MetadataViewer.init; o:", this.o);

            this.initVariables();
            this.initComponents();
            this.bindEventListeners();

        };

        MetadataViewer.prototype.initVariables = function () {

            this.$CONTAINER = $(this.o.container);

        };

        MetadataViewer.prototype.initComponents = function () {

            // if container is not defined go in any case modal
            if( this.o.modal || this.$CONTAINER.length <= 0 ) {

                this.showModal();

            }
            else {

                this.createMetadataContainer();

            }

        };

        MetadataViewer.prototype.createMetadataContainer = function () {

            var self = this;

            this.api.metadata({
                datasource: C.DATASOURCE,
                lang: this.o.lang,
                domain_code: this.o.code
            }).then(function(d) {

                // Check based on the service result
                if ( d !== undefined && d !== null && d.data.length > 0) {

                    self.createMetadataViewer(d);

                } else {

                    self.noDataAvailablePreview();

                }

            }).fail(function() {

                self.noDataAvailablePreview();

            });

        };

        MetadataViewer.prototype.createMetadataViewer = function (d) {

            var data = d.data,
                metadata = {},
                self = this;

            // grouping  by group_code
            var groups = _.groupBy(data, 'metadata_group_code');

            _.each(groups, function(g) {

                _.each(g, function(m) {

                    if (!metadata.hasOwnProperty(m.metadata_group_code)) {
                        metadata[m.metadata_group_code] = {
                            code: m.metadata_group_code,
                            label: m.metadata_group_label,
                            subsections: []
                        };
                    }

                    metadata[m.metadata_group_code].subsections.push({
                        code: m.metadata_code,
                        label: m.metadata_label,
                        text: m.metadata_text
                    });

                });
            });

            // caching metadata (used in export)
            this.metadata = metadata;

            // rendering
            //log.info(sections)

            var html = $(templates).filter('#content').html();
            var t = Handlebars.compile(html);

            this.$CONTAINER.html(t(
                $.extend(true, {},
                    i18nLabels,
                    {
                        data: metadata,
                        addHeader: this.o.addHeader
                    })
            ));

            // enable export
            self.enableExport();

        };

        MetadataViewer.prototype.noDataAvailablePreview = function () {

            var html = $(templates).filter('#no_data_available').html(),
                t = Handlebars.compile(html);

            this.$CONTAINER.html(t(i18nLabels));

        };

        MetadataViewer.prototype.showModal = function () {

            this.$MODAL = $(s.MODAL);

            // initialize modal template if doesn't exists
            if (this.$MODAL.length <= 0) {

                var html = $(templates).filter('#modal').html(),
                    t = Handlebars.compile(html);

                $('body').append(t(i18nLabels));

                this.$MODAL = $(s.MODAL);

            }

            // create metadata container in the modal
            this.o.addHeader = false; // TODO: force header at false?
            this.$CONTAINER = this.$MODAL.find(s.MODAL_METADATA_CONTAINER);
            this.createMetadataContainer();

            // show modal
            this.$MODAL.modal('show');

        };

        MetadataViewer.prototype.enableExport = function() {

            var self = this;

            // TODO: make it nicer
            this.$EXPORT_METADATA = this.$CONTAINER.find(s.EXPORT_METADATA);
            if( this.$EXPORT_METADATA.length <= 0) {
                this.$EXPORT_METADATA = this.$MODAL.find(s.EXPORT_METADATA);
            }

            log.info(this.$EXPORT_METADATA.length);

            this.$EXPORT_METADATA.off('click');
            this.$EXPORT_METADATA.on('click', function() {

                log.info("export metadata", self.sectors);

                // TODO: move the logic from here

                var d = [];

                // TODO: multilanguage
                d.push(["Subsection Code", "Section", "Subsection", "Metadata"]);

                _.each(self.metadata, function(s, index) {
                    if(s !== undefined) {
                        if (s.hasOwnProperty('label')) {
                            var sector = s.label;
                            _.each(s.subsections, function (sub) {
                                d.push([sub.code, sector, sub.label, sub.text || ""]);
                            });
                        }
                    }

                });

                // TODO: leave it here or use the Common FAOSTAT Export?
                amplify.publish(E.EXPORT_MATRIX_DATA, { data: d });

                /*

                var doc = new jsPDF();
                var specialElementHandlers = {
                    '#editor': function(element, renderer){
                        return true;
                    }
                };
                doc.fromHTML(self.$CONTAINER.get(0));
                doc.save('Test.pdf');

                */

            });

        };

        MetadataViewer.prototype.bindEventListeners = function () {

        };

        MetadataViewer.prototype.unbindEventListeners = function () {

            this.$EXPORT_METADATA.off('click');

            log.warn('TODO MetadataViewer.destroy;');

        };

        MetadataViewer.prototype.destroy = function () {

            this.unbindEventListeners();

            log.warn('TODO MetadataViewer.destroy;');

        };

        return MetadataViewer;
    });