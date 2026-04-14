# qrcode - Read Me

Visit the official repositories:

**QR Code Generator:**
👉 https://github.com/davidshimjs/qrcodejs

**QR Code Reader:**
👉 https://github.com/mebjas/html5-qrcode

# Locate the Libraries

The QR Code libraries are included in this project at:

- **QR Code Generator:** `ext/packages/qrcode/qrcode.min.js`
- **QR Code Reader:** `ext/packages/qrcode/html5-qrcode.min.js`

# How to Update the Libraries to Use the Latest Version

## QR Code Generator (qrcode.min.js)

1. Download the latest release `qrcode.min.js` from https://github.com/kazuhikoarase/qrcode-generator or https://github.com/davidshimjs/qrcodejs/blob/master/qrcode.min.js
2. Replace your existing content in `qrcode.min.js` with the new one

## QR Code Reader (html5-qrcode.min.js)

1. Download the latest release `html5-qrcode.min.js` from https://www.jsdelivr.com/package/npm/html5-qrcode?tab=files or https://github.com/mebjas/html5-qrcode/blob/master/minified/html5-qrcode.min.js
2. Replace your existing content in `html5-qrcode.min.js` with the new one

# Check for API Changes

## QR Code Generator API

The wrapper (`Ext.qrcode.generator.QRCode`) relies on these methods and properties from the qrcode library:

**Constructor:**
- `qrcode(typeNumber, errorCorrectionLevel)` - Creates a QR code instance

**Methods:**
- `addData(data)` - Adds data to be encoded in the QR code
- `make()` - Generates the QR code matrix
- `getModuleCount()` - Returns the number of modules (rows/columns) in the QR matrix
- `isDark(row, col)` - Checks if a specific module is dark (returns boolean)
- `createSvgTag(options)` - Creates an SVG representation of the QR code

**Error Correction Levels:**
- `L` - Low (~7% correction)
- `M` - Medium (~15% correction) - default
- `Q` - Quartile (~25% correction)
- `H` - High (~30% correction)

## QR Code Reader API

The wrapper (`Ext.qrcode.reader.QRCodeReader`) relies on these methods and properties from Html5Qrcode:

**Constructor:**
- `new Html5Qrcode(elementId, config)`

**Static Methods:**
- `Html5Qrcode.getCameras()` - Get list of available cameras (returns Promise)

**Instance Methods:**
- `start(cameraId, configuration, onSuccessCallback, onErrorCallback)` - Start camera scanning
- `stop()` - Stop the scanner (returns Promise)
- `clear()` - Clear the scanner instance
- `scanFile(file, showImage)` - Scan QR code from an image file (returns Promise)

**Configuration Options:**
- `fps` - Frames per second for scanning (default: 10)
- `qrbox` - Size of the scanning box in pixels (default: 250)
- `aspectRatio` - Aspect ratio of the video feed (default: 1.1)

**Callbacks:**
- `onSuccessCallback(decodedText, decodedResult)` - Called when QR code is successfully decoded
- `onErrorCallback(errorMessage)` - Called when scanning encounters an error

# If the API Has Changed

## For QR Code Generator:

Update `Ext.qrcode.generator.QRCode` methods that call into the qrcode library:

**For example:**

- If `qrcode(typeNumber, errorCorrectionLevel)` constructor signature changes, update the initialization in `generate()` method
- If `addData()` was renamed to `setData()`, update the `generate()` method accordingly
- If `make()` method changes, update the QR generation flow in `generate()`
- If `getModuleCount()` or `isDark()` methods change, update the canvas drawing logic in `generate()`
- If `createSvgTag()` method signature or options change, update the `downloadAsSVG()` method
- If new error correction levels are added or naming changes, update the `errorCorrectionLevel` config handling
- If color/styling options are added to the library, consider exposing them via `qrColor` and `qrBackgroundColor` configs

## For QR Code Reader:

Update `Ext.qrcode.reader.QRCodeReader` methods that call into the Html5Qrcode library:

**For example:**

- If `Html5Qrcode.getCameras()` signature changes, update the camera detection logic in `startScanner()`
- If `start()` method parameters change, update the scanner initialization accordingly
- If `scanFile()` method signature changes, update the `scanQRFile()` method
- If `stop()` or `clear()` methods change, update `stopScanner()` and `closeScannerWindow()` methods
- If new configuration options are added, consider exposing them via the `scannerConfig` property
- If callback structure for `onSuccessCallback` or `onErrorCallback` changes, update the corresponding handlers

Always test both QR code generation (including canvas rendering and SVG export) and scanning functionality (camera and file upload) after updating the libraries.