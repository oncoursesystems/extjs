Ext.define('KitchenSink.view.qrcode.QRCodeStyling', {
    extend: 'Ext.form.Panel',
    xtype: 'qrcode-styling',

    requires: ['Ext.qrcode.generator.QRCode'],

    controller: 'qrCodeController',
    viewModel: {
        data: {
            hideDownload: true,
            qrText: ''
        }
    },
    width: 800,
    hight: 600,
    scrollable: true,
    bodyPadding: 20,
    layout: {
        type: 'vbox',
        align: 'center'
    },
    referenceHolder: true,
    title: 'QR Code Styling',
    otherContent: [{
        type: 'Controller',
        path: 'classic/samples/view/qrcode/QRCodeStylingController.js'
    }],
    items: [{
        xtype: 'container',
        layout: 'hbox',
        defaults: {
            margin: 10
        },
        items: [{
            xtype: 'textfield',
            required: true,
            width: 400,
            fieldLabel: 'Enter Text',
            labelWidth: 100,
            reference: 'qrTextField',
            bind: {
                value: '{qrText}'
            }
        }, {
            xtype: 'button',
            text: 'Generate QR Code',
            handler: 'onGenerateClick',
            bind: {
                disabled: '{!qrText}'
            }
        }]
    }, {
        xtype: 'qrcode',
        padding: 10,
        reference: 'qrCodeFld'
    }, {
        xtype: 'container',
        layout: 'hbox',
        margin: 10,
        bind: {
            hidden: '{hideDownload}'
        },
        defaults: {
            margin: 10
        },
        items: [{
            xtype: 'numberfield',
            hideTrigger: true,
            itemId: 'sizeField',
            fieldLabel: 'Size (px)',
            labelWidth: 60,
            value: 220,
            minValue: 100,
            maxValue: 500,
            width: 120,
            listeners: {
                change: 'onSizeChange',
                buffer: 300
            }
        }, {
            xtype: 'colorfield',
            fieldLabel: 'Color',
            labelWidth: 40,
            width: 200,
            value: '#000000',
            listeners: {
                change: 'onQRColorChange',
                buffer: 300
            }
        }, {
            xtype: 'colorfield',
            fieldLabel: 'Background',
            labelWidth: 70,
            width: 200,
            value: '#ffffff',
            listeners: {
                change: 'onBackgroundColorChange',
                buffer: 300
            }
        }]
    }, {
        xtype: 'container',
        layout: 'hbox',
        margin: '5 0 0 0',
        bind: {
            hidden: '{hideDownload}'
        },
        defaults: {
            margin: 10
        },
        items: [{
            xtype: 'button',
            itemId: 'downloadBtn',
            text: 'Save As',
            iconCls: 'x-fa fa-download',
            menu: {
                items: [
                    {
                        text: 'PNG',
                        handler: 'downloadPNG'
                    },
                    {
                        text: 'SVG',
                        handler: 'downloadSVG'
                    }
                ]
            }
        }, {
            xtype: 'button',
            text: 'Copy To Clipboard',
            iconCls: 'x-fa fa-copy',
            handler: 'onCopyToClipBoard'
        }]

    }

    ]
});
