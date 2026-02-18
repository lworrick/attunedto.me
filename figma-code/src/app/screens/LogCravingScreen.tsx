import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getCravingSuggestions } from '../services/mockAI';
import { toast } from 'sonner';

export const LogCravingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addCravingLog } = useData();
  const [cravingText, setCravingText] = useState('');
  const [intensity, setIntensity] = useState([3]);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    alternatives: string[];
    honor_option: string;
    supportive_suggestion: string;
  } | null>(null);

  const categories = ['sweet', 'salty', 'crunchy', 'creamy', 'comforting', 'quick energy'];

  const handleGetSuggestions = async () => {
    if (!cravingText.trim()) return;

    setLoading(true);
    try {
      const result = await getCravingSuggestions(cravingText, intensity[0], category);
      setSuggestions(result);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCraving = async () => {
    if (!cravingText.trim() || !suggestions) return;

    try {
      await addCravingLog({
        craving_text: cravingText.trim(),
        intensity: intensity[0],
        craving_category: category,
        suggestion_text: JSON.stringify(suggestions),
      });

      toast.success("Craving logged. You're noticing patterns—that's powerful.");
      navigate('/');
    } catch (error) {
      toast.error('Failed to log craving. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <div>
          <h1 className="text-3xl text-[--basalt]">Log Craving</h1>
          <p className="text-[--dust] mt-1">What are you craving?</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Describe your craving</CardTitle>
          <CardDescription>
            Cravings are just information. Let's explore what might help.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            placeholder="e.g., chocolate, chips, something sweet..."
            value={cravingText}
            onChange={(e) => setCravingText(e.target.value)}
          />

          <div>
            <div className="flex justify-between mb-3">
              <label className="text-sm font-medium text-[--basalt]">
                Intensity (optional)
              </label>
              <span className="text-sm text-[--dust]">{intensity[0]}/5</span>
            </div>
            <Slider
              value={intensity}
              onValueChange={setIntensity}
              min={1}
              max={5}
              step={1}
            />
            <div className="flex justify-between text-xs text-[--dust] mt-2">
              <span>Mild</span>
              <span>Intense</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[--basalt] mb-3">
              Type (optional)
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(category === cat ? undefined : cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    category === cat
                      ? 'bg-[--adobe] text-[--bone] shadow-sm'
                      : 'bg-[--bone] text-[--basalt] hover:bg-[--sand] border border-[--dust]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {!suggestions ? (
            <Button
              onClick={handleGetSuggestions}
              disabled={!cravingText.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Getting suggestions...
                </>
              ) : (
                'Get Supportive Suggestions'
              )}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {suggestions && (
        <>
          <Card className="border-[--adobe] shadow-md" style={{ backgroundColor: 'rgba(182, 94, 60, 0.08)' }}>
            <CardHeader>
              <CardTitle className="text-lg">Alternatives to try</CardTitle>
              <CardDescription>
                {suggestions.supportive_suggestion}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="bg-[--bone] p-3 rounded-lg border border-[--dust]"
                >
                  <p className="text-sm text-[--basalt]">• {alt}</p>
                </div>
              ))}
              <div className="bg-[--bone] p-3 rounded-lg border border-[--adobe]">
                <p className="text-sm font-medium text-[--adobe]">
                  Or honor it: {suggestions.honor_option}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCraving} className="flex-1">
              Save Craving
            </Button>
          </div>
        </>
      )}
    </div>
  );
};