import { Box } from './ideas/Box'
import { idea_tools } from './ideas/Idea'
import { Library } from './ideas/Library'

const library = idea_tools.create(Library)

const main = idea_tools.create(Box)

main.labels.add({ title: 'Main' })

library.boxes.add(main)

console.log({ library })
