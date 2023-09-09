define(['./ideas', './known_signals'], function (
 { assert_type, global_type, typed_frame, TypedFunctionType },
 { SIGNAL_INTERRUPT, SIGNAL_PRINT, SIGNAL_PRINT_END },
) {
 const PrintFunctionType = { arguments: ['string'], return: 'undefined' }
 assert_type(TypedFunctionType, PrintFunctionType)

 const main = (globalThis.main = typed_frame())
 const MESSAGE = 'message'
 main.set(MESSAGE, 'string', 'Hello World')
 main.set('window', global_type, globalThis)
 main.intercept(SIGNAL_PRINT_END, PrintFunctionType, function (content) {
  console.log(content)
  return SIGNAL_INTERRUPT
 })
 main.intercept(SIGNAL_PRINT, PrintFunctionType, function (content) {
  console.log(content)
 })
 main.signal(SIGNAL_PRINT_END, main.value(MESSAGE))
})
