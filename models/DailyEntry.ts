// // import { Schema, model, models } from 'mongoose'
// // import type { IDailyEntry } from '@/types'

// // const DiseaseEntrySchema = new Schema(
// //   {
// //     disease:           { type: String, required: true },
// //     ageGroup:          { type: String, enum: ['0-18', '18-35', '35-60', '60+'], required: true },
// //     city:              { type: String, required: true, trim: true },
// //     state:             { type: String, required: true, trim: true },
// //     consultationType:  { type: String, enum: ['online', 'hospital'], required: true },
// //     leadsCount:        { type: Number, required: true, min: 0 },
// //     convertedCount:    { type: Number, required: true, min: 0 },
// //     revenueGenerated:  { type: Number, required: true, min: 0, default: 0 },
// //   },
// //   { _id: false }
// // )

// // const DailyEntrySchema = new Schema<IDailyEntry>(
// //   {
// //     telecallerId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
// //     date:            { type: String, required: true, index: true },
// //     totalLeadsGiven: { type: Number, required: true, min: 0 },
// //     entries:         { type: [DiseaseEntrySchema], default: [] },
// //     notes:           { type: String, trim: true },
// //   },
// //   { timestamps: true }
// // )

// // DailyEntrySchema.index({ telecallerId: 1, date: 1 }, { unique: true })

// // export const DailyEntry = models.DailyEntry || model<IDailyEntry>('DailyEntry', DailyEntrySchema)



// import { Schema, model, models } from 'mongoose'
// import type { IDailyEntry } from '@/types'

// const DiseaseEntrySchema = new Schema(
//   {
//     disease:           { type: String, required: true },
//     ageGroup:          { type: String, enum: ['0-18', '18-35', '35-60', '60+'], required: true },
//     city:              { type: String, required: true, trim: true },
//     state:             { type: String, required: true, trim: true },
//     consultationType:  { type: String, enum: ['online', 'hospital', 'whatsapp', 'call'], required: true },
//     leadsCount:        { type: Number, required: true, min: 0 },
//     convertedCount:    { type: Number, required: true, min: 0 },
//     revenueGenerated:  { type: Number, required: true, min: 0, default: 0 },
//   },
//   { _id: false }
// )

// const DailyEntrySchema = new Schema<IDailyEntry>(
//   {
//     telecallerId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
//     date:            { type: String, required: true, index: true },
//     totalLeadsGiven: { type: Number, required: true, min: 0 },
//     entries:         { type: [DiseaseEntrySchema], default: [] },
//     notes:           { type: String, trim: true },
//   },
//   { timestamps: true }
// )

// DailyEntrySchema.index({ telecallerId: 1, date: 1 }, { unique: true })

// export const DailyEntry = models.DailyEntry || model<IDailyEntry>('DailyEntry', DailyEntrySchema)


// import { Schema, model, models } from 'mongoose'
// import type { IDailyEntry } from '@/types'

// const DiseaseEntrySchema = new Schema(
//   {
//     disease:           { type: String, required: true },
//     ageGroup:          { type: String, enum: ['0-18', '18-35', '35-60', '60+'], required: true },
//     city:              { type: String, required: true, trim: true },
//     state:             { type: String, required: true, trim: true },
//     consultationType:  { type: String, enum: ['online', 'hospital'], required: true },
//     leadsCount:        { type: Number, required: true, min: 0 },
//     convertedCount:    { type: Number, required: true, min: 0 },
//     revenueGenerated:  { type: Number, required: true, min: 0, default: 0 },
//   },
//   { _id: false }
// )

// const DailyEntrySchema = new Schema<IDailyEntry>(
//   {
//     telecallerId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
//     date:            { type: String, required: true, index: true },
//     totalLeadsGiven: { type: Number, required: true, min: 0 },
//     entries:         { type: [DiseaseEntrySchema], default: [] },
//     notes:           { type: String, trim: true },
//   },
//   { timestamps: true }
// )

// DailyEntrySchema.index({ telecallerId: 1, date: 1 }, { unique: true })

// export const DailyEntry = models.DailyEntry || model<IDailyEntry>('DailyEntry', DailyEntrySchema)



import { Schema, model, models } from 'mongoose'
import type { IDailyEntry } from '@/types'

const DiseaseEntrySchema = new Schema(
  {
    disease:           { type: String, required: true },
    ageGroup:          { type: String, enum: ['0-18', '18-35', '35-60', '60+'], required: true },
    city:              { type: String, required: true, trim: true },
    state:             { type: String, required: true, trim: true },
    consultationType:  { type: String, enum: ['online', 'hospital', 'whatsapp', 'call', 'website_booking'], required: true },
    patientType:       { type: String, enum: ['new', 'existing'], required: true, default: 'new' },
    admissionType:     { type: String, enum: ['IPD', 'OPD', 'Cashless'], required: false, default: null },
    insuranceCompany:  { type: String, required: false, default: null, trim: true },
    leadsCount:        { type: Number, required: true, min: 0 },
    convertedCount:    { type: Number, required: true, min: 0 },
    revenueGenerated:  { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
)

const DailyEntrySchema = new Schema<IDailyEntry>(
  {
    telecallerId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date:            { type: String, required: true, index: true },
    totalLeadsGiven: { type: Number, required: true, min: 0 },
    entries:         { type: [DiseaseEntrySchema], default: [] },
    notes:           { type: String, trim: true },
  },
  { timestamps: true }
)

DailyEntrySchema.index({ telecallerId: 1, date: 1 }, { unique: true })

export const DailyEntry = models.DailyEntry || model<IDailyEntry>('DailyEntry', DailyEntrySchema)