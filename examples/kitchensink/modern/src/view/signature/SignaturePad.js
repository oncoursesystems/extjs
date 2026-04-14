Ext.define('KitchenSink.view.signature.SignaturePad', {
    extend: 'Ext.Panel',
    xtype: 'signature-pad',
    title: 'Signature Pad',
    controller: 'signature-pad',

    requires: [
        'Ext.signature.Signature',
        'Ext.ux.colorpick.Button',
        'KitchenSink.view.signature.SignaturePadController'
    ],

    //<example>
    otherContent: [{
        type: 'Controller',
        path: 'modern/src/view/signature/SignaturePadController.js'
    }],
    profiles: {
        defaults: {
            undoButtonText: 'Undo',
            redoButtonText: 'Redo',
            clearButtonText: 'Clear',
            downloadButtonText: 'Save As',
            sliderWidth: 100
        },
        phone: {
            defaults: {
                undoButtonText: undefined,
                redoButtonText: undefined,
                clearButtonText: undefined,
                downloadButtonText: undefined,
                sliderWidth: 60
            }
        }
    },
    //</example>

    viewModel: {
        data: {
            penColor: '#000000',
            backgroundColor: '#ffffff',
            penStrokeWidth: 1
        }
    },

    layout: 'fit',
    items: [
        {
            xtype: 'toolbar',
            docked: 'top',
            layout: {
                overflow: 'scroller'
            },
            scrollable: 'horizontal',
            indicators: false,
            items: [
                {
                    xtype: 'colorbutton',
                    iconCls: 'x-fa fa-pencil',
                    tooltip: 'Pen Color',
                    bind: {
                        value: '{penColor}'
                    },
                    style: {
                        marginRight: '10px',
                        marginLeft: '10px',
                        height: '32px',
                        width: '40px',
                        borderRadius: '4px'
                    }
                },
                {
                    xtype: 'colorbutton',
                    iconCls: 'x-fa fa-fill-drip',
                    tooltip: 'Background Color',
                    bind: {
                        value: '{backgroundColor}'
                    },
                    style: {
                        marginRight: '10px',
                        height: '32px',
                        width: '40px',
                        borderRadius: '4px'
                    }
                },
                {
                    xtype: 'component',
                    html: '<div style="border-left: 1px solid #ccc; height: 24px; margin: 0 10px;"></div>'
                },
                {
                    xtype: 'slider',
                    width: '${sliderWidth}',
                    label: 'Pen Width',
                    minValue: 1,
                    maxValue: 10,
                    increment: 1,
                    bind: {
                        value: '{penStrokeWidth}'
                    }
                },
                {
                    xtype: 'button',
                    text: '${undoButtonText}',
                    iconCls: 'x-fa fa-undo',
                    tooltip: 'Undo',
                    handler: 'onUndo'
                },
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-redo',
                    text: '${redoButtonText}',
                    tooltip: 'Redo',
                    handler: 'onRedo'
                },
                {
                    xtype: 'component',
                    flex: 1
                },
                {
                    xtype: 'button',
                    text: '${clearButtonText}',
                    iconCls: 'x-fa fa-trash',
                    tooltip: 'Clear',
                    handler: 'onClear'
                },
                {
                    xtype: 'button',
                    itemId: 'downloadBtn',
                    tooltip: '${downloadButtonText}',
                    text: '${downloadButtonText}',
                    iconCls: 'x-fa fa-download',
                    menu: {
                        items: [
                            {
                                text: 'PNG',
                                iconCls: 'x-fa fa-file-image',
                                handler: 'onDownloadPng'
                            },
                            {
                                text: 'JPEG',
                                iconCls: 'x-fa fa-file-image',
                                handler: 'onDownloadJpeg'
                            },
                            {
                                text: 'SVG',
                                iconCls: 'x-fa fa-file-image',
                                handler: 'onDownloadSVG'
                            }
                        ]
                    }
                }
            ]
        },
        {
            xtype: 'signature',
            reference: 'signaturePad',
            bind: {
                penColor: '{penColor}',
                backgroundColor: '{backgroundColor}',
                penStrokeWidth: '{penStrokeWidth}'
            }
        }
    ]
});
