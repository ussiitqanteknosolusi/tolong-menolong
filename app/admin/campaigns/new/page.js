'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { categories } from '@/lib/mock-data';

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    category: '',
    targetAmount: '',
    daysToRun: '30',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    isUrgent: false,
    isVerified: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Campaign berhasil dibuat!');
        router.push('/admin/campaigns');
      } else {
        alert(data.error || 'Gagal membuat campaign');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Buat Campaign Baru</h1>
          <p className="text-muted-foreground">Isi form berikut untuk membuat campaign</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Campaign *</Label>
              <Input
                id="title"
                placeholder="Contoh: Bantu Anak Yatim Mendapat Pendidikan"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Singkat *</Label>
              <Textarea
                id="description"
                placeholder="Jelaskan secara singkat tentang campaign ini"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="story">Cerita Lengkap</Label>
              <Textarea
                id="story"
                placeholder="Tulis cerita lengkap campaign (bisa menggunakan format HTML)"
                rows={8}
                value={formData.story}
                onChange={(e) => handleChange('story', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Dana (Rp) *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="100000000"
                  value={formData.targetAmount}
                  onChange={(e) => handleChange('targetAmount', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daysToRun">Durasi Campaign (hari) *</Label>
              <Input
                id="daysToRun"
                type="number"
                placeholder="30"
                value={formData.daysToRun}
                onChange={(e) => handleChange('daysToRun', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Gambar Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop gambar di sini, atau klik untuk upload
              </p>
              <Button type="button" variant="outline" size="sm">
                Pilih File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Format: JPG, PNG. Maksimal 5MB. Rekomendasi: 1200x630px
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Organizer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Penggalang Dana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizerName">Nama Penggalang *</Label>
              <Input
                id="organizerName"
                placeholder="Nama individu atau organisasi"
                value={formData.organizerName}
                onChange={(e) => handleChange('organizerName', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizerEmail">Email</Label>
                <Input
                  id="organizerEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.organizerEmail}
                  onChange={(e) => handleChange('organizerEmail', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizerPhone">No. Telepon</Label>
                <Input
                  id="organizerPhone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.organizerPhone}
                  onChange={(e) => handleChange('organizerPhone', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tandai sebagai Mendesak</p>
                <p className="text-sm text-muted-foreground">
                  Campaign akan ditampilkan di section urgent
                </p>
              </div>
              <Switch
                checked={formData.isUrgent}
                onCheckedChange={(checked) => handleChange('isUrgent', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Verifikasi Campaign</p>
                <p className="text-sm text-muted-foreground">
                  Campaign akan mendapat badge terverifikasi
                </p>
              </div>
              <Switch
                checked={formData.isVerified}
                onCheckedChange={(checked) => handleChange('isVerified', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/campaigns">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600"
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
                Simpan Campaign
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
