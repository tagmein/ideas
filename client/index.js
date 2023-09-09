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
 main.intercept(SIGNAL_PRINT_END, PrintFunctionType, function (extra) {
  console.log(extra)
  return SIGNAL_INTERRUPT
 })
 main.intercept(
  SIGNAL_PRINT,
  { arguments: ['string'], return: 'undefined' },
  function (extra) {
   console.log(extra)
  },
 )
 main.signal(SIGNAL_PRINT_END, main.value(MESSAGE))
})
