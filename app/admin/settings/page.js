'use client';

import { useState } from 'react';
import { Save, Loader2, Globe, CreditCard, Bell, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // General
    siteName: 'BerbagiPath',
    siteDescription: 'Platform donasi online terpercaya untuk membantu sesama',
    contactEmail: 'admin@berbagipath.com',
    contactPhone: '08001234567',
    
    // Payment
    xenditEnabled: true,
    xenditSecretKey: 'xnd_development_***',
    xenditCallbackToken: '***',
    minDonation: '10000',
    maxDonation: '100000000',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: '60',
    
    // Appearance
    primaryColor: 'emerald',
    darkMode: false,
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    alert('Pengaturan berhasil disimpan!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Kelola pengaturan aplikasi</p>
        </div>
        <Button
          className="bg-emerald-500 hover:bg-emerald-600"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4 hidden sm:inline" />
            Umum
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="w-4 h-4 hidden sm:inline" />
            Pembayaran
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4 hidden sm:inline" />
            Notifikasi
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4 hidden sm:inline" />
            Keamanan
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4 hidden sm:inline" />
            Tampilan
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Umum</CardTitle>
              <CardDescription>Konfigurasi dasar aplikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Situs</Label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => handleChange('siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Kontak</Label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Situs</Label>
                <Textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleChange('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor Telepon</Label>
                <Input
                  value={settings.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Pembayaran</CardTitle>
              <CardDescription>Konfigurasi payment gateway Xendit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Xendit Payment Gateway</p>
                  <p className="text-sm text-muted-foreground">Aktifkan integrasi Xendit</p>
                </div>
                <Switch
                  checked={settings.xenditEnabled}
                  onCheckedChange={(checked) => handleChange('xenditEnabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Xendit Secret Key</Label>
                <Input
                  type="password"
                  value={settings.xenditSecretKey}
                  onChange={(e) => handleChange('xenditSecretKey', e.target.value)}
                  placeholder="xnd_development_..."
                />
                <p className="text-xs text-muted-foreground">
                  Dapatkan dari dashboard.xendit.co
                </p>
              </div>

              <div className="space-y-2">
                <Label>Xendit Callback Token</Label>
                <Input
                  type="password"
                  value={settings.xenditCallbackToken}
                  onChange={(e) => handleChange('xenditCallbackToken', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimal Donasi (Rp)</Label>
                  <Input
                    type="number"
                    value={settings.minDonation}
                    onChange={(e) => handleChange('minDonation', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maksimal Donasi (Rp)</Label>
                  <Input
                    type="number"
                    value={settings.maxDonation}
                    onChange={(e) => handleChange('maxDonation', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>Atur channel notifikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Kirim notifikasi via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleChange('emailNotifications', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Kirim notifikasi via SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) =>
                    handleChange('smsNotifications', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Kirim push notification ke browser
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) =>
                    handleChange('pushNotifications', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Keamanan</CardTitle>
              <CardDescription>Konfigurasi keamanan aplikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Aktifkan 2FA untuk admin
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    handleChange('twoFactorAuth', checked)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Session Timeout (menit)</Label>
                <Select
                  value={settings.sessionTimeout}
                  onValueChange={(value) => handleChange('sessionTimeout', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 menit</SelectItem>
                    <SelectItem value="30">30 menit</SelectItem>
                    <SelectItem value="60">1 jam</SelectItem>
                    <SelectItem value="120">2 jam</SelectItem>
                    <SelectItem value="480">8 jam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tampilan</CardTitle>
              <CardDescription>Kustomisasi tampilan aplikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Warna Utama</Label>
                <Select
                  value={settings.primaryColor}
                  onValueChange={(value) => handleChange('primaryColor', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emerald">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-emerald-500" />
                        Emerald Green
                      </div>
                    </SelectItem>
                    <SelectItem value="blue">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500" />
                        Blue
                      </div>
                    </SelectItem>
                    <SelectItem value="purple">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-500" />
                        Purple
                      </div>
                    </SelectItem>
                    <SelectItem value="orange">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500" />
                        Orange
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Gunakan tema gelap untuk admin panel
                  </p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleChange('darkMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
