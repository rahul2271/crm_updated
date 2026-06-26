import { Schema, model, models } from 'mongoose'
import type { IDisease } from '@/types'

const DiseaseSchema = new Schema<IDisease>(
  {
    name:     { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Disease = models.Disease || model<IDisease>('Disease', DiseaseSchema)
