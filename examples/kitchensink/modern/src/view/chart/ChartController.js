Ext.define('KitchenSink.view.chart.ChartController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.chart',

    requires: [
        'Ext.chart.theme.Midnight',
        'Ext.chart.theme.Green',
        'Ext.chart.theme.Muted',
        'Ext.chart.theme.Purple',
        'Ext.chart.theme.Sky'
    ],

    onThemeSwitch: function (item) {
        var chart = this.lookup('chart');

        chart.setTheme(item.getText());
        chart.redraw();
    },

    onRefresh: function () {
        var chart = this.lookup('chart')
            store = chart.getStore();

        store.generateData(store.getNumRecords());
    }
});
