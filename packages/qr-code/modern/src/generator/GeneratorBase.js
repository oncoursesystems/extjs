/**
 * @private
 * Base class for QR code generator
 */
Ext.define('Ext.qrcode.generator.GeneratorBase', {
    extend: 'Ext.Component',

    /**
     * @protected
     * Returns the template used to render the component's DOM structure.
     */
    getTemplate: function() {
        return [{
            reference: 'canvasEl',
            tag: 'canvas',
            cls: 'qr-canvas'
        }];
    }
});
