import { main } from './app/main'
import { box_tools } from './ideas/Box'
import { Doc } from './ideas/Document'
import { idea_tools } from './ideas/Idea'
import { Library, library_tools } from './ideas/Library'

const library = idea_tools.create(Library)
const home = idea_tools.create(Doc)
home.labels.add({ title: 'Main' })
library.boxes.add(home)
library_tools.prepare_html_element(home)
const home_element = box_tools.to_html_element<HTMLDivElement>(home)
document.body.appendChild(home_element)
main(library, home, home_element)
