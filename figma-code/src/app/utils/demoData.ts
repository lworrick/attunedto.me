// Demo data helper to populate sample logs for testing
import * as storage from '../services/storage';

export const populateDemoData = (userId: string) => {
  const now = new Date();
  
  // Add food logs for the past 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Breakfast
    storage.addFoodLog({
      user_id: userId,
      timestamp: new Date(date.setHours(8, 30, 0, 0)).toISOString(),
      text: i % 2 === 0 ? 'oatmeal with berries and almonds' : 'scrambled eggs with toast',
      meal_tag: 'Breakfast',
      calories_min: 300,
      calories_max: 400,
      protein_g: 15,
      carbs_g: 45,
      fat_g: 12,
      fiber_g: 8,
      confidence: 'medium',
    });
    
    // Lunch
    storage.addFoodLog({
      user_id: userId,
      timestamp: new Date(date.setHours(12, 30, 0, 0)).toISOString(),
      text: i % 3 === 0 ? 'chicken salad with quinoa' : 'veggie wrap with hummus',
      meal_tag: 'Lunch',
      calories_min: 450,
      calories_max: 600,
      protein_g: 25,
      carbs_g: 50,
      fat_g: 18,
      fiber_g: 10,
      confidence: 'medium',
    });
    
    // Dinner
    storage.addFoodLog({
      user_id: userId,
      timestamp: new Date(date.setHours(18, 30, 0, 0)).toISOString(),
      text: 'salmon with roasted vegetables and brown rice',
      meal_tag: 'Dinner',
      calories_min: 500,
      calories_max: 700,
      protein_g: 35,
      carbs_g: 60,
      fat_g: 20,
      fiber_g: 12,
      confidence: 'medium',
    });
    
    // Water logs
    storage.addWaterLog({
      user_id: userId,
      timestamp: new Date(date.setHours(9, 0, 0, 0)).toISOString(),
      ounces: 16,
    });
    storage.addWaterLog({
      user_id: userId,
      timestamp: new Date(date.setHours(13, 0, 0, 0)).toISOString(),
      ounces: 20,
    });
    storage.addWaterLog({
      user_id: userId,
      timestamp: new Date(date.setHours(17, 0, 0, 0)).toISOString(),
      ounces: 16,
    });
    
    // Movement
    if (i % 2 === 0) {
      storage.addMovementLog({
        user_id: userId,
        timestamp: new Date(date.setHours(7, 0, 0, 0)).toISOString(),
        activity_type: 'walking',
        duration_min: 30,
        intensity: 'moderate',
        estimated_burn_min: 90,
        estimated_burn_max: 130,
      });
    }
    
    // Cravings (occasionally)
    if (i % 3 === 0) {
      storage.addCravingLog({
        user_id: userId,
        timestamp: new Date(date.setHours(15, 0, 0, 0)).toISOString(),
        craving_text: 'something sweet',
        intensity: 3,
        craving_category: 'sweet',
        suggestion_text: JSON.stringify({
          alternatives: ['Fresh berries', 'Greek yogurt with honey'],
          honor_option: 'Have a small piece of dark chocolate',
          supportive_suggestion: 'Your body is asking for energy.',
        }),
      });
    }
    
    // Sleep
    storage.addSleepLog({
      user_id: userId,
      timestamp: new Date(date.setHours(22, 0, 0, 0)).toISOString(),
      sleep_quality: i % 2 === 0 ? 4 : 3,
      hours_slept: i % 2 === 0 ? 7.5 : 6,
      notes: i % 2 === 0 ? 'felt rested' : 'woke up a few times',
    });
    
    // Stress
    storage.addStressLog({
      user_id: userId,
      timestamp: new Date(date.setHours(20, 0, 0, 0)).toISOString(),
      stress_level: i % 4 === 0 ? 4 : 2,
      notes: i % 4 === 0 ? 'busy workday' : undefined,
    });
  }
};

export const hasDemoData = (userId: string): boolean => {
  const foodLogs = storage.getFoodLogs(userId);
  return foodLogs.length > 10; // If more than 10 food logs, assume demo data exists
};
