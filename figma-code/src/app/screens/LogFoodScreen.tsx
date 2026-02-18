import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../contexts/DataContext';
import { invokeEdgeFunction } from '../services/edgeFunctionClient';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FoodEstimate {
  calories_min: number;
  calories_max: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  confidence: 'low' | 'medium' | 'high';
  supportive_note: string;
}

export const LogFoodScreen: React.FC = () => {
  const navigate = useNavigate();
  const { refreshData } = useData();
  const [text, setText] = useState('');
  const [mealTag, setMealTag] = useState<string | undefined>(undefined);
  const [unsurePortions, setUnsurePortions] = useState(false);
  const [isRestaurant, setIsRestaurant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [estimate, setEstimate] = useState<FoodEstimate | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      // Call edge function with save: false to get estimate
      const { data, error } = await invokeEdgeFunction('estimate_food', {
        body: {
          text: text.trim(),
          meal_tag: mealTag,
          is_restaurant: isRestaurant,
          unsure_portions: unsurePortions,
          save: false,
        },
      });

      if (error) {
        console.error('Error calling estimate_food function:', error);
        throw error;
      }

      console.log('Food estimate received:', data);
      setEstimate(data);
    } catch (error) {
      console.error('Error estimating food:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!estimate) return;

    setSaving(true);
    try {
      // Call edge function with save: true to save to database
      const { data, error } = await invokeEdgeFunction('estimate_food', {
        body: {
          text: text.trim(),
          meal_tag: mealTag,
          is_restaurant: isRestaurant,
          unsure_portions: unsurePortions,
          save: true,
        },
      });

      if (error) {
        console.error('Error saving food log:', error);
        throw error;
      }

      toast.success(estimate.supportive_note);
      
      // Refresh data in DataContext to update Today, History, and daily rollups
      await refreshData();
      
      navigate('/');
    } catch (error) {
      console.error('Error saving food log:', error);
      toast.error('Failed to save food log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const mealTags = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <div>
          <h1 className="text-3xl text-[--basalt]">Log Food</h1>
          <p className="text-[--dust] mt-1">Describe what you ate or are eating</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What did you eat?</CardTitle>
          <CardDescription>
            No need to be precise. Just describe it naturally.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              placeholder="Example: veggie burrito with black beans, rice, guac"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="resize-none"
            />

            <div>
              <p className="text-sm font-medium text-[--basalt] mb-3">Meal type (optional)</p>
              <div className="flex flex-wrap gap-2">
                {mealTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setMealTag(mealTag === tag ? undefined : tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      mealTag === tag
                        ? 'bg-[--clay] text-[--bone] shadow-sm'
                        : 'bg-[--bone] text-[--basalt] hover:bg-[--sand] border border-[--dust]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[--basalt] mb-3">Context (optional)</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setUnsurePortions(!unsurePortions)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    unsurePortions
                      ? 'bg-[--sage] text-[--bone] shadow-sm'
                      : 'bg-[--bone] text-[--basalt] hover:bg-[--sand] border border-[--dust]'
                  }`}
                >
                  Not sure on portions
                </button>
                <button
                  type="button"
                  onClick={() => setIsRestaurant(!isRestaurant)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isRestaurant
                      ? 'bg-[--sage] text-[--bone] shadow-sm'
                      : 'bg-[--bone] text-[--basalt] hover:bg-[--sand] border border-[--dust]'
                  }`}
                >
                  Restaurant meal
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!text.trim() || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Logging...
                  </>
                ) : (
                  'Log Food'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {estimate && (
        <Card className="border-[--sage] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[--sage]" strokeWidth={2} />
              Estimate Ready
            </CardTitle>
            <CardDescription>
              Review the estimate below and tap Save to confirm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Calorie Range */}
            <div className="bg-gradient-to-br from-[rgba(200,122,90,0.08)] to-[rgba(124,138,122,0.08)] rounded-lg p-4">
              <p className="text-xs text-[--dust] uppercase tracking-wide mb-1">Estimated Calories</p>
              <p className="text-3xl font-medium text-[--basalt]">
                {estimate.calories_min}–{estimate.calories_max}
              </p>
            </div>

            {/* Macros Grid */}
            <div>
              <p className="text-sm font-medium text-[--basalt] mb-3">Macronutrients</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[--bone] rounded-lg p-3">
                  <p className="text-xs text-[--dust] mb-1">Protein</p>
                  <p className="text-xl font-medium text-[--basalt]">{estimate.protein_g}g</p>
                </div>
                <div className="bg-[--bone] rounded-lg p-3">
                  <p className="text-xs text-[--dust] mb-1">Carbs</p>
                  <p className="text-xl font-medium text-[--basalt]">{estimate.carbs_g}g</p>
                </div>
                <div className="bg-[--bone] rounded-lg p-3">
                  <p className="text-xs text-[--dust] mb-1">Fat</p>
                  <p className="text-xl font-medium text-[--basalt]">{estimate.fat_g}g</p>
                </div>
                <div className="bg-[--bone] rounded-lg p-3">
                  <p className="text-xs text-[--dust] mb-1">Fiber</p>
                  <p className="text-xl font-medium text-[--basalt]">{estimate.fiber_g}g</p>
                </div>
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[--dust] uppercase tracking-wide">Confidence:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                estimate.confidence === 'high' ? 'bg-[--sage] text-[--bone]' :
                estimate.confidence === 'medium' ? 'bg-[--dust] text-[--bone]' :
                'bg-[--bone] text-[--basalt] border border-[--dust]'
              }`}>
                {estimate.confidence}
              </span>
            </div>

            {/* Supportive Note */}
            <div className="pt-3 border-t border-[--dust]">
              <p className="text-sm text-[--clay] italic leading-relaxed">
                {estimate.supportive_note}
              </p>
            </div>

            {/* Reminder */}
            <div className="bg-[rgba(200,122,90,0.08)] rounded-lg p-4">
              <p className="text-xs text-[--basalt] leading-relaxed">
                <strong>Remember:</strong> These are rough estimates, not exact measurements. 
                The goal is to notice patterns, not to obsess over numbers.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEstimate(null)}
                className="flex-1"
                disabled={saving}
              >
                Edit Entry
              </Button>
              <Button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!estimate && (
        <Card className="border-[--clay] shadow-sm" style={{ backgroundColor: 'rgba(200, 122, 90, 0.08)' }}>
          <CardContent className="pt-6">
            <p className="text-sm text-[--basalt] leading-relaxed">
              <strong>Remember:</strong> These are rough estimates, not exact measurements. 
              The goal is to notice patterns, not to obsess over numbers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};