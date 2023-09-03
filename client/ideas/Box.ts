import { IdeaMutation, idea_tools } from './Idea'
import { LabelIdea, LabelsIdea, LabelsMutation } from './Label'

export interface BoxIdea extends LabelsIdea {}

export const Box: BoxIdea = idea_tools.evolve({
 evolution: [LabelsMutation],
 final: {} as BoxIdea,
 name: 'Box',
}).final

interface BoxToolsIdea {}

export const box_tools: BoxToolsIdea = idea_tools.evolve({
 evolution: [],
 final: {} as BoxToolsIdea,
 name: 'box_tools',
}).final

export interface BoxesIdea {
 boxes: Set<BoxIdea>
}

export const BoxesMutation: IdeaMutation = {
 added: ['boxes'],
 values: {
  boxes: new Set(),
 },
}
