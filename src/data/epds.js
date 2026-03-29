// ── Edinburgh Postnatal Depression Scale (EPDS) ──
// 10 validated questions for postnatal depression screening
// Reverse scored: Q3, Q5, Q6, Q7, Q8, Q9, Q10

export const epdsQuestions = [
  {
    id: 'epds_1',
    en: 'In the past week, have you been able to laugh and see the funny side of things?',
    ne: 'गत हप्ता, के तपाईं हाँस्न र कुराको रमाइलो पक्ष देख्न सक्नुभयो?',
    options: [
      { en: 'As much as I always could', ne: 'जति सधैं गर्न सक्थें', score: 0 },
      { en: 'Not quite so much now', ne: 'अहिले त्यति होइन', score: 1 },
      { en: 'Definitely not so much now', ne: 'अहिले निश्चित रूपमा त्यति छैन', score: 2 },
      { en: 'Not at all', ne: 'बिल्कुल पनि छैन', score: 3 },
    ],
    reverse: false,
  },
  {
    id: 'epds_2',
    en: 'In the past week, have you looked forward with enjoyment to things?',
    ne: 'गत हप्ता, के तपाईंले कुराहरूको आनन्दको साथ प्रतीक्षा गर्नुभयो?',
    options: [
      { en: 'As much as I ever did', ne: 'जति सधैं गर्थें', score: 0 },
      { en: 'Rather less than I used to', ne: 'पहिले भन्दा कम', score: 1 },
      { en: 'Definitely less than I used to', ne: 'निश्चित रूपमा पहिले भन्दा कम', score: 2 },
      { en: 'Hardly at all', ne: 'जस्तोसुकै छैन', score: 3 },
    ],
    reverse: false,
  },
  {
    id: 'epds_3',
    en: 'In the past week, have you blamed yourself unnecessarily when things went wrong?',
    ne: 'गत हप्ता, कुरा बिग्रेको बेला के तपाईंले अनावश्यक रूपमा आफूलाई दोष दिनुभयो?',
    options: [
      { en: 'No, never', ne: 'होइन, कहिल्यै पनि', score: 0 },
      { en: 'Not very often', ne: 'धेरै कम', score: 1 },
      { en: 'Yes, some of the time', ne: 'हो, कहिलेकाहीं', score: 2 },
      { en: 'Yes, most of the time', ne: 'हो, प्रायः जसो', score: 3 },
    ],
    reverse: true,
  },
  {
    id: 'epds_4',
    en: 'In the past week, have you been anxious or worried for no good reason?',
    ne: 'गत हप्ता, के तपाईं विना कारण चिन्तित वा व्याकुल हुनुभयो?',
    options: [
      { en: 'No, not at all', ne: 'होइन, बिल्कुल पनि', score: 0 },
      { en: 'Hardly ever', ne: 'विरलै', score: 1 },
      { en: 'Yes, sometimes', ne: 'हो, कहिलेकाहीं', score: 2 },
      { en: 'Yes, very often', ne: 'हो, धेरै पटक', score: 3 },
    ],
    reverse: false,
  },
  {
    id: 'epds_5',
    en: 'In the past week, have you felt scared or panicky for no very good reason?',
    ne: 'गत हप्ता, के तपाईं विना कारण डराउनुभयो वा आत्तियाउनुभयो?',
    options: [
      { en: 'No, not at all', ne: 'होइन, बिल्कुल पनि', score: 0 },
      { en: 'Not much', ne: 'धेरै होइन', score: 1 },
      { en: 'Yes, sometimes', ne: 'हो, कहिलेकाहीं', score: 2 },
      { en: 'Yes, quite a lot', ne: 'हो, धेरै', score: 3 },
    ],
    reverse: true,
  },
  {
    id: 'epds_6',
    en: 'In the past week, have things been getting on top of you?',
    ne: 'गत हप्ता, के कुराहरू तपाईंमाथि हाबी भइरहेको छ?',
    options: [
      { en: 'No, I have been coping as well as ever', ne: 'होइन, म सधैंझैं सम्हालिरहेको छु', score: 0 },
      { en: 'Not much, I have been coping quite well', ne: 'धेरै होइन, राम्रोसँग सम्हालिरहेको छु', score: 1 },
      { en: 'Yes, sometimes I haven\'t been coping as well', ne: 'हो, कहिलेकाहीं सम्हाल्न सकिरहेको छैन', score: 2 },
      { en: 'Yes, most of the time I haven\'t been able to cope', ne: 'हो, प्रायः समय सम्हाल्न सकिरहेको छैन', score: 3 },
    ],
    reverse: true,
  },
  {
    id: 'epds_7',
    en: 'In the past week, have you been so unhappy that you have had difficulty sleeping?',
    ne: 'गत हप्ता, के तपाईं यति दुखी हुनुभयो कि सुत्न गाह्रो भयो?',
    options: [
      { en: 'No, not at all', ne: 'होइन, बिल्कुल पनि', score: 0 },
      { en: 'Not very often', ne: 'धेरै कम', score: 1 },
      { en: 'Yes, sometimes', ne: 'हो, कहिलेकाहीं', score: 2 },
      { en: 'Yes, most of the time', ne: 'हो, प्रायः जसो', score: 3 },
    ],
    reverse: true,
  },
  {
    id: 'epds_8',
    en: 'In the past week, have you felt sad or miserable?',
    ne: 'गत हप्ता, के तपाईं उदास वा दुःखी महसुस गर्नुभयो?',
    options: [
      { en: 'No, not at all', ne: 'होइन, बिल्कुल पनि', score: 0 },
      { en: 'Not very often', ne: 'धेरै कम', score: 1 },
      { en: 'Yes, quite often', ne: 'हो, प्रायः', score: 2 },
      { en: 'Yes, most of the time', ne: 'हो, प्रायः जसो', score: 3 },
    ],
    reverse: true,
  },
  {
    id: 'epds_9',
    en: 'In the past week, have you been so unhappy that you have been crying?',
    ne: 'गत हप्ता, के तपाईं यति दुखी हुनुभयो कि रुनुभयो?',
    options: [
      { en: 'No, never', ne: 'होइन, कहिल्यै पनि', score: 0 },
      { en: 'Only occasionally', ne: 'कहिलेकाहीं मात्र', score: 1 },
      { en: 'Yes, quite often', ne: 'हो, प्रायः', score: 2 },
      { en: 'Yes, most of the time', ne: 'हो, प्रायः जसो', score: 3 },
    ],
    reverse: true,
  },
  {
    id: 'epds_10',
    en: 'In the past week, has the thought of harming yourself occurred to you?',
    ne: 'गत हप्ता, के तपाईंलाई आफूलाई हानि गर्ने विचार आयो?',
    options: [
      { en: 'Never', ne: 'कहिल्यै पनि', score: 0 },
      { en: 'Hardly ever', ne: 'विरलै', score: 1 },
      { en: 'Sometimes', ne: 'कहिलेकाहीं', score: 2 },
      { en: 'Yes, quite often', ne: 'हो, प्रायः', score: 3 },
    ],
    reverse: true,
    isSelfHarm: true, // Flag for immediate critical alert
  },
];

export const EPDS_MAX_SCORE = 30;
export const EPDS_THRESHOLDS = {
  low: { min: 0, max: 9 },
  moderate: { min: 10, max: 12 },
  high: { min: 13, max: 30 },
};
