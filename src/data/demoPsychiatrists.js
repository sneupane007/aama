export const demoPsychiatrists = [
  {
    id: 'psy_1',
    name: 'Dr. Anita Gurung',
    nameNe: 'डा. अनिता गुरुङ',
    phone: '+977-9801234567',
    district: 'Kaski',
    districtNe: 'कास्की',
    facility: 'Western Regional Hospital',
    facilityNe: 'पश्चिमाञ्चल क्षेत्रीय अस्पताल',
    available: true,
    specialty: { en: 'Perinatal Psychiatry', ne: 'प्रसवकालीन मनोचिकित्सा' },
  },
  {
    id: 'psy_2',
    name: 'Dr. Ramesh Adhikari',
    nameNe: 'डा. रमेश अधिकारी',
    phone: '+977-9807654321',
    district: 'Gorkha',
    districtNe: 'गोरखा',
    facility: 'Gorkha District Hospital',
    facilityNe: 'गोरखा जिल्ला अस्पताल',
    available: true,
    specialty: { en: 'Adolescent Mental Health', ne: 'किशोर मानसिक स्वास्थ्य' },
  },
  {
    id: 'psy_3',
    name: 'Dr. Sita Sharma',
    nameNe: 'डा. सीता शर्मा',
    phone: '+977-9812345678',
    district: 'Lamjung',
    districtNe: 'लमजुङ',
    facility: 'Lamjung Community Hospital',
    facilityNe: 'लमजुङ सामुदायिक अस्पताल',
    available: true,
    specialty: { en: 'Community Psychiatry', ne: 'सामुदायिक मनोचिकित्सा' },
  },
  {
    id: 'psy_4',
    name: 'Dr. Prakash Poudel',
    nameNe: 'डा. प्रकाश पौडेल',
    phone: '+977-9845678901',
    district: 'Tanahun',
    districtNe: 'तनहुँ',
    facility: 'Damauli Hospital',
    facilityNe: 'दमौली अस्पताल',
    available: false,
    specialty: { en: 'General Psychiatry', ne: 'सामान्य मनोचिकित्सा' },
  },
  {
    id: 'psy_5',
    name: 'Dr. Maya Tamang',
    nameNe: 'डा. माया तामाङ',
    phone: '+977-9856789012',
    district: 'Chitwan',
    districtNe: 'चितवन',
    facility: 'Bharatpur Hospital',
    facilityNe: 'भरतपुर अस्पताल',
    available: true,
    specialty: { en: 'Perinatal Psychiatry', ne: 'प्रसवकालीन मनोचिकित्सा' },
  },
  {
    id: 'psy_6',
    name: 'Dr. Binod Rai',
    nameNe: 'डा. विनोद राई',
    phone: '+977-9867890123',
    district: 'Kathmandu',
    districtNe: 'काठमाडौं',
    facility: 'Tribhuvan University Teaching Hospital',
    facilityNe: 'त्रिभुवन विश्वविद्यालय शिक्षण अस्पताल',
    available: true,
    specialty: { en: 'Adolescent & Community Psychiatry', ne: 'किशोर तथा सामुदायिक मनोचिकित्सा' },
  },
];

const DISTRICT_NEIGHBORS = {
  Kaski: ['Lamjung', 'Tanahun', 'Gorkha', 'Myagdi', 'Parbat'],
  Gorkha: ['Kaski', 'Lamjung', 'Tanahun', 'Dhading', 'Manang'],
  Lamjung: ['Kaski', 'Gorkha', 'Tanahun', 'Manang'],
  Tanahun: ['Kaski', 'Gorkha', 'Lamjung', 'Chitwan', 'Nawalparasi'],
  Chitwan: ['Tanahun', 'Nawalparasi', 'Makwanpur', 'Gorkha'],
  Kathmandu: ['Lalitpur', 'Bhaktapur', 'Nuwakot', 'Dhading', 'Kavrepalanchok'],
};

export function findNearestPsychiatrist(district, urgency = 'high') {
  const available = demoPsychiatrists.filter((p) => p.available);

  const sameDistrict = available.filter((p) => p.district.toLowerCase() === district.toLowerCase());
  if (sameDistrict.length > 0) return sameDistrict[0];

  const neighbors = DISTRICT_NEIGHBORS[district] || [];
  const nearbyDocs = available.filter((p) => neighbors.includes(p.district));
  if (nearbyDocs.length > 0) return nearbyDocs[0];

  if (urgency === 'critical' && available.length > 0) return available[0];

  return available[0] || demoPsychiatrists[0];
}
