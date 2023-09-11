async function main() {
 const response = await fetch('/client/lib/startup.json')
 if (!response.ok) {
  throw new Error(`HTTP ${response.status} when loading startup.json`)
 }
 const script = await response.json()
 const check_frame = civil.type_check(script) // throws an Error if invalid types
 console.log(
  'type:',
  check_frame.scratch.attention_type,
  '; passed all type checks',
 )
 const compiled_js = civil.build(script)
 eval(compiled_js) // build and run the resulting JavaScript
}
main().catch((e) => console.error(e))
