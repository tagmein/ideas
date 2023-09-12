function IdeasGlobal() {
 const IsType = 'IsType'

 const Type = {
  Array: 'Array',
  CivilScriptString: 'CivilScriptString',
  Function: 'Function',
  JavaScriptString: 'JavaScriptString',
  Object: 'Object',
  Optional: 'Optional',
  Promise: 'Promise',
 }

 const dom_token_list_type = {
  [IsType]: Type.Object,
  name: 'DOMTokenList',
  properties: {
   add: {
    [IsType]: Type.Function,
    arguments: ['string'],
    return: 'undefined',
   },
   remove: {
    [IsType]: Type.Function,
    arguments: ['string'],
    return: 'undefined',
   },
  },
 }

 const element_type = {
  [IsType]: Type.Object,
  name: 'Element',
  properties: {
   appendChild: {
    [IsType]: Type.Function,
    arguments: [],
    return: 'undefined',
   },
   classList: dom_token_list_type,
   tagName: 'string',
  },
 }

 element_type.properties.appendChild.arguments[0] = element_type

 const create_element_function_type = {
  [IsType]: Type.Function,
  arguments: ['string'],
  return: element_type,
 }

 const document_type = {
  [IsType]: Type.Object,
  name: 'Document',
  properties: {
   body: element_type,
   createElement: create_element_function_type,
   head: element_type,
  },
 }

 const response_type = {
  [IsType]: Type.Object,
  properties: {
   json: {
    code_source_json: true,
    [IsType]: Type.Function,
    arguments: [],
    return: {
     [IsType]: Type.Promise,
     fulfilled: {
      [IsType]: Type.Object,
      code_source: 'fetch_path',
     },
    },
   },
  },
 }

 const console_type = {
  [IsType]: Type.Object,
  properties: {
   log: {
    [IsType]: Type.Function,
    arguments: ['string'],
    return: 'undefined',
   },
  },
 }

 const fetch_type = {
  [IsType]: Type.Function,
  arguments: ['string'],
  fetch_argument_path: 0,
  return: {
   [IsType]: Type.Promise,
   fulfilled: response_type,
  },
 }

 const frame_type = {
  [IsType]: Type.Object,
  properties: {
   signal: {
    [IsType]: Type.Function,
    arguments: [],
    return: {
     [IsType]: Type.Promise,
     fulfilled: 'undefined',
    },
   },
  },
 }

 const eval_type = {
  [IsType]: Type.Function,
  arguments: ['string'],
  return: 'unknown',
 }

 const attach_javascript_type = {
  [IsType]: Type.Function,
  arguments: [{ [IsType]: Type.JavaScriptString }],
  return: 'code_type_of_arg_0',
 }

 const global_type = {
  [IsType]: Type.Object,
  name: 'Window',
  properties: {
   attach_javascript: attach_javascript_type,
   console: console_type,
   document: document_type,
   eval: eval_type,
   fetch: fetch_type,
   main: frame_type,
  },
 }

 return { global_type, IsType, Type }
}

if (typeof module === 'object') {
 module.exports = IdeasGlobal
} else {
 globalThis.ideas_global = IdeasGlobal()
}
