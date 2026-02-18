import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { dailyRollupsApi } from '../services/supabase';
import { invokeEdgeFunction } from '../services/edgeFunctionClient';
import { generateDailySummary, DailySummary } from '../services/mockAI';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Utensils, 
  Droplets, 
  Heart, 
  Activity, 
  Moon, 
  Brain,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

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

interface CondensedInsight {
  pattern: string;
  experiment: string;
  supportive_line: string;
}

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { foodLogs, waterLogs, cravingLogs, movementLogs, sleepLogs, stressLogs } = useData();
  const [todayData, setTodayData] = useState<DailyRollup | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [attuneInsight, setAttuneInsight] = useState<CondensedInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // Fetch today's rollup from database - re-fetch when logs change
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // Don't fetch if user is not authenticated
    if (!user) return;

    const fetchTodayData = async () => {
      try {
        setDataLoading(true);
        const rollup = await dailyRollupsApi.getByDate();
        setTodayData(rollup);
      } catch (error) {
        console.error('Error fetching today rollup:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchTodayData();
  }, [user, authLoading, foodLogs, waterLogs, cravingLogs, movementLogs, sleepLogs, stressLogs]);

  // Generate AI summary when data is available
  useEffect(() => {
    if (!todayData) return;

    const fetchSummary = async () => {
      setSummaryLoading(true);
      const summary = await generateDailySummary({
        calories_min: todayData.calories_min_total,
        calories_max: todayData.calories_max_total,
        protein: todayData.protein_total,
        fiber: todayData.fiber_total,
        water: todayData.water_oz,
        movement_min: todayData.movement_minutes,
        cravings_count: todayData.cravings_count,
        sleep_quality_avg: todayData.sleep_quality_avg,
        stress_level_avg: todayData.stress_avg,
      });
      setDailySummary(summary);
      setSummaryLoading(false);
    };

    fetchSummary();
  }, [todayData]);

  // Fetch Attune Insight (14-day trends) with daily caching
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // Don't fetch if user is not authenticated
    if (!user) return;

    const fetchAttuneInsight = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `attune_insight_${user.id}_${today}`;
        
        // Check if we have cached insights for today
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          console.log('Using cached Attune Insight for today');
          setAttuneInsight(JSON.parse(cached));
          return;
        }

        // Fetch new insights
        setInsightLoading(true);
        console.log('Fetching new Attune Insight (14 days)');
        
        const { data, error } = await invokeEdgeFunction('generate_insights', {
          body: { days: 14 }
        });

        if (error) {
          console.error('Error calling generate_insights function:', error);
          return;
        }

        // Extract condensed insight (first pattern, experiment, supportive line)
        const condensed: CondensedInsight = {
          pattern: data.patterns?.[0] || 'Keep tracking to see patterns emerge.',
          experiment: data.experiment || 'Keep doing what feels right for you.',
          supportive_line: data.supportive_line || 'You\'re listening to yourself, and that matters.',
        };

        // Cache it for today
        localStorage.setItem(cacheKey, JSON.stringify(condensed));
        setAttuneInsight(condensed);

        // Clean up old cache entries (keep only today's)
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('attune_insight_') && !key.endsWith(today)) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('Error fetching Attune Insight:', error);
      } finally {
        setInsightLoading(false);
      }
    };

    fetchAttuneInsight();
  }, [user, authLoading]);

  const quickActions = [
    {
      icon: Utensils,
      label: 'Log Food',
      path: '/log-food',
      bgColor: 'rgba(200, 122, 90, 0.12)',
      iconColor: 'var(--clay)',
    },
    {
      icon: Droplets,
      label: 'Log Water',
      path: '/log-water',
      bgColor: 'rgba(124, 138, 122, 0.12)',
      iconColor: 'var(--sage)',
    },
    {
      icon: Heart,
      label: 'Log Craving',
      path: '/log-craving',
      bgColor: 'rgba(182, 94, 60, 0.12)',
      iconColor: 'var(--adobe)',
    },
    {
      icon: Activity,
      label: 'Log Movement',
      path: '/log-movement',
      bgColor: 'rgba(124, 138, 122, 0.12)',
      iconColor: 'var(--sage)',
    },
    {
      icon: Moon,
      label: 'Log Sleep',
      path: '/log-sleep',
      bgColor: 'rgba(184, 169, 153, 0.12)',
      iconColor: 'var(--dust)',
    },
    {
      icon: Brain,
      label: 'Log Stress',
      path: '/log-stress',
      bgColor: 'rgba(200, 122, 90, 0.12)',
      iconColor: 'var(--clay)',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[--basalt]">Today</h1>
        <p className="text-[--dust] mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.path}
            onClick={() => navigate(action.path)}
            variant="outline"
            className="h-auto py-6 flex flex-col gap-3 hover:shadow-md transition-all duration-200"
          >
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: action.bgColor }}
            >
              <action.icon className="h-6 w-6" style={{ color: action.iconColor }} strokeWidth={1.5} />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Attune Insight - Condensed */}
      {!insightLoading && attuneInsight && (
        <Card className="bg-gradient-to-br from-[rgba(124,138,122,0.06)] to-[rgba(200,122,90,0.06)] border-[--sage]">
          <CardContent className="pt-5 pb-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[--sage]" strokeWidth={2} />
              <p className="text-xs font-medium text-[--sage] uppercase tracking-wide">Attune Insight</p>
            </div>
            <p className="text-sm text-[--basalt] leading-relaxed">
              {attuneInsight.pattern}
            </p>
            <p className="text-sm text-[--basalt] leading-relaxed pt-2 border-t border-[--dust]">
              {attuneInsight.experiment}
            </p>
            <p className="text-xs text-[--clay] italic pt-2">
              {attuneInsight.supportive_line}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generate Insights Button */}
      <Card className="bg-gradient-to-br from-[rgba(124,138,122,0.08)] to-[rgba(200,122,90,0.08)] border-[--sage]">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-[--sage]" strokeWidth={2} />
                <p className="text-sm font-medium text-[--basalt]">Want personalized insights?</p>
              </div>
              <p className="text-xs text-[--dust]">
                Generate AI insights from your last 14 days of tracking
              </p>
            </div>
            <Button
              onClick={async () => {
                if (!user) return;
                
                try {
                  setInsightLoading(true);
                  console.log('Manually generating Attune Insight (14 days)');
                  
                  const { data, error } = await invokeEdgeFunction('generate_insights', {
                    body: { days: 14 }
                  });

                  if (error) {
                    console.error('Error calling generate_insights function:', error);
                    toast.error('Unable to generate insights. Please try again.');
                    return;
                  }

                  console.log('Generated insights:', data);
                  
                  // Extract the condensed insight
                  const condensed: CondensedInsight = {
                    pattern: data.patterns?.[0] || 'Keep tracking to discover patterns.',
                    experiment: data.experiment || 'Continue logging your wellness activities.',
                    supportive_line: data.supportive_line || 'You\'re doing great!',
                  };
                  
                  setAttuneInsight(condensed);
                  
                  // Cache the insights with today's date
                  const today = new Date().toISOString().split('T')[0];
                  const cacheKey = `attune_insight_${user.id}_${today}`;
                  localStorage.setItem(cacheKey, JSON.stringify(condensed));
                  
                  toast.success('Fresh insights generated!');
                } catch (error) {
                  console.error('Error generating insights:', error);
                  toast.error('Unable to generate insights. Please try again.');
                } finally {
                  setInsightLoading(false);
                }
              }}
              disabled={insightLoading}
              size="sm"
              className="ml-4"
            >
              {insightLoading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today Summary Cards */}
      {!dataLoading && !todayData ? (
        <Card className="bg-gradient-to-br from-[--bone] to-[--sand]">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-[--basalt] mb-2">
              Welcome to a fresh day! 🌅
            </p>
            <p className="text-[--dust]">
              Start by logging your first activity using the buttons above. Your daily summary will appear here as you track your wellness journey.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nutrition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-[--dust]">Estimated calories</p>
                <p className="text-2xl font-medium text-[--basalt]">
                  {todayData && todayData.calories_min_total > 0
                    ? `${todayData.calories_min_total}–${todayData.calories_max_total}`
                    : '—'}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xs text-[--dust]">Protein</p>
                  <p className="font-medium text-[--basalt]">{todayData?.protein_total || 0}g</p>
                </div>
                <div>
                  <p className="text-xs text-[--dust]">Carbs</p>
                  <p className="font-medium text-[--basalt]">{todayData?.carbs_total || 0}g</p>
                </div>
                <div>
                  <p className="text-xs text-[--dust]">Fat</p>
                  <p className="font-medium text-[--basalt]">{todayData?.fat_total || 0}g</p>
                </div>
                <div>
                  <p className="text-xs text-[--dust]">Fiber</p>
                  <p className="font-medium text-[--basalt]">{todayData?.fiber_total || 0}g</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hydration & Movement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-[--dust]">Water</p>
                <p className="text-2xl font-medium text-[--basalt]">
                  {todayData?.water_oz || 0} oz
                </p>
              </div>
              <div>
                <p className="text-sm text-[--dust]">Movement</p>
                <p className="text-2xl font-medium text-[--basalt]">
                  {todayData?.movement_minutes || 0} min
                </p>
                {todayData && todayData.burn_min > 0 && (
                  <p className="text-xs text-[--dust] mt-1">
                    Est. {todayData.burn_min}–{todayData.burn_max} cal burned
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cravings & Sleep</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-[--dust]">Cravings logged</p>
                <p className="text-2xl font-medium text-[--basalt]">
                  {todayData?.cravings_count || 0}
                </p>
                {todayData && todayData.cravings_intensity_avg > 0 && (
                  <p className="text-xs text-[--dust]">
                    Avg intensity: {todayData.cravings_intensity_avg.toFixed(1)}/5
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-[--dust]">Sleep quality</p>
                <p className="text-2xl font-medium text-[--basalt]">
                  {todayData && todayData.sleep_quality_avg > 0
                    ? `${todayData.sleep_quality_avg.toFixed(1)}/5`
                    : '—'}
                </p>
                {todayData && todayData.hours_slept_avg > 0 && (
                  <p className="text-xs text-[--dust]">
                    {todayData.hours_slept_avg.toFixed(1)} hours
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stress</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm text-[--dust]">Stress level</p>
                <p className="text-2xl font-medium text-[--basalt]">
                  {todayData && todayData.stress_avg > 0
                    ? `${todayData.stress_avg.toFixed(1)}/5`
                    : '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Snapshot */}
      {summaryLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[--dust]">Generating your daily insights...</p>
          </CardContent>
        </Card>
      ) : (
        dailySummary && (
          <Card className="bg-gradient-to-br from-[--bone] to-[--sand] border-[--clay] shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[--clay]" strokeWidth={1.5} />
                Daily Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[--basalt] leading-relaxed">{dailySummary.summary_text}</p>
              {dailySummary.insights.length > 0 && (
                <div className="space-y-2">
                  {dailySummary.insights.map((insight, idx) => (
                    <p key={idx} className="text-sm text-[--basalt] opacity-90">
                      • {insight}
                    </p>
                  ))}
                </div>
              )}
              <div className="pt-3 border-t border-[--dust]">
                <p className="font-medium text-[--basalt]">
                  {dailySummary.suggestion}
                </p>
              </div>
              <p className="text-sm text-[--clay] italic">
                {dailySummary.supportive_line}
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};