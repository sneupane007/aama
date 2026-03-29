// ── On-Device Risk Scoring Engine ──
import { EPDS_THRESHOLDS, EPDS_MAX_SCORE } from '../data/epds';
import { PHQA_MAX_SCORE, getPhqaThresholds } from '../data/phqa';

/**
 * Calculate risk from screening responses
 * @param {string} type - 'postnatal' or 'youth'
 * @param {Object} responses - { questionId: selectedOptionIndex }
 * @param {Array} questions - the question array (EPDS or PHQ-A)
 * @param {number} age - patient age (for PHQ-A threshold adjustment)
 * @returns {{ score, maxScore, riskLevel, selfHarmFlag, recommendation }}
 */
export function calculateRisk(type, responses, questions, age = 18) {
  let totalScore = 0;
  let selfHarmFlag = false;
  let maxScore = type === 'postnatal' ? EPDS_MAX_SCORE : PHQA_MAX_SCORE;

  for (const question of questions) {
    const selectedIndex = responses[question.id];
    if (selectedIndex !== undefined && selectedIndex !== null) {
      const option = question.options[selectedIndex];
      totalScore += option.score;

      // Check self-harm flag (Q10 for EPDS, Q9 for PHQ-A)
      if (question.isSelfHarm && option.score > 0) {
        selfHarmFlag = true;
      }
    }
  }

  // Determine risk level
  let riskLevel = 'low';
  
  if (selfHarmFlag) {
    riskLevel = 'critical';
  } else if (type === 'postnatal') {
    if (totalScore >= EPDS_THRESHOLDS.high.min) riskLevel = 'high';
    else if (totalScore >= EPDS_THRESHOLDS.moderate.min) riskLevel = 'moderate';
    else riskLevel = 'low';
  } else {
    const thresholds = getPhqaThresholds(age);
    if (totalScore >= thresholds.high.min) riskLevel = 'high';
    else if (totalScore >= thresholds.moderate.min) riskLevel = 'moderate';
    else riskLevel = 'low';
  }

  // Generate recommendation
  const recommendations = {
    low: {
      en: 'Continue routine follow-up. Schedule next visit in 4-6 weeks. No immediate concern detected.',
      ne: 'नियमित फलो-अप जारी राख्नुहोस्। ४-६ हप्तामा अर्को भेट तालिका बनाउनुहोस्।',
    },
    moderate: {
      en: 'Monitor closely. Schedule follow-up within 1-2 weeks. Document specific concerns and discuss with supervisor.',
      ne: 'नजिकबाट निगरानी गर्नुहोस्। १-२ हप्तामा फलो-अप तालिका बनाउनुहोस्। चिन्ता लेख्नुहोस्।',
    },
    high: {
      en: 'Refer to nearest health post for professional evaluation. Schedule follow-up within 1 week. Alert your supervisor immediately.',
      ne: 'नजिकको स्वास्थ्य चौकीमा रिफर गर्नुहोस्। १ हप्ताभित्र फलो-अप गर्नुहोस्। सुपरभाइजरलाई सूचित गर्नुहोस्।',
    },
    critical: {
      en: 'IMMEDIATE ACTION REQUIRED: Self-harm risk detected. Do NOT leave the patient alone. Contact the nearest psychiatric nurse immediately. Call the crisis hotline if needed.',
      ne: 'तत्काल कार्य आवश्यक: आत्म-हानि जोखिम पत्ता लागेको छ। बिरामीलाई एक्लै नछोड्नुहोस्। तत्काल मनोचिकित्सा नर्ससँग सम्पर्क गर्नुहोस्।',
    },
  };

  // Calculate follow-up date
  const followUpDays = {
    low: 42,      // 6 weeks
    moderate: 14,  // 2 weeks
    high: 7,       // 1 week
    critical: 1,   // Next day
  };

  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + followUpDays[riskLevel]);

  return {
    score: totalScore,
    maxScore,
    riskLevel,
    selfHarmFlag,
    recommendation: recommendations[riskLevel],
    followUpDate: followUpDate.toISOString().split('T')[0],
    followUpDays: followUpDays[riskLevel],
  };
}

/**
 * Get the risk level label
 */
export function getRiskLabel(riskLevel, lang = 'en') {
  const labels = {
    low: { en: 'Low Risk', ne: 'कम जोखिम' },
    moderate: { en: 'Moderate Risk', ne: 'मध्यम जोखिम' },
    high: { en: 'High Risk', ne: 'उच्च जोखिम' },
    critical: { en: 'Critical', ne: 'गम्भीर' },
  };
  return labels[riskLevel]?.[lang] || labels.low[lang];
}
