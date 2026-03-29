// ── PHQ-A (Patient Health Questionnaire for Adolescents) ──
// 9 questions validated for Nepali adolescents (12-19)
// Cut-offs: ≥13 for ages 12-14, ≥11 for ages 15-19

export const phqaQuestions = [
  {
    id: 'phqa_1',
    en: 'Over the past 2 weeks, how often have you had little interest or pleasure in doing things?',
    ne: 'गत २ हप्तामा, कुरा गर्न वा काम गर्न कति सक्नुभयो?',
    options: [
      { en: 'Not at all', ne: 'बिल्कुल पनि छैन', score: 0 },
      { en: 'Several days', ne: 'केही दिन', score: 1 },
      { en: 'More than half the days', ne: 'आधा भन्दा बढी दिन', score: 2 },
      { en: 'Nearly every day', ne: 'लगभग प्रत्येक दिन', score: 3 },
    ],
  },
  {
    id: 'phqa_2',
    en: 'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?',
    ne: 'गत २ हप्तामा, कति पटक निराश, उदास, वा आशाहीन महसुस गर्नुभयो?',
    options: [
      { en: 'Not at all', ne: 'बिल्कुल पनि छैन', score: 0 },
      { en: 'Several days', ne: 'केही दिन', score: 1 },
      { en: 'More than half the days', ne: 'आधा भन्दा बढी दिन', score: 2 },
      { en: 'Nearly every day', ne: 'लगभग प्रत्येक दिन', score: 3 },
    ],
  },
  {
    id: 'phqa_3',
    en: 'Over the past 2 weeks, how often have you had trouble falling or staying asleep, or sleeping too much?',
    ne: 'गत २ हप्तामा, कति पटक सुत्न गाह्रो भयो वा धेरै सुत्नुभयो?',
    options: [
      { en: 'Not at all', ne: 'बिल्कुल पनि छैन', score: 0 },
      { en: 'Several days', ne: 'केही दिन', score: 1 },
      { en: 'More than half the days', ne: 'आधा भन्दा बढी दिन', score: 2 },
      { en: 'Nearly every day', ne: 'लगभग प्रत्येक दिन', score: 3 },
    ],
  },
  {
    id: 'phqa_4',
    en: 'Over the past 2 weeks, how often have you felt tired or had little energy?',
    ne: 'गत २ हप्तामा, कति पटक थकान वा कम ऊर्जा महसुस गर्नुभयो?',
    options: [
      { en: 'Not at all', ne: 'बिल्कुल पनि छैन', score: 0 },
      { en: 'Several days', ne: 'केही दिन', score: 1 },
      { en: 'More than half the days', ne: 'आधा भन्दा बढी दिन', score: 2 },
      { en: 'Nearly every day', ne: 'लगभग प्रत्येक दिन', score: 3 },
    ],
  },
  {
    id: 'phqa_5',
    en: 'Over the past 2 weeks, how often have you had poor appetite or been eating too much?',
    ne: 'गत २ हप्तामा, कति पटक भोक कम भयो वा धेरै खानुभयो?',
    options: [
      { en: 'Not at all', ne: 'बिल्कुल पनि छैन', score: 0 },
      { en: 'Several days', ne: 'केही दिन', score: 1 },
      { en: 'More than half the days', ne: 'आधा भन्दा बढी दिन', score: 2 },
      { en: 'Nearly every day', ne: 'लगभग प्रत्येक दिन', score: 3 },
    ],
  },
  {
    id: 'phqa_6',
    en: 'Over the past 2 weeks, how often have you felt bad about yourself — or that you are a failure?',
    ne: 'गत २ हप्तामा, कति पटक आफूलाई नराम्रो महसुस गर्नुभयो वा असफल ठान्नुभयो?',
    options: [
      { en: 'Not at all', ne: 'बिल्कुल पनि छैन', score: 0 },
      { en: 'Several days', ne: 'केही दिन', score: 1 },
      { en: 'More than half the days', ne: 'आधा भन्दा बढी दिन', score: 2 },
      { en: 'Nearly every day', ne: 'लगभग प्रत्येक दिन', score: 3 },
    ],
  },
  {
    id: 'phqa_7',
    en: 'Over the past 2 weeks, how often have you had trouble concentrating on things, such as reading or studying?',
    ne: 'गत २ हप्तामा, कति पटक ध्यान केन्द्रित गर्न गाह्रो भयो, जस्तै पढ्न वा अध्ययन गर्न?',
    options: [
      { en: 'Not at all', ne: 'बिल्कुल पनि छैन', score: 0 },
      { en: 'Several days', ne: 'केही दिन', score: 1 },
      { en: 'More than half the days', ne: 'आधा भन्दा बढी दिन', score: 2 },
      { en: 'Nearly every day', ne: 'लगभग प्रत्येक दिन', score: 3 },
    ],
  },
  {
    id: 'phqa_8',
    en: 'Over the past 2 weeks, how often have you moved or spoken so slowly that others noticed? Or the opposite — being fidgety or restless?',
    ne: 'गत २ हप्तामा, कति पटक ढिलो बोल्नुभयो वा चल्नुभयो कि अरूले ध्यान दिए? वा उल्टो — बेचैन?',
    options: [
      { en: 'Not at all', ne: 'बिल्कुल पनि छैन', score: 0 },
      { en: 'Several days', ne: 'केही दिन', score: 1 },
      { en: 'More than half the days', ne: 'आधा भन्दा बढी दिन', score: 2 },
      { en: 'Nearly every day', ne: 'लगभग प्रत्येक दिन', score: 3 },
    ],
  },
  {
    id: 'phqa_9',
    en: 'Over the past 2 weeks, have you had thoughts that you would be better off dead, or of hurting yourself?',
    ne: 'गत २ हप्तामा, के तपाईंलाई मरे राम्रो हुन्थ्यो वा आफैलाई चोट पुर्याउने विचार आयो?',
    options: [
      { en: 'Not at all', ne: 'बिल्कुल पनि छैन', score: 0 },
      { en: 'Several days', ne: 'केही दिन', score: 1 },
      { en: 'More than half the days', ne: 'आधा भन्दा बढी दिन', score: 2 },
      { en: 'Nearly every day', ne: 'लगभग प्रत्येक दिन', score: 3 },
    ],
    isSelfHarm: true,
  },
];

export const PHQA_MAX_SCORE = 27;

// Age-adjusted thresholds validated for Nepali adolescents
export function getPhqaThresholds(age) {
  if (age >= 12 && age <= 14) {
    return { low: { min: 0, max: 12 }, moderate: { min: 10, max: 12 }, high: { min: 13, max: 27 } };
  }
  // 15-19
  return { low: { min: 0, max: 10 }, moderate: { min: 8, max: 10 }, high: { min: 11, max: 27 } };
}
