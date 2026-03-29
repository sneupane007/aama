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
    step3: 'Mental Health',
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

    wellnessTitle: 'Mental Wellbeing Check',
    wellnessDesc: 'As part of this visit, we also check on mental health. Please ask these questions gently and reassure the patient there are no right or wrong answers.',
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

    // Demo
    loadDemo: 'Load Demo Data',
    loadDemoDesc: 'Pre-fill with 8 sample patients for demonstration',
    demoLoaded: 'Demo data loaded successfully',

    // Consent gate
    consentTitle: 'Mental Health Screening',
    consentBody: 'This step includes a validated mental health assessment (EPDS/PHQ-A).\n\nPlease say to the patient:\n\n"As part of this visit, I will ask a few questions about your emotional wellbeing. There are no right or wrong answers — this helps me support you better."',
    consentBtn: 'Patient Informed — Proceed',

    // 3-Tier Response Protocol
    protocolTitle: 'Response Protocol',
    protocolLow1: 'Visit recorded locally',
    protocolLow2: 'Review at monthly health post meeting',
    protocolMod1: 'Visit recorded locally',
    protocolMod2: 'District nurse notified via SMS within 48 hours',
    protocolHigh1: 'Psychiatric nurse alerted by SMS',
    protocolHigh2: 'District health post notified',
    protocolCritTitle: '3-Step Safety Protocol — Act Now',
    protocolCrit1: 'Stay with the patient. Do NOT leave them alone.',
    protocolCrit2: 'Say: "You are not alone. I am here with you. Help is coming."',
    protocolCrit3: 'Call crisis hotline (1166) and psychiatric nurse immediately.',

    // Impact stat
    consultationsSaved: 'Consultations Optimized',
    consultationsSavedDesc: 'Only verified high-risk cases reach psychiatric nurses',

    // Patient detail
    visitHistory: 'Visit History',
    sessionNotes: 'Volunteer Notes',
    noNotes: 'No notes recorded for this session.',
    noAssignment: 'No psychiatrist assigned',
    patientDetails: 'Patient Details',
    addSessionNotes: 'Session notes (optional)',

    // Auth
    loginTitle: 'AAMA सखी',
    loginSubtitle: 'Sign in with your Volunteer ID',
    volunteerId: 'Volunteer ID',
    volunteerPin: 'PIN',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    invalidCredentials: 'Invalid Volunteer ID or PIN. Please try again.',
    demoHint: 'Demo: ID FCHV-1001  ·  PIN 1234',
    verifiedBadge: 'Verified FCHV',
    logout: 'Sign Out',
    logoutConfirm: 'Are you sure you want to sign out?',

    // Consult
    consultTab: 'Consult',
    consultTitle: 'Consult a Specialist',
    consultSubtitle: 'Reach out to available psychiatric nurses and counselors for guidance',
    available: 'Available',
    unavailable: 'Unavailable',
    callSpecialist: 'Call',
    whatsappLabel: 'WhatsApp',
    smsLabel: 'SMS',
    specializationLabel: 'Specialization',
    hoursLabel: 'Hours',
    consultNoteLabel: 'Describe your concern (optional)',
    consultNotePlaceholder: 'e.g. I have a patient showing signs of... or I need advice on...',

    // Alert preview
    alertPreviewTitle: 'Information Sent to Psychiatrist',
    alertPreviewToggle: 'View alert details',
    alertTimestamp: 'Alert sent at',
    alertVolunteer: 'Volunteer',
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
    step3: 'मानसिक स्वास्थ्य',
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

    wellnessTitle: 'मानसिक स्वास्थ्य जाँच',
    wellnessDesc: 'यस भेटमा हामी मानसिक स्वास्थ्यको पनि जाँच गर्छौं। कृपया यी प्रश्नहरू नरम स्वरमा सोध्नुहोस् र बिरामीलाई भन्नुहोस् कि कुनै उत्तर सही वा गलत छैन।',
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

    // Demo
    loadDemo: 'डेमो डेटा लोड गर्नुहोस्',
    loadDemoDesc: 'प्रदर्शनका लागि ८ नमूना बिरामीहरू भर्नुहोस्',
    demoLoaded: 'डेमो डेटा सफलतापूर्वक लोड भयो',

    // Consent gate
    consentTitle: 'मानसिक स्वास्थ्य जाँच',
    consentBody: 'यस चरणमा एक प्रमाणित मानसिक स्वास्थ्य मूल्यांकन (EPDS/PHQ-A) समावेश छ।\n\nकृपया बिरामीलाई भन्नुहोस्:\n\n"यस भेटको भागको रूपमा, म तपाईंको भावनात्मक स्वास्थ्यको बारेमा केही प्रश्नहरू सोध्नेछु। कुनै उत्तर सही वा गलत छैन — यसले मलाई तपाईंलाई राम्रोसँग सहयोग गर्न मद्दत गर्छ।"',
    consentBtn: 'बिरामीलाई जानकारी दिइयो — अगाडि बढ्नुहोस्',

    // 3-Tier Response Protocol
    protocolTitle: 'प्रतिक्रिया प्रोटोकल',
    protocolLow1: 'भेट स्थानीय रूपमा रेकर्ड गरियो',
    protocolLow2: 'मासिक स्वास्थ्य चौकी बैठकमा उठाउनुहोस्',
    protocolMod1: 'भेट स्थानीय रूपमा रेकर्ड गरियो',
    protocolMod2: 'जिल्ला नर्सलाई ४८ घण्टाभित्र SMS सूचना',
    protocolHigh1: 'मनोचिकित्सा नर्सलाई SMS सूचना पठाइयो',
    protocolHigh2: 'जिल्ला स्वास्थ्य चौकीलाई जानकारी दिइयो',
    protocolCritTitle: '३-चरण सुरक्षा प्रोटोकल — अहिले नै कार्य गर्नुहोस्',
    protocolCrit1: 'बिरामीसँगै रहनुहोस्। उनीहरूलाई एक्लो नछोड्नुहोस्।',
    protocolCrit2: 'भन्नुहोस्: "तपाईं एक्लो हुनुहुन्न। म यहाँ छु। सहायता आउँदैछ।"',
    protocolCrit3: 'क्राइसिस हटलाइन (११६६) र मनोचिकित्सा नर्सलाई तत्काल कल गर्नुहोस्।',

    // Impact stat
    consultationsSaved: 'परामर्श अनुकूलित',
    consultationsSavedDesc: 'प्रमाणित उच्च-जोखिम केसहरू मात्र नर्ससम्म पुग्छन्',

    // Patient detail
    visitHistory: 'भेट इतिहास',
    sessionNotes: 'स्वयंसेवक टिप्पणी',
    noNotes: 'यस सत्रका लागि कुनै टिप्पणी छैन।',
    noAssignment: 'मनोचिकित्सक तोकिएको छैन',
    patientDetails: 'बिरामी विवरण',
    addSessionNotes: 'सत्र टिप्पणी (ऐच्छिक)',

    // Auth
    loginTitle: 'AAMA सखी',
    loginSubtitle: 'स्वयंसेवक आईडीले साइन इन गर्नुहोस्',
    volunteerId: 'स्वयंसेवक आईडी',
    volunteerPin: 'पिन',
    signIn: 'साइन इन',
    signingIn: 'साइन इन हुँदैछ...',
    invalidCredentials: 'अमान्य स्वयंसेवक आईडी वा पिन। कृपया फेरि प्रयास गर्नुहोस्।',
    demoHint: 'डेमो: आईडी FCHV-1001  ·  पिन 1234',
    verifiedBadge: 'प्रमाणित FCHV',
    logout: 'साइन आउट',
    logoutConfirm: 'के तपाईं साइन आउट गर्न निश्चित हुनुहुन्छ?',

    // Consult
    consultTab: 'परामर्श',
    consultTitle: 'विशेषज्ञसँग परामर्श',
    consultSubtitle: 'मार्गदर्शनका लागि उपलब्ध मनोचिकित्सा नर्स र परामर्शदाताहरूसँग सम्पर्क गर्नुहोस्',
    available: 'उपलब्ध',
    unavailable: 'अनुपलब्ध',
    callSpecialist: 'कल',
    whatsappLabel: 'WhatsApp',
    smsLabel: 'SMS',
    specializationLabel: 'विशेषज्ञता',
    hoursLabel: 'समय',
    consultNoteLabel: 'तपाईंको चिन्ता वर्णन गर्नुहोस् (ऐच्छिक)',
    consultNotePlaceholder: 'जस्तै, मेरो एक बिरामीमा...',

    // Alert preview
    alertPreviewTitle: 'मनोचिकित्सकलाई पठाइएको जानकारी',
    alertPreviewToggle: 'सूचना विवरण हेर्नुहोस्',
    alertTimestamp: 'सूचना पठाइएको समय',
    alertVolunteer: 'स्वयंसेवक',
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
