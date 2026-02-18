// Mock AI service for Attune
// This simulates AI responses with supportive, body-neutral language
// In production, these would be Supabase Edge Functions calling OpenAI/Anthropic

export interface FoodEstimateResult {
  calories_min: number;
  calories_max: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  confidence: 'low' | 'medium' | 'high';
  optional_followup_question?: string;
  supportive_note: string;
}

export interface MovementEstimateResult {
  activity_type: string;
  duration_min: number;
  estimated_burn_min: number;
  estimated_burn_max: number;
  supportive_note: string;
}

export interface CravingResponse {
  alternatives: string[];
  honor_option: string;
  supportive_suggestion: string;
}

export interface DailySummary {
  summary_text: string;
  insights: string[];
  suggestion: string;
  supportive_line: string;
}

export interface TrendInsights {
  patterns: string[];
  influences: string[];
  experiment: string;
  supportive_line: string;
}

// Food estimation
export const estimateFood = async (
  text: string,
  mealTag?: string,
  isRestaurant?: boolean,
  unsurePortions?: boolean,
): Promise<FoodEstimateResult> => {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simple keyword-based estimation for demo
  const lowerText = text.toLowerCase();

  let calories_min = 200;
  let calories_max = 300;
  let protein_g = 10;
  let carbs_g = 30;
  let fat_g = 8;
  let fiber_g = 3;
  let confidence: 'low' | 'medium' | 'high' = 'medium';

  // Adjust estimates based on keywords
  if (lowerText.includes('burrito') || lowerText.includes('bowl')) {
    calories_min = 450;
    calories_max = 650;
    protein_g = 25;
    carbs_g = 60;
    fat_g = 18;
    fiber_g = 12;
  } else if (lowerText.includes('salad')) {
    calories_min = 200;
    calories_max = 400;
    protein_g = 15;
    carbs_g = 20;
    fat_g = 12;
    fiber_g = 8;
  } else if (lowerText.includes('pizza')) {
    calories_min = 500;
    calories_max = 800;
    protein_g = 20;
    carbs_g = 65;
    fat_g = 25;
    fiber_g = 4;
  } else if (lowerText.includes('sandwich') || lowerText.includes('wrap')) {
    calories_min = 350;
    calories_max = 550;
    protein_g = 22;
    carbs_g = 45;
    fat_g = 15;
    fiber_g = 6;
  } else if (lowerText.includes('smoothie') || lowerText.includes('shake')) {
    calories_min = 200;
    calories_max = 400;
    protein_g = 10;
    carbs_g = 50;
    fat_g = 5;
    fiber_g = 5;
  } else if (lowerText.includes('oatmeal') || lowerText.includes('oats')) {
    calories_min = 250;
    calories_max = 400;
    protein_g = 12;
    carbs_g = 55;
    fat_g = 8;
    fiber_g = 10;
  } else if (lowerText.includes('eggs')) {
    calories_min = 150;
    calories_max = 300;
    protein_g = 18;
    carbs_g = 5;
    fat_g = 12;
    fiber_g = 1;
  } else if (lowerText.includes('yogurt')) {
    calories_min = 120;
    calories_max = 250;
    protein_g = 15;
    carbs_g = 25;
    fat_g = 5;
    fiber_g = 2;
  } else if (lowerText.includes('pasta')) {
    calories_min = 400;
    calories_max = 700;
    protein_g = 18;
    carbs_g = 75;
    fat_g = 15;
    fiber_g = 5;
  } else if (lowerText.includes('rice') || lowerText.includes('grain bowl')) {
    calories_min = 350;
    calories_max = 550;
    protein_g = 15;
    carbs_g = 65;
    fat_g = 10;
    fiber_g = 7;
  } else if (lowerText.includes('snack') || lowerText.includes('bar')) {
    calories_min = 150;
    calories_max = 250;
    protein_g = 5;
    carbs_g = 25;
    fat_g = 8;
    fiber_g = 3;
  }

  // Adjust for restaurant (larger portions)
  if (isRestaurant) {
    calories_min = Math.round(calories_min * 1.3);
    calories_max = Math.round(calories_max * 1.5);
    confidence = 'low';
  }

  // Adjust for unsure portions
  if (unsurePortions) {
    const range = calories_max - calories_min;
    calories_min = Math.round(calories_min - range * 0.2);
    calories_max = Math.round(calories_max + range * 0.2);
    confidence = 'low';
  }

  const supportiveNotes = [
    "Thanks for logging. Data, not drama.",
    "You're building awareness—that's what matters.",
    "Great job adding this entry. Every bit of data helps you notice patterns.",
    "Logged. Remember, these are rough estimates, not exact science.",
    "Nice work tracking. You're learning what works for your body.",
  ];

  return {
    calories_min,
    calories_max,
    protein_g: Math.round(protein_g),
    carbs_g: Math.round(carbs_g),
    fat_g: Math.round(fat_g),
    fiber_g: Math.round(fiber_g),
    confidence,
    supportive_note:
      supportiveNotes[Math.floor(Math.random() * supportiveNotes.length)],
  };
};

