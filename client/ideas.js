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
 if (type[IsTypeObject]) {
  return type.name
 }
 if (type[IsTypeArray]) {
  return `Array<${type_string(type.items)}>`
 }
 if (type[IsTypeFunction]) {
  return `Function(${type.arguments.map(type_string).join(', ')}):${type_string(
   type.return,
  )}`
 }
 if (type[IsTypePromise]) {
  return `Promise<${type_string(type.fulfilled)}>`
 }
 throw new Error(`type '${type}' not implemented`)
}

const IsTypeArray = 'IsTypeArray'
const IsTypeFunction = 'IsTypeFunction'
const IsTypeObject = 'IsTypeObject'
const IsTypePromise = 'IsTypePromise'

function type_of(value) {
 if (value && Array.isArray(value)) {
  return {
   [IsTypeArray]: true,
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
   if (value[IsTypeObject]) {
    return {
     [IsTypeObject]: true,
     name: 'type',
     properties: value,
    }
   }
   return {
    [IsTypeObject]: true,
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

const TypedFunctionType = {
 [IsTypeObject]: true,
 name: 'typed_function',
 properties: {
  return: 'type',
  arguments: {
   [IsTypeArray]: true,
   items: 'type',
  },
 },
}

function typed_frame() {
 const type_map = new Map()
 const interceptors = new Map()
 const me = {
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
     TypedFunctionType,
     signal_handler_function_type,
     (_reason) => (reason = _reason),
    )
   ) {
    throw new Error(
     `<${JSON.stringify(
      signal_handler_function_type,
     )}> is not a valid typed function type (reason is ${reason ?? 'unknown'})`,
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
  async signal(signal_name, ...extra) {
   if (interceptors.has(signal_name)) {
    for (const interceptor of interceptors.get(signal_name)) {
     if (!interceptor.signal_handler_function_type.arguments[IsTypeArray]) {
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
     const raise_signal = await interceptor.signal_handler(...extra)
     if (raise_signal === SIGNAL_INTERRUPT) {
      break
     }
    }
   }
  },
 }
 return me
}

const dom_token_list_type = {
 [IsTypeObject]: true,
 name: 'DOMTokenList',
 properties: {
  add: {
   [IsTypeFunction]: true,
   arguments: ['string'],
   return: 'undefined',
  },
  remove: {
   [IsTypeFunction]: true,
   arguments: ['string'],
   return: 'undefined',
  },
 },
}

const element_type = {
 [IsTypeObject]: true,
 name: 'Element',
 properties: {
  appendChild: {
   [IsTypeFunction]: true,
   arguments: [],
   return: 'undefined',
  },
  classList: dom_token_list_type,
  tagName: 'string',
 },
}

element_type.properties.appendChild.arguments[0] = element_type

const create_element_function_type = {
 [IsTypeFunction]: true,
 arguments: ['string'],
 return: element_type,
}

const document_type = {
 [IsTypeObject]: true,
 name: 'Document',
 properties: {
  body: element_type,
  createElement: create_element_function_type,
  head: element_type,
 },
}

const response_type = {
 [IsTypeObject]: true,
 properties: {
  json: {
   [IsTypeFunction]: true,
   arguments: [],
   return: {
    [IsTypePromise]: true,
    fulfilled: 'object',
   },
  },
 },
}

const console_type = {
 [IsTypeObject]: true,
 properties: {
  log: {
   [IsTypeFunction]: true,
   arguments: ['string'],
   return: 'undefined',
  },
 },
}

const fetch_type = {
 [IsTypeFunction]: true,
 arguments: ['string'],
 return: {
  [IsTypePromise]: true,
  fulfilled: response_type,
 },
}

const frame_type = {
 [IsTypeObject]: true,
 properties: {
  signal: {
   [IsTypeFunction]: true,
   arguments: [],
   return: {
    [IsTypePromise]: true,
    final: 'undefined',
   },
  },
 },
}

const global_type = (globalThis.ideas_global_type = {
 [IsTypeObject]: true,
 name: 'Window',
 properties: {
  console: console_type,
  document: document_type,
  fetch: fetch_type,
  main: frame_type,
 },
})
function is_a_valid(type, value, failure_reason_callback) {
 if (type === global_type) {
  return value === globalThis
 }
 switch (type) {
  case 'type':
   if (value?.[IsTypePromise]) {
    if (
     !is_a_valid('type', value.fulfilled, (x) =>
      failure_reason_callback(`fullfilled: ${x}`),
     )
    ) {
     return false
    }
    return true
   }
   if (value?.[IsTypeFunction]) {
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
    (value[IsTypeObject] || value[IsTypeArray])
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
   if (type && type[IsTypeArray]) {
    if (!type.items) {
     throw new Error('array type without items specified')
    }
    // string[] === DOMTokenList
    if (value?.constructor === DOMTokenList && type.items === 'string') {
     return true
    }
    if (value && value[IsTypeArray]) {
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
   if (type && type[IsTypeFunction]) {
    return typeof value === 'function' // todo (?) assuming types currently
   } else if (type && type[IsTypeObject]) {
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

assert_type(TypedFunctionType, create_element_function_type)

if (typeof globalThis.define === 'function') {
 globalThis.define([], function () {
  return {
   assert_type,
   global_type,
   typed_frame,
   TypedFunctionType,
  }
 })
}
