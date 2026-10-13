import { defineCollection } from '@/lib/content'

import { checklistData, guidesData, keyFiguresData, routesData } from './data'
import { checklistItemSchema, guideSchema, keyFigureSchema, routeSchema } from './schema'

export type { ChecklistItem, Guide, KeyFigure, Route, Source } from './schema'

export const keyFigures = defineCollection('key figures', keyFigureSchema, keyFiguresData)
export const routes = defineCollection('routes', routeSchema, routesData)
export const guides = defineCollection('guides', guideSchema, guidesData)
export const checklist = defineCollection('checklist', checklistItemSchema, checklistData)
