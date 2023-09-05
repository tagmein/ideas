import { style_tools } from './CSSStyleDeclaration'
import { DocumentIdea, GetDocumentIdea } from './Document'
import { IdeaMutation, idea_tools } from './Idea'
import { LabelIdea, LabelsIdea } from './Label'

import {
 LIST_FILTER_CLASS,
 LIST_ITEMS_CLASS,
 ListItemIdea,
 list_tools,
} from './List'

export interface MenuItemsIdea {
 menu_items: ListItemIdea[]
}

export interface MenuSelectItemIdea {
 menu_select_item(value: string): void
}

export interface MenuToggleItemIdea {
 menu_toggle_item(value: string, state: boolean): void
}

export interface MenuIdea
 extends GetDocumentIdea,
  LabelsIdea,
  MenuItemsIdea,
  MenuSelectItemIdea,
  MenuToggleItemIdea {}

export const Menu = idea_tools.evolve({
 evolution: [],
 final: {} as MenuIdea,
 name: 'Menu',
}).final

export interface MenuToolsIdea {
 create(
  props: GetDocumentIdea &
   LabelIdea &
   MenuItemsIdea &
   MenuSelectItemIdea &
   MenuToggleItemIdea,
 ): MenuIdea
 close_menu(): void
 open_menu(
  context: HTMLElement,
  doc: DocumentIdea,
  menu_items: ListItemIdea[],
  menu_select_item: (value: string) => void,
  menu_toggle_item: (value: string, state: boolean) => void,
 ): void
 reposition_menu(context: HTMLElement, menu: HTMLElement): void
 to_html_button(menu: MenuIdea): HTMLButtonElement
}

export const MenuToolsCreateMutation: IdeaMutation = {
 added: 'create',
 values: {
  create({
   get_document,
   menu_items,
   menu_select_item,
   menu_toggle_item,
   title,
  }: GetDocumentIdea &
   LabelIdea &
   MenuItemsIdea &
   MenuSelectItemIdea &
   MenuToggleItemIdea): MenuIdea {
   return {
    get_document,
    labels: new Set([{ title }]),
    menu_items,
    menu_select_item,
    menu_toggle_item,
   }
  },
 },
}

export const MenuToolsToHTMLButtonMutation: IdeaMutation = {
 added: 'to_html_button',
 values: {
  to_html_button(menu: MenuIdea): HTMLButtonElement {
   const button = document.createElement('button')
   button.addEventListener('click', function () {
    const doc = menu.get_document()
    menu_tools.open_menu(
     button,
     doc,
     menu.menu_items,
     menu.menu_select_item,
     menu.menu_toggle_item,
    )
   })
   for (const label of menu.labels) {
    const title = document.createElement('div')
    title.textContent = label.title
    button.appendChild(title)
   }
   return button
  },
 },
}

const MENU_SHADE_CLASS = 'menu_shade'
style_tools.attach_style(MENU_SHADE_CLASS, {
 position: 'fixed',
 top: '0',
 left: '0',
 right: '0',
 bottom: '0',
 backgroundColor: '#80808080',
 zIndex: '1',
})

const MENU_LIST_CLASS = 'menu_list'
style_tools.attach_style(MENU_LIST_CLASS, {
 boxSizing: 'border-box',
 color: '#1b1b1b',
 display: 'flex',
 flexDirection: 'column',
 minHeight: '64px',
 minWidth: '128px',
 overflow: 'hidden',
 padding: '1px',
 position: 'absolute',
})

style_tools.attach_style(`${MENU_LIST_CLASS}::after`, {
 backgroundColor: '#e8e8e8',
 border: '1px solid #1b1b1b',
 bottom: '0',
 content: "''",
 display: 'block',
 left: '0',
 position: 'absolute',
 right: '64px',
 top: '0',
 zIndex: '2',
})

style_tools.attach_style(
 `${MENU_LIST_CLASS} > div, .${MENU_LIST_CLASS} > input`,
 {
  zIndex: '3',
 },
)

style_tools.attach_style(`${MENU_LIST_CLASS} .${LIST_FILTER_CLASS}`, {
 minWidth: 'calc(100% - 64px)',
})

style_tools.attach_style(`${MENU_LIST_CLASS} .${LIST_ITEMS_CLASS} > div`, {
 marginRight: '64px',
})

let close_current_menu: (() => void) | undefined

export const MenuToolsOpenMutation: IdeaMutation = {
 added: ['close_menu', 'open_menu', 'reposition_menu'],
 values: {
  close_menu() {
   close_current_menu?.()
  },
  open_menu(
   context: HTMLElement,
   doc: DocumentIdea,
   menu_items: ListItemIdea[],
   menu_select_item: (value: string) => void,
   menu_toggle_item: (value: string, state: boolean) => void,
  ) {
   close_current_menu?.()
   function close_menu() {
    document.body.removeChild(menu_shade)
    document.body.removeChild(menu_list)
    context.classList.remove('selected')
    close_current_menu = undefined
   }
   close_current_menu = close_menu
   const menu_shade = document.createElement('div')
   menu_shade.addEventListener('click', close_menu)
   menu_shade.classList.add(MENU_SHADE_CLASS)
   document.body.appendChild(menu_shade)
   context.classList.add('selected')
   const menu_list = document.createElement('div')
   menu_list.classList.add(MENU_LIST_CLASS)
   document.body.appendChild(menu_list)
   list_tools.create(
    menu_list,
    doc,
    menu_items,
    function (event: KeyboardEvent) {
     if (event.key === 'Escape') {
      close_menu()
     }
    },
    function (value) {
     close_menu()
     menu_select_item(value)
    },
    menu_toggle_item,
   )
   menu_tools.reposition_menu(context, menu_list)
   window.addEventListener('resize', function () {
    menu_tools.reposition_menu(context, menu_list)
   })
  },
  reposition_menu(context: HTMLElement, menu: HTMLElement) {
   const context_rect = context.getBoundingClientRect()
   const top = context_rect.bottom
   const left = context_rect.left - 1
   const minWidth = Math.max(128, context_rect.width)
   const maxWidth = innerWidth - left
   const maxHeight = innerHeight - top
   Object.assign(menu.style, {
    top: `${top}px`,
    left: `${left}px`,
    maxHeight: `${maxHeight}px`,
    maxWidth: `${maxWidth}px`,
    minWidth: `${minWidth}px`,
   })
  },
 },
}

export const menu_tools = idea_tools.evolve({
 evolution: [
  MenuToolsCreateMutation,
  MenuToolsToHTMLButtonMutation,
  MenuToolsOpenMutation,
 ],
 final: {} as MenuToolsIdea,
 name: 'MenuTools',
}).final
