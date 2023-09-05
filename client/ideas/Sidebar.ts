import { style_tools } from './CSSStyleDeclaration'

style_tools.attach_style('sidebar_container', {
 height: '100%',
 width: '100%',
 display: 'flex',
 flexDirection: 'row',
})

style_tools.attach_style('sidebar_content', {
 flexGrow: '1',
})

style_tools.attach_style('sidebar_sidebar', {
 backgroundColor: '#535353',
 borderLeft: '1px solid #808080',
 boxShadow: 'inset 0 0 2px #ffffff',
 width: '360px',
 flexGrow: '0',
 flexShrink: '0',
})

export function Sidebar(container: HTMLElement) {
 const [sidebar_container, content, sidebar] = [
  'container',
  'content',
  'sidebar',
 ].map(function (part) {
  const element = document.createElement('div')
  element.classList.add(`sidebar_${part}`)
  return element
 })
 container.appendChild(sidebar_container)
 sidebar_container.appendChild(content)
 sidebar_container.appendChild(sidebar)
 return [content, sidebar] as [HTMLDivElement, HTMLDivElement]
}
