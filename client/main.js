async function main() {
 const response = await fetch('/client/lib/startup.json')
 if (!response.ok) {
  throw new Error(`HTTP ${response.status} when loading startup.json`)
 }
 const script = await response.json()
 // check types, throws an Error if invalid types
 const check_frame = await civil.type_check(script)
 console.log('passed type check', 'source:', civil.to_civilscript(script))
 // build and run the resulting JavaScript
 const return_value = await attach_javascript(civil.to_javascript(script))
 const return_type = check_frame.scratch.attention_type
 console.log('type:', return_type, '; value:', return_value)
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
