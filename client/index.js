define(['./ideas', './known_signals'], function (
 { assert_type, global_type, typed_frame, TypedFunctionType },
 { SIGNAL_INTERRUPT, SIGNAL_PRINT, SIGNAL_PRINT_END, SIGNAL_RUN },
) {
 const PrintFunctionType = {
  [IsTypeFunction]: true,
  arguments: ['string'],
  return: 'undefined',
 }
 assert_type(TypedFunctionType, PrintFunctionType)
 const RunFunctionType = {
  [IsTypeFunction]: true,
  arguments: { [IsTypeArray]: true, items: 'type' },
  return: 'type',
 }

 const main = (globalThis.main = typed_frame())
 main.set('window', global_type, globalThis)
 main.intercept(SIGNAL_PRINT_END, PrintFunctionType, function (content) {
  console.log(content)
  return SIGNAL_INTERRUPT
 })
 main.intercept(SIGNAL_PRINT, PrintFunctionType, function (content) {
  console.log(content)
 })

 function get_property_type(type, path) {
  for (const segment of path) {
   if (typeof type === 'undefined' || type === null) {
    throw new Error(`cannot read '${segment}' of ${type}`)
   }
   if (type?.[IsTypePromise]) {
    throw new Error(
     `cannot read '${segment}' of promise, you may want to first await`,
    )
   }
   if (!('properties' in type)) {
    throw new Error(
     `type ${type_string(
      type,
     )} does not have properties, so that we might read '${segment}'`,
    )
   }
   type = type.properties[segment]
  }
  return type
 }

 const ADVANCE = 0
 const ARGUMENTS = 1
 const ARGUMENTS_GET = 2
 const ARGUMENTS_ZERO = 3
 const GET = 4
 const RUN = 5
 const SET = 6
 const VALUE = 7
 const AWAIT = 8
 const FOR_EACH = 9
 const ITERATOR_VALUE = 10
 const ITERATOR_INDEX = 11
 const ARGUMENTS_CONCAT = 12
 main.scratch = {}
 main.intercept(SIGNAL_RUN, RunFunctionType, async function (command, ...args) {
  switch (command) {
   case FOR_EACH:
    if (!main.scratch.attention_type[IsTypeArray]) {
     throw new Error(`for each: attention type is not an array`)
    }
    // todo validate inner block of code in args[0]
    break
   case ADVANCE:
    main.scratch.attention_type = get_property_type(
     main.scratch.attention_type,
     args,
    )
    break
   case ARGUMENTS:
    main.scratch.arguments_types = args.map((arg) => type_of(arg))
    break
   case ARGUMENTS_CONCAT:
    if (!main.scratch.attention_type[IsTypeArray]) {
     throw new Error(`arguments concat: attention type is not an array`)
    }
    main.scratch.argument_types = main.scratch.argument_types.concat(
     main.scratch.attention_type,
    )
    break
   case ARGUMENTS_ZERO:
    main.scratch.arguments_types = []
    break
   case ARGUMENTS_GET:
    const [arg_name, ...arg_path] = args
    main.scratch.arguments_types.push(
     get_property_type(main.type(arg_name), arg_path),
    )
    break
   case AWAIT:
    if (!main.scratch.attention_type) {
     return // todo why is this block needed
    }
    if (!main.scratch.attention_type[IsTypePromise]) {
     debugger
     throw new Error(
      `can only await after promise, got ${type_string(
       main.scratch.attention_type,
      )}`,
     )
    }
    main.scratch.attention_type = main.scratch.attention_type.fulfilled
    break
   case GET:
    const [name, ...path] = args
    main.scratch.attention_type = get_property_type(main.type(name), path)
    break
   case SET:
    if (args.length === 1) {
     main.set(args[0], main.scratch.attention_type)
    }
    // todo - type check deep property assignement
    break
   case RUN:
    const current_attention_type = main.scratch.attention_type
    if (!current_attention_type.return) {
     throw new Error(
      `cannot RUN at type ${type_string(
       current_attention_type,
      )}, must be function with return type`,
     )
    }
    const [override_return_type] = args
    if (override_return_type) {
     if (!is_a_valid('type', override_return_type)) {
      throw new Error(
       `return type override is not a valid type, got ${override_return_type}`,
      )
     }
     main.scratch.attention_type = override_return_type
    } else {
     main.scratch.attention_type = current_attention_type.return
    }
    break
   case VALUE:
    main.scratch.attention_type = type_of(args[0])
    break
  }
 })
 async function next() {
  const response = await fetch('/client/startup.json')
  if (response.ok) {
   const script = await response.json()
   for (const line of script) {
    await main.signal(SIGNAL_RUN, ...line)
   }
  }
 }
 next().catch((e) => console.error(e))
})
