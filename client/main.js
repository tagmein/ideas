async function main() {
 const response = await fetch('/client/lib/startup.json')
 if (!response.ok) {
  throw new Error(`HTTP ${response.status} when loading startup.json`)
 }
 const script = await response.json()
 // check types, throws an Error if invalid types
 const check_frame = await civil.type_check(script)
 console.log('passed type check ; source in civil script:')
 console.log(civil.escape_string(civil.to_civilscript(script)))
 // build and run the resulting JavaScript
 const return_value = await attach_javascript(
  civil.to_javascript(script, 2),
  globalThis,
 )
 const return_type = check_frame.scratch.attention_type
 console.log('type:', return_type, '; value:', return_value)
}
main()

globalThis.javascript_attach_resolve_reject = new Map()
globalThis.javascript_attach_scope = new Map()
let unique_varname = 0
function attach_javascript(source, scope = globalThis) {
 if (typeof scope !== 'object') {
  debugger
  throw new Error(`scope must be an object, got ${typeof scope}`)
 }
 const varname = `var${unique_varname++}`
 globalThis.javascript_attach_scope.set(varname, scope)
 return new Promise(function (resolve, reject) {
  javascript_attach_resolve_reject.set(varname, { resolve, reject })
  const padded_source = `(async function () {
 try {
  const scope = globalThis.javascript_attach_scope.get('${varname}')
  const resolution = await (
${source}
  )(scope)
  globalThis.javascript_attach_resolve_reject.get('${varname}').resolve(resolution) }
 catch (e) {
  globalThis.javascript_attach_resolve_reject.get('${varname}').reject(e)
 }
 finally {
  globalThis.javascript_attach_resolve_reject.delete('${varname}')
  globalThis.javascript_attach_scope.delete('${varname}')
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
