import { DocumentIdea } from './Document'
import { IdeaMutation } from './Idea'

export interface DocumentsIdea {
 documents: Map<number, DocumentIdea>
}

export const DocumentsMutation: IdeaMutation = {
 added: ['documents'],
 values: {
  documents: new Map(),
 },
}
