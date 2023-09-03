import { IdeaMutation, idea_tools } from './Idea'

export default CSSStyleDeclaration

export interface StyleToolsIdea {
 attach_style(class_name: string, styles: Partial<CSSStyleDeclaration>): void
 style_to_css_line<T extends keyof CSSStyleDeclaration & string>(
  key: T,
  value?: string | null,
 ): string
 styles_to_css<T extends keyof CSSStyleDeclaration & string>(
  class_name: string,
  styles: Partial<CSSStyleDeclaration>,
  keys?: T[],
 ): string
}

const StyleToCSSLineMigration: IdeaMutation = {
 added: ['style_to_css_line'],
 values: {
  style_to_css_line<T extends keyof CSSStyleDeclaration & string>(
   key: T,
   value?: string | null,
  ) {
   let output = ''
   if (typeof value !== 'string') {
    return output
   }
   for (const i in key) {
    const char = key[i]
    if (char.toUpperCase() === char) {
     output += `-${char.toLowerCase()}`
    } else {
     output += char
    }
   }
   return output + `: ${value};`
  },
 },
}

const StylesToCSSMigration: IdeaMutation = {
 added: 'styles_to_css',
 values: {
  styles_to_css<T extends keyof CSSStyleDeclaration & string>(
   class_name: string,
   html_style: Partial<CSSStyleDeclaration>,
   keys?: T[],
  ): string {
   if (!keys) {
    keys = Object.keys(html_style) as T[]
   }
   return [
    `.${class_name} {`,
    ...keys.map(function (key) {
     const value = html_style[key]
     if (typeof value !== 'string') {
      return ''
     }
     return ' ' + style_tools.style_to_css_line(key, value)
    }),
    '}',
   ]
    .filter((x) => x.length)
    .join('\n')
  },
 },
}

export const AttachStylesMigration: IdeaMutation = {
 added: 'attach_style',
 values: {
  attach_style(class_name: string, styles: Partial<CSSStyleDeclaration>): void {
   const style_element = document.createElement('style')
   document.head.appendChild(style_element)
   style_element.textContent = style_tools.styles_to_css(class_name, styles)
  },
 },
}

export const style_tools: StyleToolsIdea = idea_tools.evolve({
 evolution: [
  StyleToCSSLineMigration,
  StylesToCSSMigration,
  AttachStylesMigration,
 ],
 final: {} as StyleToolsIdea,
 name: 'style_tools',
}).final
