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
 zIndex: '4',
})

style_tools.attach_style(`${TOOLBENCH_CLASS_NAME} > button`, {
 backgroundColor: 'transparent',
 border: 'none',
 color: '#c8c8c8',
 cursor: 'pointer',
 fontSize: '16px',
 fontWeight: '600',
 padding: '0 8px 2px',
})

style_tools.attach_style(
 `${TOOLBENCH_CLASS_NAME} > button:hover, .${TOOLBENCH_CLASS_NAME} > button:focus`,
 {
  backgroundColor: '#ffffff40',
  color: '#ffffff',
 },
)

style_tools.attach_style(`${TOOLBENCH_CLASS_NAME} > button:active`, {
 boxShadow: 'inset 0 0 0 2px #c8c8c8, inset 0 0 1px 2px #00000080',
 color: '#c8c8c8',
})

style_tools.attach_style(`${TOOLBENCH_CLASS_NAME} > button.selected`, {
 backgroundColor: '#e8e8e8',
 color: '#303030',
})

export const ToolBench: ToolBenchIdea = idea_tools.evolve({
 evolution: [
  {
   added: ['html_attributes', 'html_class_name', 'html_tag_name'],
   values: {
    html_attributes: {
     tabIndex: '0',
    },
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
