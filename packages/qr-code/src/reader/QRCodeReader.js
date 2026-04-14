/**
 * A container that includes a file field for uploading QR code images 
 * and a scanner button to launch a QR scanner dialog using the camera input. 
 * The scanning functionality is powered by the Html5Qrcode library.
 * 
 * @since 8.0.0
 * 
 * ## Example
 * 
 * ```javascript
 * @example({ framework: 'extjs' })
 * Ext.application({
 *     name: 'QRReaderApp',
 *     launch: function() {
 *         Ext.create('Ext.qrcode.reader.QRCodeReader', {
 *             renderTo: Ext.getBody(),
 *             layout: 'fit',
 *             padding: 20,
 *             listeners: {
 *                 qrscanned: function(reader, qrData) {
 *                     console.log('QR Code scanned:', qrData);
 *                 }
 *             }
 *         });
 *     }
 * });
 * ```
 */
Ext.define('Ext.qrcode.reader.QRCodeReader', {
    extend: 'Ext.qrcode.reader.ReaderBase',

    xtype: 'qrcodereader',

    layout: 'hbox',

    config: {
        /**
         * @cfg {Object} scannerConfig
         * Configuration object for the Html5Qrcode scanner
         * 
         * @since 8.0.0
         */
        scannerConfig: {
            fps: 10,
            qrbox: 250,
            aspectRatio: 1.1
        },

        /**
         * @cfg {String} scanButtonText
         * Label text for the scanner button
         * 
         * @since 8.0.0
         */
        scanButtonText: 'Open Scanner',

        /**
         * @cfg {Boolean} autoStopAfterScan
         * Whether to automatically stop scanning after successful scan
         * 
         * @since 8.0.0
         */
        autoStopAfterScan: true,

        /**
         * @cfg {Number} scanDialogHeight
         * height for scanner window
         * 
         * @since 8.0.0
         */
        scanViewHeight: 400,

        /**
         * @cfg {Number} scanWindowWidth
         * Width for scanner window
         * 
         * @since 8.0.0
         */
        scanViewWidth: 400,

        /**
         * @cfg cameraId
         * Id of the camera to be opened by default
         * 
         * @since 8.0.0
        */
        cameraId: undefined
    },

    qrScanner: null,

    isScanning: false,

    scannerWindow: {
        xtype: 'window',
        modal: true,
        width: 400,
        height: 400,
        closable: false,
        header: false,
        border: false,
        bbar: {
            layout: {
                pack: 'center'
            },
            items: [{ text: 'Stop Scanning',
                      handler: function(btn) {
                          var scanWindow = btn.up('window');

                          scanWindow.parentScope.stopScanner();
                      }
            }]
        },
        items: [{
            xtype: 'component',
            html: '<div id="qr-scanner-preview" ' +
                        'style="position: relative; width: 100%; height: 100%;"></div>'
        }]
    },

    /**
     * @event qrscanned
     * Fired when a QR code is successfully scanned
     * @param {Ext.qrcode.reader.QRCodeReader} this
     * @param {String} qrData The decoded QR code data
     */

    /**
     * @event scanerror
     * Fired when an error occurs during scanning
     * @param {Ext.qrcode.reader.QRCodeReader} this
     * @param {Error} error The error object
     */

    /**
     * @event scannerstarted
     * Fired when the camera scanner is started
     * @param {Ext.qrcode.reader.QRCodeReader} this
     */

    /**
     * @event scannerstopped
     * Fired when the camera scanner is stopped
     * @param {Ext.qrcode.reader.QRCodeReader} this
     */

    /**
     * @private
     * adds scanner file field and scanner button
     */
    addItems: function() {
        var me = this;

        me.add([{
            xtype: 'component',
            hidden: true
        }, {
            xtype: 'filefield',
            margin: '0 10 0 0',
            flex: 1,
            accept: me.config.acceptedFileTypes,
            hidden: Ext.isEmpty(me.config.showScannerfield) ? false : !me.getShowScannerfield(),
            listeners: {
                change: 'onFileChange',
                scope: 'owner'
            }
        }, {
            xtype: 'button',
            width: 150,
            text: me.config.scanButtonText,
            hidden: Ext.isEmpty(me.config.showScanButton) ? false : !me.getShowScanButton(),
            handler: me.onScanButtonClick,
            scope: me
        }]);
    },

    handleScanSuccess: function(qrData) {
        var me = this;

        this.fireEvent('qrscanned', me, qrData);
    },

    handleScanError: function(error) {
        var me = this;

        me.fireEvent('scanerror', me, error);
        //<debug>
        Ext.log.error('QR Scan error: ' + error);
        //</debug>
    },

    startScanner: function(scanButton) {
        var me = this,
            cameraId, i;

        if (me.isScanning) {
            return;
        }

        if (!window.Html5Qrcode) {
            me.handleScanError('Html5Qrcode library not found');

            return;
        }

        // Create scanner dialog if not already created
        if (!me.scannerView) {
            me.scannerWindow.parentScope = me;
            me.scannerView = Ext.create(me.scannerWindow);
        }

        me.scannerView.setWidth(me.getScanViewWidth());
        me.scannerView.setHeight(me.getScanViewHeight());
        me.scannerView.show();

        // eslint-disable-next-line no-undef
        me.qrScanner = new Html5Qrcode('qr-scanner-preview');

        // eslint-disable-next-line no-undef
        Html5Qrcode.getCameras()
            .then(function(cameras) {
                if (!cameras || cameras.length === 0) {
                    me.handleScanError('No cameras found');

                    return;
                }

                // check if any of the cameras id matches with the provided cameraId config
                if (!Ext.isEmpty(me.getCameraId())) {
                    for (i = 0; i < cameras.length; i++) {
                        if (cameras[i].id === me.getCameraId()) {
                            cameraId = cameras[i].id;
                        }
                    }
                }

                // if no camera matches with provided cameraId switch to default camera
                if (Ext.isEmpty(cameraId)) {
                    Ext.log.warn('No Camera found with the given cameraId ' + me.getCameraId());
                    cameraId = cameras[0].id;
                }

                return me.qrScanner.start(
                    cameraId,
                    me.getScannerConfig(),
                    function(qrCodeMessage) {
                        me.onScanSuccess(qrCodeMessage);
                        me.stopScanner();
                    },
                    function(errorMessage) {
                        me.onScanFailure(errorMessage);
                    }
                );
            })
            .then(function() {
                me.isScanning = true;

                me.fireEvent('scannerstarted', me);
            })
            .catch(function(error) {
                me.handleScanError(error);
            });
    },

    /**
     * @private
     * Event handler fired when the user selects a file
     */
    onFileChange: function(field) {
        var me = this,
            qrCodeFile = me.getFiles(field),
            qrComponent = me.getQrComponent();

        if (!qrCodeFile) {
            return;
        }

        me.scanQRFile(qrCodeFile, qrComponent);
    },

    scanQRFile: function(qrCodeFile, qrComponent) {
        var me = this,
            html5QrCode;

        if (window.Html5Qrcode) {
            // eslint-disable-next-line no-undef
            html5QrCode = new Html5Qrcode(qrComponent.getId());

            html5QrCode.scanFile(qrCodeFile, true)
                .then(function(decodedText) {
                    me.handleScanSuccess(decodedText);
                })
                .catch(function(error) {
                    me.handleScanError(error);
                });
        }
        else {
            me.handleScanError('Html5Qrcode library not found');
        }
    },

    onScanButtonClick: function(button) {
        var me = this;

        if (me.isScanning) {
            me.stopScanner();
        }
        else {
            me.startScanner(button);
        }

    },

    getQrComponent: function() {
        return this.down('component');
    },

    stopScanner: function() {
        var me = this;

        if (!me.qrScanner) {
            return;
        }

        try {
            me.qrScanner.stop()
            .then(function() {
                me.closeScannerWindow();
                me.fireEvent('scannerstopped', me);
            })
            .catch(function(error) {
                me.closeScannerWindow();
                //<debug>
                Ext.log.error('Failed to stop scanner:', error);
                //</debug>
            });
        }
        catch (e) {
            //<debug>
            Ext.log.error('Failed to stop scanner:', e);
            //</debug>
        }
    },

    onScanSuccess: function(qrCodeMessage) {
        var me = this;

        me.handleScanSuccess(qrCodeMessage);

        if (me.getAutoStopAfterScan()) {
            me.stopScanner();
        }
    },

    closeScannerWindow: function() {
        var me = this;

        me.qrScanner.clear();
        me.isScanning = false;

        if (me.scannerView) {
            me.scannerView.close();
            me.scannerView = null;
        }
    },

    onDestroy: function() {
        var me = this;

        if (me.isScanning) {
            me.stopScanner();
        }

        me.callParent();
    },

    onScanFailure: Ext.emptyFn
});
