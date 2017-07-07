Ext.define('KitchenSink.view.SourceItem', {
    extend: 'Ext.Component',
    xtype: 'sourceitem',

    cls: 'ux-code',
    scrollable: true,
    padding: 8,

    constructor: function(config) {
        this.renderDiv = document.createElement('div');
        this.callParent([config]);
    },

    doDestroy: function() {
        this.renderDiv = null;
        this.callParent();
    },

    applyHtml: function(html) {
        html = html
            .replace(/</g, '&lt;')
            .replace(/\r/g, '');

        return '<div class="prettyprint-ct"><pre style="line-height: 14px; padding-left: 5px" class="prettyprint">' + html + '</pre></div>';
    },

    updateHtml: function(html, oldHtml) {
        var me = this,
            renderDiv = me.renderDiv,
            ct, el;

        me.callParent([html, oldHtml]);

        ct = me.element.down('.prettyprint-ct', true);
        el = ct.firstChild;

        renderDiv.appendChild(el.cloneNode(true));

        PR.prettyPrint(function() {
            if (!me.destroyed) {
                ct.replaceChild(renderDiv.firstChild, el);
            }
        }, renderDiv);
    }
});
