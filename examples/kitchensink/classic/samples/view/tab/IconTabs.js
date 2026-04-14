/**
 * Demonstrates a tab panel with icons in the tab buttons.
 */
Ext.define('KitchenSink.view.tab.IconTabs', {
    extend: 'Ext.container.Container',
    xtype: 'icon-tabs',
    controller: 'tab-view',
    width: 400,

    //<example>
    requires: [
        'KitchenSink.view.tab.TabController'
    ],
    otherContent: [{
        type: 'Controller',
        path: 'classic/samples/view/tab/TabController.js'
    }],
    exampleTitle: 'Icon Tabs',
    cls: Ext.baseCSSPrefix + 'shadow',
    //</example>

    defaults: {
        xtype: 'tabpanel',
        width: 400,
        height: 200,
        defaults: {
            bodyPadding: 10,
            scrollable: true
        }
    },

    items: [{
        margin: '0 0 20 0',
        items: [{
            glyph: 'f015',
            html: KitchenSink.DummyText.longText
        }, {
            glyph: 'f075',
            html: KitchenSink.DummyText.extraLongText
        }, {
            glyph: 'f013',
            disabled: true
        }]
    }, {
        plain: true,
        items: [{
            title: 'Active Tab',
            glyph: 'f015',
            html: KitchenSink.DummyText.longText
        }, {
            title: 'Inactive Tab',
            glyph: 'f075',
            html: KitchenSink.DummyText.extraLongText
        }, {
            title: 'Disabled Tab',
            glyph: 'f013',
            disabled: true
        }],
        listeners: {
            tabchange: 'onTabChange'
        }
    }]
});
