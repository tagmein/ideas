define(['./ideas', './known_signals'], function (
 { typed_frame },
 { SIGNAL_INTERRUPT, SIGNAL_PRINT },
) {
 const main = (globalThis.main = typed_frame())
 const MESSAGE = 'message'
 main.set(MESSAGE, 'string', 'Hello World')
 main.intercept(
  SIGNAL_PRINT,
  { arguments: ['string'], return: 'undefined' },
  function (extra) {
   console.log(extra)
   return SIGNAL_INTERRUPT
  },
 )
 main.signal(SIGNAL_PRINT, main.value(MESSAGE))
})
