require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
// We'll load the server env explicitly since the script might be run from different places
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const baseCourseUpdates = [
  {
    title: 'AI Real-Time: Alphabet Basics',
    gestures: [
      { module: 'Module 1: The Anchors', signs: ['A', 'E', 'I', 'O', 'U', 'S', 'T'] },
      { module: 'Module 2: The Open Hand', signs: ['B', 'C', 'D', 'F', 'K', 'V', 'W'] },
      { module: 'Module 3: Directionals', signs: ['G', 'H', 'J', 'P', 'Q', 'Z'] },
      { module: 'Module 4: Complex Spells', signs: ['L', 'M', 'N', 'R', 'X', 'Y'] },
      { module: 'Module 5: Mastery', signs: ['CAT', 'DOG', 'YES', 'NO', 'HELP'] }
    ]
  },
  {
    title: 'Visual Tracking: Speed',
    gestures: [
      { module: 'Module 1: Rubber Band', signs: ['REST', 'UP', 'REST', 'DOWN'] },
      { module: 'Module 2: Vowel Bouncing', signs: ['A-E-A', 'O-I-O', 'U-E-U'] },
      { module: 'Module 3: Double Letters', signs: ['L-L', 'E-E', 'T-T', 'S-S'] },
      { module: 'Module 4: Speed Run', signs: ['HELLO', 'WORLD', 'FAST', 'SLOW'] }
    ]
  },
  {
    title: 'Contextual: Daily Life',
    gestures: [
      { module: 'Module 1: Greetings', signs: ['Hello', 'Please', 'Thank You', 'Sorry'] },
      { module: 'Module 2: People', signs: ['I', 'You', 'Mother', 'Father', 'Friend'] },
      { module: 'Module 3: Time', signs: ['Today', 'Tomorrow', 'Now', 'Later'] },
      { module: 'Module 4: Food', signs: ['Eat', 'Drink', 'Water', 'Buy'] }
    ]
  },
  {
    title: 'Healthcare: ER Triage',
    gestures: [
      { module: 'Module 1: Pain Scale', signs: ['Pain', 'Where', 'Level 1', 'Level 10'] },
      { module: 'Module 2: Trauma', signs: ['Bleeding', 'Broken', 'Dizzy', 'Heart Attack'] },
      { module: 'Module 3: History', signs: ['Allergy', 'Medicine', 'Pregnant', 'Diabetic'] },
      { module: 'Module 4: Commands', signs: ['Sit down', 'Breathe', 'Stay calm', 'Wait'] }
    ]
  },
  {
    title: 'Healthcare: Consent',
    gestures: [
      { module: 'Module 1: Anatomy', signs: ['Blood', 'Heart', 'Lungs', 'Surgery'] },
      { module: 'Module 2: Explaining', signs: ['Look inside', 'Fix bone', 'Sleep'] },
      { module: 'Module 3: Risks', signs: ['Infection', 'Bleeding', 'Death', 'Scar'] },
      { module: 'Module 4: Legal', signs: ['Understand?', 'Agree?', 'Sign name', 'Say no'] }
    ]
  }
];

// Transform the generic strings into the new rich JSON structure with video URLs
const courseUpdates = baseCourseUpdates.map(course => ({
  title: course.title,
  gestures: course.gestures.map(mod => ({
    module: mod.module,
    introVideoUrl: 'https://cdn.signsync.app/videos/intro_placeholder.mp4',
    signs: mod.signs.map(sign => {
      const sanitizedName = sign.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return {
        name: sign,
        demoUrl: `https://cdn.signsync.app/videos/demo_${sanitizedName}.mp4`,
        correctionUrl: `https://cdn.signsync.app/videos/correction_${sanitizedName}.mp4`
      };
    })
  }))
}));

async function seedCurriculum() {
  console.log("Seeding detailed curriculum...");
  for (const update of courseUpdates) {
    const { data, error } = await supabase
      .from('courses')
      .update({ gestures: update.gestures })
      .eq('title', update.title);

    if (error) {
      console.error(`Error updating ${update.title}:`, error.message);
    } else {
      console.log(`Successfully updated: ${update.title}`);
    }
  }
  console.log("Seeding complete.");
}

seedCurriculum();
