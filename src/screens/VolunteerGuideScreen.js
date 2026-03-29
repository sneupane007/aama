import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/i18n';
import { COLORS, SIZES, commonStyles } from '../theme';

// ─── DATA ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'emergency', icon: 'alert-circle', en: 'Emergency', ne: 'आपतकाल' },
  { id: 'howto',     icon: 'map-outline',  en: 'How-To',   ne: 'कसरी' },
  { id: 'screening', icon: 'clipboard',    en: 'Scales',   ne: 'स्केल' },
  { id: 'training',  icon: 'school',       en: 'Training', ne: 'तालिम' },
  { id: 'resources', icon: 'book',         en: 'Resources',ne: 'स्रोत' },
];

const emergencyNumbers = [
  { name: { en: 'Nepal Crisis Hotline',    ne: 'नेपाल क्राइसिस हटलाइन' }, phone: '1166',        icon: 'alert-circle', color: COLORS.riskCritical },
  { name: { en: 'Police Emergency',        ne: 'प्रहरी आपतकालीन' },       phone: '100',         icon: 'shield',        color: '#3b82f6' },
  { name: { en: 'Ambulance',               ne: 'एम्बुलेन्स' },            phone: '102',         icon: 'medical',       color: COLORS.riskHigh },
  { name: { en: 'Women Helpline',          ne: 'महिला हेल्पलाइन' },       phone: '1145',        icon: 'female',        color: '#a855f7' },
  { name: { en: 'Social Welfare Council',  ne: 'सामाजिक कल्याण परिषद्' }, phone: '01-4229673',  icon: 'people',        color: '#0ea5e9' },
];

const criticalSteps = [
  { en: 'Stay calm. Do not show panic to the patient.',                      ne: 'शान्त रहनुहोस्। बिरामीलाई घबराहट नदेखाउनुहोस्।' },
  { en: 'Do NOT leave the patient alone at any time.',                       ne: 'बिरामीलाई कहिल्यै एक्लो नछोड्नुहोस्।' },
  { en: 'Remove dangerous objects from sight if safe to do so.',             ne: 'सुरक्षित भएमा दृष्टिमा खतरनाक वस्तुहरू हटाउनुहोस्।' },
  { en: 'Say gently: "I would like to connect you with someone who can help."', ne: 'भन्नुहोस्: "म तपाईंलाई सहयोग गर्न सक्ने कसैसँग जोड्न चाहन्छु।"' },
  { en: 'Call your supervisor immediately.',                                  ne: 'तत्काल आफ्नो सुपरभाइजरलाई कल गर्नुहोस्।' },
  { en: 'Call Nepal Crisis Hotline: 1166',                                   ne: 'नेपाल क्राइसिस हटलाइनमा कल गर्नुहोस्: ११६६' },
  { en: 'Assign a psychiatrist in the app (Patient → Assign).',              ne: 'एपमा मनोचिकित्सक तोक्नुहोस् (बिरामी → तोक्नुहोस्)।' },
  { en: 'Stay with the patient until professional help arrives.',            ne: 'पेशेवर सहायता नआउँदासम्म बिरामीसँग बस्नुहोस्।' },
];

const riskRef = [
  { color: COLORS.riskLow,      label: { en: 'LOW (Green) — Well. Routine follow-up in 4–6 weeks.',               ne: 'कम (हरियो) — ठीक छन्। ४–६ हप्तामा नियमित फलो-अप।' } },
  { color: COLORS.riskModerate, label: { en: 'MODERATE (Yellow) — Some concerns. Follow-up in 1–2 weeks.',        ne: 'मध्यम (पहेंलो) — केही चिन्ता। १–२ हप्तामा फलो-अप।' } },
  { color: COLORS.riskHigh,     label: { en: 'HIGH (Orange/Red) — Significant risk. Refer to health post ≤1 week.',ne: 'उच्च (रातो) — ठूलो जोखिम। १ हप्ताभित्र स्वास्थ्य चौकीमा रिफर।' } },
  { color: COLORS.riskCritical, label: { en: 'CRITICAL (Flashing Red) — Self-harm risk! NEVER leave patient alone!',ne: 'गम्भीर (चम्किरहेको रातो) — आत्म-हानि जोखिम! बिरामीलाई एक्लो नछोड्नुहोस्!' }, bold: true },
];

