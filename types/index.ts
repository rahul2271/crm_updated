// // import type { Types } from 'mongoose'

// // export type UserRole = 'admin' | 'telecaller'
// // export type AgeGroup = '0-18' | '18-35' | '35-60' | '60+'
// // export type ConsultationType = 'online' | 'hospital'

// // /**
// //  * One row = one unique combination of:
// //  *   disease + city + consultationType (+ ageGroup)
// //  *
// //  * Example: 10 diabetes leads split as:
// //  *   Row 1 → Diabetes | Mumbai | Online  | 6 leads | 3 converted | ₹9,000
// //  *   Row 2 → Diabetes | Pune   | Hospital | 4 leads | 2 converted | ₹8,000
// //  */
// // export interface IDiseaseEntry {
// //   disease: string
// //   ageGroup: AgeGroup
// //   city: string
// //   state: string
// //   consultationType: ConsultationType
// //   leadsCount: number
// //   convertedCount: number
// //   revenueGenerated: number   // total ₹ revenue from this row's conversions
// // }

// // export interface IDailyEntry {
// //   _id: Types.ObjectId
// //   telecallerId: Types.ObjectId
// //   date: string             // 'YYYY-MM-DD'
// //   totalLeadsGiven: number  // leads assigned to this telecaller today
// //   entries: IDiseaseEntry[]
// //   notes?: string
// //   createdAt: Date
// //   updatedAt: Date
// // }

// // export interface IUser {
// //   _id: Types.ObjectId
// //   name: string
// //   email: string
// //   password: string
// //   role: UserRole
// //   phone?: string
// //   isActive: boolean
// //   createdAt: Date
// //   updatedAt: Date
// // }

// // export interface IDisease {
// //   _id: Types.ObjectId
// //   name: string
// //   category: string
// //   isActive: boolean
// // }




// import type { Types } from 'mongoose'

// export type UserRole = 'admin' | 'telecaller'
// export type AgeGroup = '0-18' | '18-35' | '35-60' | '60+'
// export type ConsultationType = 'online' | 'hospital' | 'whatsapp' | 'call'

// export const CONSULT_OPTIONS: { value: ConsultationType; label: string; icon: string; color: string }[] = [
//   { value: 'online',    label: 'Online Lead',    icon: '💻', color: 'bg-blue-100 text-blue-700'   },
//   { value: 'hospital',  label: 'Hospital Visit', icon: '🏥', color: 'bg-orange-100 text-orange-700' },
//   { value: 'whatsapp',  label: 'WhatsApp',       icon: '💬', color: 'bg-green-100 text-green-700'  },
//   { value: 'call',      label: 'Phone Call',     icon: '📞', color: 'bg-purple-100 text-purple-700' },
// ]

// export interface IDiseaseEntry {
//   disease: string
//   ageGroup: AgeGroup
//   city: string
//   state: string
//   consultationType: ConsultationType
//   leadsCount: number
//   convertedCount: number
//   revenueGenerated: number
// }

// export interface IDailyEntry {
//   _id: Types.ObjectId
//   telecallerId: Types.ObjectId
//   date: string
//   totalLeadsGiven: number
//   entries: IDiseaseEntry[]
//   notes?: string
//   createdAt: Date
//   updatedAt: Date
// }

// export interface IUser {
//   _id: Types.ObjectId
//   name: string
//   email: string
//   password: string
//   role: UserRole
//   phone?: string
//   isActive: boolean
//   createdAt: Date
//   updatedAt: Date
// }

// export interface IDisease {
//   _id: Types.ObjectId
//   name: string
//   category: string
//   isActive: boolean
// }


// import type { Types } from 'mongoose'

// export type UserRole = 'admin' | 'telecaller'
// export type AgeGroup = '0-18' | '18-35' | '35-60' | '60+'
// export type ConsultationType = 'online' | 'hospital'

// /**
//  * One row = one unique combination of:
//  *   disease + city + consultationType (+ ageGroup)
//  *
//  * Example: 10 diabetes leads split as:
//  *   Row 1 → Diabetes | Mumbai | Online  | 6 leads | 3 converted | ₹9,000
//  *   Row 2 → Diabetes | Pune   | Hospital | 4 leads | 2 converted | ₹8,000
//  */
// export interface IDiseaseEntry {
//   disease: string
//   ageGroup: AgeGroup
//   city: string
//   state: string
//   consultationType: ConsultationType
//   leadsCount: number
//   convertedCount: number
//   revenueGenerated: number   // total ₹ revenue from this row's conversions
// }

