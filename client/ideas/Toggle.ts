import { style_tools } from './CSSStyleDeclaration'
import { DocumentIdea } from './Document'

export interface ToggleToolsIdea {
 create(
  doc: DocumentIdea,
  property_path: string[],
  container: HTMLElement,
  on_change: (value: boolean) => void,
 ): ToggleControlIdea
}

export interface ToggleControlIdea {
 toggle(): void
}

export const TOGGLE_CONTAINER_CLASS = 'toggle_container'
export const TOGGLE_ON_CLASS = 'toggle_on'
export const TOGGLE_OFF_CLASS = 'toggle_off'

style_tools.attach_style(TOGGLE_CONTAINER_CLASS, {
 bottom: '0',
 boxSizing: 'border-box',
 display: 'flex',
 flexDirection: 'column',
 left: '100%',
 padding: '2px',
 position: 'absolute',
 top: '0',
 userSelect: 'none',
 width: '32px',
})

style_tools.attach_style(
 `${TOGGLE_CONTAINER_CLASS}[data-toggle="1"] > .${TOGGLE_ON_CLASS}`,
 {
  backgroundColor: '#e8e8e8',
  border: '1px solid #1b1b1b',
  color: '#1b1b1b',
 },
)

style_tools.attach_style(
 `${TOGGLE_CONTAINER_CLASS}[data-toggle="0"] > .${TOGGLE_OFF_CLASS}`,
 {
  backgroundColor: '#e8e8e8',
  border: '1px solid #1b1b1b',
  color: '#1b1b1b',
 },
)

style_tools.attach_style(`${TOGGLE_CONTAINER_CLASS} > div`, {
 border: '1px solid transparent',
 borderRadius: '4px',
 color: '#a0a0a0',
 flexShrink: '0',
 fontSize: '9px',
 height: '12px',
 lineHeight: '12px',
 padding: '0 4px',
 textAlign: 'center',
 textTransform: 'uppercase',
 transition: '0.2s ease background-color, 0.2s ease border, 0.2s ease color',
})

export const toggle_tools: ToggleToolsIdea = {
 create(
  doc: DocumentIdea,
  property_path: string[],
  container: HTMLElement,
  on_change: (value: boolean) => void,
 ): ToggleControlIdea {
  function get(): Boolean {
   let value: any = doc
   for (const segment of property_path) {
    if (typeof value !== 'object') {
     throw new Error(`can not read ${segment} of ${typeof value}`)
    }
    if (segment in value) {
     value = value[segment]
    }
   }
   return value ? true : false
  }
  function set(new_value: boolean): void {
   let value: any = doc
   const path = property_path.slice()
   const final_segment = path.pop()!
   for (const segment of path) {
    if (segment in value) {
     value = value[segment]
    }
   }
   if (typeof value !== 'object') {
    throw new Error(`can not set ${final_segment} of ${typeof value}`)
   }
   value[final_segment] = new_value
  }
  function toggle() {
   const new_value = !get()
   set(new_value)
   toggle_container.setAttribute('data-toggle', get() ? '1' : '0')
   on_change(new_value)
  }
  const toggle_container = document.createElement('div')
  toggle_container.addEventListener('click', toggle)
  toggle_container.setAttribute('data-toggle', get() ? '1' : '0')
  toggle_container.setAttribute('tabindex', '0')
  toggle_container.classList.add(TOGGLE_CONTAINER_CLASS)
  container.appendChild(toggle_container)
  for (const className of [TOGGLE_ON_CLASS, TOGGLE_OFF_CLASS]) {
   const toggle_button = document.createElement('div')
   toggle_button.classList.add(className)
   toggle_button.textContent = className === TOGGLE_ON_CLASS ? 'On' : 'Off'
   toggle_container.appendChild(toggle_button)
  }
  return { toggle }
 },
}
