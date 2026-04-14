Ext.define('KitchenSink.store.TristateTree', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.tristatetree',

    proxy: {
        type: 'ajax',
        url: 'data/tree/tristate-checknodes.json'
    },
    sorters: [{
        property: 'leaf',
        direction: 'ASC'
    }, {
        property: 'text',
        direction: 'ASC'
    }]
});
