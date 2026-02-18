import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const HistoryScreen: React.FC = () => {
  const {
    foodLogs,
    waterLogs,
    cravingLogs,
    movementLogs,
    sleepLogs,
    stressLogs,
    deleteFoodLog,
    deleteWaterLog,
    deleteCravingLog,
    deleteMovementLog,
    deleteSleepLog,
    deleteStressLog,
  } = useData();

  const [activeTab, setActiveTab] = useState('food');

  const groupByDate = <T extends { created_at: string }>(logs: T[]) => {
    const grouped: Record<string, T[]> = {};
    logs
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .forEach((log) => {
        const date = format(new Date(log.created_at), 'MMMM d, yyyy');
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(log);
      });
    return grouped;
  };

  const groupByDateCreatedAt = <T extends { created_at: string }>(logs: T[]) => {
    const grouped: Record<string, T[]> = {};
    logs
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .forEach((log) => {
        const date = format(new Date(log.created_at), 'MMMM d, yyyy');
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(log);
      });
    return grouped;
  };

  const foodByDate = groupByDate(foodLogs);
  const waterByDate = groupByDate(waterLogs);
  const cravingByDate = groupByDate(cravingLogs);
  const movementByDate = groupByDate(movementLogs);
  const sleepByDate = groupByDate(sleepLogs);
  const stressByDate = groupByDate(stressLogs);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[--basalt]">History</h1>
        <p className="text-[--dust] mt-1">View and manage your logs</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="food">Food</TabsTrigger>
          <TabsTrigger value="water">Water</TabsTrigger>
          <TabsTrigger value="cravings">Cravings</TabsTrigger>
          <TabsTrigger value="movement">Movement</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
          <TabsTrigger value="stress">Stress</TabsTrigger>
        </TabsList>

        <TabsContent value="food" className="space-y-4">
          {Object.keys(foodByDate).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-[--dust]">
                No food logs yet. Start by logging your first meal!
              </CardContent>
            </Card>
          ) : (
            Object.entries(foodByDate).map(([date, logs]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-[--dust] mb-2">{date}</h3>
                <div className="space-y-2">
                  {logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {log.meal_tag && (
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                  {log.meal_tag}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {format(new Date(log.created_at), 'h:mm a')}
                              </span>
                            </div>
                            <p className="text-gray-900 mb-2">{log.text}</p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="text-gray-600">
                                {log.calories_min}–{log.calories_max} cal
                              </span>
                              <span className="text-gray-600">
                                P: {log.protein_g}g
                              </span>
                              <span className="text-gray-600">
                                C: {log.carbs_g}g
                              </span>
                              <span className="text-gray-600">
                                F: {log.fat_g}g
                              </span>
                              <span className="text-gray-600">
                                Fiber: {log.fiber_g}g
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFoodLog(log.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="water" className="space-y-4">
          {Object.keys(waterByDate).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No water logs yet. Start tracking your hydration!
              </CardContent>
            </Card>
          ) : (
            Object.entries(waterByDate).map(([date, logs]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{date}</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-lg font-semibold">
                        Total: {logs.reduce((sum, log) => sum + log.ounces, 0)} oz
                      </p>
                    </div>
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-600">
                            {format(new Date(log.created_at), 'h:mm a')} – {log.ounces} oz
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWaterLog(log.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="cravings" className="space-y-4">
          {Object.keys(cravingByDate).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No craving logs yet.
              </CardContent>
            </Card>
          ) : (
            Object.entries(cravingByDate).map(([date, logs]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{date}</h3>
                <div className="space-y-2">
                  {logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-500">
                                {format(new Date(log.created_at), 'h:mm a')}
                              </span>
                              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                                Intensity: {log.intensity}/5
                              </span>
                              {log.craving_category && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {log.craving_category}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-900">{log.craving_text}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCravingLog(log.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="movement" className="space-y-4">
          {Object.keys(movementByDate).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No movement logs yet. All movement counts!
              </CardContent>
            </Card>
          ) : (
            Object.entries(movementByDate).map(([date, logs]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{date}</h3>
                <div className="space-y-2">
                  {logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded capitalize">
                                {log.activity_type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(log.created_at), 'h:mm a')}
                              </span>
                              {log.intensity && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                                  {log.intensity}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>{log.duration_min} minutes</span>
                              <span>
                                ~{log.estimated_burn_min}–{log.estimated_burn_max} cal
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMovementLog(log.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="sleep" className="space-y-4">
          {Object.keys(sleepByDate).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No sleep logs yet.
              </CardContent>
            </Card>
          ) : (
            Object.entries(sleepByDate).map(([date, logs]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{date}</h3>
                <div className="space-y-2">
                  {logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                Quality: {log.sleep_quality}/5
                              </span>
                              {log.hours_slept && (
                                <span className="text-xs text-gray-500">
                                  {log.hours_slept} hours
                                </span>
                              )}
                            </div>
                            {log.notes && (
                              <p className="text-sm text-gray-600">{log.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSleepLog(log.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="stress" className="space-y-4">
          {Object.keys(stressByDate).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No stress logs yet.
              </CardContent>
            </Card>
          ) : (
            Object.entries(stressByDate).map(([date, logs]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{date}</h3>
                <div className="space-y-2">
                  {logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                Level: {log.stress_level}/5
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(log.created_at), 'h:mm a')}
                              </span>
                            </div>
                            {log.notes && (
                              <p className="text-sm text-gray-600">{log.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStressLog(log.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};