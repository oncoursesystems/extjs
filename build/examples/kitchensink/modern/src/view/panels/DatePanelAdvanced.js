Ext.define('KitchenSink.view.panels.DatePanelAdvanced', {
    extend: 'Ext.Container',
    xtype: 'panel-date-adv',

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
        panes: 3,
        showTodayButton: true,
        disabledDays: [1],
        disabledDates: [
            Ext.Date.add(new Date(), Ext.Date.DAY, -1),
            Ext.Date.add(new Date(), Ext.Date.MONTH, 1),
            Ext.Date.add(new Date(), Ext.Date.MONTH, -1)
        ],
        specialDates: [
            new Date(new Date().getFullYear(), 2, 19),
            new Date(new Date().getFullYear(), 4, 1),
            new Date(new Date().getFullYear(), 2, 16)
        ]
    }]
});
