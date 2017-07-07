Ext.define('KitchenSink.view.charts.column3d.ColumnController', {
    extend: 'KitchenSink.view.chart.ChartController',
    alias: 'controller.column-basic-3d',

    onRefresh: function() {
        var chart = this.lookup('chart'),
            store = chart.getStore();

        store.generateData(store.getNumRecords());
    }
});
