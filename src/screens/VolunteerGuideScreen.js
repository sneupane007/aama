import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/i18n';
import { COLORS, SIZES, commonStyles } from '../theme';

const trainingModules = [
  {
    icon: 'heart-half',
    title: { en: 'Building Trust', ne: 'विश्वास निर्माण' },
    body: {
      en: 'Before asking wellness questions, spend 5-10 minutes in casual conversation. Ask about the family, the baby, or daily life. This creates a safe space for honest answers. Never start with sensitive questions directly.',
      ne: 'सामान्य स्वास्थ्य प्रश्नहरू सोध्नु अघि, ५-१० मिनेट सामान्य कुराकानीमा बिताउनुहोस्। परिवार, बच्चा, वा दैनिक जीवनको बारेमा सोध्नुहोस्। यसले इमानदार जवाफको लागि सुरक्षित ठाउँ बनाउँछ। संवेदनशील प्रश्नहरू सिधै नसोध्नुहोस्।',
    },
  },
  {
    icon: 'chatbubbles',
    title: { en: 'How to Ask Sensitive Questions', ne: 'संवेदनशील प्रश्नहरू कसरी सोध्ने' },
    body: {
      en: 'Use the masked phrases in the app — they frame mental health questions as general wellness inquiries. Maintain a warm, conversational tone. Say things like "Many mothers feel this way" to normalize the discussion. Never show shock or judgment at any answer.',
      ne: 'एपमा भएको मास्क गरिएको वाक्यांशहरू प्रयोग गर्नुहोस् — तिनीहरूले मानसिक स्वास्थ्य प्रश्नहरूलाई सामान्य स्वास्थ्य सोधपुछको रूपमा प्रस्तुत गर्छन्। न्यानो, कुराकानीको स्वरमा राख्नुहोस्। "धेरै आमाहरूले यस्तो महसुस गर्छन्" भन्नुहोस्। कुनै पनि जवाफमा आश्चर्य वा निर्णय नदेखाउनुहोस्।',
    },
  },
  {
    icon: 'alert-circle',
    title: { en: 'Crisis Protocol', ne: 'संकट प्रोटोकल' },
    body: {
      en: 'If the app shows CRITICAL alert:\n1. Stay calm. Do not show alarm to the patient.\n2. Do NOT leave the patient alone.\n3. Gently say: "I would like to connect you with someone who can help."\n4. Call your supervisor immediately.\n5. Call the Nepal Crisis Hotline: 1166\n6. Stay with the patient until help arrives.',
      ne: 'यदि एपले गम्भीर सूचना देखाउँछ:\n१. शान्त रहनुहोस्। बिरामीलाई चिन्ता नदेखाउनुहोस्।\n२. बिरामीलाई एक्लै नछोड्नुहोस्।\n३. भन्नुहोस्: "म तपाईंलाई सहयोग गर्न सक्ने कसैसँग जोड्न चाहन्छु।"\n४. तत्काल सुपरभाइजरलाई कल गर्नुहोस्।\n५. क्राइसिस हटलाइन कल गर्नुहोस्: ११६६\n६. बिरामीसँग सहायता नआउँदासम्म बस्नुहोस्।',
    },
  },
  {
    icon: 'cloud-offline',
    title: { en: 'Using the App Offline', ne: 'अफलाइन एप प्रयोग' },
    body: {
      en: 'This app works completely without internet. All data is saved on your device. When you get internet (WiFi or cell signal), the app will automatically sync data. Just continue your visits as usual.',
      ne: 'यो एप पूर्ण रूपमा इन्टरनेट बिना काम गर्छ। सबै डाटा तपाईंको उपकरणमा सुरक्षित हुन्छ। जब तपाईंले इन्टरनेट पाउनुहुन्छ, एपले स्वचालित रूपमा डाटा सिंक गर्नेछ। सामान्य रूपमा भेटहरू जारी राख्नुहोस्।',
    },
  },
  {
    icon: 'people',
    title: { en: 'Communicating with Empathy', ne: 'सहानुभूतिसँग संवाद' },
    body: {
      en: 'Listen actively without interrupting. Make eye contact. Nod to show understanding. Never dismiss their feelings. Use phrases like:\n• "I hear you"\n• "That must be difficult"\n• "You are not alone"\n• "We are here to help"',
      ne: 'बिना रोकिकन ध्यान दिएर सुन्नुहोस्। आँखा मिलाउनुहोस्। बुझेको देखाउन टाउको हल्लाउनुहोस्। उनीहरूको भावनालाई कहिल्यै नकार्नुहोस्। यी वाक्यहरू प्रयोग गर्नुहोस्:\n• "म सुनिरहेको छु"\n• "यो गाह्रो हुनुपर्छ"\n• "तपाईं एक्लो हुनुहुन्न"\n• "हामी सहयोग गर्न यहाँ छौं"',
    },
  },
];

