/**
 * @class Ext.signature.Base
 * @extend Ext.Component
 * @private
 *
 * This is the base class for the signature component.
 *
 * It defines the main DOM structure and sets up the signature pad.
 */
Ext.define('Ext.signature.Base', {
    extend: 'Ext.Component',

    /**
     * @property {String[]} childEls
     * List of child elements referenced by `data-ref` in the `renderTpl`.
     * These will be automatically assigned to component properties (e.g., `this.canvas`).
     */
    childEls: ['canvas'],

    /**
     * @property {String[]} renderTpl
     * Template used to render the canvas element within the component.
     * This markup will be processed during rendering, and the `data-ref="canvas"`
     * ensures that the `canvas` DOM element is available as `this.canvas`.
     */
    renderTpl: [
        '<canvas id="{id}-canvas" data-ref="canvas" class="' +
            Ext.baseCSSPrefix + 'signature-canvas"></canvas>'
    ],

    /**
     * Initializes the signature pad and resizes the canvas once it's fully rendered.
     */
    afterRender: function() {
        var me = this;

        me.callParent();

        if (Ext.isEmpty(window.SignaturePad)) {
            me.update(me.getEmptyText());

            return;
        }

        me.initSignaturePad();
        me.resizeCanvas();
        me.on('resize', me.resizeCanvas, me);
    }
});
