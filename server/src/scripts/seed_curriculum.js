/**
 * IDEMPOTENT: Safe to run multiple times.
 * Uses .update().eq('title', ...) which updates existing courses by title match.
 * Does NOT insert new rows — only updates the `gestures` JSONB on existing courses.
 * If a course title doesn't match, it silently skips (no error, no duplicate).
 */
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
      { module: 'Module 1: A through F', signs: ['A', 'B', 'C', 'D', 'E', 'F'] },
      { module: 'Module 2: G through L', signs: ['G', 'H', 'I', 'J', 'K', 'L'] },
      { module: 'Module 3: M through S', signs: ['M', 'N', 'O', 'P', 'Q', 'R', 'S'] },
      { module: 'Module 4: T through Z', signs: ['T', 'U', 'V', 'W', 'X', 'Y', 'Z'] }
    ]
  },
  {
    title: 'Contextual: Daily Life',
    gestures: [
      { module: 'Module 1: Greetings & Basics', signs: ['Hello', "What's up", 'How', 'You', 'Me', 'Name'] },
      { module: 'Module 2: Time of Day', signs: ['Morning', 'Afternoon', 'Night'] },
      { module: 'Module 3: Feelings & States', signs: ['Good', 'Fine', 'So-so', 'Tired', 'Excited', 'Happy'] },
      { module: 'Module 4: Identity & Learning', signs: ['Deaf', 'Hard of hearing', 'Hearing', 'Learn', 'ASL'] },
      { module: 'Module 5: Conversational Tools', signs: ['Again', 'Please', 'Slow', 'Sign', 'What', 'Yes', 'Not'] },
      { module: 'Module 6: Closing', signs: ['Thank you', 'Take care', 'Goodbye'] }
    ]
  },
  {
    title: 'Medical Signs',
    gestures: [
      { module: 'Module 1: Personnel & Places', signs: ['Medical', 'Hospital', "Doctor's office", 'Doctor', 'Nurse'] },
      { module: 'Module 2: Body Parts', signs: ['Legs', 'Feet', 'Head', 'Eyes', 'Ears', 'Nose', 'Mouth', 'Tonsils'] },
      { module: 'Module 3: Symptoms', signs: ['Hurt', 'Sore throat', 'Cold', 'Cough', 'Dizzy', 'Nauseous', 'Weak', 'Sweat', 'Throw up', 'Fever', 'Broken', 'Sprain', 'Allergies', 'Pregnant'] },
      { module: 'Module 4: Vitals & Treatment', signs: ['Temperature', 'High', 'Low', 'Blood pressure', 'Blood', 'Heal', 'Medicine', 'Vaccine', 'Water', 'Surgery'] },
      { module: 'Module 5: Common Phrases', signs: ['Are you okay?', 'Feel better?', 'Where does it hurt?', 'Any allergies?', 'Doctor will be here soon'] }
    ]
  },
  {
    title: 'Healthcare Signs',
    gestures: [
      { module: 'Module 1: Jobs & Transport', signs: ['Doctor', 'Nurse', 'EMT', 'Paramedic', 'Ambulance', 'Interpreter'] },
      { module: 'Module 2: Locations', signs: ['Hospital', 'Clinic', 'ER', 'Waiting room', 'Elevator', 'Cafeteria', 'Pharmacy', 'Gift shop', 'Room', 'Floor'] },
      { module: 'Module 3: Admin & Family', signs: ['Appointment', 'Stay', 'Overnight', 'Contact', 'Family', 'Insurance', 'Wheelchair'] },
      { module: 'Module 4: Patient Status', signs: ['Emergency', 'Feel', 'Hurt', 'Breathe', 'Calm', 'Sick', 'Confused', 'Better'] },
      { module: 'Module 5: History & Substances', signs: ['Oxygen', 'Medicine', 'Drug', 'Drink', 'Alcohol', 'Smoking', 'Allergies', 'Pregnant'] },
      { module: 'Module 6: Symptoms & Vitals', signs: ['Cold', 'Cough', 'Fever', 'High', 'Low', 'Weak', 'Nauseous', 'Sore throat', 'Sweat', 'Throw up', 'Broken', 'Sprain', 'Blood', 'Blood pressure', 'Temperature'] },
      { module: 'Module 7: Treatment', signs: ['Heal', 'Shot', 'IV', 'Surgery'] },
      { module: 'Module 8: Common Phrases', signs: ['Do you have insurance?', 'Cafeteria closes at nine', 'Elevator is over there', 'Where does it hurt?', 'Contacting an interpreter'] }
    ]
  }
];

// Transform the generic strings into the new rich JSON structure with video URLs
const courseUpdates = baseCourseUpdates.map(course => ({
  title: course.title,
  gestures: course.gestures.map(mod => {
    let introUrl = 'https://cdn.signsync.app/videos/intro_placeholder.mp4';
    if (course.title === 'Medical Signs') introUrl = '/videos/intro_medical_signs.mp4';
    if (course.title === 'Healthcare Signs') introUrl = '/videos/intro_healthcare_signs.mp4';
    if (course.title === 'Contextual: Daily Life') introUrl = '/videos/intro_daily_life.mp4';
    if (course.title === 'AI Real-Time: Alphabet Basics') introUrl = '/videos/intro_alphabet_basics.mp4';
    
    return {
      module: mod.module,
      introVideoUrl: introUrl,
      signs: mod.signs.map(sign => {
      const sanitizedName = sign.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return {
        name: sign,
        demoUrl: introUrl,
        correctionUrl: introUrl
      };
    })
  };
  })
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
