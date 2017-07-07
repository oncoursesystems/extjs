/**
 * The Controller for the Exporter view.
 *
 * Provides logic which is referenced by listeners, handlers and renderers in the view which are configured
 * as strings. They are resolved to members of this class.
 *
 */
Ext.define('KitchenSink.view.grid.ExporterController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.grid-exporter',

    requires: [
        'Ext.exporter.text.CSV',
        'Ext.exporter.text.TSV',
        'Ext.exporter.text.Html',
        'Ext.exporter.excel.Xml',
        'Ext.exporter.excel.Xlsx'
    ],

    exportTo: function(btn){
        var cfg = Ext.merge({
            title: 'Grid export demo',
            fileName: 'GridExport' + '.' + (btn.cfg.ext || btn.cfg.type)
        }, btn.cfg);

        this.getView().saveDocumentAs(cfg);
    },

    onBeforeDocumentSave: function(view){
        view.mask('Document is prepared for export. Please wait ...');
    },

    onDocumentSave: function(view){
        view.unmask();
    },

    onDataReady: function(){
        Ext.log('"dataready" event fired!');
    }

});
