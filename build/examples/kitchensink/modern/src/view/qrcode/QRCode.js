Ext.define('KitchenSink.view.qrcode.QRCode', {
    extend: 'Ext.form.Panel',

    requires: ['Ext.qrcode.generator.QRCode'],

    xtype: 'qrcode-generator',
    title: 'Sample Email QR Code',
    width: 320,
    autoSize: true,
    layout: {
        type: 'vbox',
        align: 'center'
    },
    items: [{
        xtype: 'qrcode',
        padding: 20,
        type: 'email',
        data: {
            email: 'test@test.com',
            subject: 'QR code generation example',
            body: 'QR code generated through sencha'
        }
    }]
});