const visitSteps = [
  {
    step: 1, icon: 'add-circle-outline',
    title: { en: 'Start a New Visit',        ne: 'नयाँ भेट सुरु गर्नुहोस्' },
    body:  { en: 'Tap the "New Visit" tab at the bottom. For a new patient, fill in their details. For a returning patient, they will be auto-linked from your recent list.',
             ne: '"नयाँ भेट" ट्याब ट्याप गर्नुहोस्। नयाँ बिरामीको लागि विवरण भर्नुहोस्। फर्कने बिरामीको लागि उनीहरू स्वचालित रूपमा जोडिनेछन्।' },
  },
  {
    step: 2, icon: 'person-outline',
    title: { en: 'Enter Patient Details',    ne: 'बिरामीको विवरण प्रविष्ट गर्नुहोस्' },
    body:  { en: 'Enter name, age, type (postnatal / youth), address, and phone. The type determines which screening scale is used (EPDS for postnatal mothers; PHQ-A for youth aged 12–19).',
             ne: 'नाम, उमेर, प्रकार (प्रसूतिपछि / युवा), ठेगाना, र फोन प्रविष्ट गर्नुहोस्। प्रकारले कुन स्केल प्रयोग गरिन्छ निर्धारण गर्छ।' },
  },
  {
    step: 3, icon: 'fitness-outline',
    title: { en: 'Physical Health Check',   ne: 'शारीरिक स्वास्थ्य जाँच' },
    body:  { en: 'Record observable physical signs: blood pressure, nutrition, sleep quality. These provide context alongside the mental wellness score.',
             ne: 'अवलोकनयोग्य शारीरिक संकेतहरू रेकर्ड गर्नुहोस्: रक्तचाप, पोषण, निद्राको गुणस्तर। यसले मानसिक स्वास्थ्य स्कोरसँग सन्दर्भ प्रदान गर्छ।' },
  },
  {
    step: 4, icon: 'chatbubbles-outline',
    title: { en: 'Conduct Wellness Screening', ne: 'स्वास्थ्य स्क्रीनिंग गर्नुहोस्' },
    body:  { en: 'Read each EPDS or PHQ-A question aloud in a calm voice. The app will show a consent prompt first. Give the patient time to think and answer — do not rush or suggest answers.',
             ne: 'प्रत्येक EPDS वा PHQ-A प्रश्न शान्त स्वरमा जोरसँग पढ्नुहोस्। एपले पहिले सहमति प्रम्प्ट देखाउनेछ। बिरामीलाई सोच्ने र जवाफ दिने समय दिनुहोस्।' },
  },
  {
    step: 5, icon: 'bar-chart-outline',
    title: { en: 'Review Results',          ne: 'परिणाम समीक्षा' },
    body:  { en: 'The app scores the screening automatically and shows a colored risk badge. A CRITICAL result triggers a fullscreen alert — do not dismiss it until you have read the protocol.',
             ne: 'एपले स्वचालित रूपमा स्क्रीनिंग स्कोर गर्छ र रंगीन जोखिम ब्याज देखाउँछ। गम्भीर परिणामले फुलस्क्रिन सूचना ट्रिगर गर्छ।' },
  },
  {
    step: 6, icon: 'person-add-outline',
    title: { en: 'Assign Psychiatrist',     ne: 'मनोचिकित्सक तोक्नुहोस्' },
    body:  { en: 'For high or critical patients, go to the Patient detail screen and tap "Assign Psychiatrist." No appointment is needed — you can assign at any time.',
             ne: 'उच्च वा गम्भीर बिरामीहरूको लागि, बिरामी विवरण स्क्रिनमा जानुहोस् र "मनोचिकित्सक तोक्नुहोस्" ट्याप गर्नुहोस्।' },
  },
  {
    step: 7, icon: 'document-text-outline',
    title: { en: 'Add Notes & Next Visit',  ne: 'नोट र अर्को भेट' },
    body:  { en: 'Write any key observations in the notes field — exact quotes if possible. Set a follow-up date matching the risk level guidelines. All data saves automatically offline.',
             ne: 'नोट फिल्डमा मुख्य अवलोकनहरू लेख्नुहोस्। जोखिम स्तर दिशानिर्देश अनुसार फलो-अप मिति सेट गर्नुहोस्। सबै डाटा स्वचालित रूपमा अफलाइन सुरक्षित हुन्छ।' },
  },
];

const epdsQuestions = [
  { q: 1,  text: { en: 'Ability to laugh and see the funny side of things', ne: 'हाँस्ने र रमाइलो पक्ष देख्ने क्षमता' } },
  { q: 2,  text: { en: 'Looking forward with enjoyment to things', ne: 'कुराहरूको प्रतीक्षा आनन्दसाथ गर्ने' } },
  { q: 3,  text: { en: 'Blaming yourself when things go wrong', ne: 'गलत हुँदा आफैलाई दोष लगाउनु' } },
  { q: 4,  text: { en: 'Feeling anxious or worried without good reason', ne: 'राम्रो कारण बिना चिन्तित महसुस गर्नु' } },
  { q: 5,  text: { en: 'Feeling scared or panicky without good reason', ne: 'राम्रो कारण बिना डर वा घबराहट' } },
  { q: 6,  text: { en: 'Things getting on top of you / overwhelmed', ne: 'कुराहरूले थिचिरहेको / अभिभूत महसुस गर्नु' } },
  { q: 7,  text: { en: 'Difficulty sleeping because of unhappiness', ne: 'दुःखका कारण सुत्न गाह्रो' } },
  { q: 8,  text: { en: 'Feeling sad or miserable', ne: 'दुखी वा दयनीय महसुस गर्नु' } },
  { q: 9,  text: { en: 'So unhappy that you have been crying', ne: 'यति दुखी कि रोएको' } },
  { q: 10, text: { en: 'Thoughts of harming yourself', ne: 'आफैलाई हानि गर्ने विचार' }, critical: true },
];

const phqaQuestions = [
  { q: 1, text: { en: 'Little interest or pleasure in doing things',       ne: 'कामहरूमा कम रुचि वा आनन्द' } },
  { q: 2, text: { en: 'Feeling down, depressed, or hopeless',              ne: 'निरास, उदास, वा आशाहीन महसुस गर्नु' } },
  { q: 3, text: { en: 'Trouble falling/staying asleep, or sleeping too much', ne: 'सुत्न वा निद्रा जारी राख्न समस्या, वा धेरै सुत्नु' } },
  { q: 4, text: { en: 'Feeling tired or having little energy',             ne: 'थकित महसुस गर्नु वा कम ऊर्जा' } },
  { q: 5, text: { en: 'Poor appetite or overeating',                       ne: 'कम भोक वा अत्यधिक खानु' } },
  { q: 6, text: { en: 'Feeling bad about yourself or like a failure',      ne: 'आफ्नो बारेमा नराम्रो वा असफल महसुस गर्नु' } },
  { q: 7, text: { en: 'Trouble concentrating on things',                   ne: 'कुराहरूमा ध्यान दिन समस्या' } },
  { q: 8, text: { en: 'Moving/speaking so slowly others could notice; or fidgety/restless', ne: 'ढिलो हिड्नु/बोल्नु वा बेचैन हुनु' } },
  { q: 9, text: { en: 'Thoughts of self-harm or that you would be better off dead', ne: 'आत्म-हानि वा मृत्युको विचार' }, critical: true },
];

