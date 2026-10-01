import { z } from 'zod'
const text = (max = 300) => z.string().trim().min(1).max(max)
export const BriefSchema = z.object({
  origin:z.string().max(80).default(''), destination:z.string().max(80).default(''),
  days:z.number().int().min(1).max(14), startDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal('')).default(''),
  budget:z.number().positive().max(1000000).nullable().default(null), currency:z.literal('CNY').default('CNY'),
  interests:z.array(text(30)).max(8), pace:z.enum(['松弛','均衡','充实']), companion:text(30),
  request:z.string().max(2000).default(''), constraints:z.string().max(1000).default(''),
}).strict()
export const StopSchema=z.object({placeId:text(100),startTime:z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),durationMinutes:z.number().int().min(15).max(600),note:z.string().max(400).default('')}).strict()
export const DaySchema=z.object({day:z.number().int().min(1).max(14),title:text(100),stops:z.array(StopSchema).max(10)}).strict()
export const PlanDraftSchema=z.object({destination:text(80),summary:text(600),days:z.array(DaySchema).min(1).max(14),warnings:z.array(text(500)).max(20)}).strict()
export const CandidateSchema=z.object({id:text(100),reason:text(600),tradeoff:text(600)}).strict()
export const ProposalSchema=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('destinations'),candidates:z.array(CandidateSchema).min(1).max(3)}).strict(),
 z.object({kind:z.literal('itinerary'),plan:PlanDraftSchema}).strict(),
])
export const RunRequestSchema=z.object({kind:z.enum(['discover','plan','adjust']),brief:BriefSchema,tripId:z.string().max(100).optional(),baseRevision:z.number().int().nonnegative().optional(),idempotencyKey:text(100),scopeDays:z.array(z.number().int().min(1).max(14)).max(14).default([]),request:z.string().max(2000).default('')}).strict()
export const PlaceSchema=z.object({id:text(100),name:text(150),city:text(80),address:z.string().max(300),category:z.string().max(150),coordinate:z.tuple([z.number().min(-180).max(180),z.number().min(-90).max(90)]),coordinateSystem:z.enum(['GCJ02','WGS84']),sourceUrl:z.string().url(),retrievedAt:z.string(),openingHours:z.string().nullable(),ticketPrice:z.string().nullable(),verified:z.boolean()}).strict()
export const TripSchema=z.object({id:text(100),revision:z.number().int().nonnegative(),brief:BriefSchema,plan:PlanDraftSchema,places:z.array(PlaceSchema).max(100),lockedIds:z.array(text(100)).max(100),dataMode:z.enum(['live','example']),updatedAt:z.string()}).strict()
