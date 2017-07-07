Ext.define('KitchenSink.view.panels.DatePanel', {
    extend: 'Ext.Container',
    xtype: 'panel-date',

    requires: [
        'Ext.panel.Date',
        'Ext.layout.Center'
    ],

    //<example>
    shadow: false,
    //</example>

    layout: 'center',

    items: [{
        xtype: 'datepanel',
        shadow: true,
        showTodayButton: true
    }]
});
