import { BoxIdea } from './Box'
import { style_tools } from './CSSStyleDeclaration'
import { IdeaMutation, idea_tools } from './Idea'
import { LabelIdea } from './Label'

export interface ListItemIdea extends LabelIdea {
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
 overflow: 'hidden',
 padding: '0 8px',
 textOverflow: 'ellipsis',
 whiteSpace: 'nowrap',
})

export interface ListIdea extends BoxIdea {
 list_filter(on_select_item: (value: string) => void): HTMLInputElement
 list_items(
  items: ListItemIdea[],
  on_select_item: (value: string) => void,
 ): HTMLDivElement
}

export const ListItemsMutation: IdeaMutation = {
 added: 'list_items',
 values: {
  list_items(items: ListItemIdea[], on_select_item: (value: string) => void) {
   const items_element = document.createElement('div')
   items_element.classList.add(LIST_ITEMS_CLASS)
   for (const item of items) {
    const item_element = document.createElement('div')
    item_element.textContent = item.title
    item_element.setAttribute('data-value', item.value)
    items_element.appendChild(item_element)
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
  list_filter(on_select_item: (value: string) => void) {
   const filter_element = document.createElement('input')
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
  items: ListItemIdea[],
  on_select_item: (value: string) => void,
 ): void
}

export const ListToolsCreateMutation: IdeaMutation = {
 added: 'create',
 values: {
  create(
   container: HTMLElement,
   items: ListItemIdea[],
   on_select_item: (value: string) => void,
  ) {
   container.appendChild(List.list_filter(on_select_item))
   container.appendChild(List.list_items(items, on_select_item))
  },
 },
}

export const list_tools: ListToolsIdea = idea_tools.evolve({
 evolution: [ListToolsCreateMutation],
 final: {} as ListToolsIdea,
 name: 'list_tools',
}).final
