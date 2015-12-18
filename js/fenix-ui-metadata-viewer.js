define(['jquery',
        'handlebars',
        'text!fenix_ui_metadata_viewer/html/templates.html',
        'i18n!fenix_ui_metadata_viewer/nls/translate',
        'sweetAlert'], function ($, Handlebars, templates, translate) {

    'use strict';

    function FUIMDV() {

        this.CONFIG = {
            lang: 'en',
            placeholder_id: 'placeholder'
        };

    }

    /**
     * This is the entry method to configure the module.
     *
     * @param config Custom configuration in JSON format to extend the default settings.
     */
    FUIMDV.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'en';

        /* Load main structure. */
        var source = $(templates).filter('#main_structure').html();
        var template = Handlebars.compile(source);
        var dynamic_data = {
            title: 'This is the title',
            subtitle: "this is the subtitle"
        };
        var html = template(dynamic_data);
        $('#' + this.CONFIG.placeholder_id).html(html);

        /* Link test alert. */
        $('#alert_button').click(function() {
            sweetAlert('This is a very nice alert provided by SweetAlert');
        });

    };

    return FUIMDV;

});
