/*
 * Shows how a Slider widget can be used with a ViewModel.
 */
Ext.define('KitchenSink.view.binding.SliderWidget', {
    extend: 'Ext.Panel',
    xtype: 'binding-slider-form',
    title: 'Slider and Form Fields',

    viewModel: {
        data: {
            red: 64,
            green: 110,
            blue: 220
        }
    },

    requires: [
        'Ext.field.Container'
    ],

    //<example>
    profiles: {
        defaults: {
            bodyPadding: '10 20 20',
            height: 400,
            labelAlign: undefined,
            labelWidth: 50,
            width: 500
        },
        material: {
            labelWidth: undefined
        },
        phone: {
            defaults: {
                bodyPadding: '0 20 20',
                height: undefined,
                labelAlign: 'top',
                labelWidth: undefined,
                width: undefined
            },
            material: {
                bodyPadding: '15 20 20'
            }
        }
    },
    //</example>

    bodyPadding: '${bodyPadding}',
    defaultType: 'containerfield',
    width: '${width}',
    autoSize: true,

    defaults: {
        labelAlign: '${labelAlign}',
        labelWidth: '${labelWidth}',
        defaults: {
            maxValue: 255,
            minValue: 0
        }
    },

    items: [{
        label: 'Red',
        items: [{
            xtype: 'numberfield',
            width: 100,
            bind: '{red}'
        }, {
            xtype: 'singlesliderfield',
            flex: 1,
            padding: '0 5',
            bind: '{red}',
            liveUpdate: true
        }]
    }, {
        label: 'Green',
        items: [{
            xtype: 'numberfield',
            width: 100,
            bind: '{green}'
        }, {
            xtype: 'singlesliderfield',
            flex: 1,
            padding: '0 5',
            bind: '{green}',
            liveUpdate: true
        }]
    }, {
        label: 'Blue',
        items: [{
            xtype: 'numberfield',
            width: 100,
            bind: '{blue}'
        }, {
            xtype: 'singlesliderfield',
            flex: 1,
            padding: '0 5',
            bind: '{blue}',
            liveUpdate: true
        }]
    }, {
        xtype: 'component',
        margin: '10 0 0',
        height: 200,
        bind: {
            style: {
                backgroundColor: '#{red:hex(2)}{green:hex(2)}{blue:hex(2)}'
            }
        }
    }]
});
