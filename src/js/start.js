/*global define, console, amplify */
define([
        'jquery',
        'loglevel',
        'fs-m-v/config/Config',
        'text!fs-m-v/html/templates.hbs',
        'i18n!fs-m-v/nls/translate',
        'handlebars',
        'underscore',
        'q',
        'amplify'
    ],
    function ($, log, C, templates, i18nLabels, Handlebars, _, Q) {

        'use strict';

        var s = {

                MODAL: '#fs-metadata-modal',
                MODAL_METADATA_CONTAINER: '[data-role="metadata"]'

            },
            defaultOptions = {

                /*                lang: 'en',
                 domain: 'QC',*/
                addHeader: true,
                modal: false

            };

        function MetadataViewer() {

            return this;
        }

        MetadataViewer.prototype.init = function (config) {

            this.o = $.extend(true, {}, defaultOptions, C, config);


            log.info("MetadataViewer.init; o:", this.o);

            this.initVariables();
            this.initComponents();

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

            Q.all([this.getMetadataStructure(), this.getMetadataDomain()]).then(function(d) {

                // Check based on the service result
                if ( d !== undefined && d !== null && d !== 'null' && d[1] !== 'null') {

                    var structures = (typeof d[0] === 'string') ? JSON.parse(d[0]) : d[0],
                        domainData = (typeof d[1] === 'string') ? JSON.parse(d[1]) : d[1];

                    self.createMetadataViewer(structures, domainData);

                }else{

                    self.noDataAvailablePreview();

                }

            });

        };

        MetadataViewer.prototype.createMetadataViewer = function (structures, domainData) {

            var sectors = [],
                self = this;

            //log.info(structures);

            // for each domain data merge with the structure
            _.each(domainData, function(d) {

                var sector = {
                        label: null,
                        code: null,
                        subsections: [
                        ]
                    },
                    subsector = {
                        code: d.MetadataCode,
                        text: d.MetadataText
                    },

                // sector code used in the object creation
                    sectorCode = self.getSection(d.MetadataCode);

                // get metadata structure from code
                var structure = _.where(structures, {
                    MetadataCode: d.MetadataCode
                });

                //log.info(d);


                // check if returned something
                if (structure.length <= 0) {
                    log.error('MetadataViewer.createMetadataViewer; missing code in structure: ', d.MetadataCode);
                }
                else {

                    structure = structure[0];

                    /* log.info('\\\\\\\\\\\\\\\\\\\\');
                     log.info("Structure", structure);*/

                    // create a sector section
                    if ( sectors.hasOwnProperty(sectorCode)) {
                        sector = sectors[sectorCode];
                    }

                    // sector
                    sector.code = sectorCode;
                    sector.label = structure.NameMacroGroup;

                    // adding the description to the subsector
                    subsector.label = structure.Label;
                    subsector.description = structure.Description;

                   // log.info(sector);

                    sector.subsections.push(subsector);

                    // adding to the sectors
                    sectors[sectorCode] = sector;

                }

            });

            /*
             log.info("---------------------------");
             log.info(sectors);
             */

            // rendering

            var html = $(templates).filter('#content').html();
            var t = Handlebars.compile(html);

            this.$CONTAINER.html(t(
                $.extend(true, {}, i18nLabels, {
                    data: sectors,
                    addHeader: this.o.addHeader
                })
            ));

        };

        MetadataViewer.prototype.getSection = function (metadataCode) {

            return parseInt(metadataCode).toString();

        };

        MetadataViewer.prototype.getMetadataStructure = function () {
            return Q($.ajax({
                url: this.o.URL_METADATA_MODEL,
                type: 'GET',
                data: {
                    lang: this.getFAOSTATLang()
                }
            }));
        };

        MetadataViewer.prototype.getMetadataDomain = function () {
            return Q($.ajax({
                url: this.o.URL_METADATA_DOMAIN,
                type: 'GET',
                data: {
                    domaincode: this.o.code,
                    lang: this.getFAOSTATLang()
                }
            }));
        };

        MetadataViewer.prototype.getFAOSTATLang = function () {

            var lang = this.o.lang;

            switch(lang) {

                case 'es': return 'S';
                case 'fr': return 'F';
                default: return 'E';

            }

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

                var html = $(templates).filter('#modal').html();
                var t = Handlebars.compile(html);
                log.info(i18nLabels)
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

        MetadataViewer.prototype.destroy = function () {

            log.warn('TODO');

        };

        return MetadataViewer;
    });