const scoringGuide = [
  {
    scale: 'EPDS',
    subtitle: { en: 'For postnatal mothers · 10 questions · Max score 30', ne: 'प्रसूतिपछिकी आमाहरूको लागि · १० प्रश्न · अधिकतम ३०' },
    rows: [
      { range: '0–9',  level: { en: 'Low',      ne: 'कम' },      color: COLORS.riskLow },
      { range: '10–12',level: { en: 'Moderate', ne: 'मध्यम' },   color: COLORS.riskModerate },
      { range: '13+',  level: { en: 'High',     ne: 'उच्च' },    color: COLORS.riskHigh },
      { range: 'Q10 ≥1',level:{ en: 'CRITICAL', ne: 'गम्भीर' }, color: COLORS.riskCritical },
    ],
  },
  {
    scale: 'PHQ-A',
    subtitle: { en: 'For youth aged 12–19 · 9 questions · Max score 27', ne: 'युवाहरूको लागि उमेर १२–१९ · ९ प्रश्न · अधिकतम २७' },
    rows: [
      { range: '< 11 (age 15–19)',  level: { en: 'Low',      ne: 'कम' },      color: COLORS.riskLow },
      { range: '< 13 (age 12–14)',  level: { en: 'Low',      ne: 'कम' },      color: COLORS.riskLow },
      { range: '≥ 11 (age 15–19)', level: { en: 'High',     ne: 'उच्च' },    color: COLORS.riskHigh },
      { range: '≥ 13 (age 12–14)', level: { en: 'High',     ne: 'उच्च' },    color: COLORS.riskHigh },
      { range: 'Q9 ≥ 1',           level: { en: 'CRITICAL', ne: 'गम्भीर' }, color: COLORS.riskCritical },
    ],
  },
];

const trainingModules = [
  {
    icon: 'heart-half',
    title: { en: 'Building Trust & Rapport',          ne: 'विश्वास र सम्बन्ध निर्माण' },
    body:  { en: 'Before asking wellness questions, spend 5–10 minutes in casual conversation. Ask about the family, the baby, or daily life. This creates a safe space for honest answers. Never start with sensitive questions directly.',
             ne: 'स्वास्थ्य प्रश्नहरू सोध्नु अघि ५–१० मिनेट सामान्य कुराकानीमा बिताउनुहोस्। परिवार, बच्चा, वा दैनिक जीवनको बारेमा सोध्नुहोस्। यसले इमानदार जवाफको लागि सुरक्षित ठाउँ बनाउँछ।' },
  },
  {
    icon: 'chatbubbles',
    title: { en: 'Asking Sensitive Questions',         ne: 'संवेदनशील प्रश्नहरू सोध्ने' },
    body:  { en: 'Use a warm, conversational tone. Say: "Many mothers feel this way" to normalize the discussion. Never show shock or judgment. If a patient hesitates, say: "There are no right or wrong answers — take your time."',
             ne: 'न्यानो, कुराकानीको स्वरमा राख्नुहोस्। "धेरै आमाहरूले यस्तो महसुस गर्छन्" भन्नुहोस्। कुनै पनि जवाफमा आश्चर्य नदेखाउनुहोस्। "कुनै सही वा गलत जवाफ छैन — तपाईंले समय लिन सक्नुहुन्छ।"' },
  },
  {
    icon: 'shield-checkmark',
    title: { en: 'Consent & Confidentiality',          ne: 'सहमति र गोपनीयता' },
    body:  { en: 'Always explain the purpose before starting. Say: "Today I\'ll ask about your general wellness. Your answers are private and only shared with healthcare providers who need to help you." Never share patient data with family without explicit consent.',
             ne: 'सुरु गर्नु अघि उद्देश्य बताउनुहोस्। "आज म तपाईंको सामान्य स्वास्थ्यको बारेमा प्रश्न सोध्नेछु। तपाईंको जवाफ निजी छन्।" स्पष्ट सहमति बिना परिवारसँग डाटा साझा नगर्नुहोस्।' },
  },
  {
    icon: 'alert-circle',
    title: { en: 'Crisis Protocol (CRITICAL Cases)',   ne: 'संकट प्रोटोकल (गम्भीर मामिला)' },
    body:  { en: 'If CRITICAL alert appears:\n1. Stay calm — do not show alarm\n2. Never leave the patient alone\n3. Say: "You are not alone. Help is coming."\n4. Call your supervisor\n5. Call Crisis Hotline: 1166\n6. Assign a psychiatrist in the app\n7. Stay until help arrives',
             ne: 'गम्भीर सूचना देखिएमा:\n१. शान्त रहनुहोस्\n२. बिरामीलाई एक्लो नछोड्नुहोस्\n३. भन्नुहोस्: "तपाईं एक्लो हुनुहुन्न।"\n४. सुपरभाइजरलाई कल गर्नुहोस्\n५. हटलाइन: ११६६\n६. एपमा मनोचिकित्सक तोक्नुहोस्' },
  },
  {
    icon: 'people',
    title: { en: 'Communicating with Empathy',         ne: 'सहानुभूतिसँग संवाद' },
    body:  { en: 'Listen without interrupting. Make eye contact. Nod to show understanding. Never dismiss their feelings. Use:\n• "I hear you"\n• "That must be difficult"\n• "You are not alone"\n• "We are here to help"',
             ne: 'बिना रोकिकन सुन्नुहोस्। आँखा मिलाउनुहोस्। बुझेको देखाउन टाउको हल्लाउनुहोस्।\n• "म सुनिरहेको छु"\n• "यो गाह्रो हुनुपर्छ"\n• "तपाईं एक्लो हुनुहुन्न"\n• "हामी सहयोग गर्न यहाँ छौं"' },
  },
  {
    icon: 'document-text',
    title: { en: 'Documenting Visits Accurately',      ne: 'भेटहरू सही तरिकाले दस्तावेज गर्ने' },
    body:  { en: 'Record visits immediately — do not rely on memory. Write exact quotes when possible, especially for self-harm disclosures. Note anything unusual about the patient\'s behavior or environment. Accurate records help psychiatrists make better decisions.',
             ne: 'भेटपछि तुरुन्तै रेकर्ड गर्नुहोस् — स्मृतिमा भर नगर्नुहोस्। सम्भव भएमा सटीक उद्धरण लेख्नुहोस्। बिरामीको व्यवहारमा असामान्य कुरा नोट गर्नुहोस्।' },
  },
  {
    icon: 'home',
    title: { en: 'Working with the Family',            ne: 'परिवारसँग काम गर्ने' },
    body:  { en: 'Speak to the patient privately first. If family insists on being present, conduct sensitive questions privately anyway. Never allow family to answer on behalf of the patient. Educate supportive family members on how they can help at home.',
             ne: 'पहिले बिरामीसँग निजी रूपमा कुरा गर्नुहोस्। परिवार उपस्थित भए पनि संवेदनशील प्रश्नहरू एकान्तमा सोध्नुहोस्। परिवारलाई बिरामीको तर्फबाट जवाफ दिन कहिल्यै नदिनुहोस्।' },
  },
  {
    icon: 'globe',
    title: { en: 'Cultural Sensitivity',               ne: 'सांस्कृतिक संवेदनशीलता' },
    body:  { en: 'Avoid clinical terms like "depression" — say "feeling heavy in the heart" or "trouble with sleep and mood." Respect local beliefs but gently redirect harmful practices. Never judge the family or community.',
             ne: '"अवसाद" जस्ता क्लिनिकल शब्दहरू नप्रयोग गर्नुहोस् — "मुटुमा भारी महसुस गर्नु" वा "निद्रा र मनोदशामा समस्या" भन्नुहोस्। स्थानीय विश्वासको सम्मान गर्नुहोस्।' },
  },
  {
    icon: 'cloud-offline',
    title: { en: 'Using the App Offline',              ne: 'अफलाइन एप प्रयोग' },
    body:  { en: 'The app works 100% without internet. All data saves locally. Sync happens automatically when you next have a connection. You can complete all visit steps, assign psychiatrists, and view patient history without any signal.',
             ne: 'एप १००% इन्टरनेट बिना काम गर्छ। सबै डाटा स्थानीय रूपमा सुरक्षित हुन्छ। अर्को पटक कनेक्सन मिलेपछि स्वचालित सिंक हुन्छ।' },
  },
  {
    icon: 'heart',
    title: { en: 'Self-Care for Volunteers',           ne: 'स्वयंसेवकहरूको लागि स्व-हेरचाह' },
    body:  { en: 'Your mental health matters too. After a difficult visit:\n• Take deep breaths\n• Talk to a colleague or supervisor\n• Take a short break before the next visit\n• Use "My Wellbeing" in the Consult tab to speak with a specialist\n• It is okay to feel affected — seek help early',
             ne: 'तपाईंको मानसिक स्वास्थ्य पनि महत्त्वपूर्ण छ। कठिन भेटपछि:\n• गहिरो सास लिनुहोस्\n• सहकर्मी वा सुपरभाइजरसँग कुरा गर्नुहोस्\n• कन्सल्ट ट्याबमा "मेरो कुशलता" खण्ड प्रयोग गर्नुहोस्\n• प्रभावित हुनु ठीक छ — चाँडो सहायता लिनुहोस्' },
  },
];

