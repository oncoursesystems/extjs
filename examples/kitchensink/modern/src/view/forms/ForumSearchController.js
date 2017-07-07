Ext.define('KitchenSink.view.forms.ForumSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.form-forumsearch',

    doSearch: function (field) {
        var list = this.lookup('list'),
            wrapper = this.lookup('wrapper'),
            store = list.getStore(),
            proxy = store.getProxy(),
            value = field.getValue();

        proxy.setExtraParam('query', value);

        if (value) {
            wrapper.setFlex(1);
            list.setFlex(1);

            store.load();
        } else {
            wrapper.setFlex(null);
            list.setFlex(null);

            store.removeAll();
        }
    }
});
