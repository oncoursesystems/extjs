Ext.define('KitchenSink.view.buttons.ExtraController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.buttons-extra',

    onStyleSwitch: function (menuitem) {
        var vm = this.getViewModel();

        vm.set('style', menuitem.getValue());
    },

    onTypeSwitch: function (menuitem) {
        var vm = this.getViewModel();

        vm.set('type', menuitem.getValue());
    }
});