// Movement estimation
export const estimateMovement = async (
  text: string,
  intensity?: string,
): Promise<MovementEstimateResult> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const lowerText = text.toLowerCase();
  let duration_min = 30;
  let activity_type = 'general';
  let burnPerMin = 4;

  // Extract duration
  const durationMatch = text.match(/(\d+)\s*(min|minute|minutes|hour|hours)/i);
  if (durationMatch) {
    duration_min = parseInt(durationMatch[1]);
    if (durationMatch[2].toLowerCase().startsWith('hour')) {
      duration_min *= 60;
    }
  }

  // Determine activity type and burn rate
  if (lowerText.includes('walk')) {
    activity_type = 'walking';
    burnPerMin = 3.5;
  } else if (lowerText.includes('run') || lowerText.includes('jog')) {
    activity_type = 'running';
    burnPerMin = 10;
  } else if (
    lowerText.includes('strength') ||
    lowerText.includes('weight') ||
    lowerText.includes('lift')
  ) {
    activity_type = 'strength training';
    burnPerMin = 6;
  } else if (lowerText.includes('yoga')) {
    activity_type = 'yoga';
    burnPerMin = 3;
  } else if (lowerText.includes('bike') || lowerText.includes('cycl')) {
    activity_type = 'cycling';
    burnPerMin = 8;
  } else if (lowerText.includes('swim')) {
    activity_type = 'swimming';
    burnPerMin = 9;
  } else if (lowerText.includes('hiit') || lowerText.includes('cardio')) {
    activity_type = 'HIIT';
    burnPerMin = 12;
  }

  // Adjust for intensity
  if (intensity === 'easy') {
    burnPerMin *= 0.7;
  } else if (intensity === 'hard') {
    burnPerMin *= 1.3;
  }

  const estimated_burn_min = Math.round(duration_min * burnPerMin * 0.8);
  const estimated_burn_max = Math.round(duration_min * burnPerMin * 1.2);

  const supportiveNotes = [
    "Movement logged. Your body will thank you for listening to it.",
    "Nice work. Rest is just as important as movement.",
    "You showed up for yourself today. That counts.",
    "Logged. Remember, all movement is beneficial movement.",
    "Great job moving today. You're building sustainable habits.",
  ];

  return {
    activity_type,
    duration_min,
    estimated_burn_min,
    estimated_burn_max,
    supportive_note:
      supportiveNotes[Math.floor(Math.random() * supportiveNotes.length)],
  };
};

