import { IdeaMutation } from './Idea'

export default HTMLElement

export interface HTMLTagNameIdea {
 html_tag_name?: HTMLElement['tagName']
}
export interface HTMLAttributesIdea {
 html_attributes?: { [key in keyof HTMLElement]: string }
}

export const HTMLElementTagNameMutation: IdeaMutation = {
 added: 'html_tag_name',
 values: {
  html_tag_name: undefined,
 },
}

export interface HTMLStyleIdea {
 html_class_list?: Set<string>
 html_class_name?: string
 html_style?: Partial<HTMLElement['style']>
}

export const HTMLElementStyleMutation: IdeaMutation = {
 added: ['html_class_list', 'html_style'],
 values: {
  html_class_list: new Set(),
  html_class_name: undefined,
  html_style: {},
 },
}