// export interface IDailyEntry {
//   _id: Types.ObjectId
//   telecallerId: Types.ObjectId
//   date: string             // 'YYYY-MM-DD'
//   totalLeadsGiven: number  // leads assigned to this telecaller today
//   entries: IDiseaseEntry[]
//   notes?: string
//   createdAt: Date
//   updatedAt: Date
// }

// export interface IUser {
//   _id: Types.ObjectId
//   name: string
//   email: string
//   password: string
//   role: UserRole
//   phone?: string
//   isActive: boolean
//   createdAt: Date
//   updatedAt: Date
// }

// export interface IDisease {
//   _id: Types.ObjectId
//   name: string
//   category: string
//   isActive: boolean
// }




import type { Types } from 'mongoose'

export type UserRole = 'admin' | 'telecaller'
export type AgeGroup = '0-18' | '18-35' | '35-60' | '60+'
export type ConsultationType = 'online' | 'hospital' | 'whatsapp' | 'call' | 'website_booking'
export type PatientType = 'new' | 'existing'
export type AdmissionType = 'IPD' | 'OPD' | 'Cashless'

export const CONSULT_OPTIONS: { value: ConsultationType; label: string; icon: string; color: string }[] = [
  { value: 'online',           label: 'Online Lead',      icon: '💻', color: 'bg-blue-100 text-blue-700'    },
  { value: 'hospital',         label: 'Hospital Visit',   icon: '🏥', color: 'bg-orange-100 text-orange-700' },
  { value: 'whatsapp',         label: 'WhatsApp',         icon: '💬', color: 'bg-green-100 text-green-700'   },
  { value: 'call',             label: 'Phone Call',       icon: '📞', color: 'bg-purple-100 text-purple-700' },
  { value: 'website_booking',  label: 'Website Booking',  icon: '🌐', color: 'bg-pink-100 text-pink-700'    },
]

export const PATIENT_TYPE_OPTIONS: { value: PatientType; label: string; icon: string; color: string }[] = [
  { value: 'new',      label: 'New Patient',      icon: '🆕', color: 'bg-teal-100 text-teal-700'   },
  { value: 'existing', label: 'Existing Patient', icon: '🔄', color: 'bg-indigo-100 text-indigo-700' },
]

export const ADMISSION_TYPE_OPTIONS: { value: AdmissionType; label: string; icon: string; color: string }[] = [
  { value: 'IPD',      label: 'IPD',      icon: '🛏️',  color: 'bg-red-100 text-red-700'     },
  { value: 'OPD',      label: 'OPD',      icon: '🩺',  color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Cashless', label: 'Cashless', icon: '💳',  color: 'bg-cyan-100 text-cyan-700'   },
]

export interface IDiseaseEntry {
  disease: string
  ageGroup: AgeGroup
  city: string
  state: string
  consultationType: ConsultationType
  patientType: PatientType
  admissionType?: AdmissionType
  insuranceCompany?: string   // optional — one of GID_INSURANCE_COMPANIES or null
  leadsCount: number
  convertedCount: number
  revenueGenerated: number
}

export interface IDailyEntry {
  _id: Types.ObjectId
  telecallerId: Types.ObjectId
  date: string
  totalLeadsGiven: number
  entries: IDiseaseEntry[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface IUser {
  _id: Types.ObjectId
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IDisease {
  _id: Types.ObjectId
  name: string
  category: string
  isActive: boolean
}
// ── GID Insurance Companies (32 companies under General Insurance Division) ──
export const GID_INSURANCE_COMPANIES = [
  'New India Assurance',
  'National Insurance Company',
  'United India Insurance',
  'Oriental Insurance Company',
  'Star Health and Allied Insurance',
  'HDFC ERGO General Insurance',
  'ICICI Lombard General Insurance',
  'Bajaj Allianz General Insurance',
  'Reliance General Insurance',
  'SBI General Insurance',
  'Tata AIG General Insurance',
  'Future Generali India Insurance',
  'Niva Bupa Health Insurance',
  'Aditya Birla Health Insurance',
  'Care Health Insurance',
  'ManipalCigna Health Insurance',
  'Acko General Insurance',
  'Go Digit General Insurance',
  'Kotak Mahindra General Insurance',
  'Cholamandalam MS General Insurance',
  'Magma HDI General Insurance',
  'Royal Sundaram General Insurance',
  'Universal Sompo General Insurance',
  'Liberty General Insurance',
  'Navi General Insurance',
  'Raheja QBE General Insurance',
  'Shriram General Insurance',
  'Iffco Tokio General Insurance',
  'Zurich Kotak General Insurance',
  'Pramerica Life Insurance',
  'Edelweiss General Insurance',
  'Zuno General Insurance',
] as const

export type GIDInsuranceCompany = typeof GID_INSURANCE_COMPANIES[number]
