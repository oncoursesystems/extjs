/**
 * @private
 * Base class for QR code generator
 */
Ext.define('Ext.qrcode.generator.GeneratorBase', {
    extend: 'Ext.Component',

    renderTpl: [
        '<canvas id="{id}-canvasEl" data-ref="canvasEl" ' +
        'class="qr-canvas" width="{qrSize}" height="{qrSize}"></canvas>'
    ],

    renderSelectors: {
        canvasEl: 'canvas.qr-canvas'
    }
});
