import { IdeaMutation, idea_tools } from './Idea'

export interface LabelIdea {
 title: string
}

const LabelTitleMutation: IdeaMutation = {
 added: ['title'],
 values: {
  title: '',
 },
}

export const Label: LabelIdea = idea_tools.evolve({
 evolution: [LabelTitleMutation],
 final: {} as LabelIdea,
 name: 'Label',
}).final

interface LabelToolsIdea {}

export const label_tools: LabelToolsIdea = idea_tools.evolve({
 evolution: [],
 final: {} as LabelToolsIdea,
 name: 'label_tools',
}).final

export interface LabelsIdea {
 labels: Set<LabelIdea>
}

export const LabelsMutation: IdeaMutation = {
 added: ['labels'],
 values: {
  labels: new Set<LabelIdea>(),
 },
}