const mentalHealthResources = [
  {
    title: { en: 'What is Postnatal Depression?', ne: 'प्रसवोत्तर अवसाद भनेको के हो?' },
    body:  { en: 'Postnatal depression (PND) affects 1 in 7 new mothers. It is NOT the mother\'s fault and is not a sign of weakness. Symptoms include persistent sadness, loss of interest, difficulty bonding with the baby, sleep problems, anxiety, and thoughts of self-harm. Early detection saves lives. Untreated PND can affect both the mother and child\'s long-term health.',
             ne: 'प्रसवोत्तर अवसादले ७ मध्ये १ नयाँ आमालाई असर गर्छ। यो आमाको गल्ती होइन। लक्षणहरूमा लगातार उदासी, रुचि गुम्ने, बच्चासँग बन्धन गर्न कठिनाई, निद्रा समस्या, चिन्ता, र आत्म-हानिको विचार समावेश छ।' },
  },
  {
    title: { en: 'Adolescent Mental Health Warning Signs', ne: 'किशोर मानसिक स्वास्थ्य चेतावनी संकेतहरू' },
    body:  { en: 'Watch for: withdrawal from friends/family, sudden drop in school performance, changes in eating or sleeping, persistent worry or sadness, unexplained anger or irritability, talk of hopelessness or worthlessness, giving away possessions, or talking about death. A single sign may not indicate crisis — watch for patterns over time.',
             ne: 'ध्यान दिनुहोस्: साथीहरूबाट टाढा रहने, विद्यालयको प्रदर्शनमा अचानक गिरावट, खाने/सुत्ने बानीमा परिवर्तन, लगातार चिन्ता वा उदासी, आशाहीन महसुसको कुरा। एकल संकेतले संकट नजनाउन सक्छ — समयसँगै ढाँचाहरू हेर्नुहोस्।' },
  },
  {
    title: { en: 'Understanding the EPDS Scale', ne: 'EPDS स्केल बुझ्ने' },
    body:  { en: 'The Edinburgh Postnatal Depression Scale (EPDS) is a 10-question, validated international screening tool. Each answer scores 0–3. Total range is 0–30. Questions 1–2 are reverse-scored. A score of 10+ indicates possible depression. Question 10 specifically asks about self-harm and any positive response triggers CRITICAL regardless of total score.',
             ne: 'Edinburgh Postnatal Depression Scale (EPDS) एक १०-प्रश्न, प्रमाणित अन्तर्राष्ट्रिय स्क्रीनिंग उपकरण हो। प्रत्येक जवाफ ०–३ स्कोर गर्छ। कुल दायरा ०–३०। प्रश्न १–२ उल्टो स्कोर गरिन्छ। १०+ स्कोरले सम्भावित अवसाद संकेत गर्छ।' },
  },
  {
    title: { en: 'Understanding the PHQ-A Scale', ne: 'PHQ-A स्केल बुझ्ने' },
    body:  { en: 'The Patient Health Questionnaire for Adolescents (PHQ-A) is a 9-question tool adapted for ages 12–19. Each question scores 0–3. The high-risk threshold differs by age: ≥11 for ages 15–19, ≥13 for ages 12–14. Question 9 asks about self-harm/suicidal thoughts and any positive response is CRITICAL.',
             ne: 'PHQ-A १२–१९ वर्षका लागि अनुकूलित ९-प्रश्न उपकरण हो। प्रत्येक प्रश्न ०–३ स्कोर गर्छ। उच्च-जोखिम थ्रेसहोल्ड उमेर अनुसार फरक छ: १५–१९ को लागि ≥११, १२–१४ को लागि ≥१३।' },
  },
  {
    title: { en: 'What Happens After a HIGH or CRITICAL Visit?', ne: 'उच्च वा गम्भीर भेटपछि के हुन्छ?' },
    body:  { en: 'HIGH: The app auto-routes an alert to the nearest psychiatrist for your district. Follow up with the patient within 1 week. Assign a psychiatrist manually for closer case management.\n\nCRITICAL: A fullscreen SOS alert appears. Stay with the patient. Call 1166. A psychiatrist alert is sent automatically. Do not leave until care is arranged.',
             ne: 'उच्च: एपले तपाईंको जिल्लाको नजिकको मनोचिकित्सकलाई स्वचालित सूचना पठाउँछ। १ हप्ताभित्र फलो-अप गर्नुहोस्।\n\nगम्भीर: फुलस्क्रिन SOS सूचना देखिन्छ। बिरामीसँग बस्नुहोस्। ११६६ कल गर्नुहोस्।' },
  },
  {
    title: { en: 'Suicide & Self-Harm: Facts vs. Myths', ne: 'आत्महत्या र आत्म-हानि: तथ्य बनाम मिथकहरू' },
    body:  { en: 'MYTH: "Asking about self-harm plants the idea."\nFACT: Asking directly does NOT increase risk — it opens the door to help.\n\nMYTH: "People who talk about it won\'t do it."\nFACT: Most people who attempt suicide gave warning signs beforehand.\n\nMYTH: "It is a permanent problem."\nFACT: Most suicidal crises are temporary and treatable with support.',
             ne: 'मिथक: "आत्म-हानिको बारेमा सोध्नाले विचार उत्पन्न गर्छ।"\nतथ्य: सोध्नाले जोखिम बढाउँदैन — यसले सहायताको ढोका खोल्छ।\n\nमिथक: "यसबारे कुरा गर्नेले गर्दैन।"\nतथ्य: धेरैजसो मानिसले पहिले नै चेतावनी संकेत दिएका हुन्छन्।' },
  },
];

