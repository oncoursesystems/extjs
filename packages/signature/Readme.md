# signature - Read Me
Visit the official repo:
👉 https://github.com/szimek/signature_pad

# Locate the Library
The SignaturePad library is included in this project at:
ext/packages/signature/signature_pad.min.js

# How to update the signature pad library to use the latest version
Download the latest release signature_pad.umd.min.js from https://www.jsdelivr.com/package/npm/signature_pad?tab=files.
Replace your existing content in signature_pad.min.js with the new one.

# Check for API Changes
The wrapper relies on these methods from SignaturePad:
clear()
fromData(data)
toData()
toDataURL()
isEmpty()

# Events: 
beginStroke, endStroke (newer versions may rename these)

If the API has changed:
Update Ext.signature.Signature methods that call into SignaturePad.

For example, if fromData was renamed to loadData, update the wrapper accordingly.