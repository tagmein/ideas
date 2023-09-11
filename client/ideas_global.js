globalThis.ideas_global = (function () {
 const IsType = 'IsType'

 const Type = {
  Array: 'Array',
  Function: 'Function',
  Object: 'Object',
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
    [IsType]: Type.Function,
    arguments: [],
    return: {
     [IsType]: Type.Promise,
     fulfilled: 'object',
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
     final: 'undefined',
    },
   },
  },
 }

 const global_type = {
  [IsType]: Type.Object,
  name: 'Window',
  properties: {
   console: console_type,
   document: document_type,
   fetch: fetch_type,
   main: frame_type,
  },
 }

 return { global_type, IsType, Type }
})()
