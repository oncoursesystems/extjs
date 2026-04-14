Ext.define('KitchenSink.view.qrcode.QRCode', {
    extend: 'Ext.form.Panel',

    requires: ['Ext.qrcode.generator.QRCode'],

    title: 'Sample Email QR Code',
    xtype: 'qrcode-generator',
    padding: 20,
    width: 320,
    layout: 'center',
    items: [{
        xtype: 'qrcode',
        padding: 20,
        type: 'email',
        data: {
            email: 'test@test.com',
            subject: 'QR code generation example',
            body: 'QR code generated through Ext JS'
        }
    }]
});
