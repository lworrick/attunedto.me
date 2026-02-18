import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { ArrowLeft, Brain } from 'lucide-react';
import { toast } from 'sonner';

export const LogStressScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addStressLog } = useData();
  const [stressLevel, setStressLevel] = useState([3]);
  const [notes, setNotes] = useState('');

  const stressLabels = ['Very calm', 'Mostly calm', 'Moderate', 'High', 'Very high'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addStressLog({
        stress_level: stressLevel[0],
        notes: notes.trim() || undefined,
      });

      toast.success('Stress level logged. Noticing how you feel is valuable.');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log stress. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <div>
          <h1 className="text-3xl text-[--basalt]">Log Stress</h1>
          <p className="text-[--dust] mt-1">How are you feeling?</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[--clay]" strokeWidth={1.5} />
            Stress Level
          </CardTitle>
          <CardDescription>
            Stress influences eating, sleep, and movement patterns. Noticing it is the first step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-medium text-[--basalt]">
                  Current level
                </label>
                <span className="text-sm font-medium text-[--clay]">
                  {stressLabels[stressLevel[0] - 1]}
                </span>
              </div>
              <Slider
                value={stressLevel}
                onValueChange={setStressLevel}
                min={1}
                max={5}
                step={1}
              />
              <div className="flex justify-between text-xs text-[--dust] mt-2">
                <span>Very calm</span>
                <span>Very high</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[--basalt] mb-2 block">
                What's contributing? (optional)
              </label>
              <Textarea
                placeholder="e.g., busy workday, felt anxious, deadline pressure..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
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
              <Button type="submit" className="flex-1">
                Log Stress
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-[--clay] shadow-sm" style={{ backgroundColor: 'rgba(200, 122, 90, 0.08)' }}>
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm text-[--basalt] leading-relaxed">
            High stress days often correlate with changes in appetite, cravings, and sleep. 
            Tracking helps you see these connections.
          </p>
          <p className="text-sm text-[--basalt] leading-relaxed">
            <strong>If you'd like:</strong> Try a 5-minute breathing exercise, a short walk, 
            or reaching out to someone supportive.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};