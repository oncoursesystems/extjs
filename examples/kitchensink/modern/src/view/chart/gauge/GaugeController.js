Ext.define('KitchenSink.view.chart.gauge.GaugeController', {
    extend: 'KitchenSink.view.chart.ChartController',
    alias: 'controller.gauge-chart',

    onRefresh: function () {
        var chart = this.lookup('chart'),
            store = chart.getStore();

        store.generateData(store.getNumRecords());
    }
});
