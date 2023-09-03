export interface Idea<T> {
 name: string
 evolution: IdeaMutation[]
 final: T
}

type Values<T extends string | string[]> = T extends string
 ? { [key in T]: any }
 : { [key in T[number]]: any }

export interface IdeaMutation<
 TAdded extends string | string[] = string | string[],
> {
 added?: TAdded
 removed?: string | string[]
 values: Values<TAdded>
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
  const final = {} as U
  for (const state of idea.evolution.reverse()) {
   if (typeof state.added === 'string') {
    state.added = [state.added]
   }
   if (Array.isArray(state.added)) {
    for (const added of state.added) {
     if (!(added in has_final_state)) {
      has_final_state[added] = true
      final[added] = state.values[added]
     }
    }
   }
   if (typeof state.removed === 'string') {
    state.removed = [state.removed]
   }
   if (Array.isArray(state.removed)) {
    for (const removed of state.removed) {
     if (!(removed in has_final_state)) {
      has_final_state[removed] = true
     }
    }
   }
  }
  return {
   ...idea,
   final,
  }
 },
}