const emergencyNumbers = [
  { name: { en: 'Nepal Crisis Hotline', ne: 'नेपाल क्राइसिस हटलाइन' }, phone: '1166', icon: 'alert-circle', color: COLORS.riskCritical },
  { name: { en: 'Police Emergency', ne: 'प्रहरी आपतकालीन' }, phone: '100', icon: 'shield', color: '#3b82f6' },
  { name: { en: 'Ambulance', ne: 'एम्बुलेन्स' }, phone: '102', icon: 'medical', color: COLORS.riskHigh },
  { name: { en: 'Women Helpline', ne: 'महिला हेल्पलाइन' }, phone: '1145', icon: 'female', color: '#a855f7' },
];

const mentalHealthResources = [
  {
    title: { en: 'What is Postnatal Depression?', ne: 'प्रसवोत्तर अवसाद भनेको के हो?' },
    body: {
      en: 'Postnatal depression affects 1 in 7 new mothers. It is NOT the mother\'s fault. Symptoms include persistent sadness, loss of interest, sleep problems, and difficulty bonding with the baby. Early detection saves lives.',
      ne: 'प्रसवोत्तर अवसादले ७ मध्ये १ नयाँ आमालाई असर गर्छ। यो आमाको गल्ती होइन। लक्षणहरूमा लगातार उदासी, रुचि गुम्ने, निद्रा समस्या, र बच्चासँग बन्धन गर्न कठिनाई समावेश छ। चाँडो पत्ता लगाउनाले जीवन बचाउँछ।',
    },
  },
  {
    title: { en: 'Adolescent Mental Health Signs', ne: 'किशोर मानसिक स्वास्थ्य संकेतहरू' },
    body: {
      en: 'Watch for: withdrawal from friends, sudden drop in school performance, changes in eating/sleeping habits, excessive worry, unexplained anger, and talk about feeling hopeless.',
      ne: 'ध्यान दिनुहोस्: साथीहरूबाट टाढा रहने, विद्यालयको प्रदर्शनमा अचानक गिरावट, खाने/सुत्ने बानीमा परिवर्तन, अत्यधिक चिन्ता, अस्पष्ट रिस, र आशाहीन महसुसको कुरा।',
    },
  },
  {
    title: { en: 'Self-Care for Volunteers', ne: 'स्वयंसेवकहरूको लागि स्व-हेरचाह' },
    body: {
      en: 'Your mental health matters too. After a difficult visit:\n• Take deep breaths\n• Talk to a colleague or supervisor\n• Take a short break before the next visit\n• Remember: you are making a difference\n• It is okay to feel affected',
      ne: 'तपाईंको मानसिक स्वास्थ्य पनि महत्त्वपूर्ण छ। कठिन भेटपछि:\n• गहिरो सास लिनुहोस्\n• सहकर्मी वा सुपरभाइजरसँग कुरा गर्नुहोस्\n• अर्को भेट अघि छोटो विश्राम लिनुहोस्\n• सम्झनुहोस्: तपाईंले फरक पारिरहनुभएको छ\n• प्रभावित हुनु ठीक छ',
    },
  },
];

