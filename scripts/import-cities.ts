/**
 * Import Indian cities into MongoDB
 * Usage: npx tsx --env-file=.env.local scripts/import-cities.ts
 *
 * Safe to re-run — skips cities that already exist.
 * Add more cities at the bottom of the CITIES array anytime.
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) throw new Error('MONGODB_URI not set in .env.local')

const CitySchema = new mongoose.Schema({ name: String, state: String, isActive: { type: Boolean, default: true } })
CitySchema.index({ name: 1 })
const City = mongoose.models.City || mongoose.model('City', CitySchema)

// ─── City data ─────────────────────────────────────────────────────────────
// Format: [name, state]  — add more rows freely
const CITIES: [string, string][] = [
  // ── Andhra Pradesh ──────────────────────────────────────────────────────
  ['Visakhapatnam','Andhra Pradesh'],['Vijayawada','Andhra Pradesh'],['Guntur','Andhra Pradesh'],
  ['Nellore','Andhra Pradesh'],['Kurnool','Andhra Pradesh'],['Rajahmundry','Andhra Pradesh'],
  ['Kadapa','Andhra Pradesh'],['Tirupati','Andhra Pradesh'],['Kakinada','Andhra Pradesh'],
  ['Vizianagaram','Andhra Pradesh'],['Eluru','Andhra Pradesh'],['Anantapur','Andhra Pradesh'],
  ['Proddatur','Andhra Pradesh'],['Ongole','Andhra Pradesh'],['Tenali','Andhra Pradesh'],
  ['Hindupur','Andhra Pradesh'],['Chittoor','Andhra Pradesh'],['Bhimavaram','Andhra Pradesh'],
  ['Machilipatnam','Andhra Pradesh'],['Srikakulam','Andhra Pradesh'],['Adoni','Andhra Pradesh'],
  ['Nandyal','Andhra Pradesh'],['Dharmavaram','Andhra Pradesh'],['Guntakal','Andhra Pradesh'],
  ['Narasaraopet','Andhra Pradesh'],['Tadipatri','Andhra Pradesh'],['Gudivada','Andhra Pradesh'],

  // ── Arunachal Pradesh ───────────────────────────────────────────────────
  ['Itanagar','Arunachal Pradesh'],['Naharlagun','Arunachal Pradesh'],['Pasighat','Arunachal Pradesh'],
  ['Bomdila','Arunachal Pradesh'],['Ziro','Arunachal Pradesh'],

  // ── Assam ───────────────────────────────────────────────────────────────
  ['Guwahati','Assam'],['Silchar','Assam'],['Dibrugarh','Assam'],['Jorhat','Assam'],
  ['Nagaon','Assam'],['Tinsukia','Assam'],['Tezpur','Assam'],['Sivasagar','Assam'],
  ['Bongaigaon','Assam'],['Dhubri','Assam'],['Karimganj','Assam'],['North Lakhimpur','Assam'],
  ['Hailakandi','Assam'],['Barpeta','Assam'],['Goalpara','Assam'],['Mangaldoi','Assam'],
  ['Diphu','Assam'],['Golaghat','Assam'],['Haflong','Assam'],['Mushalpur','Assam'],

  // ── Bihar ───────────────────────────────────────────────────────────────
  ['Patna','Bihar'],['Gaya','Bihar'],['Bhagalpur','Bihar'],['Muzaffarpur','Bihar'],
  ['Darbhanga','Bihar'],['Bihar Sharif','Bihar'],['Arrah','Bihar'],['Begusarai','Bihar'],
  ['Katihar','Bihar'],['Munger','Bihar'],['Chhapra','Bihar'],['Purnia','Bihar'],
  ['Samastipur','Bihar'],['Hajipur','Bihar'],['Dehri','Bihar'],['Sasaram','Bihar'],
  ['Motihari','Bihar'],['Nawada','Bihar'],['Sitamarhi','Bihar'],['Madhubani','Bihar'],
  ['Bettiah','Bihar'],['Siwan','Bihar'],['Jehanabad','Bihar'],['Bagaha','Bihar'],
  ['Aurangabad','Bihar'],['Gopalganj','Bihar'],['Buxar','Bihar'],['Kishanganj','Bihar'],
  ['Supaul','Bihar'],['Saharsa','Bihar'],['Madhepura','Bihar'],['Jahanabad','Bihar'],

  // ── Chhattisgarh ────────────────────────────────────────────────────────
  ['Raipur','Chhattisgarh'],['Bhilai','Chhattisgarh'],['Bilaspur','Chhattisgarh'],
  ['Korba','Chhattisgarh'],['Durg','Chhattisgarh'],['Rajnandgaon','Chhattisgarh'],
  ['Jagdalpur','Chhattisgarh'],['Ambikapur','Chhattisgarh'],['Raigarh','Chhattisgarh'],
  ['Dhamtari','Chhattisgarh'],['Bhatapara','Chhattisgarh'],['Mahasamund','Chhattisgarh'],
  ['Kanker','Chhattisgarh'],['Kawardha','Chhattisgarh'],['Bijapur','Chhattisgarh'],

  // ── Goa ─────────────────────────────────────────────────────────────────
  ['Panaji','Goa'],['Margao','Goa'],['Vasco da Gama','Goa'],['Mapusa','Goa'],
  ['Ponda','Goa'],['Bicholim','Goa'],['Curchorem','Goa'],['Valpoi','Goa'],

  // ── Gujarat ─────────────────────────────────────────────────────────────
  ['Ahmedabad','Gujarat'],['Surat','Gujarat'],['Vadodara','Gujarat'],['Rajkot','Gujarat'],
  ['Bhavnagar','Gujarat'],['Jamnagar','Gujarat'],['Gandhinagar','Gujarat'],['Junagadh','Gujarat'],
  ['Anand','Gujarat'],['Navsari','Gujarat'],['Morbi','Gujarat'],['Mehsana','Gujarat'],
  ['Surendranagar','Gujarat'],['Bharuch','Gujarat'],['Porbandar','Gujarat'],
  ['Gandhidham','Gujarat'],['Ankleshwar','Gujarat'],['Valsad','Gujarat'],['Gondal','Gujarat'],
  ['Veraval','Gujarat'],['Botad','Gujarat'],['Amreli','Gujarat'],['Dhoraji','Gujarat'],
  ['Wankaner','Gujarat'],['Jetpur','Gujarat'],['Savarkundla','Gujarat'],['Sihor','Gujarat'],
  ['Mahuva','Gujarat'],['Palanpur','Gujarat'],['Patan','Gujarat'],['Unjha','Gujarat'],
  ['Disa','Gujarat'],['Visnagar','Gujarat'],['Kadi','Gujarat'],['Nadiad','Gujarat'],
  ['Khambhat','Gujarat'],['Dahod','Gujarat'],['Godhra','Gujarat'],['Himatnagar','Gujarat'],
  ['Modasa','Gujarat'],['Deesa','Gujarat'],

  // ── Haryana ─────────────────────────────────────────────────────────────
  ['Faridabad','Haryana'],['Gurugram','Haryana'],['Panipat','Haryana'],['Ambala','Haryana'],
  ['Yamunanagar','Haryana'],['Rohtak','Haryana'],['Hisar','Haryana'],['Karnal','Haryana'],
  ['Sonipat','Haryana'],['Panchkula','Haryana'],['Bhiwani','Haryana'],['Sirsa','Haryana'],
  ['Bahadurgarh','Haryana'],['Jind','Haryana'],['Thanesar','Haryana'],['Kaithal','Haryana'],
  ['Rewari','Haryana'],['Palwal','Haryana'],['Narnaul','Haryana'],['Fatehabad','Haryana'],
  ['Hansi','Haryana'],['Samalkha','Haryana'],['Shahabad','Haryana'],['Nuh','Haryana'],
  ['Mahendragarh','Haryana'],['Charkhi Dadri','Haryana'],

  // ── Himachal Pradesh ────────────────────────────────────────────────────
  ['Shimla','Himachal Pradesh'],['Dharamsala','Himachal Pradesh'],['Mandi','Himachal Pradesh'],
  ['Solan','Himachal Pradesh'],['Nahan','Himachal Pradesh'],['Chamba','Himachal Pradesh'],
  ['Hamirpur','Himachal Pradesh'],['Kullu','Himachal Pradesh'],['Manali','Himachal Pradesh'],
  ['Palampur','Himachal Pradesh'],['Baddi','Himachal Pradesh'],['Sundarnagar','Himachal Pradesh'],
  ['Una','Himachal Pradesh'],['Kangra','Himachal Pradesh'],['Bilaspur','Himachal Pradesh'],
  ['Rampur','Himachal Pradesh'],['Nurpur','Himachal Pradesh'],

  // ── Jharkhand ───────────────────────────────────────────────────────────
  ['Ranchi','Jharkhand'],['Jamshedpur','Jharkhand'],['Dhanbad','Jharkhand'],
  ['Bokaro','Jharkhand'],['Deoghar','Jharkhand'],['Hazaribag','Jharkhand'],
  ['Giridih','Jharkhand'],['Ramgarh','Jharkhand'],['Medininagar','Jharkhand'],
  ['Chaibasa','Jharkhand'],['Daltonganj','Jharkhand'],['Dumka','Jharkhand'],
  ['Gumla','Jharkhand'],['Lohardaga','Jharkhand'],['Sahebganj','Jharkhand'],
  ['Pakur','Jharkhand'],['Godda','Jharkhand'],['Chirkunda','Jharkhand'],

  // ── Karnataka ───────────────────────────────────────────────────────────
  ['Bengaluru','Karnataka'],['Mysuru','Karnataka'],['Hubli','Karnataka'],
  ['Dharwad','Karnataka'],['Mangaluru','Karnataka'],['Belagavi','Karnataka'],
  ['Kalaburagi','Karnataka'],['Ballari','Karnataka'],['Vijayapura','Karnataka'],
  ['Shivamogga','Karnataka'],['Tumakuru','Karnataka'],['Davanagere','Karnataka'],
  ['Bidar','Karnataka'],['Raichur','Karnataka'],['Hospet','Karnataka'],
  ['Udupi','Karnataka'],['Hassan','Karnataka'],['Chitradurga','Karnataka'],
  ['Gadag','Karnataka'],['Bagalkot','Karnataka'],['Mandya','Karnataka'],
  ['Gangavati','Karnataka'],['Bhadravati','Karnataka'],['Chikkamagaluru','Karnataka'],
  ['Kolar','Karnataka'],['Ramanagara','Karnataka'],['Tiptur','Karnataka'],
  ['Gokak','Karnataka'],['Yadgir','Karnataka'],['Sagara','Karnataka'],
  ['Sirsi','Karnataka'],['Puttur','Karnataka'],['Bantwal','Karnataka'],
  ['Manipal','Karnataka'],['Robertsonpet','Karnataka'],['Ranebennuru','Karnataka'],
  ['Sindhnur','Karnataka'],['Ilkal','Karnataka'],['Rabkavi-Banhatti','Karnataka'],

  // ── Kerala ──────────────────────────────────────────────────────────────
  ['Kochi','Kerala'],['Thiruvananthapuram','Kerala'],['Kozhikode','Kerala'],
  ['Thrissur','Kerala'],['Kollam','Kerala'],['Palakkad','Kerala'],
  ['Alappuzha','Kerala'],['Malappuram','Kerala'],['Kannur','Kerala'],
  ['Kasaragod','Kerala'],['Kottayam','Kerala'],['Ponnani','Kerala'],
  ['Tirur','Kerala'],['Vatakara','Kerala'],['Kayamkulam','Kerala'],
  ['Ottappalam','Kerala'],['Manjeri','Kerala'],['Perinthalmanna','Kerala'],
  ['Cherthala','Kerala'],['Punalur','Kerala'],['Varkala','Kerala'],
  ['Neyyattinkara','Kerala'],['Chalakudy','Kerala'],['Perumbavoor','Kerala'],
  ['Muvattupuzha','Kerala'],['Kothamangalam','Kerala'],['Thalassery','Kerala'],
  ['Irinjalakuda','Kerala'],['Thrippunithura','Kerala'],['Adoor','Kerala'],

  // ── Madhya Pradesh ──────────────────────────────────────────────────────
  ['Bhopal','Madhya Pradesh'],['Indore','Madhya Pradesh'],['Jabalpur','Madhya Pradesh'],
  ['Gwalior','Madhya Pradesh'],['Ujjain','Madhya Pradesh'],['Sagar','Madhya Pradesh'],
  ['Dewas','Madhya Pradesh'],['Satna','Madhya Pradesh'],['Ratlam','Madhya Pradesh'],
  ['Rewa','Madhya Pradesh'],['Murwara','Madhya Pradesh'],['Singrauli','Madhya Pradesh'],
  ['Burhanpur','Madhya Pradesh'],['Khandwa','Madhya Pradesh'],['Bhind','Madhya Pradesh'],
  ['Chhindwara','Madhya Pradesh'],['Guna','Madhya Pradesh'],['Shivpuri','Madhya Pradesh'],
  ['Vidisha','Madhya Pradesh'],['Chhatarpur','Madhya Pradesh'],['Damoh','Madhya Pradesh'],
  ['Mandsaur','Madhya Pradesh'],['Khargone','Madhya Pradesh'],['Neemuch','Madhya Pradesh'],
  ['Pithampur','Madhya Pradesh'],['Seoni','Madhya Pradesh'],['Hoshangabad','Madhya Pradesh'],
  ['Itarsi','Madhya Pradesh'],['Sehore','Madhya Pradesh'],['Betul','Madhya Pradesh'],
  ['Morena','Madhya Pradesh'],['Tikamgarh','Madhya Pradesh'],['Shahdol','Madhya Pradesh'],
  ['Balaghat','Madhya Pradesh'],['Narsinghpur','Madhya Pradesh'],['Mandla','Madhya Pradesh'],
  ['Katni','Madhya Pradesh'],['Dindori','Madhya Pradesh'],['Anuppur','Madhya Pradesh'],
  ['Ashoknagar','Madhya Pradesh'],['Datia','Madhya Pradesh'],['Panna','Madhya Pradesh'],

  // ── Maharashtra ─────────────────────────────────────────────────────────
  ['Mumbai','Maharashtra'],['Pune','Maharashtra'],['Nagpur','Maharashtra'],
  ['Thane','Maharashtra'],['Nashik','Maharashtra'],['Aurangabad (Chhatrapati Sambhajinagar)','Maharashtra'],
  ['Solapur','Maharashtra'],['Amravati','Maharashtra'],['Navi Mumbai','Maharashtra'],
  ['Kolhapur','Maharashtra'],['Sangli','Maharashtra'],['Akola','Maharashtra'],
  ['Latur','Maharashtra'],['Nanded','Maharashtra'],['Chandrapur','Maharashtra'],
  ['Jalgaon','Maharashtra'],['Bhiwandi','Maharashtra'],['Dhule','Maharashtra'],
  ['Ahmednagar','Maharashtra'],['Kalyan','Maharashtra'],['Ulhasnagar','Maharashtra'],
  ['Malegaon','Maharashtra'],['Panvel','Maharashtra'],['Satara','Maharashtra'],
  ['Jalna','Maharashtra'],['Parbhani','Maharashtra'],['Yavatmal','Maharashtra'],
  ['Osmanabad (Dharashiv)','Maharashtra'],['Wardha','Maharashtra'],['Beed','Maharashtra'],
  ['Buldhana','Maharashtra'],['Washim','Maharashtra'],['Gondia','Maharashtra'],
  ['Gadchiroli','Maharashtra'],['Hingoli','Maharashtra'],['Ratnagiri','Maharashtra'],
  ['Alibag','Maharashtra'],['Pen','Maharashtra'],['Roha','Maharashtra'],
  ['Ichalkaranji','Maharashtra'],['Pimpri-Chinchwad','Maharashtra'],['Vasai-Virar','Maharashtra'],
  ['Mira-Bhayandar','Maharashtra'],['Bhusawal','Maharashtra'],['Achalpur','Maharashtra'],
  ['Baramati','Maharashtra'],['Nandurbar','Maharashtra'],

  // ── Manipur ─────────────────────────────────────────────────────────────
  ['Imphal','Manipur'],['Thoubal','Manipur'],['Kakching','Manipur'],
  ['Bishnupur','Manipur'],['Churachandpur','Manipur'],['Senapati','Manipur'],

  // ── Meghalaya ───────────────────────────────────────────────────────────
  ['Shillong','Meghalaya'],['Tura','Meghalaya'],['Jowai','Meghalaya'],
  ['Nongstoin','Meghalaya'],['Baghmara','Meghalaya'],

  // ── Mizoram ─────────────────────────────────────────────────────────────
  ['Aizawl','Mizoram'],['Lunglei','Mizoram'],['Champhai','Mizoram'],
  ['Serchhip','Mizoram'],['Kolasib','Mizoram'],

  // ── Nagaland ────────────────────────────────────────────────────────────
  ['Kohima','Nagaland'],['Dimapur','Nagaland'],['Mokokchung','Nagaland'],
  ['Tuensang','Nagaland'],['Wokha','Nagaland'],['Zunheboto','Nagaland'],

  // ── Odisha ──────────────────────────────────────────────────────────────
  ['Bhubaneswar','Odisha'],['Cuttack','Odisha'],['Rourkela','Odisha'],
  ['Brahmapur','Odisha'],['Sambalpur','Odisha'],['Puri','Odisha'],
  ['Balasore','Odisha'],['Bhadrak','Odisha'],['Baripada','Odisha'],
  ['Jharsuguda','Odisha'],['Bargarh','Odisha'],['Jeypore','Odisha'],
  ['Balangir','Odisha'],['Bhawanipatna','Odisha'],['Rayagada','Odisha'],
  ['Kendujhar','Odisha'],['Paradip','Odisha'],['Dhenkanal','Odisha'],
  ['Kendrapara','Odisha'],['Angul','Odisha'],['Koraput','Odisha'],
  ['Phulbani','Odisha'],['Berhampur','Odisha'],['Sundargarh','Odisha'],

  // ── Punjab ──────────────────────────────────────────────────────────────
  ['Ludhiana','Punjab'],['Amritsar','Punjab'],['Jalandhar','Punjab'],
  ['Patiala','Punjab'],['Bathinda','Punjab'],['Hoshiarpur','Punjab'],
  ['Mohali (SAS Nagar)','Punjab'],['Pathankot','Punjab'],['Moga','Punjab'],
  ['Firozpur','Punjab'],['Batala','Punjab'],['Gurdaspur','Punjab'],
  ['Abohar','Punjab'],['Phagwara','Punjab'],['Khanna','Punjab'],
  ['Barnala','Punjab'],['Rajpura','Punjab'],['Sangrur','Punjab'],
  ['Nabha','Punjab'],['Muktsar','Punjab'],['Fazilka','Punjab'],
  ['Faridkot','Punjab'],['Mansa','Punjab'],['Rupnagar','Punjab'],
  ['Kapurthala','Punjab'],['Zirakpur','Punjab'],

  // ── Rajasthan ───────────────────────────────────────────────────────────
  ['Jaipur','Rajasthan'],['Jodhpur','Rajasthan'],['Kota','Rajasthan'],
  ['Bikaner','Rajasthan'],['Ajmer','Rajasthan'],['Bhilwara','Rajasthan'],
  ['Alwar','Rajasthan'],['Sri Ganganagar','Rajasthan'],['Sikar','Rajasthan'],
  ['Bharatpur','Rajasthan'],['Barmer','Rajasthan'],['Pali','Rajasthan'],
  ['Hanumangarh','Rajasthan'],['Dhaulpur','Rajasthan'],['Tonk','Rajasthan'],
  ['Churu','Rajasthan'],['Sawai Madhopur','Rajasthan'],['Nagaur','Rajasthan'],
  ['Jhunjhunu','Rajasthan'],['Bundi','Rajasthan'],['Chittorgarh','Rajasthan'],
  ['Banswara','Rajasthan'],['Udaipur','Rajasthan'],['Dungarpur','Rajasthan'],
  ['Sirohi','Rajasthan'],['Jaisalmer','Rajasthan'],['Karauli','Rajasthan'],
  ['Dausa','Rajasthan'],['Rajsamand','Rajasthan'],['Baran','Rajasthan'],
  ['Jhalawar','Rajasthan'],['Pratapgarh','Rajasthan'],['Jalor','Rajasthan'],
  ['Beawar','Rajasthan'],['Kishangarh','Rajasthan'],['Gangapur City','Rajasthan'],

  // ── Sikkim ──────────────────────────────────────────────────────────────
  ['Gangtok','Sikkim'],['Namchi','Sikkim'],['Gyalshing','Sikkim'],['Mangan','Sikkim'],

  // ── Tamil Nadu ──────────────────────────────────────────────────────────
  ['Chennai','Tamil Nadu'],['Coimbatore','Tamil Nadu'],['Madurai','Tamil Nadu'],
  ['Tiruchirappalli','Tamil Nadu'],['Salem','Tamil Nadu'],['Tirunelveli','Tamil Nadu'],
  ['Tiruppur','Tamil Nadu'],['Vellore','Tamil Nadu'],['Erode','Tamil Nadu'],
  ['Thoothukudi','Tamil Nadu'],['Dindigul','Tamil Nadu'],['Thanjavur','Tamil Nadu'],
  ['Kanchipuram','Tamil Nadu'],['Cuddalore','Tamil Nadu'],['Nagercoil','Tamil Nadu'],
  ['Kumbakonam','Tamil Nadu'],['Karur','Tamil Nadu'],['Hosur','Tamil Nadu'],
  ['Sivakasi','Tamil Nadu'],['Pollachi','Tamil Nadu'],['Udhagamandalam','Tamil Nadu'],
  ['Rajapalayam','Tamil Nadu'],['Ambattur','Tamil Nadu'],['Avadi','Tamil Nadu'],
  ['Ambur','Tamil Nadu'],['Virudhunagar','Tamil Nadu'],['Namakkal','Tamil Nadu'],
  ['Pudukkottai','Tamil Nadu'],['Sivaganga','Tamil Nadu'],['Ramanathapuram','Tamil Nadu'],
  ['Krishnagiri','Tamil Nadu'],['Dharmapuri','Tamil Nadu'],['Nagapattinam','Tamil Nadu'],
  ['Villupuram','Tamil Nadu'],['Tiruvannamalai','Tamil Nadu'],['Tiruvallur','Tamil Nadu'],
  ['Tirupattur','Tamil Nadu'],['Ranipet','Tamil Nadu'],['Chengalpattu','Tamil Nadu'],
  ['Kallakurichi','Tamil Nadu'],['Mayiladuthurai','Tamil Nadu'],['Perambalur','Tamil Nadu'],
  ['Ariyalur','Tamil Nadu'],['Tiruvarur','Tamil Nadu'],['Karaikudi','Tamil Nadu'],

  // ── Telangana ───────────────────────────────────────────────────────────
  ['Hyderabad','Telangana'],['Secunderabad','Telangana'],['Warangal','Telangana'],
  ['Nizamabad','Telangana'],['Khammam','Telangana'],['Karimnagar','Telangana'],
  ['Ramagundam','Telangana'],['Mahbubnagar','Telangana'],['Nalgonda','Telangana'],
  ['Adilabad','Telangana'],['Suryapet','Telangana'],['Miryalaguda','Telangana'],
  ['Siddipet','Telangana'],['Jagitial','Telangana'],['Nirmal','Telangana'],
  ['Mancherial','Telangana'],['Kothagudem','Telangana'],['Bhongir','Telangana'],
  ['Vikarabad','Telangana'],['Sangareddy','Telangana'],['Medak','Telangana'],
  ['Zahirabad','Telangana'],['Tandur','Telangana'],['Kamareddy','Telangana'],
  ['Bodhan','Telangana'],['Wanaparthy','Telangana'],['Gadwal','Telangana'],

  // ── Tripura ─────────────────────────────────────────────────────────────
  ['Agartala','Tripura'],['Dharmanagar','Tripura'],['Udaipur','Tripura'],
  ['Kailashahar','Tripura'],['Ambassa','Tripura'],['Belonia','Tripura'],

  // ── Uttar Pradesh ───────────────────────────────────────────────────────
  ['Lucknow','Uttar Pradesh'],['Kanpur','Uttar Pradesh'],['Ghaziabad','Uttar Pradesh'],
  ['Agra','Uttar Pradesh'],['Meerut','Uttar Pradesh'],['Varanasi','Uttar Pradesh'],
  ['Prayagraj','Uttar Pradesh'],['Bareilly','Uttar Pradesh'],['Aligarh','Uttar Pradesh'],
  ['Moradabad','Uttar Pradesh'],['Saharanpur','Uttar Pradesh'],['Gorakhpur','Uttar Pradesh'],
  ['Noida','Uttar Pradesh'],['Firozabad','Uttar Pradesh'],['Jhansi','Uttar Pradesh'],
  ['Muzaffarnagar','Uttar Pradesh'],['Mathura','Uttar Pradesh'],['Shahjahanpur','Uttar Pradesh'],
  ['Rampur','Uttar Pradesh'],['Farrukhabad','Uttar Pradesh'],['Mau','Uttar Pradesh'],
  ['Hapur','Uttar Pradesh'],['Etawah','Uttar Pradesh'],['Sambhal','Uttar Pradesh'],
  ['Amroha','Uttar Pradesh'],['Bulandshahr','Uttar Pradesh'],['Lakhimpur','Uttar Pradesh'],
  ['Sitapur','Uttar Pradesh'],['Hardoi','Uttar Pradesh'],['Unnao','Uttar Pradesh'],
  ['Raebareli','Uttar Pradesh'],['Sultanpur','Uttar Pradesh'],['Jaunpur','Uttar Pradesh'],
  ['Gonda','Uttar Pradesh'],['Ballia','Uttar Pradesh'],['Azamgarh','Uttar Pradesh'],
  ['Mirzapur','Uttar Pradesh'],['Deoria','Uttar Pradesh'],['Kushinagar','Uttar Pradesh'],
  ['Bahraich','Uttar Pradesh'],['Shravasti','Uttar Pradesh'],['Balrampur','Uttar Pradesh'],
  ['Basti','Uttar Pradesh'],['Siddharthnagar','Uttar Pradesh'],['Ayodhya','Uttar Pradesh'],
  ['Amethi','Uttar Pradesh'],['Banda','Uttar Pradesh'],['Chitrakoot','Uttar Pradesh'],
  ['Fatehpur','Uttar Pradesh'],['Kaushambi','Uttar Pradesh'],['Pratapgarh','Uttar Pradesh'],
  ['Hamirpur','Uttar Pradesh'],['Mahoba','Uttar Pradesh'],['Lalitpur','Uttar Pradesh'],
  ['Jalaun','Uttar Pradesh'],['Auraiya','Uttar Pradesh'],['Etah','Uttar Pradesh'],
  ['Mainpuri','Uttar Pradesh'],['Budaun','Uttar Pradesh'],['Pilibhit','Uttar Pradesh'],
  ['Kasganj','Uttar Pradesh'],['Hathras','Uttar Pradesh'],['Greater Noida','Uttar Pradesh'],
  ['Vrindavan','Uttar Pradesh'],['Rishikesh (UP)','Uttar Pradesh'],

  // ── Uttarakhand ─────────────────────────────────────────────────────────
  ['Dehradun','Uttarakhand'],['Haridwar','Uttarakhand'],['Roorkee','Uttarakhand'],
  ['Haldwani','Uttarakhand'],['Rudrapur','Uttarakhand'],['Kashipur','Uttarakhand'],
  ['Rishikesh','Uttarakhand'],['Kotdwara','Uttarakhand'],['Ramnagar','Uttarakhand'],
  ['Mussoorie','Uttarakhand'],['Nainital','Uttarakhand'],['Pithoragarh','Uttarakhand'],
  ['Almora','Uttarakhand'],['Champawat','Uttarakhand'],['Bageshwar','Uttarakhand'],
  ['Pauri','Uttarakhand'],['Tehri','Uttarakhand'],['Uttarkashi','Uttarakhand'],
  ['Chamoli','Uttarakhand'],['Rudraprayag','Uttarakhand'],

  // ── West Bengal ─────────────────────────────────────────────────────────
  ['Kolkata','West Bengal'],['Howrah','West Bengal'],['Durgapur','West Bengal'],
  ['Asansol','West Bengal'],['Siliguri','West Bengal'],['Bardhaman','West Bengal'],
  ['Malda','West Bengal'],['Baharampur','West Bengal'],['Habra','West Bengal'],
  ['Kharagpur','West Bengal'],['Shantipur','West Bengal'],['Raiganj','West Bengal'],
  ['Darjeeling','West Bengal'],['Krishnanagar','West Bengal'],['Haldia','West Bengal'],
  ['Jalpaiguri','West Bengal'],['Cooch Behar','West Bengal'],['Contai','West Bengal'],
  ['Purulia','West Bengal'],['Bankura','West Bengal'],['Bishnupur','West Bengal'],
  ['Arambagh','West Bengal'],['Tamluk','West Bengal'],['Midnapore','West Bengal'],
  ['Jhargram','West Bengal'],['Barrackpore','West Bengal'],['Bally','West Bengal'],
  ['Uluberia','West Bengal'],['Dankuni','West Bengal'],['Kalyani','West Bengal'],
  ['Ranaghat','West Bengal'],['Nabadwip','West Bengal'],['Santiniketan','West Bengal'],
  ['Alipurduar','West Bengal'],['Balurghat','West Bengal'],['Islampur','West Bengal'],

  // ── Delhi ───────────────────────────────────────────────────────────────
  ['New Delhi','Delhi'],['Delhi','Delhi'],['Dwarka','Delhi'],['Rohini','Delhi'],
  ['Pitampura','Delhi'],['Janakpuri','Delhi'],['Laxmi Nagar','Delhi'],
  ['Saket','Delhi'],['Vasant Kunj','Delhi'],['Karol Bagh','Delhi'],
  ['Connaught Place','Delhi'],['Shahdara','Delhi'],['Preet Vihar','Delhi'],
  ['Patparganj','Delhi'],['Mayur Vihar','Delhi'],['Uttam Nagar','Delhi'],
  ['Narela','Delhi'],['Bawana','Delhi'],

  // ── Chandigarh ──────────────────────────────────────────────────────────
  ['Chandigarh','Chandigarh'],['Panchkula','Chandigarh'],['Mohali','Chandigarh'],

  // ── Puducherry ──────────────────────────────────────────────────────────
  ['Pondicherry','Puducherry'],['Karaikal','Puducherry'],['Yanam','Puducherry'],['Mahe','Puducherry'],

  // ── Jammu & Kashmir ─────────────────────────────────────────────────────
  ['Srinagar','Jammu & Kashmir'],['Jammu','Jammu & Kashmir'],['Sopore','Jammu & Kashmir'],
  ['Anantnag','Jammu & Kashmir'],['Baramulla','Jammu & Kashmir'],['Udhampur','Jammu & Kashmir'],
  ['Kathua','Jammu & Kashmir'],['Rajouri','Jammu & Kashmir'],['Poonch','Jammu & Kashmir'],
  ['Kupwara','Jammu & Kashmir'],['Pulwama','Jammu & Kashmir'],['Budgam','Jammu & Kashmir'],
  ['Kulgam','Jammu & Kashmir'],['Shopian','Jammu & Kashmir'],

  // ── Ladakh ──────────────────────────────────────────────────────────────
  ['Leh','Ladakh'],['Kargil','Ladakh'],

  // ── Other UTs ───────────────────────────────────────────────────────────
  ['Port Blair','Andaman & Nicobar'],
  ['Kavaratti','Lakshadweep'],
  ['Daman','Daman & Diu'],['Diu','Daman & Diu'],
  ['Silvassa','Dadra & Nagar Haveli'],

  ['Not Applicable','Not Applicable'],
]

// ─── Seed runner ────────────────────────────────────────────────────────────
async function run() {
  console.log('🔗 Connecting…')
  await mongoose.connect(MONGODB_URI)
  console.log(`✅ Connected — importing ${CITIES.length} cities\n`)

  let added = 0, skipped = 0

  for (const [name, state] of CITIES) {
    // Use updateOne with upsert so re-runs are safe
    const res = await (City as any).updateOne(
      { name },
      { $setOnInsert: { name, state, isActive: true } },
      { upsert: true }
    )
    if (res.upsertedCount > 0) { added++; process.stdout.write('.') }
    else skipped++
  }

  console.log(`\n\n✅ Added:   ${added} new cities`)
  console.log(`⏭  Skipped: ${skipped} already existed`)
  console.log(`📊 Total:   ${CITIES.length} cities across all states`)
  console.log('\nDone! Telecallers can now search cities in the entry form.')

  await mongoose.disconnect()
}

run().catch(e => { console.error(e); process.exit(1) })