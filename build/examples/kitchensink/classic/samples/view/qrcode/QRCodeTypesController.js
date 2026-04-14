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
                            fieldLabel: me.getFormattedLabel(qrFields[i]),
                            name: qrFields[i],
                            allowBlank: false,
                            minValue: new Date()
                        });
                    }
                    else {
                        fields.push({
                            xtype: 'textfield',
                            allowBlank: (me.optionalFields.indexOf(qrFields[i]) === -1) ? false : true,
                            fieldLabel: me.getFormattedLabel(qrFields[i]),
                            name: qrFields[i]
                        });
                    }
                }
            }
            else {
                for (i = 0; i < qrFields.length; i++) {
                    field = {
                        fieldLabel: me.getFormattedLabel(qrFields[i]),
                        allowBlank: (me.optionalFields.indexOf(qrFields[i]) === -1) ? false : true,
                        name: qrFields[i]
                    };

                    if (qrFields[i] === 'phone' || qrFields[i] === 'phoneNumber') {
                        field.regex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
                    }
                    else if (qrFields[i] === 'email') {
                        field.vtype = 'email';
                    }
                    else if (qrFields[i] === 'birthday') {
                        field.xtype = 'datefield';
                        field.maxValue = new Date();
                    }

                    fields.push(field);
                }
            }
        }
        else {
            fields.push({
                fieldLabel: 'Enter Some Text',
                allowBlank: false,
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
            qrComponent = me.getQrComponent(),
            values = fieldsform.getValues(),
            recIndx;

        if (!fieldsform.isValid()) {
            Ext.toast({
                html: 'Please enter a valid data',
                closable: false,
                align: 't',
                slideDUration: 400,
                maxWidth: 400
            });

            return;
        }

        values = me.checkHasValues(fieldsform.getValues());

        if (!Ext.Object.isEmpty(values)) {
            if (type === 'calendar') {
                values.start = me.toICalendarUTCFormat(values.start);
                values.end = me.toICalendarUTCFormat(values.end);
            }

            // check for type selection, if not type should be empty
            recIndx = qrTypeCombo.getStore().indexOf(qrTypeCombo.getSelection());
            type = qrTypeCombo.getValue();

            // to handle free text other than type selection
            if (recIndx === -1) {
                type = null;
                values = values.sampletext;
            }

            qrComponent.setData(values);
            qrComponent.generate(values, type);
        }
        else {
            Ext.toast({
                html: 'Please enter some text',
                closable: false,
                align: 't',
                slideDUration: 400,
                maxWidth: 400
            });
        }
    },

    getQrComponent: function() {
        var qrComponent = this.lookupReference('qrComponent');

        if (!Ext.isEmpty(qrComponent)) {
            return qrComponent;
        }

        return null;
    },

    toICalendarUTCFormat: function(date) {
        if (Ext.isEmpty(date)) {
            date = new Date();
        }
        else if (Ext.isString(date)) {
            date = Ext.Date.parse(date);
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
