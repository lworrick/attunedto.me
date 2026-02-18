import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { ArrowLeft, Droplets } from 'lucide-react';
import { toast } from 'sonner';

export const LogWaterScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addWaterLog, getTodayRollup } = useData();
  const [customOz, setCustomOz] = useState('');

  const todayData = getTodayRollup();

  const handleQuickLog = async (ounces: number) => {
    try {
      await addWaterLog(ounces);
      toast.success(`Logged ${ounces}oz of water. Keep it up!`);
      navigate('/');
    } catch (error) {
      toast.error('Failed to log water. Please try again.');
    }
  };

  const handleCustomLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const oz = parseInt(customOz);
    if (oz > 0) {
      try {
        await addWaterLog(oz);
        toast.success(`Logged ${oz}oz of water. You're staying hydrated!`);
        navigate('/');
      } catch (error) {
        toast.error('Failed to log water. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <div>
          <h1 className="text-3xl text-[--basalt]">Log Water</h1>
          <p className="text-[--dust] mt-1">Track your hydration</p>
        </div>
      </div>

      <Card className="border-[--sage] shadow-md" style={{ backgroundColor: 'rgba(124, 138, 122, 0.08)' }}>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[--dust]">Today's total</p>
            <p className="text-3xl font-medium text-[--sage]">
              {todayData.water_total} oz
            </p>
          </div>
          <Droplets className="h-12 w-12 text-[--sage] opacity-60" strokeWidth={1.5} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick log</CardTitle>
          <CardDescription>Tap a common amount</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => handleQuickLog(8)}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-2xl font-medium">8</span>
              <span className="text-xs text-[--dust]">oz</span>
            </Button>
            <Button
              onClick={() => handleQuickLog(12)}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-2xl font-medium">12</span>
              <span className="text-xs text-[--dust]">oz</span>
            </Button>
            <Button
              onClick={() => handleQuickLog(16)}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-2xl font-medium">16</span>
              <span className="text-xs text-[--dust]">oz</span>
            </Button>
            <Button
              onClick={() => handleQuickLog(20)}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-2xl font-medium">20</span>
              <span className="text-xs text-[--dust]">oz</span>
            </Button>
            <Button
              onClick={() => handleQuickLog(24)}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-2xl font-medium">24</span>
              <span className="text-xs text-[--dust]">oz</span>
            </Button>
            <Button
              onClick={() => handleQuickLog(32)}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-2xl font-medium">32</span>
              <span className="text-xs text-[--dust]">oz</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom amount</CardTitle>
          <CardDescription>Enter any amount in ounces</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCustomLog} className="flex gap-3">
            <Input
              type="number"
              placeholder="Enter oz"
              value={customOz}
              onChange={(e) => setCustomOz(e.target.value)}
              min="1"
              className="flex-1"
            />
            <Button type="submit" disabled={!customOz || parseInt(customOz) <= 0}>
              Log
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};