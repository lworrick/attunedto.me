import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { ArrowLeft, Moon } from 'lucide-react';
import { toast } from 'sonner';

export const LogSleepScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addSleepLog } = useData();
  const [sleepQuality, setSleepQuality] = useState([3]);
  const [hoursSlept, setHoursSlept] = useState('');
  const [notes, setNotes] = useState('');

  const qualityLabels = ['Very poor', 'Poor', 'Okay', 'Good', 'Excellent'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addSleepLog({
        sleep_quality: sleepQuality[0],
        hours_slept: hoursSlept ? parseFloat(hoursSlept) : undefined,
        notes: notes.trim() || undefined,
      });

      toast.success("Sleep logged. Rest is essential for everything.");
      navigate('/');
    } catch (error) {
      toast.error('Failed to log sleep. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <div>
          <h1 className="text-3xl text-[--basalt]">Log Sleep</h1>
          <p className="text-[--dust] mt-1">How did you sleep?</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-[--dust]" strokeWidth={1.5} />
            Sleep Quality
          </CardTitle>
          <CardDescription>
            Sleep affects everything from cravings to movement to stress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-medium text-[--basalt]">
                  Quality
                </label>
                <span className="text-sm font-medium text-[--clay]">
                  {qualityLabels[sleepQuality[0] - 1]}
                </span>
              </div>
              <Slider
                value={sleepQuality}
                onValueChange={setSleepQuality}
                min={1}
                max={5}
                step={1}
              />
              <div className="flex justify-between text-xs text-[--dust] mt-2">
                <span>Very poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[--basalt] mb-2 block">
                Hours slept (optional)
              </label>
              <Input
                type="number"
                placeholder="e.g., 7.5"
                value={hoursSlept}
                onChange={(e) => setHoursSlept(e.target.value)}
                min="0"
                max="24"
                step="0.5"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[--basalt] mb-2 block">
                Notes (optional)
              </label>
              <Textarea
                placeholder="e.g., woke up often, felt rested, restless..."
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
                Log Sleep
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-[--dust] shadow-sm" style={{ backgroundColor: 'rgba(184, 169, 153, 0.08)' }}>
        <CardContent className="pt-6">
          <p className="text-sm text-[--basalt] leading-relaxed">
            Sleep quality impacts energy, cravings, and stress. Tracking it helps you 
            notice patterns and make supportive adjustments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};