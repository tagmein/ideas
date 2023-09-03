import { BoxIdea } from './Box'
import { style_tools } from './CSSStyleDeclaration'
import { HTMLTagNameIdea } from './HTMLElement'
import { idea_tools } from './Idea'

export const TOOLBENCH_CLASS_NAME = 'toolbench'

export interface ToolBenchIdea extends BoxIdea {}

style_tools.attach_style(TOOLBENCH_CLASS_NAME, {
 backgroundColor: '#535353',
 border: 'none',
 borderBottom: '1px solid #1b1b1b',
 boxSizing: 'border-box',
 display: 'flex',
 flexDirection: 'row',
 flexGrow: '0',
 flexShrink: '0',
 height: '40px',
})

export const ToolBench: ToolBenchIdea = idea_tools.evolve({
 evolution: [
  {
   added: ['html_class_name', 'html_tag_name'],
   values: {
    html_class_name: TOOLBENCH_CLASS_NAME,
    html_tag_name: 'div',
   },
  },
 ],
 final: {} as ToolBenchIdea,
 name: 'ToolBench',
}).final

interface ToolBenchToolsIdea extends HTMLTagNameIdea {}

export const toolbench_tools: ToolBenchToolsIdea = idea_tools.evolve({
 evolution: [],
 final: {} as ToolBenchToolsIdea,
 name: 'toolbench_tools',
}).final
