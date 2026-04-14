Ext.define('KitchenSink.view.qrcode.QRCodeStylingController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.qrcode-styling',

    downloadPNG: function() {
        var qrComponent = this.getQrComponent();

        qrComponent.downloadAsPNG();
    },

    downloadSVG: function() {
        var qrComponent = this.getQrComponent();

        qrComponent.downloadAsSVG();
    },

    getQRText: function() {
        var textField = this.lookupReference('qrTextField');

        return textField ? textField.getValue() : '';
    },

    getQrComponent: function() {
        return this.lookupReference('qrComponent');
    },

    onCopyToClipBoard: function() {
        var qrComponent = this.getQrComponent();

        qrComponent.copyToClipboard();
    },

    onGenerateClick: function() {
        var me = this,
            vm = me.getViewModel(),
            textField = me.lookupReference('qrTextField'),
            qrComponent = me.lookupReference('qrComponent'),
            text = textField ? textField.getValue() : '';

        if (!Ext.isEmpty(text)) {
            qrComponent.setData(text);
            qrComponent.generate(text);
            vm.set('hideDownload', false);
        }
    },

    onSizeChange: function(field, newValue) {
        var me = this,
            size = parseInt(newValue, 10),
            qrComponent = me.getQrComponent(),
            canvas = qrComponent.getCanvas();

        if (size >= 100 && size <= 500 && qrComponent.getQrSize() !== size) {
            canvas.width = size;
            canvas.height = size;

            qrComponent.setQrSize(size);
        }
    },

    onColorChange: function(field, newValue) {
        var me = this,
            qrCodeComponent = me.getQrComponent();

        if (newValue.indexOf('#') === -1) {
            newValue = '#' + newValue;
        }

        qrCodeComponent.setQrColor(newValue);
    },

    onBackgroundColorChange: function(field, newValue) {
        var me = this,
            qrComponent = me.getQrComponent(),
            bgColor = qrComponent.getQrBackgroundColor();

        if (newValue.indexOf('#') === -1) {
            newValue = '#' + newValue;
        }

        // Prevent same color for background and background
        if (newValue === bgColor) {
            field.setValue(qrComponent.config.qrBackgroundColor);

            return;
        }

        qrComponent.setQrBackgroundColor(newValue);
    }
});
