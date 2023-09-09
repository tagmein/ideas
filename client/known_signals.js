const known_signals = {
 SIGNAL_INTERRUPT: 'interrupt',
 SIGNAL_PRINT: 'print',
}

if (typeof globalThis.define === 'function') {
 globalThis.define([], function () {
  return known_signals
 })
}
