'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2, Save, Trash2, ImageIcon } from 'lucide-react';
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
import { toast } from 'sonner';
import RichTextEditor from '@/components/rich-text-editor';

export default function EditCampaignPage({ params }) {
  const router = useRouter();
  const { id } = params; // Next.js 14
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    category: '',
    targetAmount: '',
    daysToRun: '30',
    optionsStart: '', 
    image: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    isUrgent: false,
    isVerified: false,
    isBerbagipath: false,
    status: 'pending',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignResponse, categoriesResponse] = await Promise.all([
            fetch(`/api/campaigns/${id}`),
            fetch('/api/categories')
        ]);
        
        const campaignData = await campaignResponse.json();
        const categoriesData = await categoriesResponse.json();

        // Set categories
        if (categoriesData.success) {
            setCategoriesList(categoriesData.data);
        }

        if (campaignData.success) {
          const c = campaignData.data;
          
          // Calculate days left if not provided
          let daysLeft = c.daysLeft;
          if (daysLeft === undefined || daysLeft === null) {
            if (c.end_date) {
               const end = new Date(c.end_date);
               const now = new Date();
               // Diff in days
               daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            }
          }

          setFormData({
            title: c.title || '',
            description: c.description || '',
            story: c.story || '',
            category: c.category_id ? c.category_id.toString() : '',
            targetAmount: c.targetAmount ? c.targetAmount.toString() : '', 
            daysToRun: daysLeft !== undefined ? daysLeft.toString() : '30',
            image: c.image || '',
            organizerName: c.organizerName || c.organizer?.name || c.organizer_name || '',
            organizerEmail: c.organizerEmail || c.email || '',
            organizerPhone: c.organizerPhone || c.phone || '',
            isUrgent: !!c.isUrgent,
            isVerified: !!c.isVerified,
            isBerbagipath: !!c.isBerbagipath,
            status: c.status || 'pending',
          });
        } else {
          toast.error('Gagal mengambil data campaign');
          router.push('/admin/campaigns');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Terjadi kesalahan');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Campaign berhasil diperbarui!');
        router.push('/admin/campaigns');
      } else {
        toast.error(data.error || 'Gagal memperbarui campaign');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
    }

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData
        });
        const data = await res.json();
        
        if (data.success) {
            setFormData(prev => ({ ...prev, image: data.url }));
            toast.success('Gambar berhasil diupload');
        } else {
            toast.error(data.error || 'Upload gagal');
        }
    } catch (err) {
        toast.error('Gagal mengupload file');
    } finally {
        setUploading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Edit Campaign</h1>
          <p className="text-muted-foreground">Perbarui informasi campaign</p>
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
              <Label htmlFor="image">Gambar Utama</Label>
               {formData.image ? (
                  <div className="relative w-full max-w-sm h-48 border rounded-lg overflow-hidden group">
                      <img src={formData.image} alt="Campaign Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button type="button" variant="destructive" size="sm" onClick={() => handleChange('image', '')}>
                              <Trash2 className="w-4 h-4 mr-2" /> Hapus
                          </Button>
                      </div>
                  </div>
              ) : (
                  <div className="flex items-center gap-2">
                      <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                      />
                      {uploading && <Loader2 className="animate-spin w-4 h-4 text-emerald-600" />}
                  </div>
              )}
            </div>

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
              <RichTextEditor
                value={formData.story}
                onChange={(value) => handleChange('story', value)}
                placeholder="Tulis cerita lengkap campaign..."
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
                    {categoriesList.map((cat) => (
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
                <Label htmlFor="status">Status Campaign</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>

        {/* Organizer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Penggalang Dana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">BerbagiPath sebagai Penggalang Dana</p>
                <p className="text-sm text-muted-foreground">
                  Aktifkan jika campaign ini dikelola langsung oleh BerbagiPath
                </p>
              </div>
              <Switch
                checked={formData.isBerbagipath}
                onCheckedChange={(checked) => {
                  handleChange('isBerbagipath', checked);
                  if (checked) {
                    handleChange('organizerName', 'BerbagiPath');
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizerName">Nama Penggalang</Label>
              <Input
                id="organizerName"
                placeholder="Nama individu atau organisasi"
                value={formData.organizerName}
                onChange={(e) => handleChange('organizerName', e.target.value)}
                disabled={formData.isBerbagipath}
                className={formData.isBerbagipath ? 'bg-gray-100 text-muted-foreground' : ''}
              />
              {formData.isBerbagipath && (
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  ✅ Campaign ini dikelola oleh BerbagiPath
                </p>
              )}
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
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
