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
     * @property {Object} element
     * Defines the main DOM structure for the component.
     * The `reference: 'element'` allows access to the outermost container via `this.element`.

     */
    element: {
        reference: 'element',
        children: [{
            reference: 'canvas',
            tag: 'canvas',
            classList: [
                Ext.baseCSSPrefix + 'signature-canvas'
            ]
        }]
    },

    /**
     * This sets up the signature pad, resizes the canvas to fit the component, and 
     * attaches a resize listener to reflow the canvas when the component size changes.
     */
    initialize: function() {
        var me = this;

        me.callParent();

        if (Ext.isEmpty(window.SignaturePad)) {
            me.setHtml(me.getEmptyText());

            return;
        }

        me.initSignaturePad();
        me.resizeCanvas();
        me.on('resize', me.resizeCanvas, me);
    }
});

