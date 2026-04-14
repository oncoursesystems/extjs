/**
 * @class Ext.qrcode.generator.QRCode
 * @extend Ext.qrcode.generator.GeneratorBase
 * @alias widget.qrcode
 * This class is a QR code generator component that renders a QR code based on the 
 * provided {@link #cfg-data}, it is dependent on qr code library[`qrcode.min.js`]( https://github.com/kazuhikoarase/qrcode-generator) 
 * which generates QR codes directly in the browser using an HTML `<canvas>` element.
 * 
 * @since 8.0.0
 *
 * ## Example
 * 
 * ```javascript
 * @example({ framework: 'extjs' })
 * Ext.application({
 *     name: 'QRCodeApp'
 *     launch: function() {
 *         Ext.create('Ext.qrcode.generator.QRCode', {
 *             renderTo: Ext.getBody(),
 *             height: 300,
 *             width: 300,
 *             padding: 20,
 *             data: 'Sample text from QR code'
 *         });
 *     }
 * });
 * ```
 *
 * It also supports generating various types of QR codes, such as email, SMS, and more.
 * Valid values for the {@link #cfg-type} config include: email, sms, vCard, meCard,
 * phoneNumber, calendar, paypal, bitcoin, WIFI, location, and upi.
 *
 * ## Example
 * ```javascript
 * @example({ framework: 'extjs' })
 * Ext.application({
 *     name: 'QRCodeApp',
 *     launch: function() {
 *         Ext.create('Ext.qrcode.generator.QRCode', {
 *             renderTo: Ext.getBody(),
 *             height: 300,
 *             width: 300,
 *             padding: 20,
 *             data: 'Sample text from QR code'
 *         });
 *     }
 * });
 * ```
 * 
  * ```javascript
 * @example({ framework: 'extjs' })
 * Ext.application({
 *    name: 'QRCodeApp',
 *    launch: function() {
 *         Ext.create('Ext.qrcode.generator.QRCode', {
 *             renderTo: Ext.getBody(),
 *             height: 300,
 *             width: 300,
 *             padding: 20,
 *             type: 'email',
 *             data: {
 *                 email: 'test@test.com',
 *                 subject: 'Test Subject',
 *                 body: 'Test email body content'
 *             }
 *         });
 *    }
 * });
 * ```
 */

