/**
 * This example shows simple checkbox selection in a tree. It is enabled on leaf nodes by
 * simply setting `checked: true/false` at the node level.
 *
 * This example also shows loading an entire tree structure statically in one load call,
 * rather than loading each node asynchronously.
 *
 * The beforecheckchange event is used to veto the taking of a nap.
 */
Ext.define('KitchenSink.view.tree.TristateTreeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tristateTree',

    onBeforeCheckChange: function(record, checkedState, e) {
        if (record.get('text') === 'Take a nap' && !checkedState) {
            Ext.toast('No rest for the weary!', null, 't');

            return false;
        }
    },

    onCheckedNodesClick: function() {
        var records = this.getView().getChecked(),
            names = [];

        Ext.Array.each(records, function(rec) {
            names.push(rec.get('text'));
        });

        Ext.MessageBox.show({
            title: 'Selected Nodes',
            msg: names.join('<br />'),
            icon: Ext.MessageBox.INFO
        });
    },

    changeCheckPropagation: function(item) {
        this.getView().setCheckPropagation(item.text);
        console.log('checkPropagation', this.getView().getCheckPropagation());
    },

    changeEnableTri: function(item) {
        this.getView().setEnableTri(JSON.parse(item.text));
        console.log('EnableTri', this.getView().getEnableTri());
    },

    changeCheckOnTriTap: function(item) {
        this.getView().setCheckOnTriTap(JSON.parse(item.text));
        console.log('CheckOntritap', this.getView().getCheckOnTriTap());
    }
});
