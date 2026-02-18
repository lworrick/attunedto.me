import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dailyRollupsApi } from '../services/supabase';
import { invokeEdgeFunction } from '../services/edgeFunctionClient';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface DailyRollup {
  day: string;
  user_id: string;
  water_oz: number;
  calories_min_total: number;
  calories_max_total: number;
  protein_total: number;
  carbs_total: number;
  fat_total: number;
  fiber_total: number;
  movement_minutes: number;
  burn_min: number;
  burn_max: number;
  cravings_count: number;
  cravings_intensity_avg: number;
  hours_slept_avg: number;
  sleep_quality_avg: number;
  stress_avg: number;
}

interface TrendInsights {
  patterns: string[];
  influences: string[];
  experiment: string;
  supportive_line: string;
}

export const TrendsScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [days, setDays] = useState(30);
  const [rollups, setRollups] = useState<DailyRollup[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState<TrendInsights | null>(null);

  // Fetch rollups from database - ONLY after auth is established
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // Don't fetch if user is not authenticated
    if (!user) return;

    const fetchRollups = async () => {
      try {
        setDataLoading(true);
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - days + 1);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = today.toISOString().split('T')[0];
        
        const data = await dailyRollupsApi.getRange(startDateStr, endDateStr);
        setRollups(data);
      } catch (error) {
        console.error('Error fetching rollups:', error);
        setRollups([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchRollups();
  }, [user, authLoading, days]);

  // Generate insights when rollups are available
  useEffect(() => {
    if (rollups.length === 0) {
      setInsights(null);
      return;
    }

    // Wait for auth to finish loading
    if (authLoading) return;
    
    // Don't fetch if user is not authenticated
    if (!user) return;

    const fetchInsights = async () => {
      try {
        setInsightsLoading(true);
        
        // Call the Supabase Edge Function with authenticated session
        const { data, error } = await invokeEdgeFunction('generate_insights', {
          body: { days }
        });

        if (error) {
          console.error('Error calling generate_insights function:', error);
          throw error;
        }

        console.log('Insights from edge function:', data);
        setInsights(data);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setInsights(null);
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchInsights();
  }, [rollups, days, user, authLoading]);

  const chartData = rollups.map((r) => ({
    date: format(new Date(r.day), 'MMM d'),
    calories: Math.round((r.calories_min_total + r.calories_max_total) / 2),
    protein: r.protein_total,
    fiber: r.fiber_total,
    water: r.water_oz,
    movement: r.movement_minutes,
    cravings: r.cravings_count,
    sleep: r.sleep_quality_avg || 0,
    stress: r.stress_avg || 0,
  }));

  // Show loading state during auth initialization
  if (authLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl text-[--basalt]">Trends</h1>
          <p className="text-[--dust] mt-1">See patterns over time</p>
        </div>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center space-y-3">
            <TrendingUp className="h-10 w-10 text-[--sage] mx-auto animate-pulse" />
            <p className="text-[--dust]">Loading your trends...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[--basalt]">Trends</h1>
        <p className="text-[--dust] mt-1">See patterns over time</p>
      </div>

      <div className="flex gap-3">
        <Button
          variant={days === 7 ? 'primary' : 'outline'}
          onClick={() => setDays(7)}
        >
          7 Days
        </Button>
        <Button
          variant={days === 30 ? 'primary' : 'outline'}
          onClick={() => setDays(30)}
        >
          30 Days
        </Button>
        <Button
          variant={days === 90 ? 'primary' : 'outline'}
          onClick={() => setDays(90)}
        >
          90 Days
        </Button>
      </div>

      {rollups.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Not enough data yet. Keep logging to see your trends!
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Calories</CardTitle>
              <CardDescription>Daily calorie range (mid-point)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Protein & Fiber</CardTitle>
                <CardDescription>Grams per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="protein" fill="#10b981" name="Protein (g)" />
                    <Bar dataKey="fiber" fill="#f59e0b" name="Fiber (g)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Water Intake</CardTitle>
                <CardDescription>Ounces per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="water" fill="#3b82f6" name="Water (oz)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Movement Minutes</CardTitle>
              <CardDescription>Minutes per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="movement" fill="#8b5cf6" name="Minutes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cravings</CardTitle>
                <CardDescription>Frequency per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cravings" fill="#ec4899" name="Cravings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep & Stress</CardTitle>
                <CardDescription>Quality (1-5 scale)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      stroke="#6366f1"
                      strokeWidth={2}
                      name="Sleep"
                    />
                    <Line
                      type="monotone"
                      dataKey="stress"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Stress"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {insightsLoading ? (
            <Card>
              <CardHeader>
                <CardTitle>Trend Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-[--dust]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing your patterns...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            insights && (
              <Card className="bg-gradient-to-br from-[rgba(200,122,90,0.08)] to-[rgba(124,138,122,0.08)] border-[--dust]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[--clay]" />
                    Trend Insights
                  </CardTitle>
                  <CardDescription>
                    Based on your {days}-day tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-[--basalt] mb-3">
                      Patterns I'm noticing
                    </h4>
                    <div className="space-y-2">
                      {insights.patterns.map((pattern, idx) => (
                        <p key={idx} className="text-sm text-[--basalt]">
                          • {pattern}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[--basalt] mb-3">
                      What might be influencing this
                    </h4>
                    <div className="space-y-2">
                      {insights.influences.map((influence, idx) => (
                        <p key={idx} className="text-sm text-[--basalt]">
                          • {influence}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[--dust]">
                    <h4 className="font-medium text-[--basalt] mb-2">
                      One small experiment to try
                    </h4>
                    <p className="text-[--basalt]">{insights.experiment}</p>
                  </div>

                  <p className="text-sm text-[--clay] italic pt-3 border-t border-[--dust]">
                    {insights.supportive_line}
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </>
      )}
    </div>
  );
};