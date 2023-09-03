export interface Idea<T> {
 name: string
 evolution: IdeaState[]
 final: T
}

export interface Values {
 [key: string]: any
}

export interface IdeaState {
 added: string[]
 removed: string[]
 values: Values
}

export const idea_tools = {
 create<T extends { [key: string]: any }>(final: T): T {
  const idea = Object.assign({}, final)
  if ('run' in idea) {
   if (typeof idea.run === 'function') {
    idea.run()
   }
  }
  return idea
 },
 evolve<T, U = T>(idea: Idea<T>): Idea<U> {
  const has_final_state: { [key: string]: true } = {}
  const final = {}
  for (const state of idea.evolution.reverse()) {
   for (const added of state.added) {
    if (!(added in has_final_state)) {
     has_final_state[added] = true
     final[added] = state.values[added]
    }
   }
   for (const removed of state.removed) {
    if (!(removed in has_final_state)) {
     has_final_state[removed] = true
    }
   }
  }
  return {
   ...idea,
   final: final as unknown as U,
  }
 },
}
