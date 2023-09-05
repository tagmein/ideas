import { box_tools } from '../ideas/Box'
import { DocumentIdea, UpdateDocumentIdea } from '../ideas/Document'
import { LibraryIdea, library_tools } from '../ideas/Library'
import { Sidebar } from '../ideas/Sidebar'
import { tool_bench } from './tool_bench'

export function main(
 library: LibraryIdea,
 home: DocumentIdea,
 container: HTMLElement,
) {
 console.log({ library, home })
 function toggle_item(value: string, state: boolean) {
  switch (value) {
   case 'sidebar':
    enable_sidebar(state)
    break
  }
 }
 const bench = tool_bench(library, home, container, toggle_item)
 const [content, sidebar, enable_sidebar] = Sidebar(container)
 const content_render: UpdateDocumentIdea = {
  update_document(doc) {
   content.textContent = ''
   for (const box of library.boxes) {
    content.appendChild(box_tools.to_html_element_visual(box))
   }
  },
 }
 function route() {
  const id = location.hash.substring(1)
  const new_doc: DocumentIdea = { ...home, id } // todo: load path
  for (const item of [bench, content_render /*, sidebar_render*/]) {
   item.update_document(new_doc)
  }
 }
 addEventListener('hashchange', route)
 route()
}
