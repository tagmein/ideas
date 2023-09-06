import { BOX_VISUAL_HEIGHT, BOX_VISUAL_WIDTH, box_tools } from '../ideas/Box'
import { style_tools } from '../ideas/CSSStyleDeclaration'
import { DocumentIdea, UpdateDocumentIdea } from '../ideas/Document'
import { LibraryIdea } from '../ideas/Library'
import { Sidebar } from '../ideas/Sidebar'
import { tool_bench } from './tool_bench'

function grid_position_2d_spacefill(position: number): [number, number] {
 const last_square_size = Math.floor(Math.sqrt(position))
 const last_square_area = last_square_size * last_square_size
 const current_square_size = last_square_size + 1
 position -= last_square_area
 if (position >= current_square_size) {
  return [2 * current_square_size - position - 2, current_square_size - 1]
 } else {
  return [current_square_size - 1, position]
 }
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
 const OVERLAY_CLASS = 'overlay'
 style_tools.attach_style(OVERLAY_CLASS, {
  pointerEvents: 'none',
  position: 'absolute',
  top: '0',
  left: '0',
  zIndex: '5',
 })
 let last_resize_listener: (() => void) | undefined
 const BLUR_SIZE = 7
 const bench = tool_bench(library, home, container, toggle_item)
 const [content, sidebar, enable_sidebar] = Sidebar(container)
 function blur_effect(
  canvas: HTMLCanvasElement,
  layer: CanvasRenderingContext2D,
 ) {
  layer.globalAlpha = 0.0125
  for (let i = 0; i < BLUR_SIZE * BLUR_SIZE; i++) {
   const x = (i % BLUR_SIZE) - Math.floor(BLUR_SIZE / 2)
   const y = (i - (i % BLUR_SIZE)) / BLUR_SIZE - Math.floor(BLUR_SIZE / 2)
   layer.drawImage(
    canvas,
    0,
    0,
    canvas.width - Math.max(0, x),
    canvas.height - Math.max(0, y),
    x,
    y,
    canvas.width - Math.max(0, x),
    canvas.height - Math.max(0, y),
   )
  }
  layer.globalAlpha = 1
 }
 const content_render: UpdateDocumentIdea = {
  update_document(doc) {
   content.textContent = ''
   const overlay = document.createElement('canvas')
   overlay.classList.add(OVERLAY_CLASS)
   content.appendChild(overlay)
   if (last_resize_listener) {
    removeEventListener('resize', last_resize_listener)
   }
   const overlay_layer = overlay.getContext('2d')!
   last_resize_listener = function resize() {
    const content_rect = content.getBoundingClientRect()
    const cells_y = Math.ceil(content_rect.height / BOX_VISUAL_HEIGHT)
    const cells_x = Math.ceil(content_rect.width / BOX_VISUAL_WIDTH)
    overlay.height = content_rect.height
    overlay.width = content_rect.width
    overlay.style.height = `${content_rect.height}px`
    overlay.style.width = `${content_rect.width}px`
    overlay_layer.clearRect(0, 0, overlay.width, overlay.height)
    overlay_layer.fillStyle = '#ffffff20'
    overlay_layer.font = '14px monospace'
    for (let _ in [0, 0, 0, 0]) {
     blur_effect(overlay, overlay_layer)
     for (let c_x = 0; c_x < cells_x; c_x++) {
      for (let c_y = 0; c_y < cells_y; c_y++) {
       const square_size = Math.max(c_x + 1, c_y + 1)
       const last_square_size = square_size - 1
       const last_square_area = last_square_size * last_square_size
       const position =
        last_square_area +
        (c_x === square_size - 1 ? c_y : 2 * last_square_size - c_x)
       const text = position.toString(10)
       overlay_layer.fillText(
        text,
        10 +
         c_x * BOX_VISUAL_WIDTH +
         BOX_VISUAL_WIDTH / 2 -
         overlay_layer.measureText(text).width / 2,
        10 + c_y * BOX_VISUAL_HEIGHT + BOX_VISUAL_HEIGHT / 2,
       )
      }
     }
    }
   }
   last_resize_listener()
   addEventListener('resize', last_resize_listener)
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
    library_box.style.left = `${x * BOX_VISUAL_WIDTH + 20}px`
    library_box.style.top = `${y * BOX_VISUAL_HEIGHT + 20}px`
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