export default function VolunteerGuideScreen() {
  const { t, lang } = useTranslation();
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedResources, setExpandedResources] = useState({});

  const toggleModule = (i) => {
    setExpandedModules((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const toggleResource = (i) => {
    setExpandedResources((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{t('guideTitle')}</Text>
      <Text style={commonStyles.subtitle}>{t('guideSubtitle')}</Text>

      {/* Quick Reference */}
      <Text style={commonStyles.sectionTitle}>{t('quickReference')}</Text>
      <View style={commonStyles.card}>
        <View style={styles.refItem}>
          <View style={[styles.refDot, { backgroundColor: COLORS.riskLow }]} />
          <Text style={styles.refText}>{t('greenMeans')}</Text>
        </View>
        <View style={styles.refItem}>
          <View style={[styles.refDot, { backgroundColor: COLORS.riskModerate }]} />
          <Text style={styles.refText}>{t('yellowMeans')}</Text>
        </View>
        <View style={styles.refItem}>
          <View style={[styles.refDot, { backgroundColor: COLORS.riskHigh }]} />
          <Text style={styles.refText}>{t('redMeans')}</Text>
        </View>
        <View style={styles.refItem}>
          <View style={[styles.refDot, { backgroundColor: COLORS.riskCritical }]} />
          <Text style={[styles.refText, { fontWeight: '700' }]}>{t('flashingRedMeans')}</Text>
        </View>
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
          <View style={[styles.emergencyIcon, { backgroundColor: num.color + '20' }]}>
            <Ionicons name={num.icon} size={22} color={num.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyName}>{lang === 'ne' ? num.name.ne : num.name.en}</Text>
            <Text style={styles.emergencyPhone}>{num.phone}</Text>
          </View>
          <Ionicons name="call" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      ))}

      {/* Training Modules */}
      <Text style={[commonStyles.sectionTitle, { marginTop: 8 }]}>{t('trainingModules')}</Text>
      {trainingModules.map((mod, i) => (
        <TouchableOpacity
          key={i}
          style={commonStyles.card}
          onPress={() => toggleModule(i)}
          activeOpacity={0.7}
        >
          <View style={[commonStyles.row, { justifyContent: 'space-between' }]}>
            <View style={[commonStyles.row, { flex: 1, gap: 12 }]}>
              <View style={styles.moduleIconCircle}>
                <Ionicons name={mod.icon} size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.moduleTitle} numberOfLines={2}>
                {lang === 'ne' ? mod.title.ne : mod.title.en}
              </Text>
            </View>
            <Ionicons name={expandedModules[i] ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
          </View>
          {expandedModules[i] && (
            <Text style={styles.moduleBody}>{lang === 'ne' ? mod.body.ne : mod.body.en}</Text>
          )}
        </TouchableOpacity>
      ))}

      {/* Mental Health Resources */}
      <Text style={[commonStyles.sectionTitle, { marginTop: 8 }]}>{t('mentalHealthResources')}</Text>
      {mentalHealthResources.map((res, i) => (
        <TouchableOpacity
          key={i}
          style={commonStyles.card}
          onPress={() => toggleResource(i)}
          activeOpacity={0.7}
        >
          <View style={[commonStyles.row, { justifyContent: 'space-between' }]}>
            <Text style={[styles.moduleTitle, { flex: 1 }]}>
              {lang === 'ne' ? res.title.ne : res.title.en}
            </Text>
            <Ionicons name={expandedResources[i] ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
          </View>
          {expandedResources[i] && (
            <Text style={styles.moduleBody}>{lang === 'ne' ? res.body.ne : res.body.en}</Text>
          )}
        </TouchableOpacity>
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  refItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  refDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
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
    padding: 16,
    marginBottom: 8,
    gap: 14,
  },
  emergencyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  emergencyPhone: {
    fontSize: SIZES.lg,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  moduleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.text,
  },
  moduleBody: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
