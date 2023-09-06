import { style_tools } from './CSSStyleDeclaration'

style_tools.attach_style('sidebar_container', {
 height: '100%',
 width: '100%',
 display: 'flex',
 flexDirection: 'row',
 marginBottom: '1px',
})

style_tools.attach_style('sidebar_content', {
 flexGrow: '1',
 position: 'relative',
})

style_tools.attach_style('sidebar_sidebar', {
 backgroundColor: '#535353',
 borderLeft: '1px solid #808080',
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
 content.setAttribute('tabindex', '0')
 sidebar.setAttribute('tabindex', '0')
 function enable_sidebar(state: boolean) {
  if (state) {
   sidebar_container.appendChild(sidebar)
  } else {
   sidebar_container.removeChild(sidebar)
  }
 }
 return [content, sidebar, enable_sidebar] as [
  HTMLDivElement,
  HTMLDivElement,
  (state: boolean) => void,
 ]
}
