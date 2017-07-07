Ext.define('KitchenSink.view.grid.tree.TreeGrid', {
    extend: 'Ext.grid.Tree',
    xtype: 'tree-grid',
    title: 'Tree Grid',

    viewModel: {
        type: 'tree-grid'
    },

    // <example>
    otherContent: [{
        type: 'ViewModel',
        path: 'modern/src/view/grid/tree/TreeGridModel.js'
    }],

    profiles: {
        defaults: {
            height: 400,
            width: 600
        },
        phone: {
            defaults: {
                height: undefined,
                width: undefined
            }
        }
    },
    // </example>

    height: '${height}',
    width: '${width}',

    // binds the store from the TreeGridModel to this tree
    bind: '{navItems}',

    columns: [{
        xtype: 'treecolumn',
        text: 'Name',
        dataIndex: 'text',
        flex: 1
    }, {
        xtype: 'numbercolumn',
        width: 100,
        text: '# Items',
        dataIndex: 'numItems',
        align: 'center',
        format: '0,0'
    }]
});
