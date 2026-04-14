Ext.define('KitchenSink.view.signature.SignaturePadController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.signature-pad',

    getSignatureCmp: function() {
        return this.lookupReference('signaturePad');
    },

    onUndo: function() {
        this.getSignatureCmp().undo();
    },

    onRedo: function() {
        this.getSignatureCmp().redo();
    },

    onClear: function() {
        this.getSignatureCmp().clear();
    },

    onDownloadPng: function() {
        this.getSignatureCmp().downloadSignature('signature', 'png');
    },

    onDownloadJpeg: function() {
        this.getSignatureCmp().downloadSignature('signature', 'jpeg');
    },

    onDownloadSVG: function() {
        this.getSignatureCmp().downloadSignature('signature', 'SVG');
    }
});
