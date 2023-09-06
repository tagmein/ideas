import {
 BOX_VISUAL_HEIGHT,
 BOX_VISUAL_WIDTH,
 Box,
 BoxIdea,
 box_tools,
} from '../ideas/Box'
import { style_tools } from '../ideas/CSSStyleDeclaration'
import { data_tools } from '../ideas/Data'
import { Doc, DocumentIdea, UpdateDocumentIdea } from '../ideas/Document'
import { idea_tools } from '../ideas/Idea'
import { LibraryIdea } from '../ideas/Library'
import { menu_tools } from '../ideas/Menu'
import { Sidebar } from '../ideas/Sidebar'
import { space_fill_2d_to_1d } from '../ideas/SpaceFilling'
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

export interface RouteDocumentIdea {
 route(id: string): void
}

export async function main(
 library: LibraryIdea,
 doc: DocumentIdea,
 container: HTMLElement,
): Promise<RouteDocumentIdea> {
 console.log({ library, doc })
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
  zIndex: '1',
 })
 let last_resize_listener: (() => void) | undefined
 const BLUR_SIZE = 7
 const bench = tool_bench(library, doc, container, toggle_item)
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
  update_document(library, doc) {
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
       const text = space_fill_2d_to_1d(c_x, c_y).toString(10)
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
   for (const [position, box] of library.documents.entries()) {
    create_library_box(position, box)
   }
  },
 }

 function create_library_box(position: number, box: BoxIdea) {
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
    {
     title: 'Open',
     value: 'open',
    },
    {
     title: 'Remove',
     value: 'remove',
    },
   ],
   async function (selection: string) {
    switch (selection) {
     case 'remove':
      await data_tools.make_query(
       `DELETE FROM boxes WHERE parent_id = :1 AND position = :2`,
       [doc.id, position],
      )
      library.documents.delete(position)
      content.removeChild(library_box)
      break
     case 'open':
      location.hash += `/${position}`
      break
    }
   },
  )
  const [x, y] = grid_position_2d_spacefill(position)
  library_box.style.left = `${x * BOX_VISUAL_WIDTH + 20}px`
  library_box.style.top = `${y * BOX_VISUAL_HEIGHT + 20}px`
  content.appendChild(library_box)
 }

 content.addEventListener('click', function (event: MouseEvent) {
  if (event.target !== content) {
   return
  }
  const x = Math.floor(event.clientX / BOX_VISUAL_WIDTH)
  const y = Math.floor(event.clientY / BOX_VISUAL_HEIGHT)
  const position = space_fill_2d_to_1d(x, y)
  menu_tools.open_menu(
   event,
   doc,
   [{ title: 'Add', value: 'add' }],
   async function (value: string) {
    switch (value) {
     case 'add':
      const new_doc = idea_tools.create(Doc)
      const title = 'untitled'
      await data_tools.make_query(
       `INSERT INTO boxes (parent_id, position, title) VALUES (:1, :2, :3)`,
       [doc.id, position, title],
      )
      new_doc.labels = new Set([{ title }])
      library.documents.set(position, new_doc)
      create_library_box(position, new_doc)
      break
    }
   },
   function () {},
  )
 })

 await data_tools.make_query(`
  CREATE TABLE IF NOT EXISTS boxes (
   position INTEGER NOT NULL,
   title TEXT NOT NULL,
   parent_id TEXT NOT NULL,
   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
 `)

 async function route(id: string) {
  console.log('id is', JSON.stringify(id))
  const new_doc: DocumentIdea = { ...doc, id } // todo: load path
  const boxes_setup: { position: number; title: string }[] =
   await data_tools.make_query(
    'select position , title from boxes where parent_id = :1',
    [id],
   )
  library.documents = new Map()
  const depth = id.length > 0 ? id.split('/').length : 0
  library.documents.set(0, {
   sidebar: false,
   id: '',
   labels: new Set([{ title: 'Home' }]),
  })
  for (const setup of boxes_setup) {
   library.documents.set(setup.position, {
    id: `${id}/${setup.position.toString(10)}`,
    labels: new Set([{ title: setup.title }]),
    sidebar: false,
   })
  }
  for (const item of [bench, content_render /*, sidebar_render*/]) {
   item.update_document(library, new_doc)
  }
  doc = new_doc
 }

 return { route }
}
