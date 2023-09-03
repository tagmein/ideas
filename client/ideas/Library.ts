import { BoxesIdea, BoxesMutation } from './Box'
import { idea_tools } from './Idea'
import { ObscenityLevelsIdea, ObscenityLevelsMutation } from './Obscenity'

export interface LibraryIdea extends BoxesIdea, ObscenityLevelsIdea {}

// const example_library: LibraryIdea = {
//  boxes: new Set(),
//  obscenity_level_maximum: 15,
//  obscenity_level_none: 0,
//  obscenity_levels: 16
// }

export const Library: LibraryIdea = idea_tools.evolve({
 evolution: [ObscenityLevelsMutation, BoxesMutation],
 final: {} as LibraryIdea,
 name: 'Library',
}).final

export interface LibraryToolsIdea {}

export const library_tools = idea_tools.evolve<LibraryToolsIdea>({
 evolution: [],
 final: {} as LibraryToolsIdea,
 name: 'library_tools',
}).final
