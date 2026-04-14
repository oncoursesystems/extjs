Ext.define('KitchenSink.view.qrcode.QRCodeTypesController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.qrcode-types',

    qrTypeFields: {
        "vcard": ['firstName', 'lastName', 'phone', 'email', 'company', 'address', 'title', 'website' ],
        'mecard': ['firstName', 'lastName', 'phone', 'email', 'address', 'org', 'url', 'note', 'birthday'],
        'wifi': ['encryptionType', 'ssid', 'password'],
        'sms': ['phone', 'text'],
        'location': ['latitude', 'longitude'],
        'phone': ['phoneNumber'],
        'calendar': ['summary', 'description', 'location', 'start', 'end'],
        'upi': ['vpa', 'name', 'amount', 'currency'],
        'paypal': ['username', 'amount'],
        'bitcoin': ['address', 'amount', 'label'],
        'email': ['email', 'subject', 'body']
    },

    optionalFields: ['description', 'location', 'subject', 'company', 'address', 'title', 'website', 'address', 'org', 'url', 'note', 'birthday', 'label', 'currency' ],

    onQRCodeTypeChange: function(fld, newVal) {
        var me = this,
            vm = me.getViewModel(),
            fieldsform = me.lookup('fieldsform'),
            fields;

        if (!Ext.isEmpty(newVal)) {
            vm.set('typeSelected', true);
            fields = me.getFieldsByType(newVal);
            fieldsform.removeAll();
            fieldsform.add(fields);
        }
    },

    getFieldsByType: function(qrType) {
        var me = this,
            qrFields = this.qrTypeFields[qrType],
            fields = [],
            field, i;

        if (qrFields) {
            if (qrType === 'calendar') {
                for (i = 0; i < qrFields.length; i++) {
                    if (qrFields[i] === 'start' || qrFields[i] === 'end') {
                        fields.push({
                            xtype: 'datefield',
                            label: me.getFormattedLabel(qrFields[i]),
                            name: qrFields[i],
                            required: true,
                            minDate: new Date()
                        });
                    }
                    else {
                        fields.push({
                            xtype: 'textfield',
                            label: me.getFormattedLabel(qrFields[i]),
                            required: (me.optionalFields.indexOf(qrFields[i]) === -1) ? true : false,
                            name: qrFields[i]
                        });
                    }
                }
            }
            else {
                for (i = 0; i < qrFields.length; i++) {
                    field = {
                        label: me.getFormattedLabel(qrFields[i]),
                        required: (me.optionalFields.indexOf(qrFields[i]) === -1) ? true : false,
                        name: qrFields[i]
                    };

                    if (qrFields[i] === 'phone' || qrFields[i] === 'phoneNumber') {
                        field.validators = 'phone';
                    }
                    else if (qrFields[i] === 'email') {
                        field.validators = 'email';
                    }
                    else if (qrFields[i] === 'birthday') {
                        field.xtype = 'datefield';
                        field.maxDate = new Date();
                    }

                    fields.push(field);
                }
            }
        }
        else {
            fields.push({
                label: 'Enter Some Text',
                required: true,
                name: 'sampletext'
            });
        }

        return fields;
    },

    onGenerateClick: function() {
        var me = this,
            fieldsform = me.lookup('fieldsform'),
            qrTypeCombo = me.lookup('qrTypeField'),
            type = qrTypeCombo.getValue(),
            qrCodeComponent = me.getQrCodeComponent(),
            values,
            recIndx;

        if (!fieldsform.validate()) {
            Ext.Msg.alert('Data Missing', 'Please check for form errors and retry.');

            return;
        }

        values = me.checkHasValues(fieldsform.getValues());

        if (!Ext.isEmpty(values)) {

            if (type === 'calendar') {
                values.start = me.toICalendarUTCFormat(values.start);
                values.end = me.toICalendarUTCFormat(values.end);
            }

            // check for type selection, if not make type empty
            recIndx = qrTypeCombo.getStore().indexOf(qrTypeCombo.getSelection());
            type = qrTypeCombo.getValue();

            // to handle free text other than type selection
            if (recIndx === -1) {
                type = null;
                values = values.sampletext;
            }

            qrCodeComponent.setData(values);

            qrCodeComponent.generate(values, type);
        }
        else {
            Ext.toast('Please enter some text', 800);
        }
    },

    getQrCodeComponent: function() {
        var qrCodeComponent = this.lookupReference('qrCodeComponent');

        if (!Ext.isEmpty(qrCodeComponent)) {
            return qrCodeComponent;
        }

        return null;
    },

    toICalendarUTCFormat: function(date) {
        if (Ext.isEmpty(date)) {
            date = new Date();
        }

        return Ext.Date.format(date, 'Ymd') +
               'T' +
               Ext.String.leftPad(date.getUTCHours(), 2, '0') +
               Ext.String.leftPad(date.getUTCMinutes(), 2, '0') +
               Ext.String.leftPad(date.getUTCSeconds(), 2, '0') +
               'Z';
    },

    getFormattedLabel: function(label) {
        return label.charAt(0).toUpperCase() + label.slice(1);
    },

    checkHasValues: function(values) {
        var key,
            count = 0;

        if (!Ext.Object.isEmpty(values)) {
            for (key in values) {
                if (!Ext.isEmpty(values[key])) {
                    count = count + 1;

                    break;
                }
            }
        }

        return count ? values : null;
    }
});
