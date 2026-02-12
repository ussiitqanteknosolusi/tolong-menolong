'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calendar, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/rich-text-editor';

export default function NewCampaignPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isVerifying, setIsVerifying] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    category: '',
    targetAmount: '',
    daysToRun: '30',
    image: '', 
  });

  // Initial Check & Fetch
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
        router.push('/login?redirect=/campaigns/new');
        return;
    }

    const checkPermissionAndFetchInfo = async () => {
        setIsVerifying(true);
        try {
            // Check fresh user data for permission
            const userRes = await fetch(`/api/users/${user.id}`);
            const userData = await userRes.json();
            
            if (userData.success) {
                const u = userData.data;
                const canCreate = u.role === 'organizer' || u.role === 'admin' || u.isVerified;
                
                if (!canCreate) {
                    toast.error('Akun anda belum terverifikasi. Silakan lengkapi data verifikasi anda.');
                    router.push('/verify'); 
                    return;
                }
            } else {
                toast.error('Gagal memverifikasi status akun');
                router.push('/');
                return;
            }

            // Fetch categories if allowed
            const catRes = await fetch('/api/categories');
            const catData = await catRes.json();
            if (catData.success) {
                setCategories(catData.data);
            }
            
            setIsVerifying(false);
        } catch (e) {
            console.error(e);
            toast.error('Terjadi kesalahan koneksi');
        }
    };

    checkPermissionAndFetchInfo();
  }, [user, authLoading, router]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.image) {
        toast.error('Harap upload gambar utama campaign');
        setLoading(false);
        return;
    }

    try {
        const payload = {
            ...formData,
            organizerId: user.id
        };

        const response = await fetch('/api/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            toast.success('Campaign berhasil dibuat! Menunggu persetujuan admin.');
            router.push('/dashboard'); 
        } else {
            toast.error(result.error || 'Gagal membuat campaign');
        }
    } catch (error) {
        toast.error('Terjadi kesalahan saat mengirim data');
    } finally {
        setLoading(false);
    }
  };

  if (authLoading || isVerifying) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
      );
  }

  if (!user) return null;

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mulai Galang Dana</h1>
        <p className="text-muted-foreground">Isi formulir di bawah ini untuk memulai campaign kebaikan Anda.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card>
            <CardHeader>
                <CardTitle>Informasi Utama</CardTitle>
                <CardDescription>Berikan judul dan deskripsi yang menarik.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Judul Campaign *</Label>
                    <Input 
                        id="title" 
                        placeholder="Contoh: Bantu Pembangunan Masjid Al-Huda" 
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Kategori *</Label>
                     <Select 
                        value={formData.category} 
                        onValueChange={(val) => handleChange('category', val)}
                     >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.slug || cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi Singkat *</Label>
                    <Textarea 
                        id="description" 
                        placeholder="Ringkasan singkat tentang tujuan penggalangan dana ini"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)} 
                        required
                    />
                </div>
                
                 <div className="space-y-2">
                    <Label htmlFor="image">Gambar Utama *</Label>
                    {formData.image ? (
                        <div className="relative w-full max-w-md h-56 border rounded-lg overflow-hidden group mb-2">
                            <img src={formData.image} alt="Campaign Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button type="button" variant="destructive" size="sm" onClick={() => handleChange('image', '')}>
                                    Hapus & Ganti
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    required={!formData.image}
                                />
                                {uploading && <Loader2 className="animate-spin w-4 h-4 text-emerald-600" />}
                            </div>
                            <p className="text-xs text-muted-foreground">Format JPG/PNG, maks 5MB. Pastikan gambar jelas dan menarik.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* Target Info */}
        <Card>
            <CardHeader>
                <CardTitle>Target & Durasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="targetAmount">Target Dana (Rp) *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rp</span>
                            <Input 
                                id="targetAmount" 
                                type="number" 
                                className="pl-8"
                                placeholder="10000000"
                                value={formData.targetAmount}
                                onChange={(e) => handleChange('targetAmount', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="daysToRun">Durasi (Hari) *</Label>
                         <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                id="daysToRun" 
                                type="number" 
                                className="pl-10"
                                value={formData.daysToRun}
                                onChange={(e) => handleChange('daysToRun', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Story */}
        <Card>
            <CardHeader>
                 <CardTitle>Cerita Lengkap</CardTitle>
                 <CardDescription>Ceritakan detail, latar belakang, dan penggunaan dana.</CardDescription>
            </CardHeader>
            <CardContent>
                <RichTextEditor 
                    value={formData.story}
                    onChange={(val) => handleChange('story', val)}
                    placeholder="Tulis cerita lengkap di sini..."
                />
            </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={loading}
            >
                Batal
            </Button>
            <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px]"
                disabled={loading}
            >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</> : 'Buat Campaign'}
            </Button>
        </div>
      </form>
    </div>
  );
}
