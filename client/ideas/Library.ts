import { BoxIdea, BoxesMutation, box_tools } from './Box'
import { style_tools } from './CSSStyleDeclaration'
import { DocumentsIdea, DocumentsMutation } from './Documents'
import { IdeaMutation, idea_tools } from './Idea'
import { ObscenityLevelsIdea, ObscenityLevelsMutation } from './Obscenity'
import { ToolBench } from './ToolBench'

export interface LibraryIdea extends DocumentsIdea, ObscenityLevelsIdea {}

// const example_library: LibraryIdea = {
//  boxes: new Set(),
//  obscenity_level_maximum: 15,
//  obscenity_level_none: 0,
//  obscenity_levels: 16
// }

export const Library: LibraryIdea = idea_tools.evolve({
 evolution: [ObscenityLevelsMutation, DocumentsMutation],
 final: {} as LibraryIdea,
 name: 'Library',
}).final

export const LIBRARY_CONTAINER_CLASS_NAME = 'library_container'

export interface LibraryToolsIdea {
 attach_toolbench(container: HTMLElement): HTMLElement
 prepare_html_element(box: BoxIdea): void
}

export interface LibraryViewStateIdea {
 sidebar: boolean
}

export const LibraryViewStateMutation: IdeaMutation = {
 added: ['library_view_state'],
 values: {
  library_view_state: {
   sidebar: true,
  },
 },
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

export const LibraryAttachToolbenchHTMLElementMutation: IdeaMutation = {
 added: 'attach_toolbench',
 values: {
  attach_toolbench(container: HTMLElement): HTMLDivElement {
   const toolbench = idea_tools.create(ToolBench)
   const toolbench_element =
    box_tools.to_html_element<HTMLDivElement>(toolbench)
   container.appendChild(toolbench_element)
   return toolbench_element
  },
 },
}

export const library_tools = ((globalThis as any).library_tools =
 idea_tools.evolve<LibraryToolsIdea>({
  evolution: [
   LibraryPrepareHTMLElementMutation,
   LibraryAttachToolbenchHTMLElementMutation,
  ],
  final: {} as LibraryToolsIdea,
  name: 'library_tools',
 }).final)
