Ext.define('KitchenSink.view.signature.SignaturePad', {
    extend: 'Ext.panel.Panel',
    xtype: 'signature-pad',
    title: 'Signature Pad',

    requires: [
        'Ext.signature.Signature',
        'Ext.ux.colorpick.Field',
        'KitchenSink.view.signature.SignaturePadController'
    ],

    // <example>
    otherContent: [{
        type: 'Controller',
        path: 'classic/samples/view/signature/SignaturePadController.js'
    }],
    //</example>

    controller: 'signature-pad',

    viewModel: {
        data: {
            penColor: '#000000',
            backgroundColor: '#b0c5d3ff',
            penStrokeWidth: 2
        }
    },

    items: [{
        xtype: 'signature',
        reference: 'signature',
        bind: {
            penColor: '{penColor}',
            backgroundColor: '{backgroundColor}',
            penStrokeWidth: '{penStrokeWidth}'

        },
        height: 400
    }],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        height: 80,
        overflowHandler: 'scroller',
        items: [
            {
                xtype: 'colorfield',
                fieldLabel: 'Pen Color',
                labelWidth: 60,
                bind: {
                    value: '{penColor}'
                }
            },
            {
                xtype: 'colorfield',
                fieldLabel: 'Background Color',
                labelWidth: 105,
                bind: {
                    value: '{backgroundColor}'
                }
            },
            '-',
            {
                xtype: 'slider',
                fieldLabel: 'Pen Width',
                labelWidth: 70,
                width: 150,
                bind: {
                    value: '{penStrokeWidth}'
                },
                minValue: 1,
                maxValue: 20,
                increment: 1,
                useTips: true,
                tipText: function(thumb) {
                    return 'Width: ' + thumb.value + 'px';
                }
            },
            '->',
            {
                xtype: 'button',
                tooltip: 'Undo',
                iconCls: 'x-fa fa-undo',
                handler: 'onUndo'
            },
            {
                xtype: 'button',
                tooltip: 'Redo',
                iconCls: 'x-fa fa-redo',
                handler: 'onRedo'
            },
            {
                xtype: 'button',
                tooltip: 'Clear',
                iconCls: 'x-fa fa-trash',
                handler: 'onClear'
            },
            {
                xtype: 'button',
                text: 'Save As',
                tooltip: 'Save As',
                iconCls: 'x-fa fa-download',
                menu: {
                    items: [
                        { text: 'PNG', handler: 'onDownloadPng' },
                        { text: 'JPEG', handler: 'onDownloadJpeg' },
                        { text: 'SVG', handler: 'onDownloadSVG' }
                    ]
                }
            }
        ]
    }]
});

