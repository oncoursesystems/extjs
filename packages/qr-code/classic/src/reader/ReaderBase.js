/**
 * @private
 * Base Class for QR code reader/scanner
 */
Ext.define('Ext.qrcode.reader.ReaderBase', {
    extend: 'Ext.Container',

    config: {
        /**
         * @cfg {Boolean} showScanButton
         * Whether to show or hide scan button 
         */
        showScanButton: false,

        /**
         * @cfg {String} [acceptedFileTypes] An optional list of file MIME types 
         * accepted by this field. This string will be rendered in to 
         * the `accept` attribute of the file input
         * and should conform to HTML requirements: http://www.w3.org/TR/html-markup/input.file.html
         *
         * @since 8.0.0
         */
        acceptedFileTypes: 'image/png, image/jpeg, image/svg+xml'
    },

    initComponent: function() {
        var me = this;

        me.callParent();
        me.addItems();
    },

    addItems: Ext.emptyFn,

    getFiles: function(field) {
        var fileInputEl = field.fileInputEl.dom,
            files = fileInputEl.files;

        return files && files[0];
    }

});
