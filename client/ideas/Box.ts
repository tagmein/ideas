import { style_tools } from './CSSStyleDeclaration'
import HTMLElement, {
 HTMLAttributesIdea,
 HTMLElementStyleMutation,
 HTMLElementTagNameMutation,
 HTMLStyleIdea,
 HTMLTagNameIdea,
} from './HTMLElement'
import { IdeaMutation, idea_tools } from './Idea'
import { LabelsIdea, LabelsMutation } from './Label'

export interface BoxIdea
 extends HTMLStyleIdea,
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
 to_html_element_visual(box: BoxIdea): HTMLDivElement
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

const BOX_CLASS = 'box'
style_tools.attach_style(BOX_CLASS, {
 backgroundColor: '#535353',
 height: '128px',
 width: '128px',
 border: '1px solid #a0a0a0',
 borderRadius: '8px',
 position: 'relative',
})

style_tools.attach_style(`${BOX_CLASS} label`, {
 position: 'absolute',
 backgroundColor: '#a0a0a0',
 color: '#1b1b1b',
 padding: '6px 8px',
 left: '8px',
 bottom: '8px',
 border: '1px solid #1b1b1b',
 borderRadius: '8px',
})

export const VisualBoxToHTMLElementMutation: IdeaMutation = {
 added: 'to_html_element_visual',
 values: {
  to_html_element_visual(box: BoxIdea): HTMLDivElement {
   const box_element = document.createElement('div')
   box_element.setAttribute('tabindex', '0')
   box_element.classList.add(BOX_CLASS)
   const label_element = document.createElement('label')
   box_element.appendChild(label_element)
   for (const label of box.labels) {
    const label_line = document.createElement('div')
    label_line.textContent = label.title
    label_element.appendChild(label_line)
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
 boxes: Set<BoxIdea>
}

export const BoxesMutation: IdeaMutation = {
 added: ['boxes'],
 values: {
  boxes: new Set(),
 },
}
