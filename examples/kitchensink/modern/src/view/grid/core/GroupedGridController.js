Ext.define('KitchenSink.view.grid.core.GroupedGridController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.grouped-grid',

    onToggleGrouping: function (button, pressed) {
        var grid = this.lookup('grid'),
            grouped = grid.getGrouped();

        grid.setGrouped(pressed);
    }
});
