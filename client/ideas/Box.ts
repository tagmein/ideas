import { Idea, idea_tools } from './Idea'

interface BoxIdea {}

export const Box: Idea<BoxIdea> = {
 evolution: [],
 final: {} as BoxIdea,
 name: 'Box',
}

interface BoxToolsIdea {}

export const box_tools: BoxToolsIdea = idea_tools.evolve({
 evolution: [],
 final: {} as BoxToolsIdea,
 name: 'box_tools',
}).final
