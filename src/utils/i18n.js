import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const strings = {
  en: {
    appName: 'AAMA सखी',
    appTagline: 'Community Health Companion',

    navHome: 'Home',
    navNewVisit: 'New Visit',
    navPatients: 'Patients',
    navGuide: 'Guide',
    navSettings: 'Settings',

    greeting: 'Namaste',
    todayVisits: "Today's Visits",
    pendingSync: 'Pending Sync',
    highRisk: 'High Risk',
    totalPatients: 'Total Patients',
    recentVisits: 'Recent Visits',
    quickActions: 'Quick Actions',
    startVisit: 'Start Visit',
    viewPatients: 'View Patients',
    training: 'Training',
    syncNow: 'Sync Now',
    noVisitsToday: 'No visits recorded today',

    step1: 'Patient Info',
    step2: 'Physical Health',
    step3: 'Wellness Check',
    step4: 'Results',

    patientName: 'Patient Name',
    age: 'Age',
    patientType: 'Patient Type',
    postnatalMother: 'Postnatal Mother',
    youth: 'Youth (12-19)',
    address: 'Village / Ward',
    phone: 'Phone (optional)',
    next: 'Next',
    back: 'Back',

    physicalHealthTitle: 'Physical Health Check',
    physicalHealthDesc: 'Complete the standard health checklist',

    wellnessTitle: 'General Wellness Check',
    wellnessDesc: 'Ask these questions in a conversational tone',
    answered: 'answered',

    resultTitle: 'Visit Summary',
    riskLow: 'Low Risk',
    riskModerate: 'Moderate Risk',
    riskHigh: 'High Risk',
    riskCritical: 'Critical — Immediate Action',
    scoreSuffix: 'out of',

    saveVisit: 'Save & Complete Visit',
    saving: 'Saving...',
    newVisit: 'Start New Visit',

    searchPatients: 'Search patients...',
    allPatients: 'All',
    filterLow: 'Low',
    filterModerate: 'Moderate',
    filterHigh: 'High',
    filterCritical: 'Critical',
    noPatients: 'No patients found',
    lastVisit: 'Last visit',
    visits: 'visits',
    patientsOnRecord: 'patients on record',

    settingsTitle: 'Settings',
    fchvProfile: 'Volunteer Profile',
    fchvName: 'Your Name',
    fchvDistrict: 'District',
    language: 'Language',
    syncSettings: 'Sync & Data',
    about: 'About AAMA',
    version: 'Version',
    pendingRecords: 'pending records',
    localData: 'Local Data',
    encryptedDB: 'WatermelonDB (SQLite)',
    save: 'Save',
    cancel: 'Cancel',
    profileSaved: 'Profile saved',

    // Guide
    guideTitle: 'Volunteer Guide',
    guideSubtitle: 'Resources and training to help you',
    trainingModules: 'Training Modules',
    emergencyNumbers: 'Emergency Numbers',
    quickReference: 'Quick Reference',
    mentalHealthResources: 'Mental Health Resources',
    crisisHotline: 'Crisis Hotline',
    emergencyServices: 'Emergency Services',
    healthPost: 'Nearest Health Post',
    districtHospital: 'District Hospital',

    // Alert
    alertSent: 'Alert Sent',
    alertAutoRouted: 'Auto-routed to nearest psychiatrist',
    assignedPsychiatrist: 'Assigned Psychiatrist',
    callPsychiatrist: 'Call Psychiatrist',
    sendSMS: 'Send SMS',
    escalate: 'Escalate',
    escalateToSupervisor: 'Escalate to Supervisor',
    manualContact: 'Manual Contact',
    callCrisisHotline: 'Call Crisis Hotline (1166)',
    alertEscalated: 'Alert escalated',

    // SOS
    sosTitle: 'CRITICAL ALERT',
    sosMessage:
      'This patient may be at immediate risk of self-harm. Do NOT leave them alone. Contact the nearest psychiatric nurse immediately.',
    sosCrisisLine: 'Call Crisis Hotline',
    sosDismiss: 'I understand, continue',

    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',
    loading: 'Loading...',

    // Quick reference
    greenMeans: 'GREEN = Patient is well. Follow-up in 4-6 weeks.',
    yellowMeans: 'YELLOW = Some concerns. Follow-up in 1-2 weeks.',
    redMeans: 'RED = Significant risk. Refer to health post within 1 week.',
    flashingRedMeans: 'FLASHING RED = Self-harm risk! Do NOT leave patient alone!',
  },
  ne: {
    appName: 'AAMA सखी',
    appTagline: 'सामुदायिक स्वास्थ्य साथी',

    navHome: 'गृहपृष्ठ',
    navNewVisit: 'नयाँ भेट',
    navPatients: 'बिरामीहरू',
    navGuide: 'सहयोग',
    navSettings: 'सेटिङ्',

    greeting: 'नमस्ते',
    todayVisits: 'आजको भेट',
    pendingSync: 'पेन्डिङ सिंक',
    highRisk: 'उच्च जोखिम',
    totalPatients: 'जम्मा बिरामी',
    recentVisits: 'हालका भेटहरू',
    quickActions: 'छिटो कार्य',
    startVisit: 'भेट सुरु',
    viewPatients: 'बिरामी हेर्नुहोस्',
    training: 'तालिम',
    syncNow: 'सिंक गर्नुहोस्',
    noVisitsToday: 'आज कुनै भेट रेकर्ड छैन',

    step1: 'बिरामी जानकारी',
    step2: 'शारीरिक स्वास्थ्य',
    step3: 'सामान्य स्वास्थ्य',
    step4: 'नतिजा',

    patientName: 'बिरामीको नाम',
    age: 'उमेर',
    patientType: 'बिरामी प्रकार',
    postnatalMother: 'सुत्केरी आमा',
    youth: 'युवा (१२-१९)',
    address: 'गाउँ / वडा',
    phone: 'फोन (ऐच्छिक)',
    next: 'अर्को',
    back: 'पछाडि',

    physicalHealthTitle: 'शारीरिक स्वास्थ्य जाँच',
    physicalHealthDesc: 'मानक स्वास्थ्य चेकलिस्ट पूरा गर्नुहोस्',

    wellnessTitle: 'सामान्य स्वास्थ्य जाँच',
    wellnessDesc: 'कुराकानीको स्वरमा यी प्रश्नहरू सोध्नुहोस्',
    answered: 'पूरा',

    resultTitle: 'भेट सारांश',
    riskLow: 'कम जोखिम',
    riskModerate: 'मध्यम जोखिम',
    riskHigh: 'उच्च जोखिम',
    riskCritical: 'गम्भीर — तत्काल कार्य',
    scoreSuffix: 'मा',

    saveVisit: 'भेट सुरक्षित गर्नुहोस्',
    saving: 'सुरक्षित गर्दै...',
    newVisit: 'नयाँ भेट सुरु',

    searchPatients: 'बिरामी खोज्नुहोस्...',
    allPatients: 'सबै',
    filterLow: 'कम',
    filterModerate: 'मध्यम',
    filterHigh: 'उच्च',
    filterCritical: 'गम्भीर',
    noPatients: 'कुनै बिरामी भेटिएन',
    lastVisit: 'अन्तिम भेट',
    visits: 'भेटहरू',
    patientsOnRecord: 'बिरामी रेकर्डमा',

    settingsTitle: 'सेटिङ्',
    fchvProfile: 'स्वयंसेवक प्रोफाइल',
    fchvName: 'तपाईंको नाम',
    fchvDistrict: 'जिल्ला',
    language: 'भाषा',
    syncSettings: 'सिंक र डाटा',
    about: 'AAMA बारेमा',
    version: 'संस्करण',
    pendingRecords: 'पेन्डिङ रेकर्ड',
    localData: 'स्थानीय डाटा',
    encryptedDB: 'WatermelonDB (SQLite)',
    save: 'सुरक्षित',
    cancel: 'रद्द',
    profileSaved: 'प्रोफाइल सुरक्षित भयो',

    guideTitle: 'स्वयंसेवक सहयोग',
    guideSubtitle: 'तपाईंलाई सहयोग गर्ने स्रोतहरू र तालिम',
    trainingModules: 'तालिम मोड्युलहरू',
    emergencyNumbers: 'आपतकालीन नम्बरहरू',
    quickReference: 'छिटो सन्दर्भ',
    mentalHealthResources: 'मानसिक स्वास्थ्य स्रोतहरू',
    crisisHotline: 'क्राइसिस हटलाइन',
    emergencyServices: 'आपतकालीन सेवा',
    healthPost: 'नजिकको स्वास्थ्य चौकी',
    districtHospital: 'जिल्ला अस्पताल',

    alertSent: 'सूचना पठाइयो',
    alertAutoRouted: 'नजिकको मनोचिकित्सकलाई स्वचालित पठाइयो',
    assignedPsychiatrist: 'तोकिएको मनोचिकित्सक',
    callPsychiatrist: 'मनोचिकित्सकलाई कल गर्नुहोस्',
    sendSMS: 'SMS पठाउनुहोस्',
    escalate: 'बढाउनुहोस्',
    escalateToSupervisor: 'सुपरभाइजरलाई बढाउनुहोस्',
    manualContact: 'म्यानुअल सम्पर्क',
    callCrisisHotline: 'क्राइसिस हटलाइन कल गर्नुहोस् (११६६)',
    alertEscalated: 'सूचना बढाइयो',

    sosTitle: 'गम्भीर सूचना',
    sosMessage:
      'यो बिरामी तत्काल आत्म-हानिको जोखिममा हुन सक्छ। उनीहरूलाई एक्लै नछोड्नुहोस्। तत्काल मनोचिकित्सा नर्ससँग सम्पर्क गर्नुहोस्।',
    sosCrisisLine: 'क्राइसिस हटलाइनमा कल गर्नुहोस्',
    sosDismiss: 'मैले बुझें, जारी राख्नुहोस्',

    today: 'आज',
    yesterday: 'हिजो',
    daysAgo: 'दिन अगाडि',
    loading: 'लोड हुँदैछ...',

    greenMeans: 'हरियो = बिरामी ठीक छन्। ४-६ हप्तामा फलो-अप।',
    yellowMeans: 'पहेंलो = केही चिन्ताहरू। १-२ हप्तामा फलो-अप।',
    redMeans: 'रातो = ठूलो जोखिम। १ हप्ताभित्र स्वास्थ्य चौकीमा रिफर।',
    flashingRedMeans: 'चम्किरहेको रातो = आत्म-हानि जोखिम! बिरामीलाई एक्लै नछोड्नुहोस्!',
  },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('ne');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('aama-lang')
      .then((saved) => {
        if (saved) setLang(saved);
      })
      .finally(() => setLoaded(true));
  }, []);

  const setLanguage = (l) => {
    setLang(l);
    AsyncStorage.setItem('aama-lang', l);
  };

  const t = (key) => strings[lang]?.[key] || strings.en[key] || key;

  if (!loaded) return null;

  return <I18nContext.Provider value={{ lang, setLanguage, t }}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}
