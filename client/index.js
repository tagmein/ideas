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

 function get_property(value, path) {
  for (const segment of path) {
   if (typeof value === 'undefined' || value === null) {
    throw new Error(`cannot read ${segment} of ${value}`)
   }
   if (typeof value[segment] === 'function') {
    value = value[segment].bind(value)
   } else {
    value = value[segment]
   }
  }
  return value
 }

 function get_property_type(type, path) {
  for (const segment of path) {
   if (typeof type === 'undefined' || type === null) {
    throw new Error(`cannot read '${segment}' of ${type}`)
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

 function set_property(context, set_path, value) {
  const last = set_path.pop()
  for (const segment of set_path) {
   if (typeof context === 'undefined' || context === null) {
    throw new Error(`cannot set '${segment}' of ${context}`)
   }
   context = context[segment]
  }
  context[last] = value
 }

 const ARGUMENTS = 0
 const GET = 1
 const RUN = 2
 const SET = 3
 const ARGUMENTS_ZERO = 4
 const ARGUMENTS_GET = 5
 const VALUE = 6
 main.scratch = {}
 main.intercept(SIGNAL_RUN, RunFunctionType, function (command, ...args) {
  switch (command) {
   case ARGUMENTS:
    main.scratch.arguments = args
    main.scratch.arguments_types = args.map((arg) => type_of(arg))
    break
   case ARGUMENTS_ZERO:
    main.scratch.arguments = []
    main.scratch.arguments_types = []
    break
   case ARGUMENTS_GET:
    const [arg_name, ...arg_path] = args
    main.scratch.arguments.push(get_property(main.value(arg_name), arg_path))
    main.scratch.arguments_types.push(
     get_property_type(main.type(arg_name), arg_path),
    )
    break
   case GET:
    const [name, ...path] = args
    main.scratch.attention = get_property(main.value(name), path)
    main.scratch.attention_type = get_property_type(main.type(name), path)
    break
   case SET:
    const [set_name, ...set_path] = args
    if (set_path.length === 0) {
     main.set(set_name, main.scratch.attention_type, main.scratch.attention)
    } else {
     const context = main.value(set_name)
     set_property(context, set_path, main.scratch.attention)
    }
    break
   case RUN:
    if (!main.scratch.attention_type.return) {
     throw new Error(
      `cannot RUN at type ${type_string(
       main.scratch.attention_type,
      )}, must be function with return type`,
     )
    }
    main.scratch.attention = main.scratch.attention(...main.scratch.arguments)
    main.scratch.attention_type = main.scratch.attention_type.return
    break
   case VALUE:
    main.scratch.attention = args[0]
    main.scratch.attention_type = type_of(main.scratch.attention)
    break
  }
 })

 main.signal(SIGNAL_RUN, ARGUMENTS, 'div')
 main.signal(SIGNAL_RUN, GET, 'window', 'document', 'createElement')
 main.signal(SIGNAL_RUN, RUN)
 main.signal(SIGNAL_RUN, SET, 'container')
 main.signal(SIGNAL_RUN, ARGUMENTS_ZERO)
 main.signal(SIGNAL_RUN, ARGUMENTS_GET, 'container')
 main.signal(SIGNAL_RUN, GET, 'window', 'document', 'body', 'appendChild')
 main.signal(SIGNAL_RUN, RUN)
 main.signal(SIGNAL_RUN, ARGUMENTS, 'style')
 main.signal(SIGNAL_RUN, GET, 'window', 'document', 'createElement')
 main.signal(SIGNAL_RUN, RUN)
 main.signal(SIGNAL_RUN, SET, 'global-style')
 main.signal(
  SIGNAL_RUN,
  VALUE,
  `
 .container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
 }
 `,
 )
 main.signal(SIGNAL_RUN, SET, 'global-style', 'textContent')
 main.signal(SIGNAL_RUN, ARGUMENTS_ZERO)
 main.signal(SIGNAL_RUN, ARGUMENTS_GET, 'global-style')
 main.signal(SIGNAL_RUN, GET, 'window', 'document', 'head', 'appendChild')
 main.signal(SIGNAL_RUN, RUN)
 main.signal(SIGNAL_RUN, ARGUMENTS, 'container')
 main.signal(SIGNAL_RUN, GET, 'container', 'classList', 'add')
 main.signal(SIGNAL_RUN, RUN)
})
