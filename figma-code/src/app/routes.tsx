import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LogFoodScreen } from './screens/LogFoodScreen';
import { LogWaterScreen } from './screens/LogWaterScreen';
import { LogCravingScreen } from './screens/LogCravingScreen';
import { LogMovementScreen } from './screens/LogMovementScreen';
import { LogSleepScreen } from './screens/LogSleepScreen';
import { LogStressScreen } from './screens/LogStressScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { TrendsScreen } from './screens/TrendsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { NotFoundScreen } from './screens/NotFoundScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'log-food', element: <LogFoodScreen /> },
      { path: 'log-water', element: <LogWaterScreen /> },
      { path: 'log-craving', element: <LogCravingScreen /> },
      { path: 'log-movement', element: <LogMovementScreen /> },
      { path: 'log-sleep', element: <LogSleepScreen /> },
      { path: 'log-stress', element: <LogStressScreen /> },
      { path: 'history', element: <HistoryScreen /> },
      { path: 'trends', element: <TrendsScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
]);