Ext.define('Ext.qrcode.generator.QRCode', {
    extend: 'Ext.qrcode.generator.GeneratorBase',

    xtype: 'qrcode',

    config: {
        /**
         * @cfg {Number} qrSize
         * Default size for the QR code canvas
         * 
         * @since 8.0.0
         */
        qrSize: 220,

        /**
         * @cfg {String} type
         * Type of QR code to be generated
         * valid types currently it supports are - vcard, email, vcard, wifi, sms, mecard, location,
         * location, upi, paypal, bitcoin, calendar, phone.
         * Each type has its own set keys to be passed in {@link #cfg-data} config 
         * in order to generate QR code 
         * for the type intend.
         * 
         * @since 8.0.0
         */
        type: 'text',

        /**
         * @cfg {Object/String} data
         * data for which QR code should be generated, can be a string
         * or an object with valid key value pairs.
         * each {@link #cfg-type} config has a set of different objects, 
         * below are the valid key value pairs to be passed for each type
         * 
         * email - email, subject, body
         * sms - phone, text
         * location - latitude, longititude
         * wifi - `encryptionType`, `ssid`, `password`
         * vcard - firstName, lastName, phone, email, company, address, title, website
         * mecard - firstName, lastName, phone, email, address, org, url, note, birthday
         * phone - phoneNumber
         * calendar - summary, description, location, start, end
         * upi - vpa, name, amount, currency
         * paypal - username, amount
         * bitcoin - address, amount, label
         * 
         * Defaults to `null`
         * 
         * @since 8.0.0
         */
        data: null,

        /**
         * @cfg {String} qrColor
         * Default color for QR code
         * 
         * @since 8.0.0
         */
        qrColor: '#000000',

        /**
         * @cfg {String} qrBackgroundColor
         * Default background color for QR code
         * 
         * @since 8.0.0
         */
        qrBackgroundColor: '#ffffff',

        /**
         * @cfg {String} errorCorrectionLevel
         * Controls how much error recovery is built in. Higher levels increase size.
         * Accepted values 'L', 'M', 'Q', 'H' where 'L' is lowest and 'H' is the heighest
         * 
         * @since 8.0.0
         */
        errorCorrectionLevel: 'M'
    },

    qrInstance: null,

    /**
     * @event qrgenerated
     * Fires when Qr Code is generated successfully
     * @param {Ext.qrcode.generator.QRCode} this - current instance of the component
     * @param {Object} data Object/String that is passed for QR code generation
     */
    afterRender: function() {
        var me = this,
            canvas = me.getCanvas(),
            size = me.getQrSize();

        me.callParent();

        if (canvas) {
            canvas.width = size;
            canvas.height = size;

            me.generate();
        }
    },

    getCanvas: function() {
        var me = this;

        return me.canvasEl ? me.canvasEl.dom : null;
    },
    /**
     * Returns a map of QR code data template handler functions based on the supported
     * `type` values.Each key corresponds to a QR code content type, and each value
     *  is a method responsible for generating the properly formatted data string for that type.
     */
    getDataTemplates: function() {
        var me = this;

        if (!me.qrDataTemplates) {
            me.qrDataTemplates = {
                'vcard': me.getVCardQRData,
                'mecard': me.getMeCardQRData,
                'wifi': me.getWIFIQRData,
                'email': me.getEmailQRData,
                'sms': me.getSMSQRData,
                'location': me.getLocationQRData,
                'phone': me.getPhoneNumberQRData,
                'calendar': me.getCalenderEventQRData,
                'upi': me.getUPIQRData,
                'paypal': me.getPayPalQRData,
                'bitcoin': me.getBitcoinQRData
            };
        }

        return me.qrDataTemplates;
    },

    /**
     * Generates a QR code based on the given `type` and `data`.  
     * If a recognized `type` is provided (e.g., `email`, `sms`, `wifi`), the corresponding
     * formatter method is used to transform the input `data` into a properly structured string
     * before generating the QR code. If no matching formatter is found for the given `type`, 
     * the raw data is used as-is.
     * 
     * This method uses the `qrcode.min.js` library to encode the data and then draws
     * the generated QR matrix onto an HTML5 `<canvas>` element.
     *
     * @param {String} data The data string to encode in the QR code.
     * @param {String} [type] The type of QR code to 
     * generate (e.g., `email`, `sms`, `wifi`, `vcard`, etc.).
     * @private
     */
    generate: function(data, type) {
        var me = this,
            canvas = me.getCanvas(),
            qrSize = me.getQrSize(),
            ctx, qr, moduleCount, tileW, tileH, i, j;

        if (!canvas) {
            return;
        }

        data = data || me.getData();
        type = type || me.getType();

        if (Ext.isEmpty(data)) {
            Ext.log.warn('Please provide some text to generate QR code');

            return;
        }

        if (!Ext.isEmpty(type)) {
            data = me.getDataTemplateByType(type, data);
        }

        canvas.width = qrSize;
        canvas.height = qrSize;

        // eslint-disable-next-line no-undef
        if (!qrcode) {
            Ext.log.error("qrcode is not defined");
        }

        // eslint-disable-next-line no-undef
        qr = qrcode(0, me.getErrorCorrectionLevel());
        qr.addData(data);
        qr.make();

        me.qrInstance = qr;

        // Get canvas context
        ctx = canvas.getContext('2d');
        moduleCount = qr.getModuleCount();
        tileW = canvas.width / moduleCount;
        tileH = canvas.height / moduleCount;

        ctx.fillStyle = me.getQrBackgroundColor();
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR modules
        for (i = 0; i < moduleCount; i++) {
            for (j = 0; j < moduleCount; j++) {
                if (qr.isDark(i, j)) {
                    ctx.fillStyle = me.getQrColor();
                }
                else {
                    ctx.fillStyle = me.getQrBackgroundColor();
                }

                ctx.fillRect(
                    Math.round(j * tileW),
                    Math.round(i * tileH),
                    Math.ceil(tileW),
                    Math.ceil(tileH)
                );
            }
        }

        me.fireEvent('qrgenerated', me, data);
    },

    getDataTemplateByType: function(type, data) {
        var me = this,
            dataTemplatesObj = me.getDataTemplates();

        if (dataTemplatesObj) {
            type = type.toLowerCase();

            if (!Ext.isEmpty(dataTemplatesObj[type])) {
                data = dataTemplatesObj[type](data);
            }
        }

        return data;
    },

    /**
    * Copies the current canvas content to the system clipboard as a PNG image.
    *
    * This method converts the canvas to a blob and uses the Clipboard API to copy the image.
    * It checks for browser support and logs an error if the functionality is unavailable.
    *
    * **Note:** Clipboard API must be supported by the browser, 
    * and the page must be served over HTTPS.
    */
    copyToClipboard: function() {
        var me = this,
            canvas = me.getCanvas(),
            hasClipboardSupport, item;

        hasClipboardSupport = navigator.clipboard &&
                          Ext.isFunction(ClipboardItem) &&
                          Ext.isFunction(navigator.clipboard.write);

        if (!hasClipboardSupport) {
            Ext.log.error('Your browser does not support copying to the clipboard.');

            return;
        }

        // Create the ClipboardItem with a Promise IMMEDIATELY (during user gesture)
        item = new ClipboardItem({
            // eslint-disable-next-line no-undef
            'image/png': new Promise(function(resolve, reject) {
                canvas.toBlob(function(blob) {
                    if (blob) {
                        resolve(blob);
                    }
                    else {
                        reject(new Error('Could not create image blob.'));
                    }
                }, 'image/png');
            })
        });

        // Write to clipboard while still in user gesture context
        navigator.clipboard.write([item])
        .then(function() {
            // <debug>
            Ext.log('Image copied to clipboard successfully.');
            // </debug>
        })
        .catch(function(error) {
            // <debug>
            Ext.log.error('Failed to copy image to clipboard:', error);
            // </debug>
        });
    },

    /**
     * Prompts the user to enter a filename and downloads the current canvas content
     * as a PNG image file. The filename is sanitized to remove invalid characters,
     * and a `.png` extension is added if not provided.
     */
    downloadAsPNG: function() {
        var me = this,
            canvas = me.getCanvas(),
            link, filename;

        if (canvas) {
            Ext.Msg.prompt('Download As PNG', 'Enter filename (without extension):',
                           function(btn, text) {
                               if (btn === 'ok' && text) {
                                   filename = text.trim();

                                   if (!filename) {
                                       Ext.Msg.alert('Error', 'Please enter a valid filename.');

                                       return;
                                   }

                                   // Add .png extension if not present
                                   if (!filename.toLowerCase().endsWith('.png')) {
                                       filename += '.png';
                                   }

                                   // Remove invalid characters for filename
                                   filename = filename.replace(/[<>:"/\\|?*]/g, '_');

                                   // Create and trigger download
                                   link = document.createElement('a');
                                   link.href = canvas.toDataURL('image/png');
                                   link.download = filename;

                                   document.body.appendChild(link);
                                   link.click();
                                   document.body.removeChild(link);
                               }
                           }, me, false, 'qr-code');
        }
    },

    /**
     * Prompts the user to enter a filename and downloads the current QR code as an SVG file.
     *
     * **Note:** Some characters are removed from the filename to 
     * ensure compatibility across file systems.
     */
    downloadAsSVG: function() {
        var me = this,
            canvas = me.getCanvas(),
            qr = me.qrInstance,
            svg, blob, url, link, filename, cleanedAttrs;

        if (qr && canvas) {
            Ext.Msg.prompt('Download SVG',
                           'Enter filename (without extension):', function(btn, text) {
                               if (btn === 'ok' && text) {
                                   filename = text.trim();
                                   filename = filename.replace(/[<>:"/\\|?*]/g, '_');

                                   svg = qr.createSvgTag({ scalable: true });
                                   svg = svg.replace(/fill="black"/g, 'fill="' + me.getQrColor() + '"');
                                   svg = svg.replace(/fill="white"/g, 'fill="' + me.getQrBackgroundColor() + '"');

                                   svg = svg.replace(/<svg([^>]*?)>/, function(match, attrs) {
                                       cleanedAttrs = attrs.replace(/width="[^"]*"/g, '').replace(/height="[^"]*"/g, '');

                                       return '<svg width="' + canvas.width + '" height="' +
                                            canvas.height + '"' + cleanedAttrs + '>';
                                   });

                                   blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
                                   url = URL.createObjectURL(blob);

                                   link = document.createElement('a');
                                   link.href = url;
                                   link.download = filename + '.svg';
                                   link.click();

                                   URL.revokeObjectURL(url);
                               }
                           }, me, false, 'qr-code');

        }
    },

    /**
     *  Generates a `mailto:` URL string from the given email object,
     * suitable for use in QR codes or direct email links.
     * 
     * @param {Object} emailObj An object containing email details.
     *  valid keys to be provided - email, subject, body.
     * 
     * @return {String} A `mailto:` URL string including encoded query
     * parameters for subject and body if provided.
     * @private
     */
    getEmailQRData: function(emailObj) {
        var mailtoLink = 'mailto:' + emailObj.email,
            params = [];

        if (emailObj.subject) {
            params.push('subject=' + encodeURIComponent(emailObj.subject));
        }

        if (emailObj.body) {
            params.push('body=' + encodeURIComponent(emailObj.body));
        }

        if (params.length > 0) {
            mailtoLink += '?' + params.join('&');
        }

        return mailtoLink;

    },

    /**
     * Generates a vCard 3.0 formatted string from the given vCard object,
     * suitable for use in QR codes or contact sharing.
     *
     * @param {Object} vCardObj An object containing contact details.
     * valid keys to be passed in this object - firstName, lastName, address, 
     * phone, email, company, title.
     *
     * @return {String} A vCard formatted string representing the contact.
     */
    getVCardQRData: function(vCardObj) {
        var fieldMap = {
                phone: 'TEL;TYPE=CELL',
                email: 'EMAIL',
                company: 'ORG',
                title: 'TITLE',
                website: 'URL'
            },
            vCard = 'BEGIN:VCARD\nVERSION:3.0\n',
            lastName,
            firstName,
            vCardKey;

        // Handle name fields separately since they require special formatting
        if (vCardObj.firstName || vCardObj.lastName) {
            lastName = vCardObj.lastName || '';
            firstName = vCardObj.firstName || '';

            vCard += 'N:' + lastName + ';' + firstName + ';;;\n';
            vCard += 'FN:' + firstName + ' ' + lastName + '\n';
        }

        // Handle address separately since it has special formatting
        if (vCardObj.address) {
            vCard += 'ADR:;;' + vCardObj.address + ';;;;\n';
        }

        // Process other fields using the mapping
        for (vCardKey in fieldMap) {
            if (vCardObj[vCardKey]) {
                vCard += fieldMap[vCardKey] + ':' + vCardObj[vCardKey] + '\n';
            }
        }

        vCard += 'END:VCARD';

        return vCard;
    },

    /**
     * Generates an `sms:` URI string for use in QR codes or clickable SMS links.
     *
     * @param {Object} smsObj An object containing SMS details.
     *  valid keys to be passed in this object - phone, text.
     *
     * @return {String} An `sms:` URI string formatted as `sms:<phone>?body=<text>`.
     * 
     * @private
     */
    getSMSQRData: function(smsObj) {
        return 'sms:' + smsObj.phone + '?body=' + smsObj.text;
    },

    /**
     * @private
     */
    getLocationQRData: function(locationObj) {
        return 'geo:' + locationObj.latitude + ',' + locationObj.longitude;
    },

    /**
     * @private
     */
    getPhoneNumberQRData: function(phoneObj) {
        return 'tel:' + phoneObj.phoneNumber;
    },

    /**
     * @private
     */
    getWIFIQRData: function(wifiObj) {
        return 'WIFI:T:' + wifiObj.encryptionType + ';S:' + wifiObj.ssid +
                    ';P:' + wifiObj.password + ';';
    },

    /**
     * @private
     */
    getCalenderEventQRData: function(eventObj) {
        var vCalendar =
                'BEGIN:VCALENDAR\n' +
                'VERSION:2.0\n' +
                'BEGIN:VEVENT\n' +
                'SUMMARY:' + eventObj.summary + '\n' +
                'DESCRIPTION:' + eventObj.description + '\n' +
                'LOCATION:' + eventObj.location + '\n' +
                'DTSTART:' + eventObj.start + '\n' +
                'DTEND:' + eventObj.end + '\n' +
                'END:VEVENT\n' +
                'END:VCALENDAR';

        return vCalendar;
    },

    /**
     * @private
     */
    getUPIQRData: function(upiObj) {
        var upiLink = 'upi://pay?pa=' + encodeURIComponent(upiObj.vpa) +
                          '&pn=' + encodeURIComponent(upiObj.name) +
                          '&am=' + encodeURIComponent(upiObj.amount) +
                          '&cu=' + upiObj.currency;

        return upiLink;
    },

    /**
     * @private
     */
    getPayPalQRData: function(payPalObj) {
        return 'https://www.paypal.me/' + encodeURIComponent(payPalObj.username) + '/' + encodeURIComponent(payPalObj.amount);
    },

    /**
     * @private 
     */
    getBitcoinQRData: function(bitCoinObj) {
        return 'bitcoin:' + bitCoinObj.address + '?amount=' + bitCoinObj.amount +
                    '&label=' + encodeURIComponent(bitCoinObj.label);
    },

    /**
     * 
     * @param {Object} contact 
     * @private 
     */
    getMeCardQRData: function(contact) {
        var fieldMap = {
                phone: 'TEL',
                email: 'EMAIL',
                address: 'ADR',
                org: 'ORG',
                url: 'URL',
                note: 'NOTE',
                birthday: 'BDAY'
            },
            mecard = 'MECARD:',
            contactKey;

        if (contact.firstName || contact.lastName) {
            mecard += 'N:' + (contact.lastName || '') + ',' + (contact.firstName || '') + ';';
        }

        if (contact.address) {
            mecard += 'ADR:;;' + contact.address + ';;;;\n';
        }

        for (contactKey in fieldMap) {
            if (contact[contactKey]) {
                mecard += fieldMap[contactKey] + ':' + contact[contactKey] + ';';
            }
        }

        mecard += ';';

        return mecard;
    },

    /**
     * Regenerates the QR code using the current {@link #cfg-data} and 
     * {@link #cfg-type} configs.
     * it re-generates the QR code only if a QR instance has already been created.
     */
    applyData: function(data) {
        var me = this;

        if (me.qrInstance) {
            me.generate(data, me.getType());
        }

        return data;
    },

    /**
     * Resets the QR code's foreground and background colors to their initial configured values.
     * It uses the values provided in the `initialConfig` or from the current `config` values.
     * After resetting the colors, it triggers QR code regeneration using the current type and 
     * data.
     */
    resetQRColor: function() {
        var me = this,
            color = me.initialConfig.color || me.config.color,
            bgColor = me.initialConfig.qrBackgroundColor || me.config.qrBackgroundColor;

        me.setQrBackgroundColor(bgColor);
        me.setColor(color);
        me.generate();
    },

    /**
     * @param {String} color 
     * regenerates the QR with the new color passed
     */
    updateQrColor: function(color) {
        var me = this;

        if (me.qrInstance) {
            me.generate();
        }
    },

    /**
     * @param {String} color 
     * regenerates the QR code with the new background color passed
     */
    updateQrBackgroundColor: function(color) {
        var me = this;

        if (me.qrInstance) {
            me.generate();
        }
    },

    /**
     * @param {Number} size 
     * 
     * regenerates the QR code with the new size passed
     */
    updateQrSize: function(size) {
        var me = this;

        if (me.qrInstance) {
            me.generate();
        }
    }
});
