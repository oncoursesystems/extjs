Ext.define('KitchenSink.model.tree.Country', {
    extend: 'KitchenSink.model.tree.Base',
    entityName: 'Country',
    idProperty: 'name',
    glyph: 'xf024',
    fields: [{
        name: 'name',
        convert: undefined
    }, {
        name: 'iconCls',
        defaultValue: 'x-fa fa-flag'
    }]
});
