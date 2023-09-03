import { style_tools } from './CSSStyleDeclaration'
import HTMLElement, {
 HTMLElementStyleMutation,
 HTMLElementTagNameMutation,
 HTMLStyleIdea,
 HTMLTagNameIdea,
} from './HTMLElement'
import { IdeaMutation, idea_tools } from './Idea'
import { LabelsIdea, LabelsMutation } from './Label'

export interface BoxIdea extends HTMLStyleIdea, HTMLTagNameIdea, LabelsIdea {}

export const Box: BoxIdea = idea_tools.evolve({
 evolution: [
  HTMLElementStyleMutation,
  HTMLElementTagNameMutation,
  LabelsMutation,
 ],
 final: {} as BoxIdea,
 name: 'Box',
}).final

interface BoxToolsIdea extends HTMLTagNameIdea {
 to_html_element<T extends HTMLElement>(box: BoxIdea): T
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
   return element
  },
 },
}

export const box_tools: BoxToolsIdea = idea_tools.evolve({
 evolution: [BoxToHTMLElementMutation],
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
