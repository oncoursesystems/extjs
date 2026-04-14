Ext.define('KitchenSink.view.qrcode.QRCodeStylingController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.qrCodeController',

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
        return this.lookupReference('qrCodeFld');
    },

    onCopyToClipBoard: function() {
        var qrComponent = this.getQrComponent();

        qrComponent.copyToClipboard();
    },

    onGenerateClick: function() {
        var me = this,
            vm = me.getViewModel(),
            textField = me.lookupReference('qrTextField'),
            qrComponent = me.lookupReference('qrCodeFld'),
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
            qrComponent.setHeight(size);
            qrComponent.setWidth(size);

            canvas.width = size;
            canvas.height = size;

            qrComponent.setQrSize(size);
        }
    },

    onQRColorChange: function(field, newValue) {
        var qrComponent = this.getQrComponent();

        // Ensure # prefix
        if (newValue && !newValue.startsWith('#')) {
            newValue = '#' + newValue;
        }

        qrComponent.setQrColor(newValue);
    },

    onBackgroundColorChange: function(field, newValue) {
        var qrComponent = this.getQrComponent(),
            bgColor;

        if (newValue && !newValue.startsWith('#')) {
            newValue = '#' + newValue;
        }

        bgColor = qrComponent.getQrBackgroundColor();

        // prevent same foreground & background
        if (newValue === bgColor) {
            field.setValue(qrComponent.config.qrBackgroundColor);

            return;
        }

        qrComponent.setQrBackgroundColor(newValue);
    }

});