const faq = [
  {
    q: { en: 'What if the patient refuses to answer a question?',     ne: 'यदि बिरामीले जवाफ दिन अस्वीकार गरे?' },
    a: { en: 'Never force or pressure anyone. Say: "That\'s completely fine — we can skip this." Document that the question was skipped and note any observations about the patient\'s discomfort. Partial scores can still indicate risk.',
         ne: 'कसैलाई बाध्य नगर्नुहोस्। भन्नुहोस्: "यो ठीक छ — हामी यो छोड्न सक्छौं।" प्रश्न छोडिएको दस्तावेज गर्नुहोस्।' },
  },
  {
    q: { en: 'What if there is no internet during the visit?',         ne: 'भेटको समयमा इन्टरनेट नभएमा?' },
    a: { en: 'The app works 100% offline. All visit data, scores, and psychiatrist assignments save to your device. Sync happens automatically when you next have a connection.',
         ne: 'एप १००% अफलाइन काम गर्छ। सबै भेट डाटा, स्कोर, र तोकिएका मनोचिकित्सकहरू तपाईंको उपकरणमा सुरक्षित हुन्छन्।' },
  },
  {
    q: { en: 'Can family members be present during screening?',        ne: 'स्क्रीनिंगको समयमा परिवार उपस्थित हुन सक्छन्?' },
    a: { en: 'Ideally, screen patients privately. If a family member insists, you may allow non-sensitive questions with them present. Always ask self-harm and mood questions in private. Never allow family to answer on behalf of the patient.',
         ne: 'आदर्श रूपमा, बिरामीलाई एकान्तमा स्क्रीन गर्नुहोस्। आत्म-हानि र मनोदशाका प्रश्नहरू सधैं एकान्तमा सोध्नुहोस्।' },
  },
  {
    q: { en: 'What do I do if I feel unsafe during a visit?',          ne: 'भेटमा असुरक्षित महसुस गरेमा?' },
    a: { en: 'Your safety comes first. Calmly excuse yourself and leave. Call police (100) if needed. Report to your supervisor immediately. Never enter a home alone if something feels wrong.',
         ne: 'तपाईंको सुरक्षा पहिलो छ। शान्तपूर्वक बाहिर निस्कनुहोस्। आवश्यक भएमा प्रहरी (१००) कल गर्नुहोस्। तुरुन्तै सुपरभाइजरलाई रिपोर्ट गर्नुहोस्।' },
  },
  {
    q: { en: 'How often should I visit the same patient?',             ne: 'एउटै बिरामीलाई कति पटक भेट गर्नुपर्छ?' },
    a: { en: 'Follow-up frequency by risk level:\n• Low: every 4–6 weeks\n• Moderate: every 1–2 weeks\n• High: within 1 week, then weekly until stable\n• Critical: immediately after crisis resolution, then weekly',
         ne: 'जोखिम स्तर अनुसार फलो-अप:\n• कम: ४–६ हप्तामा\n• मध्यम: १–२ हप्तामा\n• उच्च: १ हप्ताभित्र, त्यसपछि साप्ताहिक\n• गम्भीर: संकट समाधान पछि तुरुन्त' },
  },
  {
    q: { en: 'Can I assign a psychiatrist without an appointment?',    ne: 'के म अपोइन्टमेन्ट बिना मनोचिकित्सक तोक्न सक्छु?' },
    a: { en: 'Yes — always. Go to Patient Detail, tap "Assign Psychiatrist." You can assign any psychiatrist at any time regardless of their availability status. The assignment is recorded immediately.',
         ne: 'हो — सधैं। बिरामी विवरणमा जानुहोस्, "मनोचिकित्सक तोक्नुहोस्" ट्याप गर्नुहोस्। उपलब्धता स्थितिले फरक पार्दैन।' },
  },
  {
    q: { en: 'How do I switch the app language?',                      ne: 'एपको भाषा कसरी परिवर्तन गर्ने?' },
    a: { en: 'Go to the Profile tab (bottom-right). Tap the language toggle to switch between English and Nepali. The change takes effect immediately across the entire app.',
         ne: 'प्रोफाइल ट्याबमा (तल-दायाँ) जानुहोस्। भाषा टगल ट्याप गर्नुहोस्। परिवर्तन तुरुन्तै पूरा एपमा लागू हुन्छ।' },
  },
  {
    q: { en: 'What does "Sync" mean in the Profile tab?',             ne: 'प्रोफाइल ट्याबमा "सिंक" को अर्थ के हो?' },
    a: { en: 'Sync uploads your locally saved visit data to the central health system. It only works when you have internet. All visits are saved offline first and synced later — you never lose data.',
         ne: 'सिंकले तपाईंको स्थानीय रूपमा सुरक्षित भेट डाटा केन्द्रीय स्वास्थ्य प्रणालीमा अपलोड गर्छ। यो इन्टरनेट भएमा मात्र काम गर्छ।' },
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

function AccordionItem({ title, body, icon, highlight }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.accordion, highlight && styles.accordionHighlight]}
      onPress={() => setOpen((v) => !v)}
      activeOpacity={0.7}
    >
      <View style={styles.accordionRow}>
        {icon && (
          <View style={[styles.modIcon, highlight && { backgroundColor: '#fee2e2' }]}>
            <Ionicons name={icon} size={20} color={highlight ? COLORS.riskCritical : COLORS.primary} />
          </View>
        )}
        <Text style={[styles.accordionTitle, { flex: 1 }, highlight && { color: COLORS.riskCritical }]}>
          {title}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
      </View>
      {open && <Text style={styles.accordionBody}>{body}</Text>}
    </TouchableOpacity>
  );
}

