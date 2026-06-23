import { Schema, model, models } from 'mongoose'

export interface ICity {
  name: string
  state: string
  isActive: boolean
}

const CitySchema = new Schema<ICity>(
  {
    name:     { type: String, required: true, trim: true },
    state:    { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Text index for fast search + regular index for exact match
CitySchema.index({ name: 'text' })
CitySchema.index({ name: 1 })

export const City = models.City || model<ICity>('City', CitySchema)