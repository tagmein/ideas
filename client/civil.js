function Civil(scope) {
 const civil_type = {
  [scope.ideas.IsType]: scope.ideas.Type.Object,
  properties: {
   build: {
    [scope.ideas.IsType]: scope.ideas.Type.Function,
    arguments: ['code'],
    return: 'string',
   },
   type_check: {
    [scope.ideas.IsType]: scope.ideas.Type.Function,
    arguments: [
     'code',
     { [scope.ideas.IsType]: scope.ideas.Type.Optional, type: 'frame' },
    ],
    return: 'undefined',
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
 }

 const SIGNAL = {
  INTERRUPT: 'interrupt',
  PRINT_END: 'print+interrupt',
  PRINT: 'print',
  RUN: 'run',
 }

 const PrintFunctionType = {
  [scope.ideas.IsType]: 'Function',
  arguments: ['string'],
  return: 'undefined',
 }

 scope.ideas.assert_type(scope.ideas.function_type, PrintFunctionType)

 const RunFunctionType = {
  [scope.ideas.IsType]: 'Function',
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
     break
    case INSTRUCTION.ARGUMENTS:
     frame.scratch.arguments_types = args.map((arg) => scope.ideas.type_of(arg))
     break
    case INSTRUCTION.ARGUMENTS_CONCAT:
     if (!frame.scratch.attention_type[scope.ideas.IsType] === 'Array') {
      throw new Error(`arguments concat: attention type is not an array`)
     }
     frame.scratch.argument_types = frame.scratch.argument_types.concat(
      frame.scratch.attention_type,
     )
     break
    case INSTRUCTION.ARGUMENTS_PUSH:
     if (!Array.isArray(frame.scratch.argument_types)) {
      frame.scratch.argument_types = []
     }
     frame.scratch.argument_types.push(frame.scratch.attention_type)
     break
    case INSTRUCTION.ARGUMENTS_ZERO:
     frame.scratch.arguments_types = []
     break
    case INSTRUCTION.ARGUMENTS_GET:
     const [arg_name, ...arg_path] = args
     frame.scratch.arguments_types.push(
      scope.ideas.get_property_type(frame.type(arg_name), arg_path),
     )
     break
    case INSTRUCTION.AWAIT:
     if (!frame.scratch.attention_type) {
      return // todo why is this block needed
     }
     if (!frame.scratch.attention_type[scope.ideas.IsType] === 'Promise') {
      throw new Error(
       `can only await after promise, got ${type_string(
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
     const current_attention_type = frame.scratch.attention_type
     if (!current_attention_type.return) {
      throw new Error(
       `cannot RUN at type ${type_string(
        current_attention_type,
       )}, must be function with return type`,
      )
     }
     const [override_return_type] = args
     if (override_return_type) {
      if (!scope.ideas.is_a_valid('type', override_return_type)) {
       throw new Error(
        `return type override is not a valid type, got ${override_return_type}`,
       )
      }
      frame.scratch.attention_type = override_return_type
     } else {
      frame.scratch.attention_type = current_attention_type.return
     }
     break
    case INSTRUCTION.VALUE:
     frame.scratch.attention_type = scope.ideas.type_of(args[0])
     break
   }
  },
 )

 function type_check(script, context = base_frame) {
  const frame = context.clone()
  for (const line of script) {
   frame.signal(SIGNAL.RUN, ...line)
  }
  return frame
 }

 function build(script) {
  let iterator_level = 0
  let frame_level = 0
  const output = ['(async function () {']
  const endput = ['})()']
  output.push(
   'let _arguments = []',
   'let _attention',
   'let _attention0',
   'let _attention1',
   'let _attention2',
   'let _get0',
   'let _get1',
  )
  output.push(
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
      output.push(
       `_attention0 = _attention${args
        .slice(0, args.length - 1)
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      output.push(
       `_attention = _attention${args
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      output.push(
       `if (typeof _attention === 'function') { _attention = _attention.bind(_attention0) }`,
      )
     }
     break
    case INSTRUCTION.ARGUMENTS: // 1
     output.push(`_arguments = ${JSON.stringify(args)}`)
     break
    case INSTRUCTION.ARGUMENTS_GET: // 2
     {
      const [name, ...path] = args
      output.push(
       `_get0 = _frame_stack[${frame_level}][${JSON.stringify(name)}]${path
        .slice(0, path.length - 1)
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      output.push(
       `_get1 = _frame_stack[${frame_level}][${JSON.stringify(name)}]${path
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      output.push(
       `if (typeof _get1 === 'function') { _get1 = _get1.bind(_get0) }`,
      )
      output.push('_arguments.push(_get1)')
     }
     break
    case INSTRUCTION.ARGUMENTS_ZERO: // 3
     output.push('_arguments = []')
     break
    case INSTRUCTION.GET: // 4
     {
      const [name, ...path] = args
      output.push(
       `_attention0 = _frame_stack[${frame_level}][${JSON.stringify(
        name,
       )}]${path
        .slice(0, path.length - 1)
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      output.push(
       `_attention = _frame_stack[${frame_level}][${JSON.stringify(name)}]${path
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')}`,
      )
      output.push(
       `if (typeof _attention === 'function') { _attention = _attention.bind(_attention0) }`,
      )
     }
     break
    case INSTRUCTION.RUN: // 5
     output.push(
      `if (typeof _attention !== 'function') { throw new Error('expecting function, got ' + _attention) }`,
     )
     output.push('_attention = _attention(..._arguments)')
     output.push('_arguments = []')
     break
    case INSTRUCTION.SET: // 6
     {
      const [name, ...path] = args
      output.push(
       `_frame_stack[${frame_level}][${JSON.stringify(name)}]${path
        .map(function (segment) {
         return `[${JSON.stringify(segment)}]`
        })
        .join('')} = _attention`,
      )
     }
     break
    case INSTRUCTION.VALUE: // 7
     output.push('_attention = ' + JSON.stringify(args[0]))
     break
    case INSTRUCTION.AWAIT: // 8
     output.push('_attention = await _attention')
     break
    case INSTRUCTION.FOR_EACH: // 9
     const level = iterator_level
     output.push(
      `if (typeof _attention !== 'object' || !('length' in _attention)) { throw new Error('for each: attention must have length property, got ' + _attention)}`,
      `_iterator_source_stack[${level}] = _attention`,
      `for (_iterator_index_stack[${level}]=0;_iterator_index_stack[${level}]<_iterator_source_stack[${level}].length;_iterator_index_stack[${level}]++) {`,
      `_iterator_value_stack[${level}] = _iterator_source_stack[${level}][_iterator_index_stack[${level}]]`,
     )
     endput.unshift(
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
     output.push(
      '_attention = _iterator_value_stack[_iterator_value_stack.length - 1]',
     )
     break
    case INSTRUCTION.ITERATOR_INDEX: // 11
     output.push(
      '_attention = _iterator_index_stack[_iterator_index_stack.length - 1',
     )
     break
    case INSTRUCTION.ARGUMENTS_CONCAT: // 12
     output.push('_arguments = _arguments.concat(_attention)')
     break
    case INSTRUCTION.ARGUMENTS_PUSH:
     output.push('_arguments.push(_attention)')
     break
    default:
     throw new Error(`unhandled command: ${command}`)
   }
  }
  return output.concat(endput).join('\n')
 }

 return { base_frame, build, type_check }
}

if (typeof module === 'object') {
 module.exports = Civil
} else {
 globalThis.civil = Civil(globalThis)
}
