/**
 * @private
 * Base class for QR code reader/scanner
 */
Ext.define('Ext.qrcode.reader.ReaderBase', {
    extend: 'Ext.Container',

    config: {
        /**
         * @cfg {Boolean} showFilefield
         * Whether to show or hide filefield 
         */
        showScannerfield: false,

        /**
         * @cfg {String} acceptedFileTypes
         * Accepted file types for the file input
         * File input accept attribute documented here (http://www.w3schools.com/tags/att_input_accept.asp) 
         * Also can be simple strings (e.g. audio, video, image)
         * 
         * @since 8.0.0
         */
        acceptedFileTypes: 'image/png, image/jpeg, image/svg+xml'
    },

    initialize: function() {
        var me = this;

        me.callParent();
        me.addItems();
    },

    addItems: Ext.emptyFn,

    /**
     * @private
     * handler for file selc
     */
    getFiles: function(field) {
        var files = field.getFiles();

        return files && files[0];
    }
});
