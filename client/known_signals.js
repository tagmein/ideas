const known_signals = {
 SIGNAL_INTERRUPT: 'interrupt',
 SIGNAL_PRINT: 'print',
 SIGNAL_PRINT_END: 'print+interrupt',
}

if (typeof globalThis.define === 'function') {
 globalThis.define([], function () {
  return known_signals
 })
}
