import { Box, BoxIdea, BoxesIdea, BoxesMutation, box_tools } from './Box'
import { style_tools } from './CSSStyleDeclaration'
import { IdeaMutation, idea_tools } from './Idea'
import { ObscenityLevelsIdea, ObscenityLevelsMutation } from './Obscenity'
import { ToolBench } from './ToolBench'

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

export const LIBRARY_CONTAINER_CLASS_NAME = 'library_container'

export interface LibraryToolsIdea {
 prepare_html_element(box: BoxIdea): void
 toolbench_html_element(container: HTMLElement): void
}

style_tools.attach_style(LIBRARY_CONTAINER_CLASS_NAME, {
 display: 'flex',
 flexDirection: 'column',
 flexGrow: '1',
})

export const LibraryPrepareHTMLElementMutation: IdeaMutation = {
 added: 'prepare_html_element',
 values: {
  prepare_html_element(box: BoxIdea) {
   box.html_class_name = LIBRARY_CONTAINER_CLASS_NAME
   box.html_tag_name = 'div'
  },
 },
}

export const LibrarytoolbenchHTMLElementMutation: IdeaMutation = {
 added: 'toolbench_html_element',
 values: {
  toolbench_html_element(container: HTMLElement): void {
   const toolbench = idea_tools.create(ToolBench)
   container.appendChild(box_tools.to_html_element<HTMLDivElement>(toolbench))
  },
 },
}

export const library_tools = (globalThis.library_tools =
 idea_tools.evolve<LibraryToolsIdea>({
  evolution: [
   LibraryPrepareHTMLElementMutation,
   LibrarytoolbenchHTMLElementMutation,
  ],
  final: {} as LibraryToolsIdea,
  name: 'library_tools',
 }).final)
