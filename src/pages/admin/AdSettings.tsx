import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdSettings as AdSettingsType } from '@/types/ads';

const AdSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('ad_settings')
        .update({
          ads_enabled: settings.ads_enabled,
          adsense_client_id: settings.adsense_client_id,
          banner_ad_enabled: settings.banner_ad_enabled,
          sidebar_ad_enabled: settings.sidebar_ad_enabled,
          interstitial_ad_enabled: settings.interstitial_ad_enabled,
          ad_frequency_games: settings.ad_frequency_games,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Ad settings updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!settings) {
    return <div className="flex items-center justify-center min-h-screen">No settings found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Advertisement Settings</CardTitle>
            <CardDescription>
              Configure how ads are displayed across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ads-enabled">Enable Ads</Label>
                <p className="text-sm text-muted-foreground">
                  Master switch for all advertisements
                </p>
              </div>
              <Switch
                id="ads-enabled"
                checked={settings.ads_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, ads_enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adsense-id">AdSense Client ID</Label>
              <Input
                id="adsense-id"
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                value={settings.adsense_client_id || ''}
                onChange={(e) =>
                  setSettings({ ...settings, adsense_client_id: e.target.value })
                }
              />
              <p className="text-sm text-muted-foreground">
                Your Google AdSense publisher ID
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Ad Types</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="banner-ads">Banner Ads</Label>
                    <p className="text-sm text-muted-foreground">
                      Horizontal ads at top/bottom of pages
                    </p>
                  </div>
                  <Switch
                    id="banner-ads"
                    checked={settings.banner_ad_enabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, banner_ad_enabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sidebar-ads">Sidebar Ads</Label>
                    <p className="text-sm text-muted-foreground">
                      Vertical ads in sidebar (desktop only)
                    </p>
                  </div>
                  <Switch
                    id="sidebar-ads"
                    checked={settings.sidebar_ad_enabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, sidebar_ad_enabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="interstitial-ads">Interstitial Ads</Label>
                    <p className="text-sm text-muted-foreground">
                      Full-screen ads between games
                    </p>
                  </div>
                  <Switch
                    id="interstitial-ads"
                    checked={settings.interstitial_ad_enabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, interstitial_ad_enabled: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-frequency">Interstitial Frequency</Label>
              <Input
                id="ad-frequency"
                type="number"
                min="1"
                max="10"
                value={settings.ad_frequency_games}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ad_frequency_games: parseInt(e.target.value) || 3,
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Show interstitial ad every X games completed
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdSettings;
