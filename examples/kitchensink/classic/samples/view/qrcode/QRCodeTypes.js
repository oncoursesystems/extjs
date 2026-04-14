Ext.define('KitchenSink.view.qrcode.QRCodeTypes', {
    extend: 'Ext.form.Panel',
    xtype: 'qrcode-types',

    requires: ['Ext.qrcode.generator.QRCode'],

    controller: 'qrcode-types',
    referenceHolder: true,
    width: 800,
    title: 'QR Code By Type',
    layout: 'hbox',
    otherContent: [{
        type: 'Controller',
        path: 'classic/samples/view/qrcode/QRCodeTypesController.js'
    }],
    viewModel: {
        data: {
            typeSelected: false
        }
    },

    items: [{
        xtype: 'panel',
        flex: 1,
        style: {
            "border-right": "1px solid #5fa2dd;"
        },
        layout: {
            type: 'vbox',
            align: 'center'
        },
        defaults: {
            margin: 10
        },
        bbar: {
            layout: {
                type: 'hbox',
                pack: 'center'
            },
            items: [{
                xtype: 'button',
                formBind: true,
                bind: {
                    disabled: '{!typeSelected}'
                },
                text: 'Generate QR Code',
                handler: 'onGenerateClick'
            }]
        },
        items: [{
            xtype: 'combobox',
            fieldLabel: 'Select QR Code Type',
            labelWidth: 130,
            store: {
                data: [{ type: 'Email', value: 'email' },
                       { type: 'VCard', value: 'vcard' },
                       { type: 'SMS', value: 'sms' },
                       { type: 'MeCard', value: 'mecard' },
                       { type: 'Location', value: 'location' },
                       { type: 'WIFI', value: 'wifi' },
                       { type: 'Phone', value: 'phone' },
                       { type: 'Calendar', value: 'calendar' },
                       { type: 'UPI', value: 'upi' },
                       { type: 'PayPal', value: 'paypal' },
                       { type: 'Bitcoin', value: 'bitcoin' }]
            },
            queryMode: 'local',
            displayField: 'type',
            valueField: 'value',
            reference: 'qrTypeField',
            listeners: {
                change: 'onQRCodeTypeChange'
            }
        }, {
            xtype: 'form',
            layout: 'vbox',
            reference: 'fieldsform',
            height: 400,
            border: false,
            scrollable: 'y',
            defaults: {
                xtype: 'textfield',
                padding: 10,
                labelWidth: 100
            },
            items: []
        }]
    }, {
        xtype: 'container',
        flex: 1,
        layout: {
            type: 'vbox',
            align: 'center'
        },
        items: [{
            xtype: 'qrcode',
            padding: 10,
            flex: 1,
            qrSize: 200,
            reference: 'qrComponent'
        }]
    }]

});
