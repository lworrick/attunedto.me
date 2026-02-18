import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { estimateMovement } from '../services/mockAI';
import { toast } from 'sonner';

export const LogMovementScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addMovementLog } = useData();
  const [text, setText] = useState('');
  const [activityType, setActivityType] = useState<string | undefined>(undefined);
  const [intensity, setIntensity] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const activityTypes = ['walk', 'run', 'strength', 'yoga', 'cycling', 'mobility', 'other'];
  const intensityLevels = ['easy', 'moderate', 'hard'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const result = await estimateMovement(text, intensity);
      
      await addMovementLog({
        activity_type: activityType || result.activity_type,
        duration_min: result.duration_min,
        intensity,
        estimated_burn_min: result.estimated_burn_min,
        estimated_burn_max: result.estimated_burn_max,
      });

      toast.success(result.supportive_note);
      navigate('/');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <div>
          <h1 className="text-3xl text-[--basalt]">Log Movement</h1>
          <p className="text-[--dust] mt-1">Any movement counts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What movement did you do?</CardTitle>
          <CardDescription>
            All movement is beneficial movement. Be proud of showing up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              placeholder="Example: 25 min walk or 45 min strength training"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="resize-none"
            />

            <div>
              <p className="text-sm font-medium text-[--basalt] mb-3">
                Activity type (optional)
              </p>
              <div className="flex flex-wrap gap-2">
                {activityTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActivityType(activityType === type ? undefined : type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                      activityType === type
                        ? 'bg-[--sage] text-[--bone] shadow-sm'
                        : 'bg-[--bone] text-[--basalt] hover:bg-[--sand] border border-[--dust]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[--basalt] mb-3">
                Intensity (optional)
              </p>
              <div className="flex flex-wrap gap-2">
                {intensityLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setIntensity(intensity === level ? undefined : level)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                      intensity === level
                        ? 'bg-[--sage] text-[--bone] shadow-sm'
                        : 'bg-[--bone] text-[--basalt] hover:bg-[--sand] border border-[--dust]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
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
                  'Log Movement'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-[--sage] shadow-sm" style={{ backgroundColor: 'rgba(124, 138, 122, 0.08)' }}>
        <CardContent className="pt-6">
          <p className="text-sm text-[--basalt] leading-relaxed">
            <strong>Remember:</strong> Rest and recovery are just as important as movement. 
            Listen to what your body needs today.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};