// Craving suggestions
export const getCravingSuggestions = async (
  cravingText: string,
  intensity: number,
  category?: string,
): Promise<CravingResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const lowerText = cravingText.toLowerCase();

  let alternatives: string[] = [];
  let honor_option = '';

  if (
    lowerText.includes('sweet') ||
    lowerText.includes('sugar') ||
    lowerText.includes('chocolate') ||
    lowerText.includes('candy')
  ) {
    alternatives = [
      'Fresh berries with a drizzle of honey',
      'Greek yogurt with cinnamon and a few dark chocolate chips',
      'Sliced apple with almond butter',
      'A small handful of dates',
    ];
    honor_option = 'Have a small piece of your favorite chocolate mindfully';
  } else if (
    lowerText.includes('salty') ||
    lowerText.includes('chips') ||
    lowerText.includes('crispy')
  ) {
    alternatives = [
      'Roasted chickpeas with sea salt',
      'Handful of lightly salted nuts',
      'Popcorn with nutritional yeast',
      'Veggie sticks with hummus',
    ];
    honor_option = 'Have a small bowl of chips, eaten slowly';
  } else if (lowerText.includes('creamy') || lowerText.includes('rich')) {
    alternatives = [
      'Full-fat Greek yogurt with berries',
      'Avocado on toast',
      'Smoothie with banana and nut butter',
      'Cottage cheese with fruit',
    ];
    honor_option = 'Have a small portion of ice cream or your creamy favorite';
  } else if (lowerText.includes('crunchy') || lowerText.includes('crispy')) {
    alternatives = [
      'Carrot and celery sticks',
      'Apple slices',
      'Rice cakes with toppings',
      'Cucumber with lime and tajin',
    ];
    honor_option = 'Have your crunchy snack of choice in a small portion';
  } else {
    alternatives = [
      'Handful of trail mix',
      'Sliced veggies with guacamole',
      'A piece of fruit you enjoy',
    ];
    honor_option = 'Honor what you\'re truly craving in a mindful portion';
  }

  const suggestions = [
    "Cravings are just information. You might be noticing a pattern here.",
    "It's okay to feel this. Sometimes our bodies are asking for specific nutrients—or just comfort.",
    "If you'd like, try one of these options. Or honor the craving. Both are valid.",
    "Your body is communicating. These alternatives might satisfy the same need.",
  ];

  return {
    alternatives,
    honor_option,
    supportive_suggestion:
      suggestions[Math.floor(Math.random() * suggestions.length)],
  };
};

// Daily summary
export const generateDailySummary = async (data: {
  calories_min: number;
  calories_max: number;
  protein: number;
  fiber: number;
  water: number;
  movement_min: number;
  cravings_count: number;
  sleep_quality_avg: number;
  stress_level_avg: number;
}): Promise<DailySummary> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const insights: string[] = [];
  let suggestion = '';

  // Analyze patterns
  if (data.water < 40) {
    insights.push(
      "You might be noticing you're drinking less water than usual today.",
    );
  } else if (data.water > 80) {
    insights.push("You're staying well-hydrated today.");
  }

  if (data.protein > 60) {
    insights.push("You're getting solid protein today.");
  }

  if (data.fiber > 25) {
    insights.push("You're including plenty of fiber-rich foods.");
  }

  if (data.movement_min > 30) {
    insights.push(`You moved for ${data.movement_min} minutes today.`);
  }

  if (data.sleep_quality_avg > 0 && data.sleep_quality_avg < 3) {
    insights.push(
      "It looks like sleep was challenging. That can affect everything.",
    );
  }

  if (data.stress_level_avg > 3) {
    insights.push(
      "You logged higher stress today. Be gentle with yourself.",
    );
  }

  if (data.cravings_count > 3) {
    insights.push(
      `You logged ${data.cravings_count} cravings today. That's valuable data.`,
    );
  }

  // Generate suggestion
  if (data.sleep_quality_avg < 3 && data.stress_level_avg > 3) {
    suggestion =
      "If you'd like, try a 5-minute breathing exercise before bed tonight.";
  } else if (data.water < 40) {
    suggestion =
      "If it feels right, try keeping water nearby tomorrow—it might help.";
  } else if (data.movement_min === 0) {
    suggestion =
      "If you're up for it, a short walk tomorrow might feel good.";
  } else if (data.cravings_count > 2 && data.water < 50) {
    suggestion =
      "Sometimes staying hydrated can help with cravings. Worth noticing.";
  } else {
    suggestion =
      "You're building awareness. That's the most important part.";
  }

  const summaryTexts = [
    `You logged food, ${data.water}oz of water, and ${data.movement_min} minutes of movement today.`,
    `Today you tracked your eating patterns, hydration (${data.water}oz), and movement.`,
    `You checked in with your body today: food, water (${data.water}oz), and ${data.movement_min} min of movement.`,
  ];

  const supportiveLines = [
    "You're showing up for yourself. That's what matters.",
    "This is progress. You're noticing patterns.",
    "Keep going. You're learning what works for you.",
    "Every day of data helps you understand your body better.",
  ];

  return {
    summary_text:
      summaryTexts[Math.floor(Math.random() * summaryTexts.length)],
    insights,
    suggestion,
    supportive_line:
      supportiveLines[Math.floor(Math.random() * supportiveLines.length)],
  };
};

