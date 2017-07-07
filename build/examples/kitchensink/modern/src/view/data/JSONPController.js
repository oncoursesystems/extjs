Ext.define('KitchenSink.view.data.JSONPController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.jsonp',

    cachedConfig: {
        tpl: '<div class="demo-weather">' +
            '<tpl for=".">' +
                '<div class="day">' +
                    '<div class="date">{date}</div>' +
                    '<tpl for="weatherIconUrl">' +
                        '<img src="{value}">' +
                    '</tpl>' +
                    '<span class="temp">{tempMaxF}&deg;<span class="temp_low">{tempMinF}&deg;</span></span>' +
                '</div>' +
            '</tpl>' +
        '</div>'
    },

    applyTpl: function(tpl) {
        return Ext.XTemplate.get(tpl);
    },

    onLoad: function() {
        this.getView().setMasked({
            xtype: 'loadmask',
            message: 'Loading...'
        });

        Ext.data.JsonP.request({
            scope: this,
            callback: this.loadCallback,
            url: 'http://api.worldweatheronline.com/free/v1/weather.ashx',
            callbackKey: 'callback',
            params: {
                key: 'qfj4gk3t4u5u3bqc8atf69fn',
                q: '94301', // Palo Alto
                format: 'json',
                num_of_days: 5
            }
        });
    },

    loadCallback: function(success, result) {
        var weather = success && result.data.weather;

        if (weather) {
            this.lookup('results').updateHtml(this.getTpl().applyTemplate(weather));
        } else {
            Ext.Msg.alert('Error', 'There was an error retrieving the weather.');
        }

        this.getView().unmask();
    }
});
