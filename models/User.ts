import { Schema, model, models } from 'mongoose'
import type { IUser } from '@/types'

const UserSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role:     { type: String, enum: ['admin', 'telecaller'], required: true },
    phone:    { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const User = models.User || model<IUser>('User', UserSchema)
