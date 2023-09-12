async function main() {
 const response = await fetch('/client/lib/startup.json')
 if (!response.ok) {
  throw new Error(`HTTP ${response.status} when loading startup.json`)
 }
 const script = await response.json()
 const check_frame = await civil.type_check(script) // throws an Error if invalid types
 console.log('passed type check', 'source:', civil.to_civilscript(script))
 console.log(
  'return type:',
  check_frame.scratch.attention_type,
  'return value:',
  await attach_javascript(civil.to_javascript(script)), // build and run the resulting JavaScript
 )
}
main()

globalThis.javascript_attach_resolve_reject = new Map()
let unique_varname = 0
function attach_javascript(source) {
 const varname = `var${unique_varname++}`
 return new Promise(function (resolve, reject) {
  javascript_attach_resolve_reject.set(varname, { resolve, reject })
  const padded_source = `(async function () {
 try {
  const resolution = await ${source}
  globalThis.javascript_attach_resolve_reject.get('${varname}').resolve(resolution) }
 catch (e) {
  globalThis.javascript_attach_resolve_reject.get('${varname}').reject(e)
 }
 finally {
  globalThis.javascript_attach_resolve_reject.delete('${varname}')
 }
})()
  `.trim()
  const script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute(
   'src',
   `data:text/javascript;base64,${btoa(padded_source)}`,
  )
  document.head.appendChild(script)
 })
}
