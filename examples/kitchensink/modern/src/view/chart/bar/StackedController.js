Ext.define('KitchenSink.view.chart.bar.StackedController', {
    extend: 'KitchenSink.view.chart.ChartController',
    alias: 'controller.bar-stacked',

    onRefresh: function() {
        var chart = this.lookup('chart'),
            store = chart.getStore();

        store.generateData(store.getNumRecords());
    }
});
