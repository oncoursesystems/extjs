/**
 * This view demonstrates how to use the tooltip align config to specify the two
 * points of the tooltip and its target which should align with each other.
 *
 * It also demonstrates how the tooltip alignment falls back when the desired
 * alignment is not possible due to space constraints. The target is draggable,
 * and when close to the panel border, the tip will move into the closest available
 * space.
 */
Ext.define('KitchenSink.view.tip.TipAligning', {
    extend: 'Ext.panel.Panel',
    xtype: 'tip-aligning',
    controller: 'tip-aligning',
    title: 'Draggable button with configurable tooltip',

    requires: [
        'KitchenSink.view.tip.TipAligningController',
        'KitchenSink.view.tip.TipAligningModel'
    ],

    //<example>
    otherContent: [{
        type: 'Controller',
        path: 'modern/src/view/tip/TipAligningController.js'
    }, {
        type: 'ViewModel',
        path: 'app/view/tip/TipAligningModel.js'
    }],
    //</example>

    bodyBorder: true,

    viewModel: {
        type: 'tip-aligning'
    },

    listeners: {
        single: true,
        resize: 'initButton'
    },

    items: [{
        xtype: 'button',
        ui: 'action',
        ripple: false,
        reference: 'button',
        left: 0,
        top: 0,
        constrain: true,
        text: 'Confirm selection',
        hidden: true,
        draggable: {
            constrain: {
                element: true // Constrain to the parent element
            },
            listeners: {
                dragmove: 'onButtonDrag'
            }
        },
        tooltip: {
            align: 't-b',
            minWidth: 250,
            title: 'Confirm choice of destination',
            html: '<ul><li>Condition one.</li><li>Condition two</li><li>Condition three</li></ul>',
            anchor: true,
            autoHide: false,
            closable: true,
            bind: {
                align: '{alignSpec}',
                anchor: '{anchor}'
            }
        }
    }],

    bbar: {
        defaults: {
            margin: '0 10 0 0'
        },
        items: [{
            xtype: 'component',
            html: 'Tip:'
        }, {
            xtype: 'segmentedbutton',
            bind: '{tipEdge}',
            width: 100,
            defaults: {
                ui: 'default-toolbar',
                width: 25
            },
            items: [{
                text: 'T'
            }, {
                text: 'R'
            }, {
                text: 'B'
            }, {
                text: 'L'
            }]
        }, {
            xtype: 'sliderfield',
            flex: 1,
            minWidth: 100,
            minValue: 0,
            maxValue: 100,
            bind: '{tipOffset}',
            liveUpdate: true
        }, {
            xtype: 'component',
            html: 'Target:'
        }, {
            xtype: 'segmentedbutton',
            bind: '{targetEdge}',
            width: 100,
            defaults: {
                ui: 'default-toolbar',
                width: 25
            },
            items: [{
                text: 'T'
            }, {
                text: 'R'
            }, {
                text: 'B'
            }, {
                text: 'L'
            }]
        }, {
            xtype: 'sliderfield',
            flex: 1,
            minWidth: 100,
            minValue: 0,
            maxValue: 100,
            bind: '{targetOffset}',
            liveUpdate: true
        }, {
            xtype: 'textfield',
            editable: false,
            bind: '{alignSpec}',
            width: 80,
            clearable: false,
            readOnly: true
        }, {
            xtype: 'checkboxfield',
            label: 'Anchor',
            labelWidth: 60,
            bind: '{anchor}',
            inputValue: true
        }]
    }
});
