import { IdeaMutation } from './Idea'

export interface ObscenityLevelsIdea {
 obscenity_levels: 0x10
 obscenity_level_maximum: 0xf
 obscenity_level_none: 0
}

export const default_obscenity_levels: ObscenityLevelsIdea = {
 obscenity_levels: 0x10,
 obscenity_level_maximum: 0xf,
 obscenity_level_none: 0,
}

export const ObscenityLevelsMutation: IdeaMutation = {
 added: ['obscenity_levels', 'obscenity_level_maximum', 'obscenity_level_none'],
 values: {
  ...default_obscenity_levels,
 },
}