// Trend insights
export const generateTrendInsights = async (
  rollups: any[],
  days: number,
): Promise<TrendInsights> => {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const patterns: string[] = [];
  const influences: string[] = [];

  // Calculate averages
  const avgCalories =
    rollups.reduce((sum, r) => sum + (r.calories_min_total + r.calories_max_total) / 2, 0) /
    rollups.length;
  const avgWater =
    rollups.reduce((sum, r) => sum + r.water_total, 0) / rollups.length;
  const avgMovement =
    rollups.reduce((sum, r) => sum + r.movement_min_total, 0) / rollups.length;
  const avgCravings =
    rollups.reduce((sum, r) => sum + r.cravings_count, 0) / rollups.length;
  const avgSleep =
    rollups.filter((r) => r.sleep_quality_avg > 0).length > 0
      ? rollups
          .filter((r) => r.sleep_quality_avg > 0)
          .reduce((sum, r) => sum + r.sleep_quality_avg, 0) /
        rollups.filter((r) => r.sleep_quality_avg > 0).length
      : 0;
  const avgStress =
    rollups.filter((r) => r.stress_level_avg > 0).length > 0
      ? rollups
          .filter((r) => r.stress_level_avg > 0)
          .reduce((sum, r) => sum + r.stress_level_avg, 0) /
        rollups.filter((r) => r.stress_level_avg > 0).length
      : 0;

  // Identify patterns
  if (avgWater < 50) {
    patterns.push(
      `Over the past ${days} days, you're averaging around ${Math.round(avgWater)}oz of water daily.`,
    );
  }

  if (avgMovement > 20) {
    patterns.push(
      `You're moving an average of ${Math.round(avgMovement)} minutes per day.`,
    );
  } else if (avgMovement < 10) {
    patterns.push(
      "Movement has been lighter lately. That's okay—rest matters too.",
    );
  }

  if (avgCravings > 2) {
    patterns.push(
      `You're noticing about ${Math.round(avgCravings)} cravings per day on average.`,
    );
  }

  // Identify influences
  if (avgSleep < 3 && avgCravings > 2) {
    influences.push(
      "Lower sleep quality seems to coincide with more frequent cravings.",
    );
  }

  if (avgStress > 3 && avgCravings > 2) {
    influences.push(
      "Higher stress days often align with more cravings—that's a common pattern.",
    );
  }

  if (avgSleep < 3 && avgMovement < 15) {
    influences.push(
      "Sleep challenges may be affecting your energy for movement.",
    );
  }

  if (avgStress > 3.5) {
    influences.push(
      "Stress levels have been elevated. That impacts everything from sleep to eating patterns.",
    );
  }

  if (influences.length === 0) {
    influences.push(
      "You're building a baseline. Keep tracking to see clearer patterns.",
    );
  }

  const experiments = [
    "Try drinking 8oz of water first thing in the morning for a week.",
    "Experiment with a 10-minute walk after one meal per day.",
    "Notice if eating protein at breakfast affects your afternoon cravings.",
    "Try a 5-minute wind-down routine before bed for better sleep.",
    "See if hydrating more on high-stress days changes anything.",
  ];

  const supportiveLines = [
    "You're making progress just by paying attention.",
    "Keep exploring what works for your unique body.",
    "This awareness is the foundation of lasting change.",
    "You're doing great. Small shifts add up over time.",
  ];

  return {
    patterns,
    influences,
    experiment: experiments[Math.floor(Math.random() * experiments.length)],
    supportive_line:
      supportiveLines[Math.floor(Math.random() * supportiveLines.length)],
  };
};