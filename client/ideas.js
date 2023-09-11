function Ideas(scope) {
 const { global_type, IsType, Type } = scope.ideas_global
 const SIGNAL_INTERRUPT = 'interrupt' // also found in known_signals

 const KNOWN_TYPE_STRINGS = new Set([
  'bigint',
  'boolean',
  'function',
  'number',
  'string',
  'symbol',
  'type',
  'undefined',
 ])

 function type_string(type) {
  if (typeof type === 'string') {
   return type
  }
  if (type[IsType] === 'Object') {
   return type.name
  }
  if (type[IsType] === 'Array') {
   return `Array<${type_string(type.items)}>`
  }
  if (type[IsType] === 'Function') {
   return `Function(${type.arguments
    .map(type_string)
    .join(', ')}):${type_string(type.return)}`
  }
  if (type[IsType] === 'Promise') {
   return `Promise<${type_string(type.fulfilled)}>`
  }
  throw new Error(`type '${type}' not implemented`)
 }

 function type_of(value) {
  if (value && Array.isArray(value)) {
   return {
    [IsType]: Type.Array,
    items: type_of(value[0]),
   }
  }
  const js_type = typeof value
  switch (js_type) {
   case 'bigint':
   case 'boolean':
   case 'function':
   case 'number':
   case 'string':
   case 'symbol':
   case 'undefined':
    return js_type
   case 'object':
    if (value[IsType] === 'Object') {
     return {
      [IsType]: Type.Object,
      name: 'type',
      properties: value,
     }
    }
    return {
     [IsType]: Type.Object,
     name: 'object',
     properties: Object.fromEntries(
      Object.entries(value).map(([key, value]) => {
       return [key, type_of(value)]
      }),
     ),
    }
   default:
    return 'unknown'
  }
 }

 const function_type = {
  [IsType]: Type.Object,
  name: 'typed_function',
  properties: {
   return: 'type',
   arguments: {
    [IsType]: Type.Array,
    items: 'type',
   },
  },
 }

 function typed_frame(type_map_source, interceptors_source, scratch_source) {
  const type_map = new Map(type_map_source)
  const interceptors = new Map(interceptors_source)
  const me = {
   clone() {
    return typed_frame(type_map, interceptors)
   },
   scratch: scratch_source ? Object.assign({}, scratch_source) : {},
   type_map,
   interceptors,
   forget(name) {
    type_map.delete(name)
   },
   type(name) {
    return type_map.get(name)
   },
   set(name, type, overwrite = false) {
    const known_type = me.type(name)
    // if type does not exist, set type and value
    // if type exists, and overwrite is false, throw error
    // if type exists, and overwrite is true, overwrite existing type
    if (known_type && !overwrite) {
     throw new Error(
      `no permission to overwrite variable ${name}<${known_type}>`,
     )
    }
    type_map.set(name, type)
   },
   intercept(signal_name, signal_handler_function_type, signal_handler) {
    let reason
    if (
     !is_a_valid(
      function_type,
      signal_handler_function_type,
      (_reason) => (reason = _reason),
     )
    ) {
     throw new Error(
      `<${JSON.stringify(
       signal_handler_function_type,
      )}> is not a valid typed function type (reason is ${
       reason ?? 'unknown'
      })`,
     )
    }
    if (!interceptors.has(signal_name)) {
     interceptors.set(signal_name, new Set())
    }
    interceptors
     .get(signal_name)
     .add({ signal_handler_function_type, signal_handler })
   },
   unintercept(signal_name, signal_handler) {
    if (interceptors.has(signal_name)) {
     const interceptors_set = interceptors.get(signal_name)
     for (const c of interceptors_set.values()) {
      if (c.signal_handler === signal_handler) {
       interceptors_set.delete(c)
       return true // ok, i unintercepted the signal handler
      }
     }
    }
    return false // i didn't have any record of that
   },
   signal(signal_name, ...extra) {
    if (interceptors.has(signal_name)) {
     for (const interceptor of interceptors.get(signal_name)) {
      if (
       !interceptor.signal_handler_function_type.arguments[IsType] === 'Array'
      ) {
       for (const index in interceptor.signal_handler_function_type.arguments) {
        let reason
        if (
         !is_a_valid(
          interceptor.signal_handler_function_type.arguments[index],
          extra[index],
          (_reason) => (reason = _reason),
         )
        ) {
         throw new Error(
          `when handling signal <${signal_name}> at index ${index}, expecting <${type_string(
           interceptor.signal_handler_function_type.arguments[index],
          )}> but got <${type_of(extra[index])}> (reason is ${
           reason ?? 'unknown'
          })`,
         )
        }
       }
      }
      const raise_signal = interceptor.signal_handler(me, ...extra)
      if (raise_signal === SIGNAL_INTERRUPT) {
       break
      }
     }
    }
   },
  }
  return me
 }

 function is_a_valid(type, value, failure_reason_callback) {
  if (type === global_type) {
   return value === globalThis
  }
  switch (type) {
   case 'type':
    if (value?.[IsType] === 'Promise') {
     if (
      !is_a_valid('type', value.fulfilled, (x) =>
       failure_reason_callback(`fullfilled: ${x}`),
      )
     ) {
      return false
     }
     return true
    }
    if (value?.[IsType] === 'Function') {
     // todo test function arguments types
     if (
      !is_a_valid('type', value.return, (x) =>
       failure_reason_callback(`return: ${x}`),
      )
     ) {
      return false
     }
     return true
    }
    if (
     typeof value === 'object' &&
     (value[IsType] === 'Object' || value[IsType] === 'Array')
    ) {
     return true
    }
    const is_valid_type = KNOWN_TYPE_STRINGS.has(value)

    if (!is_valid_type) {
     failure_reason_callback?.(
      'was expecting a known type, or a type object, or a type array',
     )
    }
    return is_valid_type
   case 'bigint':
   case 'boolean':
   case 'function':
   case 'number':
   case 'string':
   case 'symbol':
   case 'undefined':
    const is_valid_js_type = typeof value === type
    if (!is_valid_js_type) {
     failure_reason_callback?.(
      `expecting ${type_string(type)}, got ${type_string(type_of(value))}`,
     )
    }
    return is_valid_js_type
   default:
    if (type && type[IsType] === 'Array') {
     if (!type.items) {
      throw new Error('array type without items specified')
     }
     if (value && value[IsType] === 'Array') {
      return type.items === 'type'
     } else if (!Array.isArray(value)) {
      failure_reason_callback?.(
       `expected array, got ${type_string(type_of(value))}`,
      )
      return false
     }
     return value.every(function (item, index) {
      // does the item match the type of type.items
      const array_item_is_valid = is_a_valid(type.items, item)
      if (!array_item_is_valid) {
       failure_reason_callback?.(
        `type mismatch at array index ${index}: ${type_string(
         type_of(item),
        )} vs ${type_string(type.items)}`,
       )
      }
      return array_item_is_valid
     })
    }
    if (type && type[IsType] === 'Function') {
     return typeof value === 'function' // todo (?) assuming types currently
    } else if (type && type[IsType] === 'Object') {
     if (!value) {
      failure_reason_callback?.(
       `<${type_of(value)}> is not suitable for <${type.name}>`,
      )
      return false
     }
     return Object.entries(type.properties).every(function ([
      property_name,
      property_type,
     ]) {
      let rreason
      const property_is_valid = is_a_valid(
       property_type,
       value[property_name],
       (_reason) => (rreason = _reason),
      )
      if (!property_is_valid) {
       failure_reason_callback?.(
        `property '${property_name}': <${type_string(
         type_of(value[property_name]),
        )}> not suitable for <${property_type}> (reason is ${
         rreason ?? 'unknown'
        })`,
       )
      }
      return property_is_valid
     })
    } else {
     failure_reason_callback?.(`<${type}> is not yet implemented`)
     console.log(type)
     return false
    }
  }
 }

 function assert_type(type, value) {
  let assert_reason
  if (!is_a_valid(type, value, (_reason) => (assert_reason = _reason))) {
   throw new Error(
    `type assertion failed: ${type_string(type_of(value))} ${type_string(
     type,
    )} (reason is ${assert_reason})`,
   )
  }
 }

 function get_property_type(type, path) {
  for (const segment of path) {
   if (typeof type === 'undefined' || type === null) {
    throw new Error(`cannot read '${segment}' of ${type}`)
   }
   if (type?.[ideas.IsType] === 'Promise') {
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

 const ideas = {
  assert_type,
  function_type,
  get_property_type,
  global_type,
  is_a_valid,
  IsType,
  Type,
  type_of,
  type_string,
  typed_frame,
 }

 return ideas
}

if (typeof module === 'object') {
 module.exports = Ideas
} else {
 globalThis.ideas = Ideas(globalThis)
}
