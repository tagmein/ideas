function Civil(scope) {
 const civil_type = {
  [scope.ideas.IsType]: scope.ideas.Type.Object,
  properties: {
   to_civilscript: {
    [scope.ideas.IsType]: scope.ideas.Type.Function,
    arguments: ['code'],
    return: 'civilscriptstring',
   },
   to_javascript: {
    [scope.ideas.IsType]: scope.ideas.Type.Function,
    arguments: ['code'],
    return: { [scope.ideas.IsType]: scope.ideas.Type.JavaScriptString },
   },
   type_check: {
    [scope.ideas.IsType]: scope.ideas.Type.Function,
    arguments: [
     'code',
     { [scope.ideas.IsType]: scope.ideas.Type.Optional, type: 'frame' },
    ],
    return: 'frame',
   },
  },
 }

 scope.ideas_global.global_type.properties.civil = civil_type

 const INSTRUCTION = {
  ADVANCE: 0,
  ARGUMENTS: 1,
  ARGUMENTS_GET: 2,
  ARGUMENTS_ZERO: 3,
  GET: 4,
  RUN: 5,
  SET: 6,
  VALUE: 7,
  AWAIT: 8,
  FOR_EACH: 9,
  ITERATOR_VALUE: 10,
  ITERATOR_INDEX: 11,
  ARGUMENTS_CONCAT: 12,
  ARGUMENTS_PUSH: 13,
  CREATE_FUNCTION: 14,
 }

 const SIGNAL = {
  INTERRUPT: 'interrupt',
  PRINT_END: 'print+interrupt',
  PRINT: 'print',
  RUN: 'run',
 }

 const PrintFunctionType = {
  [scope.ideas.IsType]: scope.ideas.Type.Function,
  arguments: ['string'],
  return: 'undefined',
 }

 scope.ideas.assert_type(scope.ideas.function_type, PrintFunctionType)

 const RunFunctionType = {
  [scope.ideas.IsType]: scope.ideas.Type.Function,
  arguments: { [scope.ideas.IsType]: 'Array', items: 'type' },
  return: 'type',
 }

 scope.ideas.assert_type(scope.ideas.function_type, RunFunctionType)

 const base_frame = (globalThis.base_frame = scope.ideas.typed_frame())
 base_frame.set('window', scope.ideas.global_type, globalThis)

 base_frame.intercept(
  SIGNAL.PRINT_END,
  PrintFunctionType,
  function (_, content) {
   console.log(content)
   return SIGNAL.INTERRUPT
  },
 )

 base_frame.intercept(SIGNAL.PRINT, PrintFunctionType, function (_, content) {
  console.log(content)
 })

 base_frame.scratch = {}
 base_frame.intercept(
  SIGNAL.RUN,
  RunFunctionType,
  async function (frame, command, ...args) {
   switch (command) {
    case INSTRUCTION.ITERATOR_VALUE:
     frame.scratch.attention_type = frame.scratch.iterator_type
     break
    case INSTRUCTION.ITERATOR_INDEX:
     frame.scratch.attention_type = 'number'
     break
    case INSTRUCTION.FOR_EACH:
     if (!frame.scratch.attention_type[scope.ideas.IsType] === 'Array') {
      throw new Error(`for each: attention type is not an array`)
     }
     frame.scratch.iterator_type = frame.scratch.attention_type.items
     // todo validate inner block of code in args[0]
     break
    case INSTRUCTION.ADVANCE:
     frame.scratch.attention_type = scope.ideas.get_property_type(
      frame.scratch.attention_type,
      args,
     )
     if (frame.scratch.attention) {
      const property = frame.scratch.attention[args[0]]
      frame.scratch.attention =
       typeof property === 'function'
        ? property.bind(frame.scratch.attention)
        : property
     }
     break
    case INSTRUCTION.ARGUMENTS:
     frame.scratch.arguments_types = args.map((arg) => scope.ideas.type_of(arg))
     frame.scratch.arguments_values = args.slice(0)
     break
    case INSTRUCTION.ARGUMENTS_CONCAT:
     if (!frame.scratch.attention_type[scope.ideas.IsType] === 'Array') {
      throw new Error(`arguments concat: attention type is not an array`)
     }
     frame.scratch.arguments_types = frame.scratch.arguments_types.concat(
      frame.scratch.attention_type,
     )
     frame.scratch.arguments_values.push(undefined)
     break
    case INSTRUCTION.ARGUMENTS_PUSH:
     if (!Array.isArray(frame.scratch.arguments_types)) {
      frame.scratch.arguments_types = []
      frame.scratch.arguments_values = []
     }
     frame.scratch.arguments_types.push(frame.scratch.attention_type)
     frame.scratch.arguments_values.push(frame.scratch.attention)
     break
    case INSTRUCTION.ARGUMENTS_ZERO:
     frame.scratch.arguments_types = []
     frame.scratch.arguments_values = []
     break
    case INSTRUCTION.ARGUMENTS_GET:
     const [arg_name, ...arg_path] = args
     frame.scratch.arguments_types.push(
      scope.ideas.get_property_type(frame.type(arg_name), arg_path),
     )
     frame.scratch.arguments_values.push(undefined)
     break
    case INSTRUCTION.AWAIT:
     if (!frame.scratch.attention_type) {
      return // todo why is this block needed
     }
     if (!frame.scratch.attention_type[scope.ideas.IsType] === 'Promise') {
      throw new Error(
       `can only await after promise, got ${ideas.type_string(
        frame.scratch.attention_type,
       )}`,
      )
     }
     frame.scratch.attention_type = frame.scratch.attention_type.fulfilled
     break
    case INSTRUCTION.GET:
     const [name, ...path] = args
     frame.scratch.attention_type = scope.ideas.get_property_type(
      frame.type(name),
      path,
     )
     break
    case INSTRUCTION.SET:
     if (args.length === 1) {
      frame.set(args[0], frame.scratch.attention_type)
     }
     // todo - type check deep property assignement
     break
    case INSTRUCTION.RUN:
     if (typeof frame.scratch.attention === 'function') {
      frame.scratch.attention = await frame.scratch.attention()
     }
     const current_attention_type = frame.scratch.attention_type
     if (!current_attention_type.return) {
      throw new Error(
       `cannot RUN at type ${scope.ideas.type_string(
        current_attention_type,
       )}, must be function with return type`,
      )
     }
     if (typeof frame.scratch.attention_type.fetch_argument_path === 'number') {
      frame.scratch.fetch_path = frame.scratch.arguments_values[0]
      frame.scratch.attention = await fetch(frame.scratch.fetch_path)
     }
     const [override_return_type] = args
     if (override_return_type) {
      if (!scope.ideas.is_a_valid('type', override_return_type)) {
       throw new Error(
        `return type override is not a valid type, got ${override_return_type}`,
       )
      }
      if (override_return_type.code_source) {
       if (override_return_type.code_source === 'fetch_path') {
        override_return_type.code_source = frame.scratch.fetch_path
       }
      }
      if (
       override_return_type[scope.ideas.IsType] === scope.ideas.Type.Promise
      ) {
       frame.scratch.attention_type = override_return_type.fulfilled
      } else {
       frame.scratch.attention_type = override_return_type
      }
     } else {
      if (current_attention_type.return === 'code_type_of_arg_0') {
       frame.scratch.attention_type = (
        await type_check(frame.scratch.arguments_values[0])
       ).scratch.attention_type
      } else if (
       current_attention_type.return[scope.ideas.IsType] ===
       scope.ideas.Type.Promise
      ) {
       frame.scratch.attention_type = current_attention_type.return.fulfilled
      } else {
       frame.scratch.attention_type = current_attention_type.return
      }
      frame.scratch.arguments_values = []
      frame.scratch.arguments_types = []
      if (frame.scratch.attention_type.code_source) {
       if (frame.scratch.attention_type.code_source === 'fetch_path') {
        frame.scratch.attention_type.code_source = frame.scratch.fetch_path
       }
      }
     }
     break
    case INSTRUCTION.VALUE:
     frame.scratch.attention_type = scope.ideas.type_of(args[0])
     break
    case INSTRUCTION.CREATE_FUNCTION:
     const [argument_names, function_code] = args
     frame.scratch.attention_type = {
      [scope.ideas.IsType]: scope.ideas.Type.Function,
      arguments: argument_names.map(() => 'unknown'),
      return: (await type_check(function_code)).scratch.attention_type,
     }
     break
   }
   // console.log('ARGS', args.slice(0), Object.assign({}, frame.scratch))
  },
 )

 async function type_check(script, context = base_frame) {
  const frame = context.clone()
  for (const line of script) {
   await frame.signal(SIGNAL.RUN, ...line)
  }
  if (!frame.scratch.attention_type) {
   throw new Error('script produced no type')
  }
  return frame
 }

 function to_civilscript(script) {
  const start = []
  const end = []
  return start.concat(end).join('\n')
 }

 function to_javascript(script, indent_level = 0) {
  let iterator_level = 0
  let frame_level = 0
  const start = []
  const end = []
  start.push(
   'let _arguments = []',
   'let _attention',
   'let _attention0',
   'let _attention1',
   'let _attention2',
   'let _get0',
   'let _get1',
  )
  start.push(
   'const _iterator_index_stack = []',
   'const _iterator_source_stack = []',
   'const _iterator_value_stack = []',
   'const _frame_stack = [globalThis]',
  )
  for (const line of script) {
   const [command, ...args] = line
   switch (command) {
    case INSTRUCTION.ADVANCE: // 0
     {
      start.push(
       `_attention0 = _attention${args
        .slice(0, args.length - 1)
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      start.push(
       `_attention = _attention${args
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      start.push(
       `if (typeof _attention === 'function') { _attention = _attention.bind(_attention0) }`,
      )
     }
     break
    case INSTRUCTION.ARGUMENTS: // 1
     start.push(`_arguments = ${JSON.stringify(args)}`)
     break
    case INSTRUCTION.ARGUMENTS_GET: // 2
     {
      const [name, ...path] = args
      start.push(
       `_get0 = _frame_stack[${frame_level}][${JSON.stringify(name)}]${path
        .slice(0, path.length - 1)
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      start.push(
       `_get1 = _frame_stack[${frame_level}][${JSON.stringify(name)}]${path
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      start.push(
       `if (typeof _get1 === 'function') { _get1 = _get1.bind(_get0) }`,
      )
      start.push('_arguments.push(_get1)')
     }
     break
    case INSTRUCTION.ARGUMENTS_ZERO: // 3
     start.push('_arguments = []')
     break
    case INSTRUCTION.GET: // 4
     {
      const [name, ...path] = args
      start.push(
       `_attention0 = _frame_stack[${frame_level}][${JSON.stringify(
        name,
       )}]${path
        .slice(0, path.length - 1)
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      start.push(
       `_attention = _frame_stack[${frame_level}][${JSON.stringify(name)}]${path
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      start.push(
       `if (typeof _attention === 'function') { _attention = _attention.bind(_attention0) }`,
      )
     }
     break
    case INSTRUCTION.RUN: // 5
     start.push(
      `if (typeof _attention !== 'function') { throw new Error('expecting function, got ' + _attention) }`,
     )
     start.push('_attention = await _attention(..._arguments)')
     start.push('_arguments = []')
     break
    case INSTRUCTION.SET: // 6
     {
      const [name, ...path] = args
      start.push(
       `_frame_stack[${frame_level}][${JSON.stringify(name)}]${path
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')} = _attention`,
      )
     }
     break
    case INSTRUCTION.VALUE: // 7
     start.push('_attention = ' + JSON.stringify(args[0]))
     break
    case INSTRUCTION.AWAIT: // 8
     start.push('_attention = await _attention')
     break
    case INSTRUCTION.FOR_EACH: // 9
     const level = iterator_level
     start.push(
      `if (typeof _attention !== 'object' || !('length' in _attention)) { throw new Error('for each: attention must have length property, got ' + _attention)}`,
      `_iterator_source_stack[${level}] = _attention`,
      `for (_iterator_index_stack[${level}]=0;_iterator_index_stack[${level}]<_iterator_source_stack[${level}].length;_iterator_index_stack[${level}]++) {`,
      `_iterator_value_stack[${level}] = _iterator_source_stack[${level}][_iterator_index_stack[${level}]]`,
     )
     end.unshift(
      '}',
      '_iterator_index_stack.pop()',
      '_iterator_source_stack.pop()',
      '_iterator_value_stack.pop()',
     )
     iterator_level++
     // todo handle block inside foreach recursively
     iterator_level--
     break
    case INSTRUCTION.ITERATOR_VALUE: // 10
     start.push(
      '_attention = _iterator_value_stack[_iterator_value_stack.length - 1]',
     )
     break
    case INSTRUCTION.ITERATOR_INDEX: // 11
     start.push(
      '_attention = _iterator_index_stack[_iterator_index_stack.length - 1',
     )
     break
    case INSTRUCTION.ARGUMENTS_CONCAT: // 12
     start.push('_arguments = _arguments.concat(_attention)')
     break
    case INSTRUCTION.ARGUMENTS_PUSH:
     start.push('_arguments.push(_attention)')
     break
    case INSTRUCTION.CREATE_FUNCTION:
     const [argument_names, function_code] = args
     start.push(`_attention = async function (...args) {
 for (const [index, name] of ${JSON.stringify(argument_names)}.entries()) {
  _frame_stack[${frame_level}][name] = args[index]
 }
 _attention = await ${to_javascript(function_code, 1)}
 return _attention
}`)
     break
    default:
     throw new Error(`unhandled command: ${command}`)
   }
  }
  const indent = ' '.repeat(indent_level)
  return [`(async function () {`]
   .concat(
    start
     .concat(end)
     .map((x) => ` ${indent}${x}`)
     .concat([`${indent} return _attention`, `${indent}})()`]),
   )
   .join('\n')
 }

 return { base_frame, to_civilscript, to_javascript, type_check }
}

if (typeof module === 'object') {
 module.exports = Civil
} else {
 globalThis.civil = Civil(globalThis)
}
