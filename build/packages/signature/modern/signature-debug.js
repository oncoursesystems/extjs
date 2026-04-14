/**
 * @class Ext.signature.Base
 * @extend Ext.Component
 * @private
 *
 * This is the base class for the signature component.
 *
 * It defines the main DOM structure and sets up the signature pad.
 */
Ext.define('Ext.signature.Base', {
    extend: 'Ext.Component',
    /**
     * @property {Object} element
     * Defines the main DOM structure for the component.
     * The `reference: 'element'` allows access to the outermost container via `this.element`.

     */
    element: {
        reference: 'element',
        children: [
            {
                reference: 'canvas',
                tag: 'canvas',
                classList: [
                    Ext.baseCSSPrefix + 'signature-canvas'
                ]
            }
        ]
    },
    /**
     * This sets up the signature pad, resizes the canvas to fit the component, and 
     * attaches a resize listener to reflow the canvas when the component size changes.
     */
    initialize: function() {
        var me = this;
        me.callParent();
        if (Ext.isEmpty(window.SignaturePad)) {
            me.setHtml(me.getEmptyText());
            return;
        }
        me.initSignaturePad();
        me.resizeCanvas();
        me.on('resize', me.resizeCanvas, me);
    }
});

/**
 * @class Ext.signature.Signature
 * @extend Ext.signature.Base
 * @alias widget.signature
 * A lightweight and configurable signature pad component for 
 * capturing user-drawn signatures using canvas.
 * 
 * This component is built on top of the SignaturePad JavaScript 
 * library and provides integration with
 * ExtJS layout and configurable pen settings.
 * 
 * @since 8.0.0
 *
 * ## Example
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * Ext.application({
 *     name: 'SimpleSignatureApp',
 *     launch: function() {
 *         Ext.create('Ext.Panel', {
 *             renderTo: Ext.getBody(),
 *             width: '100%',
 *             height: '100%',
 *             layout: 'fit',
 *             items: [{
 *                 xtype: 'signature',
 *                 penColor: '#000',
 *                 penStrokeWidth: 2,
 *                 minStrokeRatio: 0.7,
 *                 listeners: {
 *                    beginStroke: function(cmp) {
 *                        console.log('Signature beginStroke:', cmp);
 *                    },
 *                    endStroke: function(cmp) {
 *                        console.log('Signature endStroke:', cmp);
 *                    }
 *                 }
 *             }]
 *         });
 *     }
 * });
 * ```
 */
