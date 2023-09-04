import { style_tools } from './CSSStyleDeclaration'
import { IdeaMutation, idea_tools } from './Idea'
import { LabelIdea, LabelsIdea } from './Label'
import { ListItemIdea, list_tools } from './List'

export interface MenuItemsIdea {
 menu_items: ListItemIdea[]
}

export interface MenuSelectItemIdea {
 menu_select_item(value: string): void
}

export interface MenuIdea
 extends LabelsIdea,
  MenuItemsIdea,
  MenuSelectItemIdea {}

export const Menu = idea_tools.evolve({
 evolution: [],
 final: {} as MenuIdea,
 name: 'Menu',
}).final

export interface MenuToolsIdea {
 create(props: LabelIdea & MenuItemsIdea & MenuSelectItemIdea): MenuIdea
 open_menu(
  context: HTMLElement,
  menu_items: ListItemIdea[],
  menu_select_item: (value: string) => void,
 ): void
 reposition_menu(context: HTMLElement, menu: HTMLElement): void
 to_html_button(menu: MenuIdea): HTMLButtonElement
}

export const MenuToolsCreateMutation: IdeaMutation = {
 added: 'create',
 values: {
  create({
   menu_items,
   menu_select_item,
   title,
  }: LabelIdea & MenuItemsIdea & MenuSelectItemIdea): MenuIdea {
   return { labels: new Set([{ title }]), menu_items, menu_select_item }
  },
 },
}

export const MenuToolsToHTMLButtonMutation: IdeaMutation = {
 added: 'to_html_button',
 values: {
  to_html_button(menu: MenuIdea): HTMLButtonElement {
   const button = document.createElement('button')
   button.addEventListener('click', function () {
    menu_tools.open_menu(button, menu.menu_items, menu.menu_select_item)
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
})

const MENU_LIST_CLASS = 'menu_list'
style_tools.attach_style(MENU_LIST_CLASS, {
 backgroundColor: '#e8e8e8',
 border: '1px solid #1b1b1b',
 boxSizing: 'border-box',
 color: '1px solid #1b1b1b',
 display: 'flex',
 flexDirection: 'column',
 minHeight: '64px',
 minWidth: '64px',
 overflow: 'hidden',
 position: 'absolute',
})

export const MenuToolsOpenMutation: IdeaMutation = {
 added: ['open_menu', 'reposition_menu'],
 values: {
  open_menu(
   context: HTMLElement,
   menu_items: ListItemIdea[],
   menu_select_item: (value: string) => void,
  ) {
   function close_menu() {
    document.body.removeChild(menu_shade)
    document.body.removeChild(menu_list)
    context.classList.remove('selected')
   }
   const menu_shade = document.createElement('div')
   menu_shade.addEventListener('click', close_menu)
   menu_shade.classList.add(MENU_SHADE_CLASS)
   document.body.appendChild(menu_shade)
   context.classList.add('selected')
   const menu_list = document.createElement('div')
   menu_list.classList.add(MENU_LIST_CLASS)
   document.body.appendChild(menu_list)
   list_tools.create(menu_list, menu_items, function (value) {
    close_menu()
    menu_select_item(value)
   })
   menu_tools.reposition_menu(context, menu_list)
   window.addEventListener('resize', function () {
    menu_tools.reposition_menu(context, menu_list)
   })
  },
  reposition_menu(context: HTMLElement, menu: HTMLElement) {
   const context_rect = context.getBoundingClientRect()
   const top = context_rect.bottom
   const left = context_rect.left - 1
   const minWidth = Math.max(64, context_rect.width)
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
