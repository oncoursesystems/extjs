Ext.define('KitchenSink.view.qrcode.QRCodeReader', {
    extend: 'Ext.form.Panel',
    xtype: 'qrcode-reader',

    requires: ['Ext.qrcode.reader.QRCodeReader'],
    viewModel: {
        data: {
            hideResult: true,
            scannedText: ''
        }
    },
    layout: 'vbox',
    width: 500,
    title: 'QR Code Reader',
    minHeight: 200,
    items: [{
        xtype: 'qrcodereader',
        width: '100%',
        padding: '25 10 10 10',
        showScanButton: true,
        listeners: {
            qrscanned: function(fld, scannedText) {
                var vm = fld.up('panel').getViewModel();

                vm.set('hideResult', false);
                vm.set('scannedText', scannedText);
            },
            scanerror: function(fld, error) {
                var vm = fld.up('panel').getViewModel();

                vm.set('hideResult', false);
                vm.set('scannedText', (error || 'Invalid QR Code'));
            }
        }
    }, {
        xtype: 'container',
        scrollable: 'y',
        layout: 'vbox',
        width: '100%',
        bind: {
            hidden: '{hideResult}'
        },
        items: [{
            xtype: 'component',
            padding: 10,
            width: '100%',
            bind: {
                html: '<b>Scanned Text: </b><span style="white-space: normal; word-break: break-all;">{scannedText}</span>'
            }
        }]
    }]
});
