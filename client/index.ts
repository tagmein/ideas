import { Box, box_tools } from './ideas/Box'
import { idea_tools } from './ideas/Idea'
import { Library, library_tools } from './ideas/Library'
import { menu_tools } from './ideas/Menu'
import { Sidebar } from './ideas/Sidebar'

const library = idea_tools.create(Library)

const main = idea_tools.create(Box)

main.labels.add({ title: 'Main' })

library.boxes.add(main)
library_tools.prepare_html_element(main)
const main_element = box_tools.to_html_element<HTMLDivElement>(main)
const toolbench_element = library_tools.attach_toolbench(main_element)
document.body.appendChild(main_element)

const menu_file = menu_tools.create({
 title: 'File',
 menu_items: [
  {
   title: 'About',
   value: 'about',
  },
 ],
 menu_select_item(value: string) {
  console.log('Selected', value)
 },
})
toolbench_element.appendChild(menu_tools.to_html_button(menu_file))

const menu_document = menu_tools.create({
 title: 'Document',
 menu_items: [
  {
   title: 'Settings',
   value: 'settings',
  },
 ],
 menu_select_item(value: string) {
  console.log('Selected', value)
 },
})
toolbench_element.appendChild(menu_tools.to_html_button(menu_document))

const menu_view = menu_tools.create({
 title: 'View',
 menu_items: [
  {
   title: 'Sidebar',
   value: 'sidebar',
  },
 ],
 menu_select_item(value: string) {
  console.log('Selected', value)
 },
})
toolbench_element.appendChild(menu_tools.to_html_button(menu_view))

const menu_run = menu_tools.create({
 title: 'Run',
 menu_items: [
  {
   title: 'Start now',
   value: 'start',
  },
 ],
 menu_select_item(value: string) {
  console.log('Selected', value)
 },
})
toolbench_element.appendChild(menu_tools.to_html_button(menu_run))

const menu_timeline = menu_tools.create({
 title: 'Timeline',
 menu_items: [
  {
   title: 'Go back',
   value: 'back',
  },
 ],
 menu_select_item(value: string) {
  console.log('Selected', value)
 },
})
toolbench_element.appendChild(menu_tools.to_html_button(menu_timeline))

const menu_help = menu_tools.create({
 title: 'Help',
 menu_items: [
  {
   title: 'All commands',
   value: 'all-commands',
  },
 ],
 menu_select_item(value: string) {
  console.log('Selected', value)
 },
})
toolbench_element.appendChild(menu_tools.to_html_button(menu_help))

console.log({ library })

const [content, sidebar] = Sidebar(document.body)
