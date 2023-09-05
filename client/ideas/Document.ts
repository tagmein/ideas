import { BoxIdea, BoxIdeaEvolution } from './Box'
import { IdIdea } from './Id'
import { idea_tools } from './Idea'
import { LibraryViewStateIdea, LibraryViewStateMutation } from './Library'

export interface DocumentIdea extends BoxIdea, IdIdea, LibraryViewStateIdea {}

export interface GetDocumentIdea {
 get_document(): DocumentIdea
}

export const Doc: DocumentIdea = idea_tools.evolve({
 evolution: [...BoxIdeaEvolution, LibraryViewStateMutation],
 final: {} as DocumentIdea,
 name: 'Doc',
}).final

export interface UpdateDocumentIdea {
 update_document(doc: DocumentIdea): void
}
