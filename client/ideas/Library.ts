import { Idea, idea_tools } from './Idea'

interface LibraryIdea {}

export const Library: LibraryIdea = idea_tools.evolve({
 evolution: [],
 final: {} as LibraryIdea,
 name: 'Library',
}).final

interface LibraryToolsIdea {}

export const library_tools = idea_tools.evolve<LibraryToolsIdea>({
 evolution: [],
 final: {} as LibraryToolsIdea,
 name: 'library_tools',
}).final
