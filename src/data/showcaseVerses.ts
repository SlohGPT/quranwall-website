// Ayat shown in the homepage mockups (hero lock screen, feature bento).
// Every string is copied exactly from quran.com (API v4) and checked on 2026-11-16:
// Arabic = text_uthmani, English = Saheeh International (resource 20), the same
// translation the app ships as "Saheeh Intl.". Some entries are one full sentence
// of a longer ayah; the text is unchanged. Add or edit only after re-checking on
// quran.com the same day, then re-run the Amiri Quran subset (see src/index.css).

export type ShowcaseVerse = {
  key: string; // surah:ayah
  surah: string; // transliterated surah name as the app writes it
  surahNameAr: string; // Arabic-script surah name, copied from BibleBookNames.swift `arabic` (the app uses it for Arabic, Urdu and Persian editions)
  arabic: string;
  translation: string;
  translationName: string;
};

const SAHEEH = 'Saheeh International';

export const SHOWCASE_VERSES: ShowcaseVerse[] = [
  {
    key: '94:6',
    surah: 'Ash-Sharh',
    surahNameAr: 'الشَّرۡحِ',
    arabic: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    translation: 'Indeed, with hardship [will be] ease.',
    translationName: SAHEEH,
  },
  {
    key: '13:28',
    surah: "Ar-Ra'd",
    surahNameAr: 'الرَّعۡدِ',
    arabic: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    translation: 'Unquestionably, by the remembrance of Allāh hearts are assured.',
    translationName: SAHEEH,
  },
  {
    key: '2:152',
    surah: 'Al-Baqarah',
    surahNameAr: 'البَقَرَةِ',
    arabic: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ',
    translation: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    translationName: SAHEEH,
  },
  {
    key: '65:3',
    surah: 'At-Talaq',
    surahNameAr: 'الطَّلَاقِ',
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ',
    translation: 'And whoever relies upon Allāh - then He is sufficient for him.',
    translationName: SAHEEH,
  },
  {
    key: '2:286',
    surah: 'Al-Baqarah',
    surahNameAr: 'البَقَرَةِ',
    arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: 'Allāh does not charge a soul except [with that within] its capacity.',
    translationName: SAHEEH,
  },
];

// Quran 94:6 in the app's translations that quran.com carries (checked 2026-11-16).
// lang = BCP 47 code for the lang attribute; dir = text direction.
export const VERSE_94_6_TRANSLATIONS = [
  { language: 'English', lang: 'en', dir: 'ltr', name: 'Saheeh International', text: 'Indeed, with hardship [will be] ease.' },
  { language: 'Français', lang: 'fr', dir: 'ltr', name: 'Hamidullah', text: 'A côté de la difficulté, est certes, une facilité !' },
  { language: 'Deutsch', lang: 'de', dir: 'ltr', name: 'Bubenheim & Elyas', text: 'gewiß, mit der Erschwernis ist Erleichterung.' },
  { language: 'Türkçe', lang: 'tr', dir: 'ltr', name: 'Diyanet', text: 'Gerçekten, güçlükle beraber bir kolaylık vardır.' },
  { language: 'Bahasa Indonesia', lang: 'id', dir: 'ltr', name: 'Kemenag', text: 'sesungguhnya bersama kesulitan ada kemudahan.' },
  { language: 'Bahasa Melayu', lang: 'ms', dir: 'ltr', name: 'Basmeih', text: '(Sekali lagi ditegaskan): bahawa sesungguhnya tiap-tiap kesukaran disertai kemudahan.' },
  { language: 'اردو', lang: 'ur', dir: 'rtl', name: 'Jalandhry', text: '(اور) بے شک مشکل کے ساتھ آسانی ہے' },
] as const;

// The ten languages the app offers (iOS source: BibleModels.swift, QuranLanguage).
export const APP_LANGUAGES = [
  'Arabic', 'English', 'French', 'German', 'Turkish',
  'Indonesian', 'Malay', 'Urdu', 'Bengali', 'Persian',
] as const;
