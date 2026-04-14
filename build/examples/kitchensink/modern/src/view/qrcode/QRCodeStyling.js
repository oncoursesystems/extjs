Ext.define('KitchenSink.view.qrcode.QRCodeStyling', {
    extend: 'Ext.form.Panel',
    xtype: 'qrcode-styling',

    requires: ['Ext.qrcode.generator.QRCode'],

    controller: 'qrcode-styling',

    viewModel: {
        data: {
            hideDownload: true
        }
    },

    otherContent: [{
        type: 'Controller',
        path: 'modern/src/view/qrcode/QRCodeStylingController.js'
    }],

    profiles: {
        defaults: {
            height: 520,
            width: 700
        },
        phone: {
            defaults: {
                height: undefined,
                width: undefined
            }
        }
    },

    height: '${height}',
    width: '${width}',
    autoSize: true,
    scrollable: true,
    bodyPadding: 20,

    layout: {
        type: 'vbox',
        align: 'center'
    },

    referenceHolder: true,
    title: 'QR Code Styling',

    items: [{
        // Input section
        xtype: 'container',
        layout: 'hbox',
        autoSize: true,
        items: [{
            xtype: 'label',
            html: 'Enter Text:',
            margin: '5 10 0 0'
        }, {
            xtype: 'textfield',
            flex: 1,
            maxWidth: 250,
            reference: 'qrTextField',
            publishes: 'value'
        }, {
            xtype: 'button',
            text: 'Generate QR Code',
            handler: 'onGenerateClick',
            bind: {
                disabled: '{!qrTextField.value}'
            }
        }]
    }, {
        // QR Code display
        xtype: 'qrcode',
        scrollable: 'y',
        border: true,
        reference: 'qrComponent',
        margin: '30 0 30 0'
    }, {
        // First row: Size field and color buttons
        xtype: 'container',
        layout: {
            type: 'hbox',
            pack: 'center'
        },
        autoSize: true,
        width: '100%',
        margin: '0 0 20 0',
        bind: {
            hidden: '{hideDownload}'
        },
        defaults: {
            margin: '0 20 0 0'
        },
        items: [
            {
                xtype: 'label',
                html: 'Size (px): ',
                margin: '0 10 0 0'
            }, {
                xtype: 'numberfield',
                clearable: false,
                itemId: 'sizeField',
                labelAlign: 'left',
                width: 100,
                minValue: 100,
                maxValue: 500,
                labelWidth: 70,
                value: 220,
                listeners: {
                    change: {
                        fn: 'onSizeChange',
                        buffer: 300
                    }
                }
            }, {
                xtype: 'label',
                html: 'QR Code Color',
                margin: '0 10 0 0'
            }, {
                xtype: 'colorbutton',
                value: '#000000',
                width: Ext.platformTags.phone ? 25 : 15,
                height: Ext.platformTags.phone ? 25 : 15,
                margin: '0 20 0 0',
                listeners: {
                    change: {
                        fn: 'onColorChange',
                        buffer: 300
                    }
                }
            }, {
                xtype: 'label',
                html: 'Background Color',
                margin: '0 10 0 0'
            }, {
                xtype: 'colorbutton',
                value: '#ffffff',
                width: Ext.platformTags.phone ? 25 : 15,
                height: Ext.platformTags.phone ? 25 : 15,
                listeners: {
                    change: {
                        fn: 'onBackgroundColorChange',
                        buffer: 300
                    }
                }
            }]
    }, {
        // Second row: Download and copy buttons
        xtype: 'container',
        layout: {
            type: 'hbox',
            pack: 'center'
        },
        autoSize: true,
        width: '100%',
        bind: {
            hidden: '{hideDownload}'
        },
        defaults: {
            margin: '0 20 0 0'
        },
        items: [
            {
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
            },
            {
                xtype: 'button',
                iconCls: 'x-fa fa-copy',
                text: 'Copy To Clipboard',
                handler: 'onCopyToClipBoard'
            }]
    }]
});
