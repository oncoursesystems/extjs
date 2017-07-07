Ext.define('KitchenSink.view.layout.BoxViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.layout-box-item',

    data: {
        flex: null,
        height: null,
        width: null
    },

    formulas: {
        html: function (get) {
            var flex = get('flex'),
                height = get('height'),
                width = get('width'),
                html = [];

            if (flex) {
                html.push('<div>flex : ' + flex + '</div>');
            }

            if (height) {
                html.push('<div>height : ' + height + '</div>');
            }

            if (width) {
                html.push('<div>width : ' + width + '</div>');
            }

            return html.join('');
        }
    }
});
