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
    layout: 'center',
    profiles: {
        defaults: {
            height: 400,
            width: 600
        },
        phone: {
            defaults: {
                height: undefined,
                width: undefined
            }
        }
    },
    width: '${width}',
    autoSize: true,
    title: 'QR Code Reader',
    minHeight: 200,
    items: [{
        xtype: 'qrcodereader',
        width: '100%',
        scanViewHeight: 400,
        scanViewWidth: 400,
        autoSize: true,
        padding: '5 10',
        showScannerfield: true,
        acceptedFileTypes: 'image',
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
        autoSize: true,
        maxHeight: 200,
        bind: {
            hidden: '{hideResult}'
        },
        layout: 'fit',
        items: [{
            xtype: 'component',
            padding: '10 5',
            width: '95%',
            bind: {
                html: '<b>Scanned Text: </b> <span style="white-space: normal; word-break: break-all;">{scannedText}</span>'
            }
        }]
    }]
});
