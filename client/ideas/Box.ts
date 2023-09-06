import { HasBatteryIdea, battery_tools } from './Battery'
import { style_tools } from './CSSStyleDeclaration'
import { DocumentIdea } from './Document'
import HTMLElement, {
 HTMLAttributesIdea,
 HTMLElementStyleMutation,
 HTMLElementTagNameMutation,
 HTMLStyleIdea,
 HTMLTagNameIdea,
} from './HTMLElement'
import { IdeaMutation, idea_tools } from './Idea'
import { LabelsIdea, LabelsMutation } from './Label'
import { ListItemIdea } from './List'
import { menu_tools } from './Menu'

export interface BoxIdea
 extends HasBatteryIdea,
  HTMLStyleIdea,
  HTMLTagNameIdea,
  HTMLAttributesIdea,
  LabelsIdea {}

export const BoxIdeaEvolution: IdeaMutation[] = [
 HTMLElementStyleMutation,
 HTMLElementTagNameMutation,
 LabelsMutation,
]

export const Box: BoxIdea = idea_tools.evolve({
 evolution: BoxIdeaEvolution,
 final: {} as BoxIdea,
 name: 'Box',
}).final

interface BoxToolsIdea extends HTMLTagNameIdea {
 to_html_element<T extends HTMLElement>(box: BoxIdea): T
 to_html_element_visual(
  box: BoxIdea,
  get_document: () => DocumentIdea,
  menu_items: ListItemIdea[],
 ): HTMLDivElement
}

const BoxHTMLElementStyleClassCreated: { [key: string]: true } = {}

export const BoxToHTMLElementMutation: IdeaMutation = {
 added: 'to_html_element',
 values: {
  to_html_element<T extends HTMLElement>(box: BoxIdea): T {
   if (typeof box.html_tag_name !== 'string') {
    throw new Error('cannot to_html_element: html_tag_name must be a string')
   }
   const element = document.createElement(box.html_tag_name) as T
   const html_style_keys =
    'html_style' in box
     ? (Object.keys(box.html_style) as (keyof CSSStyleDeclaration & string)[])
     : []
   if (html_style_keys.length > 0) {
    const class_name = `${box.html_tag_name}_${box.html_class_name}`
    if (!(class_name in BoxHTMLElementStyleClassCreated)) {
     const styleElement = document.createElement('style')
     document.head.appendChild(styleElement)
     BoxHTMLElementStyleClassCreated[class_name] = true
     styleElement.textContent = style_tools.styles_to_css(
      class_name,
      box.html_style,
      html_style_keys,
     )
     element.classList.add(class_name)
    }
   } else if (box.html_class_name) {
    element.classList.add(box.html_class_name)
   }
   if ('html_class_list' in box) {
    for (const class_name of box.html_class_list) {
     element.classList.add(class_name)
    }
   }
   if (box.html_attributes) {
    for (const [k, v] of Object.entries(box.html_attributes)) {
     element.setAttribute(k, v)
    }
   }
   return element
  },
 },
}

export const BOX_VISUAL_HEIGHT = 128
export const BOX_VISUAL_WIDTH = 128

const BOX_CLASS = 'box'
style_tools.attach_style(BOX_CLASS, {
 backgroundColor: '#1b1b1b',
 border: '1px solid #b1b1b1',
 borderRadius: '8px',
 boxSizing: 'border-box',
 height: `${BOX_VISUAL_HEIGHT - 20}px`,
 position: 'absolute',
 width: `${BOX_VISUAL_HEIGHT - 20}px`,
})

style_tools.attach_style(`${BOX_CLASS}.selected`, {
 backgroundColor: '#808080',
 border: '1px solid #ffffff',
})

style_tools.attach_style(`${BOX_CLASS} label`, {
 backgroundColor: '#303030',
 border: '1px solid #b1b1b1',
 borderRadius: '4px',
 bottom: '8px',
 color: '#ffffff',
 left: '8px',
 maxHeight: '62px',
 maxWidth: '62px',
 overflow: 'hidden',
 padding: '6px 8px',
 position: 'absolute',
})

export const VisualBoxToHTMLElementMutation: IdeaMutation = {
 added: 'to_html_element_visual',
 values: {
  to_html_element_visual(
   box: BoxIdea,
   get_document: () => DocumentIdea,
   menu_items: ListItemIdea[],
  ): HTMLDivElement {
   const box_element = document.createElement('div')
   const box_menu = menu_tools.create({
    title: 'Box',
    get_document,
    menu_items,
    menu_select_item(value) {},
    menu_toggle_item(value, state) {},
   })
   box_element.addEventListener('focus', function () {
    menu_tools.open_menu(
     box_element,
     get_document(),
     box_menu.menu_items,
     box_menu.menu_select_item,
     box_menu.menu_toggle_item,
     10,
    )
   })
   box_element.setAttribute('tabindex', '0')
   box_element.classList.add(BOX_CLASS)
   const label_element = document.createElement('label')
   box_element.appendChild(label_element)
   for (const label of box.labels) {
    const label_line = document.createElement('div')
    label_line.textContent = label.title
    label_element.appendChild(label_line)
   }
   if (box.battery) {
    box_element.appendChild(battery_tools.to_html_element_visual(box.battery))
   }
   return box_element
  },
 },
}

export const box_tools: BoxToolsIdea = idea_tools.evolve({
 evolution: [BoxToHTMLElementMutation, VisualBoxToHTMLElementMutation],
 final: {} as BoxToolsIdea,
 name: 'box_tools',
}).final

export interface BoxesIdea {
 boxes: Map<number, BoxIdea>
}

export const BoxesMutation: IdeaMutation = {
 added: ['boxes'],
 values: {
  boxes: new Map(),
 },
}
