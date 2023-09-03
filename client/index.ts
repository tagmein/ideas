import { Box, box_tools } from './ideas/Box'
import { idea_tools } from './ideas/Idea'
import { Library, library_tools } from './ideas/Library'

const library = idea_tools.create(Library)

const main = idea_tools.create(Box)

main.labels.add({ title: 'Main' })

library.boxes.add(main)
library_tools.prepare_html_element(main)
const main_element = box_tools.to_html_element(main)
library_tools.attach_toolbench(main_element)
document.body.appendChild(main_element)

console.log({ library })
