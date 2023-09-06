import { box_tools } from '../ideas/Box'
import { DocumentIdea, UpdateDocumentIdea } from '../ideas/Document'
import { LibraryIdea } from '../ideas/Library'
import { Sidebar } from '../ideas/Sidebar'
import { tool_bench } from './tool_bench'

function grid_position_2d_spacefill(position: number): [number, number] {
 let last_square_area: number
 let current_square_size = 0
 let current_square_area = 0
 while (position >= 0) {
  last_square_area = current_square_area
  current_square_size++
  current_square_area = current_square_size * current_square_size
  const delta_size = current_square_area - last_square_area
  if (position >= delta_size) {
   position -= delta_size
  } else {
   if (position >= current_square_size) {
    return [2 * current_square_size - position - 2, current_square_size - 1]
   } else {
    return [current_square_size - 1, position]
   }
  }
 }
 return [0, 0]
}

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
   for (const [position, box] of library.boxes.entries()) {
    const library_box = box_tools.to_html_element_visual(
     box,
     function () {
      return doc
     },
     [
      {
       title: 'Position: ' + position.toString(10),
       value: 'position',
      },
     ],
    )
    const [x, y] = grid_position_2d_spacefill(position)
    library_box.style.left = `${x * 118 + 10}px`
    library_box.style.top = `${y * 118 + 10}px`
    content.appendChild(library_box)
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