export default function VolunteerGuideScreen() {
  const { t, lang } = useTranslation();
  const L = (obj) => (lang === 'ne' ? obj.ne : obj.en);
  const [activeTab, setActiveTab] = useState('emergency');

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon}
                  size={15}
                  color={active ? COLORS.primary : COLORS.textMuted}
                />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {lang === 'ne' ? tab.ne : tab.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={commonStyles.screen} contentContainerStyle={styles.scrollContent}>

        {/* ── EMERGENCY ──────────────────────────────────────────────── */}
        {activeTab === 'emergency' && (
          <>
            {/* Banner */}
            <View style={styles.criticalBanner}>
              <Ionicons name="alert-circle" size={28} color={COLORS.riskCritical} />
              <View style={{ flex: 1 }}>
                <Text style={styles.criticalBannerTitle}>
                  {lang === 'ne' ? 'गम्भीर मामिलामा के गर्ने' : 'What To Do In A Critical Case'}
                </Text>
                <Text style={styles.criticalBannerSub}>
                  {lang === 'ne' ? 'यदि बिरामीले आत्म-हानिको संकेत देखाउँछन्' : 'If the patient shows signs of self-harm'}
                </Text>
              </View>
            </View>
            {criticalSteps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{L(step)}</Text>
              </View>
            ))}

            {/* Risk reference */}
            <Text style={[commonStyles.sectionTitle, { marginTop: 24 }]}>
              {t('quickReference')}
            </Text>
            <View style={commonStyles.card}>
              {riskRef.map((r, i) => (
                <View key={i} style={[styles.refItem, i < riskRef.length - 1 && styles.refItemBorder]}>
                  <View style={[styles.refDot, { backgroundColor: r.color }]} />
                  <Text style={[styles.refText, r.bold && { fontWeight: '700' }]}>{L(r.label)}</Text>
                </View>
              ))}
            </View>

            {/* Emergency Numbers */}
            <Text style={commonStyles.sectionTitle}>{t('emergencyNumbers')}</Text>
            {emergencyNumbers.map((num, i) => (
              <TouchableOpacity
                key={i}
                style={styles.emergencyItem}
                onPress={() => Linking.openURL(`tel:${num.phone}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.emergencyIcon, { backgroundColor: num.color + '22' }]}>
                  <Ionicons name={num.icon} size={22} color={num.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.emergencyName}>{L(num.name)}</Text>
                  <Text style={styles.emergencyPhone}>{num.phone}</Text>
                </View>
                <View style={styles.callChip}>
                  <Ionicons name="call" size={15} color={COLORS.white} />
                  <Text style={styles.callChipText}>{lang === 'ne' ? 'कल' : 'Call'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── HOW-TO ─────────────────────────────────────────────────── */}
        {activeTab === 'howto' && (
          <>
            <Text style={styles.sectionHeader}>
              {lang === 'ne' ? 'भेट सञ्चालन: चरण-दर-चरण' : 'Conducting a Visit: Step by Step'}
            </Text>
            <Text style={styles.sectionSub}>
              {lang === 'ne' ? 'प्रत्येक गृह भेटको लागि यो कार्यप्रवाह पालना गर्नुहोस्' : 'Follow this workflow for every home visit'}
            </Text>

            {visitSteps.map((s) => (
              <View key={s.step} style={styles.visitStep}>
                <View style={styles.stepCircle}>
                  <Ionicons name={s.icon} size={22} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[commonStyles.row, { gap: 8, marginBottom: 2 }]}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{s.step}</Text>
                    </View>
                    <Text style={styles.visitStepTitle}>{L(s.title)}</Text>
                  </View>
                  <Text style={styles.visitStepBody}>{L(s.body)}</Text>
                </View>
              </View>
            ))}

            {/* App tabs overview */}
            <Text style={[commonStyles.sectionTitle, { marginTop: 24 }]}>
              {lang === 'ne' ? 'एप ट्याबहरूको अवलोकन' : 'App Tabs Overview'}
            </Text>
            {[
              { icon: 'home',        en: 'Home',       ne: 'गृह',     desc: { en: 'Dashboard with recent visit stats and at-risk patients',           ne: 'हालको भेट तथ्याङ्क र जोखिममा रहेका बिरामीहरू' } },
              { icon: 'add-circle',  en: 'New Visit',  ne: 'नयाँ भेट',desc: { en: 'Start a new patient screening visit',                              ne: 'नयाँ बिरामी स्क्रीनिंग भेट सुरु गर्नुहोस्' } },
              { icon: 'people',      en: 'Patients',   ne: 'बिरामी',  desc: { en: 'Full patient list with risk filter and visit history per patient',  ne: 'जोखिम फिल्टर र प्रति बिरामी भेट इतिहास' } },
              { icon: 'call',        en: 'Consult',    ne: 'सल्लाह',  desc: { en: 'Call specialists or send your own wellbeing request anonymously',   ne: 'विशेषज्ञलाई कल गर्नुहोस् वा आफ्नो कुशलता अनुरोध पठाउनुहोस्' } },
              { icon: 'person',      en: 'Profile',    ne: 'प्रोफाइल',desc: { en: 'Your volunteer stats, active patient alerts, language toggle',      ne: 'तपाईंको स्वयंसेवक तथ्याङ्क, सक्रिय बिरामी सूचनाहरू, भाषा टगल' } },
            ].map((tab, i) => (
              <View key={i} style={styles.tabOverviewRow}>
                <View style={styles.tabOverviewIcon}>
                  <Ionicons name={tab.icon} size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tabOverviewName}>{lang === 'ne' ? tab.ne : tab.en}</Text>
                  <Text style={styles.tabOverviewDesc}>{L(tab.desc)}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── SCREENING SCALES ───────────────────────────────────────── */}
        {activeTab === 'screening' && (
          <>
            {scoringGuide.map((scale) => (
              <View key={scale.scale} style={{ marginBottom: 20 }}>
                <Text style={styles.scaleTitle}>{scale.scale}</Text>
                <Text style={styles.scaleSub}>{L(scale.subtitle)}</Text>
                <View style={styles.scoreTable}>
                  <View style={styles.scoreHeader}>
                    <Text style={[styles.scoreCell, styles.scoreCellHead, { flex: 1.4 }]}>
                      {lang === 'ne' ? 'स्कोर' : 'Score'}
                    </Text>
                    <Text style={[styles.scoreCell, styles.scoreCellHead, { flex: 1 }]}>
                      {lang === 'ne' ? 'स्तर' : 'Level'}
                    </Text>
                  </View>
                  {scale.rows.map((row, i) => (
                    <View key={i} style={[styles.scoreRow, i % 2 === 1 && { backgroundColor: '#f8fafc' }]}>
                      <Text style={[styles.scoreCell, { flex: 1.4, fontWeight: '600' }]}>{row.range}</Text>
                      <View style={[styles.scoreCell, { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                        <View style={[styles.riskDot, { backgroundColor: row.color }]} />
                        <Text style={{ fontSize: SIZES.sm, fontWeight: '700', color: row.color }}>{L(row.level)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <Text style={[commonStyles.sectionTitle, { marginTop: 4 }]}>
              {lang === 'ne' ? 'EPDS प्रश्नहरू' : 'EPDS Questions'}
            </Text>
            <Text style={styles.scaleSub}>
              {lang === 'ne' ? 'प्रत्येक प्रश्नको विषय (क्लिनिकल सन्दर्भ)' : 'Topic of each question (clinical reference)'}
            </Text>
            {epdsQuestions.map((q) => (
              <View key={q.q} style={[styles.qRow, q.critical && styles.qRowCritical]}>
                <View style={[styles.qNum, q.critical && { backgroundColor: COLORS.riskCritical }]}>
                  <Text style={styles.qNumText}>{q.q}</Text>
                </View>
                <Text style={[styles.qText, q.critical && { fontWeight: '700', color: COLORS.riskCritical }]}>
                  {L(q.text)}
                </Text>
              </View>
            ))}

            <Text style={[commonStyles.sectionTitle, { marginTop: 20 }]}>
              {lang === 'ne' ? 'PHQ-A प्रश्नहरू' : 'PHQ-A Questions'}
            </Text>
            <Text style={styles.scaleSub}>
              {lang === 'ne' ? 'उमेर १२–१९ का लागि' : 'For ages 12–19'}
            </Text>
            {phqaQuestions.map((q) => (
              <View key={q.q} style={[styles.qRow, q.critical && styles.qRowCritical]}>
                <View style={[styles.qNum, q.critical && { backgroundColor: COLORS.riskCritical }]}>
                  <Text style={styles.qNumText}>{q.q}</Text>
                </View>
                <Text style={[styles.qText, q.critical && { fontWeight: '700', color: COLORS.riskCritical }]}>
                  {L(q.text)}
                </Text>
              </View>
            ))}

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.infoBoxText}>
                {lang === 'ne'
                  ? 'EPDS प्रश्न १–२ उल्टो स्कोर गरिन्छ (अर्थात् "धेरैजसो समय" सबैभन्दा राम्रो जवाफ हो)। PHQ-A को सबै प्रश्नहरू सामान्य रूपमा स्कोर गरिन्छन्।'
                  : 'EPDS questions 1–2 are reverse-scored (i.e. "most of the time" is the healthiest answer). All PHQ-A questions are normally scored.'}
              </Text>
            </View>
          </>
        )}

        {/* ── TRAINING ───────────────────────────────────────────────── */}
        {activeTab === 'training' && (
          <>
            <Text style={styles.sectionHeader}>{t('trainingModules')}</Text>
            <Text style={styles.sectionSub}>
              {lang === 'ne' ? 'प्रत्येक मोड्युल विस्तार गर्न ट्याप गर्नुहोस्' : 'Tap each module to expand'}
            </Text>
            {trainingModules.map((mod, i) => (
              <AccordionItem
                key={i}
                icon={mod.icon}
                title={L(mod.title)}
                body={L(mod.body)}
                highlight={mod.icon === 'alert-circle'}
              />
            ))}
          </>
        )}

        {/* ── RESOURCES & FAQ ────────────────────────────────────────── */}
        {activeTab === 'resources' && (
          <>
            <Text style={styles.sectionHeader}>{t('mentalHealthResources')}</Text>
            <Text style={styles.sectionSub}>
              {lang === 'ne' ? 'विस्तृत जानकारीको लागि ट्याप गर्नुहोस्' : 'Tap for detailed information'}
            </Text>
            {mentalHealthResources.map((r, i) => (
              <AccordionItem key={i} title={L(r.title)} body={L(r.body)} />
            ))}

            <Text style={[commonStyles.sectionTitle, { marginTop: 24 }]}>
              {lang === 'ne' ? 'सामान्य प्रश्नहरू (FAQ)' : 'Frequently Asked Questions'}
            </Text>
            {faq.map((item, i) => (
              <AccordionItem key={i} title={L(item.q)} body={L(item.a)} />
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: SIZES.borderRadiusFull,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#ccfbf1',
  },
  tabLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // Emergency
  criticalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff1f2',
    borderWidth: 1.5,
    borderColor: '#fecdd3',
    borderRadius: SIZES.borderRadius,
    padding: 16,
    marginBottom: 16,
  },
  criticalBannerTitle: {
    fontSize: SIZES.base,
    fontWeight: '800',
    color: COLORS.riskCritical,
    marginBottom: 2,
  },
  criticalBannerSub: {
    fontSize: SIZES.sm,
    color: COLORS.riskCritical,
    opacity: 0.8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.riskCritical,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  stepText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  refItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  refItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  refDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  refText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  emergencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm,
    padding: 14,
    marginBottom: 8,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emergencyIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  emergencyName: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text },
  emergencyPhone: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.primary, marginTop: 2 },
  callChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: SIZES.borderRadiusFull,
  },
  callChipText: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.white },

  // How-To
  sectionHeader: {
    fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: 4,
  },
  sectionSub: {
    fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 16,
  },
  visitStep: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  stepBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusFull,
    width: 20, height: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  stepBadgeText: { fontSize: 11, fontWeight: '800', color: COLORS.white },
  visitStepTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  visitStepBody:  { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20, marginTop: 4 },
  tabOverviewRow: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tabOverviewIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  tabOverviewName: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  tabOverviewDesc: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 18 },

  // Screening
  scaleTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  scaleSub: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 10 },
  scoreTable: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.borderRadiusSm, overflow: 'hidden',
  },
  scoreHeader: {
    flexDirection: 'row', backgroundColor: '#f1f5f9',
  },
  scoreRow: { flexDirection: 'row' },
  scoreCell: {
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: SIZES.sm, color: COLORS.text,
  },
  scoreCellHead: { fontWeight: '700', color: COLORS.textSecondary },
  riskDot: { width: 10, height: 10, borderRadius: 5 },
  qRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm, padding: 10, marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  qRowCritical: {
    backgroundColor: '#fff1f2', borderColor: '#fecdd3',
  },
  qNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  qNumText: { fontSize: 12, fontWeight: '800', color: COLORS.white },
  qText: { flex: 1, fontSize: SIZES.sm, color: COLORS.text, lineHeight: 20, paddingTop: 3 },
  infoBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#f0fdfa', borderWidth: 1, borderColor: '#99f6e4',
    borderRadius: SIZES.borderRadiusSm, padding: 12, marginTop: 16,
  },
  infoBoxText: { flex: 1, fontSize: SIZES.sm, color: COLORS.text, lineHeight: 20 },

  // Training / Resources
  accordion: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accordionHighlight: {
    borderColor: '#fecdd3',
    backgroundColor: '#fff1f2',
  },
  accordionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accordionTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  accordionBody: {
    fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 22,
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  modIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
});
