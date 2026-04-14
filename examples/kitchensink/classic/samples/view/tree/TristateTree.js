/**
 * This example shows tristate checkbox selection in a tree. It demonstrates the three
 * possible states: checked, unchecked, and indeterminate (partially checked). The
 * indeterminate state occurs when a parent node has some, but not all, child nodes selected.
 *
 * Tristate behavior automatically manages parent-child relationships:
 * - When all children are checked, the parent becomes checked
 * - When no children are checked, the parent becomes unchecked  
 * - When some children are checked, the parent shows indeterminate state
 * - Checking/unchecking a parent will check/uncheck all its children
 *
 * This example also shows loading an entire tree structure statically in one load call,
 * rather than loading each node asynchronously.
 *
 * The beforecheckchange event can be used to prevent certain nodes from changing state,
 * such as disabling selection for specific categories or restricted items.
 */
Ext.define('KitchenSink.view.tree.TristateTree', {
    extend: 'Ext.tree.Panel',
    xtype: 'tristatetree',

    //<example>
    exampleTitle: 'Checkbox Selection in a TreePanel',
    otherContent: [{
        type: 'Controller',
        path: 'classic/samples/view/tree/TristateTreeController.js'
    }, {
        type: 'Store',
        path: 'classic/samples/store/TristateTree.js'
    }, {
        type: 'Data',
        path: 'data/tree/tristate-checknodes.json'
    }],
    //</example>

    enableTri: true,
    checkable: true,

    controller: 'tristateTree',
    store: 'TristateTree',
    rootVisible: false,
    useArrows: true,
    frame: true,
    title: 'Tristate Tree',
    width: 550,
    height: 400,
    bufferedRenderer: false,
    animate: true,
    listeners: {
        beforecheckchange: 'onBeforeCheckChange'
    },
    tbar: [{
        text: 'Get checked nodes',
        handler: 'onCheckedNodesClick'
    }, {
        ui: 'default-toolbar',
        xtype: 'button',
        cls: 'dock-tab-btn',
        text: 'CheckPropogation',
        menu: [{
            text: 'none',
            checked: true,
            group: 'checkpropagation',
            handler: 'changeCheckPropagation'
        }, {
            text: 'up',
            checked: false,
            group: 'checkpropagation',
            handler: 'changeCheckPropagation'
        }, {
            text: 'down',
            checked: false,
            group: 'checkpropagation',
            handler: 'changeCheckPropagation'
        }, {
            text: 'both',
            checked: false,
            group: 'checkpropagation',
            handler: 'changeCheckPropagation'
        }]
    }, {
        ui: 'default-toolbar',
        xtype: 'button',
        cls: 'dock-tab-btn',
        text: 'EnableTri',
        menu: [{
            text: 'true',
            checked: true,
            group: 'enabletri',
            handler: 'changeEnableTri'
        }, {
            text: 'false',
            checked: false,
            group: 'enabletri',
            handler: 'changeEnableTri'
        }]
    }, {
        ui: 'default-toolbar',
        xtype: 'button',
        cls: 'dock-tab-btn',
        text: 'CheckonTriTap',
        menu: [{
            text: 'true',
            checked: false,
            group: 'checkontritap',
            handler: 'changeCheckOnTriTap'
        }, {
            text: 'false',
            group: 'checkontritap',
            checked: true,
            handler: 'changeCheckOnTriTap'
        }]
    }]
});
