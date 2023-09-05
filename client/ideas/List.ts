import { BoxIdea } from './Box'
import { style_tools } from './CSSStyleDeclaration'
import { DocumentIdea } from './Document'
import { IdeaMutation, idea_tools } from './Idea'
import { LabelIdea } from './Label'
import { toggle_tools } from './Toggle'

export interface ListItemIdea extends LabelIdea {
 action_toggle_document_property?: string[]
 value: string
}

export const LIST_FILTER_CLASS = 'list_filter'
style_tools.attach_style(LIST_FILTER_CLASS, {
 backgroundColor: 'transparent',
 border: 'none',
 borderBottom: '1px solid #1b1b1b',
 boxSizing: 'border-box',
 minWidth: '100%',
 padding: '8px',
 width: '0',
})

export const LIST_ITEMS_CLASS = 'list_items'
style_tools.attach_style(LIST_ITEMS_CLASS, {
 display: 'flex',
 flexDirection: 'column',
 flexGrow: '1',
 overflowX: 'hidden',
 overflowY: 'auto',
})

style_tools.attach_style(`${LIST_ITEMS_CLASS} > div`, {
 boxSizing: 'border-box',
 cursor: 'pointer',
 height: '32px',
 lineHeight: '30px',
 overflow: 'visible',
 position: 'relative',
})

style_tools.attach_style(`${LIST_ITEMS_CLASS} > div:hover::after`, {
 backgroundColor: '#00000020',
 content: "''",
 display: 'block',
 position: 'absolute',
 bottom: '0',
 left: '0',
 right: '64px',
 top: '0',
 width: '100%',
})

style_tools.attach_style(`${LIST_ITEMS_CLASS} > div:active::after`, {
 backgroundColor: '#00000040',
})

style_tools.attach_style(`${LIST_ITEMS_CLASS} > div > label`, {
 overflow: 'hidden',
 padding: '0 8px',
 pointerEvents: 'none',
 textOverflow: 'ellipsis',
 whiteSpace: 'nowrap',
})

export interface ListIdea extends BoxIdea {
 list_filter(
  on_keydown: (event: KeyboardEvent) => void,
  on_select_item: (value: string) => void,
 ): HTMLInputElement
 list_items(
  items: ListItemIdea[],
  on_render_item: (item: ListItemIdea, container: HTMLDivElement) => void,
  on_select_item: (value: string) => void,
 ): HTMLDivElement
}

export const ListItemsMutation: IdeaMutation = {
 added: 'list_items',
 values: {
  list_items(
   items: ListItemIdea[],
   on_render_item: (item: ListItemIdea, container: HTMLDivElement) => void,
   on_select_item: (value: string) => void,
  ) {
   const items_element = document.createElement('div')
   items_element.classList.add(LIST_ITEMS_CLASS)
   for (const item of items) {
    const item_element = document.createElement('div')
    const item_label = document.createElement('label')
    item_label.textContent = item.title
    item_element.appendChild(item_label)
    item_element.setAttribute('data-value', item.value)
    items_element.appendChild(item_element)
    on_render_item(item, item_element)
   }
   items_element.addEventListener('click', function (event) {
    const value = (event.target as HTMLElement).getAttribute('data-value')
    if (typeof value === 'string') {
     on_select_item(value)
    }
   })
   return items_element
  },
 },
}

export const ListFilterMutation: IdeaMutation = {
 added: 'list_filter',
 values: {
  list_filter(
   on_keydown: (event: KeyboardEvent) => void,
   on_select_item: (value: string) => void, // todo
  ) {
   const filter_element = document.createElement('input')
   filter_element.addEventListener('keydown', on_keydown)
   filter_element.classList.add(LIST_FILTER_CLASS)
   filter_element.setAttribute('placeholder', 'filter')
   setTimeout(filter_element.focus.bind(filter_element))
   return filter_element
  },
 },
}

export const List: ListIdea = idea_tools.evolve({
 evolution: [ListItemsMutation, ListFilterMutation],
 final: {} as ListIdea,
 name: 'List',
}).final

export interface ListToolsIdea {
 create(
  container: HTMLElement,
  doc: DocumentIdea,
  items: ListItemIdea[],
  on_keydown: (event: KeyboardEvent) => void,
  on_select_item: (value: string) => void,
  on_toggle_item: (value: string, toggle_state: boolean) => void,
 ): void
}

export const ListToolsCreateMutation: IdeaMutation = {
 added: 'create',
 values: {
  create(
   container: HTMLElement,
   doc: DocumentIdea,
   items: ListItemIdea[],
   on_keydown: (event: KeyboardEvent) => void,
   on_select_item: (value: string) => void,
   on_toggle_item: (value: string, toggle_state: boolean) => void,
  ) {
   const special_actions: Map<string, () => void> = new Map()
   function select_item(value: string) {
    if (special_actions.has(value)) {
     filter.focus()
     special_actions.get(value)!()
    } else {
     on_select_item(value)
    }
   }
   const filter = List.list_filter(on_keydown, on_select_item)
   container.appendChild(filter)
   function on_render_item(item: ListItemIdea, item_container: HTMLDivElement) {
    if (item.action_toggle_document_property) {
     const toggle = toggle_tools.create(
      doc,
      item.action_toggle_document_property,
      item_container,
      function (new_state) {
       on_toggle_item(item.value, new_state)
      },
     )
     special_actions.set(item.value, toggle.toggle)
    }
   }
   container.appendChild(List.list_items(items, on_render_item, select_item))
  },
 },
}

export const list_tools: ListToolsIdea = idea_tools.evolve({
 evolution: [ListToolsCreateMutation],
 final: {} as ListToolsIdea,
 name: 'list_tools',
}).final
