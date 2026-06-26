import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) throw new Error('MONGODB_URI not set in .env.local')

const UserSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String, phone: String, isActive: { type: Boolean, default: true } }, { timestamps: true })
const DiseaseSchema = new mongoose.Schema({ name: String, category: String, isActive: { type: Boolean, default: true } })

const User    = mongoose.models.User    || mongoose.model('User', UserSchema)
const Disease = mongoose.models.Disease || mongoose.model('Disease', DiseaseSchema)

const diseases = [
  // Digestive Disorders
  { name: 'IBS (Irritable Bowel Syndrome)',   category: 'Digestive Disorders' },
  { name: 'IBD (Inflammatory Bowel Disease)', category: 'Digestive Disorders' },
  { name: 'Ulcerative Colitis',               category: 'Digestive Disorders' },
  { name: 'GERD / Acid Reflux',               category: 'Digestive Disorders' },

  // Pain Management
  { name: 'Sciatica',                          category: 'Pain Management' },
  { name: 'Cervical Spondylosis',              category: 'Pain Management' },
  { name: 'Back Pain',                         category: 'Pain Management' },
  { name: 'Knee Pain',                         category: 'Pain Management' },
  { name: 'Osteoarthritis',                    category: 'Pain Management' },
  { name: 'Rheumatoid Arthritis',              category: 'Pain Management' },
  { name: 'Gout',                              category: 'Pain Management' },
  { name: 'Fibromyalgia',                      category: 'Pain Management' },

  // Auto-Immune Disorders
  { name: 'ITP (Immune Thrombocytopenia)',     category: 'Auto-Immune Disorders' },
  { name: 'Psoriasis',                         category: 'Auto-Immune Disorders' },
  { name: 'Multiple Sclerosis',                category: 'Auto-Immune Disorders' },

  // Skin Disorders
  { name: 'Eczema',                            category: 'Skin Disorders' },
  { name: 'Acne',                              category: 'Skin Disorders' },
  { name: 'Hyper-pigmentation',                category: 'Skin Disorders' },
  { name: 'Vitiligo',                          category: 'Skin Disorders' },

  // Respiratory Disorders
  { name: 'Asthma',                            category: 'Respiratory Disorders' },
  { name: 'COPD',                              category: 'Respiratory Disorders' },
  { name: 'Bronchitis',                        category: 'Respiratory Disorders' },

  // Liver Disorders
  { name: 'Fatty Liver (NAFLD)',               category: 'Liver Disorders' },
  { name: 'Hepatitis',                         category: 'Liver Disorders' },
  { name: 'Liver Cirrhosis',                   category: 'Liver Disorders' },
  { name: 'Ascitis',                           category: 'Liver Disorders' },

  // Metabolic Disorders
  { name: 'Diabetes Type 1',                   category: 'Metabolic Disorders' },
  { name: 'Diabetes Type 2',                   category: 'Metabolic Disorders' },
  { name: 'Insulin Resistance',                category: 'Metabolic Disorders' },
  { name: 'Diabetic Neuropathy',               category: 'Metabolic Disorders' },
  { name: 'Thyroid (Hypothyroidism)',          category: 'Metabolic Disorders' },
  { name: 'Thyroid (Hyperthyroidism)',         category: 'Metabolic Disorders' },

  // Cardiac Disorders
  { name: 'Hypertension',                      category: 'Cardiac Disorders' },
  { name: 'High Cholesterol',                  category: 'Cardiac Disorders' },
  { name: 'Angina',                            category: 'Cardiac Disorders' },
  { name: 'Coronary Artery Disease',           category: 'Cardiac Disorders' },
  { name: 'Arrhythmia',                        category: 'Cardiac Disorders' },

  // Renal Disorders
  { name: 'Chronic Kidney Disease (CKD)',      category: 'Renal Disorders' },
  { name: 'UTI (Urinary Tract Infection)',     category: 'Renal Disorders' },
  { name: 'Kidney Stones',                     category: 'Renal Disorders' },
  { name: 'Nephrotic Syndrome',                category: 'Renal Disorders' },

  // Reproductive Disorders
  { name: 'PCOS / PCOD',                       category: 'Reproductive Disorders' },
  { name: 'Endometriosis',                     category: 'Reproductive Disorders' },
  { name: 'Hormonal Imbalance',                category: 'Reproductive Disorders' },
  { name: 'Male Health Disorders',             category: 'Reproductive Disorders' },
  { name: 'Female Health Disorders',           category: 'Reproductive Disorders' },
]

async function seed() {
  console.log('🌱 Connecting…')
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected\n')

  // Admin
  if (!await User.findOne({ email: 'admin@patientcrm.com' })) {
    await User.create({ name: 'Super Admin', email: 'admin@patientcrm.com', password: await bcrypt.hash('Admin@1234', 10), role: 'admin', isActive: true })
    console.log('👤 Admin: admin@patientcrm.com / Admin@1234')
  } else console.log('👤 Admin already exists')

  // Telecallers
  for (const tc of [
    { name: 'Priya Sharma', email: 'priya@patientcrm.com', phone: '9876543210' },
    { name: 'Rahul Verma',  email: 'rahul@patientcrm.com', phone: '9876543211' },
    { name: 'Anita Patel',  email: 'anita@patientcrm.com', phone: '9876543212' },
  ]) {
    if (!await User.findOne({ email: tc.email })) {
      await User.create({ ...tc, password: await bcrypt.hash('Telecaller@1234', 10), role: 'telecaller', isActive: true })
      console.log(`📞 Telecaller: ${tc.email} / Telecaller@1234`)
    } else console.log(`📞 ${tc.email} already exists`)
  }

  // Diseases
  let created = 0
  for (const d of diseases) {
    if (!await Disease.findOne({ name: d.name })) { await Disease.create(d); created++ }
  }
  console.log(`\n🏥 ${created} new diseases seeded (${diseases.length} total)`)
  console.log('\n✅ Done!\n')
  console.log('─── Credentials ──────────────────────────────')
  console.log('Admin:      admin@patientcrm.com  / Admin@1234')
  console.log('Telecaller: priya@patientcrm.com  / Telecaller@1234')
  console.log('──────────────────────────────────────────────')

  await mongoose.disconnect()
}

seed().catch(e => { console.error(e); process.exit(1) })