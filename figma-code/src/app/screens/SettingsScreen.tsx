import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { LogOut, Sparkles } from 'lucide-react';
import { populateDemoData, hasDemoData } from '../utils/demoData';
import { toast } from 'sonner';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { settings, updateSettings, refreshData } = useData();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLoadDemoData = () => {
    if (!user) return;
    
    if (hasDemoData(user.id)) {
      toast.error('Demo data already exists. Sign out and create a new account to try again.');
      return;
    }
    
    populateDemoData(user.id);
    refreshData();
    toast.success('Demo data loaded! Check out your trends and insights.');
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[--basalt]" style={{ fontFamily: 'var(--font-canela)' }}>Settings</h1>
        <p className="text-[--dust] mt-1">Customize your experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[--dust]">Email</p>
              <p className="text-[--basalt]">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dietary Preferences</CardTitle>
          <CardDescription>Help us personalize suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-[--basalt]">Vegetarian</p>
              <p className="text-sm text-[--dust]">
                Prioritize plant-based suggestions
              </p>
            </div>
            <Switch
              checked={settings.vegetarian}
              onCheckedChange={(checked) =>
                updateSettings({ vegetarian: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tone Preferences</CardTitle>
          <CardDescription>
            How we communicate with you (always supportive)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-[--basalt]">
                Avoid weight-focused language
              </p>
              <p className="text-sm text-[--dust]">
                Keep all insights body-neutral and wellness-focused
              </p>
            </div>
            <Switch
              checked={settings.avoidWeightFocused}
              onCheckedChange={(checked) =>
                updateSettings({ avoidWeightFocused: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Units</CardTitle>
          <CardDescription>Measurement preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-[--basalt]">Liquid measurement</p>
              <p className="text-sm text-[--dust]">
                Currently using: {settings.units}
              </p>
            </div>
            <Switch
              checked={settings.units === 'ml'}
              onCheckedChange={(checked) =>
                updateSettings({ units: checked ? 'ml' : 'oz' })
              }
            />
          </div>
          <p className="text-xs text-[--dust] mt-2">
            Toggle for oz (ounces) or ml (milliliters)
          </p>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: 'rgba(200, 122, 90, 0.08)', borderColor: 'var(--clay)' }}>
        <CardContent className="pt-6">
          <h4 className="font-medium text-[--basalt] mb-2">About Attune</h4>
          <p className="text-sm text-[--basalt] mb-2">
            Attune is a supportive, body-neutral wellness tracking tool designed
            to help you notice patterns without judgment.
          </p>
          <p className="text-sm text-[--basalt]">
            Your data is securely stored and only accessible to you.
          </p>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: 'rgba(200, 122, 90, 0.08)', borderColor: 'var(--clay)' }}>
        <CardContent className="pt-6">
          <h4 className="font-medium text-[--basalt] mb-2">Load Demo Data</h4>
          <p className="text-sm text-[--basalt] mb-2">
            Load some sample data to see how Attune works.
          </p>
          <Button
            variant="outline"
            onClick={handleLoadDemoData}
            className="w-full sm:w-auto"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Load Demo Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};