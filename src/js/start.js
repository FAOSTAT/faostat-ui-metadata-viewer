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

            },
            defaultOptions = {

/*                lang: 'en',
                domain: 'QC',*/
                addHeader: true

            };

        function MetadataViewer() {

            return this;
        }

        MetadataViewer.prototype.init = function (config) {

            this.o = $.extend(true, {}, defaultOptions, C, config);


            log.info("MetadataViewer.init; o:", this.o);

            this.initVariables();
            this.initComponents();
            this.bindEventListeners();

        };

        MetadataViewer.prototype.initVariables = function () {

            this.$CONTAINER = $(this.o.container);

        };

        MetadataViewer.prototype.initComponents = function () {

            var self = this;

            Q.all([this.getMetadataStructure(), this.getMetadataDomain()]).then(function(d) {

                var structures = (typeof d[0] === 'string')? JSON.parse(d[0]): d[0],
                    domainData = (typeof d[1] === 'string')? JSON.parse(d[1]): d[1];

                self.createMetadataViewer(structures, domainData);

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

/*                    log.info('\\\\\\\\\\\\\\\\\\\\');
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

                    log.info(sector);

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

            var t = Handlebars.compile(templates);

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
                type: 'GET'
            }));
        };

        MetadataViewer.prototype.getMetadataDomain = function () {
            return Q($.ajax({
                url: this.o.URL_METADATA_DOMAIN,
                type: 'GET',
                data: {
                    domaincode: this.o.domain
                }
            }));
        };

        MetadataViewer.prototype.noDataAvailablePreview = function () {

        };

        MetadataViewer.prototype.bindEventListeners = function () {

        };

        MetadataViewer.prototype.unbindEventListeners = function () {

        };

        MetadataViewer.prototype.destroy = function () {

        };

        return MetadataViewer;
    });