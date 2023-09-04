import { Box, box_tools } from './ideas/Box'
import { idea_tools } from './ideas/Idea'
import { Library, library_tools } from './ideas/Library'
import { menu_tools } from './ideas/Menu'

const library = idea_tools.create(Library)

const main = idea_tools.create(Box)

main.labels.add({ title: 'Main' })

library.boxes.add(main)
library_tools.prepare_html_element(main)
const main_element = box_tools.to_html_element<HTMLDivElement>(main)
const toolbench_element = library_tools.attach_toolbench(main_element)
document.body.appendChild(main_element)
const menu = menu_tools.create({
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
toolbench_element.appendChild(menu_tools.to_html_button(menu))

console.log({ library })
