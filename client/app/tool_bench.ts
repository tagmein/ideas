import { DocumentIdea } from '../ideas/Document'
import { LibraryIdea, library_tools } from '../ideas/Library'
import { menu_tools } from '../ideas/Menu'

export interface ToolBenchControlIdea {
 update_document(doc: DocumentIdea): void
}

export function tool_bench(
 library: LibraryIdea,
 doc: DocumentIdea,
 attach_to: HTMLElement,
 menu_toggle_item: (value: string, state: boolean) => void,
): ToolBenchControlIdea {
 const control: ToolBenchControlIdea = {
  update_document(_doc) {
   doc = _doc
  },
 }
 const tool_bench_element = library_tools.attach_toolbench(attach_to)
 const menu_file = menu_tools.create({
  get_document() {
   return doc
  },
  title: 'File',
  menu_items: [
   {
    title: 'About',
    value: 'about',
   },
  ],
  menu_select_item(value: string) {
   console.log('Selected', value, { library, box: doc })
  },
  menu_toggle_item,
 })
 tool_bench_element.appendChild(menu_tools.to_html_button(menu_file))

 const menu_document = menu_tools.create({
  get_document() {
   return doc
  },
  title: 'Document',
  menu_items: [
   {
    title: 'Settings',
    value: 'settings',
   },
  ],
  menu_select_item(value: string) {
   console.log('Selected', value, { library, box: doc })
  },
  menu_toggle_item,
 })
 tool_bench_element.appendChild(menu_tools.to_html_button(menu_document))

 const menu_view = menu_tools.create({
  get_document() {
   return doc
  },
  title: 'View',
  menu_items: [
   {
    action_toggle_document_property: ['library_view_state', 'sidebar'],
    title: 'Sidebar',
    value: 'sidebar',
   },
  ],
  menu_select_item(value: string) {
   console.log('Selected', value, { library, box: doc })
  },
  menu_toggle_item,
 })
 tool_bench_element.appendChild(menu_tools.to_html_button(menu_view))

 const menu_run = menu_tools.create({
  get_document() {
   return doc
  },
  title: 'Run',
  menu_items: [
   {
    title: 'Start now',
    value: 'start',
   },
  ],
  menu_select_item(value: string) {
   console.log('Selected', value, { library, box: doc })
  },
  menu_toggle_item,
 })
 tool_bench_element.appendChild(menu_tools.to_html_button(menu_run))

 const menu_timeline = menu_tools.create({
  get_document() {
   return doc
  },
  title: 'Timeline',
  menu_items: [
   {
    title: 'Go back',
    value: 'back',
   },
  ],
  menu_select_item(value: string) {
   console.log('Selected', value, { library, box: doc })
  },
  menu_toggle_item,
 })
 tool_bench_element.addEventListener('click', function (event) {
  if (event.target === tool_bench_element) {
   menu_tools.close_menu()
  }
 })
 tool_bench_element.appendChild(menu_tools.to_html_button(menu_timeline))

 const menu_help = menu_tools.create({
  get_document() {
   return doc
  },
  title: 'Help',
  menu_items: [
   {
    title: 'All commands',
    value: 'all-commands',
   },
  ],
  menu_select_item(value: string) {
   console.log('Selected', value, { library, box: doc })
  },
  menu_toggle_item,
 })
 tool_bench_element.appendChild(menu_tools.to_html_button(menu_help))
 return control
}