Ext.define('Ext.signature.Signature', {
    extend: 'Ext.signature.Base',
    alias: 'widget.signature',
    config: {
        /**
         * @cfg {String} penColor
         * The color of the pen stroke used to draw on the canvas.
         * 
         * @since 8.0.0
         */
        penColor: '#000000',
        /**
         * @cfg {String} backgroundColor
         * The background color of the signature canvas.
         *
         * Accepts any valid CSS color value. This is rendered beneath the signature strokes.
         * 
         * @since 8.0.0
         */
        backgroundColor: '#ffffff',
        /**
         * @cfg {Number} penStrokeWidth
         * A general stroke width value used to set both min and max stroke width.
         *
         * If `penStrokeMinWidth` or `penStrokeMaxWidth` are not specified, this config is used
         * to compute their values dynamically.
         *
         * Default: `2`
         * 
         * @since 8.0.0
         */
        penStrokeWidth: 2,
        /**
         * @cfg {Number} penStrokeMinWidth
         * Minimum stroke width in pixels.
         *
         * Used by the internal SignaturePad algorithm to determine the thinnest part of a stroke.
         *
         * Default: `0.5`
         * 
         * @since 8.0.0
         */
        minStrokeRatio: 0.5,
        /**
         * @cfg {Number} throttle
         * The minimum time interval (in milliseconds) between canvas updates while drawing.
         *
         * Higher values can improve performance but may reduce stroke fidelity.
         *
         * Default: `16`
         * 
         * @since 8.0.0
         */
        throttle: 16,
        /**
         * @cfg {Number} minDistance
         * The minimum distance (in pixels) between points in a stroke.
         *
         * Smaller values result in smoother curves but require more computation.
         *
         * Default: `5`
         * 
         * @since 8.0.0
         */
        minDistance: 5,
        /**
        * @cfg {String} emptyText
        * The fallback text to display when the SignaturePad library is not loaded or available.
        *
        * Default: `'SignaturePad library not loaded'`
        * 
        * @since 8.0.0
        */
        emptyText: 'SignaturePad library not loaded'
    },
    /**
     * @private
     * @readonly
     * Buffer to store undone strokes for redo functionality.
     */
    redoBuffer: [],
    /**
     * @private
     * @readonly
     * The default filename used when downloading the signature.
     */
    defaultFileName: 'signature',
    /**
     * @private
     * @readonly
     * The default image format used when downloading the signature.
     * Valid values: 'png', 'jpeg'
     */
    defaultFormat: 'png',
    /**
     * Initializes the SignaturePad instance with configuration.
     */
    initSignaturePad: function() {
        var me = this,
            canvas = me.canvas.dom,
            options = {
                penColor: me.getPenColor(),
                backgroundColor: me.getBackgroundColor(),
                minWidth: me.getPenStrokeWidth() * me.getMinStrokeRatio(),
                maxWidth: me.getPenStrokeWidth(),
                throttle: me.getThrottle(),
                minDistance: me.getMinDistance()
            },
            signaturePad = new window.SignaturePad(canvas, options);
        me.signaturePad = signaturePad;
        signaturePad.addEventListener("beginStroke", me.onBegingStroke.bind(me));
        signaturePad.addEventListener("endStroke", me.onEndStroke.bind(me));
    },
    resizeCanvas: function() {
        var me = this,
            canvas = me.canvas,
            canvasEl, signaturePad, data, width, height;
        if (!canvas) {
            return;
        }
        canvasEl = canvas.dom;
        signaturePad = me.getSignaturePad();
        if (signaturePad) {
            data = signaturePad.toData();
            width = me.el.getWidth();
            height = me.el.getHeight();
            canvasEl.width = width;
            canvasEl.height = height;
            canvas.setStyle({
                width: width + 'px',
                height: height + 'px'
            });
            signaturePad.clear();
            signaturePad.fromData(data);
        }
    },
    /**
     * @event beginStroke
     * Fires when the user begins drawing a stroke on the signature pad.
     * Typically triggered on pointer down or pen contact.
     *
     * @param {Ext.signature.Signature} this The signature component instance.
     * @param {Ext.event.Event } e The original pointer or mouse event.
     */
    /**
     * @event endStroke
     * Fires when the user finishes drawing a stroke on the signature pad.
     * Typically triggered on pointer up or pen lift.
     *
     * @param {Ext.signature.Signature} this The signature component instance.
     * @param {Ext.event.Event } e The original pointer or mouse event.
     */
    /**
     * Returns the internal SignaturePad instance.
     * 
     * This is intended for internal or advanced use.
     * Avoid calling methods directly on it unless absolutely necessary.
     */
    getSignaturePad: function() {
        return this.signaturePad;
    },
    onBegingStroke: function(e) {
        this.redoBuffer.length = 0;
        this.fireEvent('beginStroke', this, e);
    },
    onEndStroke: function(e) {
        this.fireEvent('endStroke', this, e);
    },
    /**
     * Clears the canvas content.
     */
    clear: function() {
        var signaturePad = this.getSignaturePad();
        if (signaturePad) {
            signaturePad.clear();
        }
    },
    /**
     * Checks if the canvas is empty.
     * @return {Boolean}
     */
    isEmpty: function() {
        var signaturePad = this.getSignaturePad();
        return !signaturePad || signaturePad.isEmpty();
    },
    /**
     * Returns the signature as a base64 data URL.
     * @param {String} type MIME type (e.g. 'image/png')
     * @param {Number} encoderOptions  Number between 0 and 1 representing image quality for
     * image/jpeg or image/webp
     * @return {String|null}
     */
    getToDataURL: function(type, encoderOptions) {
        var signaturePad = this.getSignaturePad();
        return signaturePad ? signaturePad.toDataURL(type, encoderOptions) : null;
    },
    /**
     * Returns the internal stroke data.
     * @return {Array}
     */
    getToData: function() {
        var signaturePad = this.getSignaturePad();
        return signaturePad ? signaturePad.toData() : [];
    },
    /**
     * Loads signature data from an array of stroke points.
     * @param {Array} pointGroups
     */
    fromData: function(pointGroups) {
        var signaturePad = this.getSignaturePad();
        if (signaturePad) {
            signaturePad.fromData(pointGroups);
        }
    },
    /**
     * Loads a signature image from a base64 Data URL.
     * 
     * @param {String} dataUrl The data URL (e.g. "data:image/png;base64,...")
     * @param {Object} [options] Optional config for how the image is drawn:
     *  - {Number} ratio Scaling factor for the image (default: 1).
     *  - {Boolean} width Crop width to canvas width (default: true).
     *  - {Boolean} height Crop height to canvas height (default: true).
     *  - {Boolean} x, y Position offsets.
     */
    fromDataURL: function(dataUrl, options) {
        var signaturePad = this.getSignaturePad();
        if (signaturePad && Ext.isString(dataUrl)) {
            try {
                signaturePad.fromDataURL(dataUrl, options || {});
            } catch (e) {
                Ext.Logger.warn('Invalid data URL for SignaturePad');
            }
        }
    },
    /**
     * Triggers download of the signature image.
     * @param {String} filename Name without extension
     * @param {String} format 'png', 'jpeg', or 'webp'
     */
    downloadSignature: function(filename, format) {
        var me = this,
            dataURL, link, fmt, width, height, svg, bgColor, rawSVG;
        if (me.isEmpty()) {
            Ext.Logger.warn('No Signature');
            return;
        }
        filename = filename || me.defaultFileName;
        format = format || me.defaultFormat;
        fmt = format.toLowerCase();
        if (fmt === 'svg') {
            // Get plain SVG markup
            rawSVG = me.getSignaturePad().toSVG();
            // Get canvas dimensions
            width = me.signaturePad.canvas.width;
            height = me.signaturePad.canvas.height;
            // Pick background color from config (fallback = white)
            bgColor = me.getBackgroundColor ? me.getBackgroundColor() : (me.backgroundColor || 'white');
            // Remove any existing width/height/viewBox
            svg = rawSVG.replace(/\swidth="[^"]*"/, '').replace(/\sheight="[^"]*"/, '').replace(/\sviewBox="[^"]*"/, '');
            // Add width, height, viewBox
            svg = svg.replace(/<svg([^>]*)>/, '<svg$1 width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">');
            // Insert background rect with dynamic color
            svg = svg.replace(/(<svg[^>]*>)/, '$1<rect width="' + width + '" height="' + height + '" fill="' + bgColor + '"/>');
            // Encode SVG to data URL
            dataURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        } else {
            dataURL = me.getToDataURL('image/' + fmt);
        }
        if (dataURL) {
            link = document.createElement('a');
            link.download = filename + '.' + format;
            link.href = dataURL;
            link.click();
            link = null;
        }
    },
    /**
     *  @private
     * Ensures the color is a valid CSS color.
     * Adds '#' to hex codes if missing.
     * Returns normalized color if valid, else null.
     */
    normalizeColor: function(color) {
        if (Ext.isString(color) && /^[0-9A-Fa-f]{3,6}$/.test(color)) {
            return '#' + color;
        }
        return color;
    },
    /**
     * Updates the pen color on the SignaturePad instance.
     */
    updatePenColor: function(color) {
        var signaturePad = this.getSignaturePad(),
            data;
        if (signaturePad) {
            data = signaturePad.toData();
            signaturePad.penColor = color;
            signaturePad.clear();
            signaturePad.fromData(data);
        }
    },
    applyPenColor: function(color) {
        return this.normalizeColor(color);
    },
    /**
     * Updates the background color and clears the pad.
     */
    updateBackgroundColor: function(color) {
        var signaturePad = this.getSignaturePad(),
            data;
        if (signaturePad) {
            data = signaturePad.toData();
            signaturePad.backgroundColor = color;
            signaturePad.clear();
            signaturePad.fromData(data);
        }
    },
    applyBackgroundColor: function(color) {
        return this.normalizeColor(color);
    },
    /**
     * Undoes the last drawn stroke.
     */
    undo: function() {
        var me = this,
            signaturePad = me.getSignaturePad(),
            data;
        if (signaturePad) {
            data = signaturePad.toData();
            if (data.length) {
                me.redoBuffer.push(data.pop());
                signaturePad.fromData(data);
            }
        }
    },
    /**
     * Redoes the last undone stroke.
     */
    redo: function() {
        var me = this,
            signaturePad = me.getSignaturePad(),
            redoData, currentData;
        if (signaturePad && me.redoBuffer.length) {
            redoData = me.redoBuffer.pop();
            currentData = signaturePad.toData();
            currentData.push(redoData);
            signaturePad.fromData(currentData);
        }
    },
    /**
     * Updates both min and max width based on penStrokeWidth config.
     */
    updatePenStrokeWidth: function(width) {
        var signaturePad = this.getSignaturePad();
        if (signaturePad && Ext.isNumber(width)) {
            signaturePad.maxWidth = width;
            // Ensure minimum stroke width scales with canvas size
            signaturePad.minWidth = Math.max(1, width * this.getMinStrokeRatio());
            signaturePad.penStrokeWidth = width;
        }
    },
    /**
     * Cleans up SignaturePad instance and event listeners.
     */
    destroy: function() {
        var me = this,
            signaturePad = me.getSignaturePad();
        if (signaturePad) {
            me.signaturePad = null;
        }
        me.un('resize', me.resizeCanvas, me);
        me.redoBuffer = null;
        me.callParent();
        Ext.destroyMembers(me, 'canvas');
    }
});

