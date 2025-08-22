@echo off
setlocal

candle Product.wxs -ext WixUIExtension -o Product.wixobj
light Product.wixobj -ext WixUIExtension -o AplicacionPyme.msi

endlocal
