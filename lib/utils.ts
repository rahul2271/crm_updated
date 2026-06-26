import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) { return clsx(inputs) }

export function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}
export function formatNumber(n: number) { return new Intl.NumberFormat('en-IN').format(n) }
export function formatPercent(n: number) { return `${n.toFixed(1)}%` }
export function formatDate(d: Date | string) { return format(new Date(d), 'dd MMM yyyy') }
export function todayString() { return format(new Date(), 'yyyy-MM-dd') }
export function conversionRate(converted: number, total: number) {
  return total === 0 ? 0 : Math.round((converted / total) * 1000) / 10
}

export const AGE_GROUPS = ['0-18', '18-35', '35-60', '60+'] as const

// N/A first so telecaller can pick it quickly
export const INDIAN_STATES = [
  'N/A',
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry',
  'Jammu & Kashmir','Ladakh','Lakshadweep','Dadra & Nagar Haveli','Daman & Diu','Andaman & Nicobar',
]

// Comprehensive Indian cities list for searchable dropdown
// N/A first so it's always the easiest pick
export const INDIAN_CITIES: string[] = [
  'N/A',
  // Metro / Tier-1
  'Mumbai','Delhi','Bengaluru','Hyderabad','Ahmedabad','Chennai','Kolkata','Pune','Surat','Jaipur',
  'Lucknow','Kanpur','Nagpur','Indore','Thane','Bhopal','Visakhapatnam','Patna','Vadodara','Ghaziabad',
  'Ludhiana','Agra','Nashik','Faridabad','Meerut','Rajkot','Varanasi','Srinagar','Aurangabad','Dhanbad',
  'Amritsar','Allahabad (Prayagraj)','Ranchi','Howrah','Coimbatore','Jabalpur','Gwalior','Vijayawada',
  'Jodhpur','Madurai','Raipur','Kota','Guwahati','Chandigarh','Solapur','Hubli-Dharwad','Tiruchirappalli',
  'Bareilly','Mysuru','Tiruppur','Gurgaon (Gurugram)','Noida','Aligarh','Jalandhar','Bhubaneswar',
  'Salem','Warangul','Guntur','Bhiwandi','Saharanpur','Gorakhpur','Bikaner','Amravati','Noida',
  'Jamshedpur','Bhilai','Cuttack','Firozabad','Kochi','Nellore','Bhavnagar','Dehradun','Durgapur',
  'Asansol','Rourkela','Nanded','Kolhapur','Ajmer','Akola','Gulbarga','Jamnagar','Ujjain','Siliguri',
  'Jhansi','Ulhasnagar','Nellore','Jammu','Sangli-Miraj','Mangaluru','Erode','Belgaum','Ambattur',
  'Tirunelveli','Malegaon','Gaya','Jalgaon','Udaipur','Maheshtala','Davanagere','Kozhikode','Kurnool',
  'Rajpur Sonarpur','Rajahmundry','Bokaro','South Dumdum','Bellary','Patiala','Gopalpur','Agartala',
  'Bhagalpur','Muzaffarnagar','Bhatpara','Panihati','Latur','Dhule','Rohtak','Korba','Bhilwara',
  'Brahmapur','Muzaffarpur','Ahmednagar','Mathura','Kollam','Avadi','Kadapa','Kamarhati','Bilaspur',
  'Shahjahanpur','Bijapur','Rampur','Shambhajinagar','Shimoga','Chandrapur','Junagadh','Thrissur',
  'Alwar','Bardhaman','Kulti','Nizamabad','Parbhani','Tumkur','Kharagpur','Loni','Hisar','Ozhukarai',
  'Bihar Sharif','Panipat','Darbhanga','Bally','Aizawl','Dewas','Ichalkaranji','Karnal','Bathinda',
  'Jalna','Eluru','Kirk Road','Barasat','Purnia','Satna','Mau','Sonipat','Farrukhabad','Hapur',
  'Sagar','Ratlam','Vizianagaram','Moradabad','Katihar','Etawah','Sambhal','Ambernath',
  'Tirupati','Yamunanagar','Rohtak','Anantapur','Karimnagar','Bidar','Hospet','Proddatur',
  'Nagercoil','Secunderabad','Noida Extension','Greater Noida','Pondicherry',
  // Smaller cities (Tier-3)
  'Shimla','Manali','Dharamsala','Solan','Mandi',
  'Imphal','Shillong','Kohima','Itanagar','Gangtok','Dispur','Silvassa','Daman','Port Blair',
  'Kavaratti','Panaji','Margao','Vasco da Gama',
  'Rishikesh','Haridwar','Mussoorie','Nainital','Haldwani','Roorkee',
  'Udhampur','Kathua','Anantnag','Baramulla','Leh','Kargil',
]