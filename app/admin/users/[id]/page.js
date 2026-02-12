'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, User as UserIcon, Mail, Phone, Calendar, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  organizer: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-700',
};

export default function EditUserPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isVerified: false,
    role: 'user' // read-only purpose mostly as role logic is complex
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${id}`);
        const data = await response.json();

        if (data.success) {
          const u = data.data;
          setUser(u);
          setFormData({
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            isVerified: u.isVerified,
            role: u.role
          });
        } else {
          toast.error('Gagal mengambil data user');
          router.push('/admin/users');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Terjadi kesalahan');
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Also update verification status specifically if needed, but the general PUT handles it if API is set up so
        // Our API setup in previous steps handles general updates including name, email, phone.
        // It does NOT explicitly handle isVerified in the general block, only in /verify endpoint or if we add it. 
        // Let's make sure we call the verify endpoint if verification status changed or ensure the general endpoint handles it.
        // Based on my previous code: general endpoint updates name/email/phone. /verify updates isVerified.
        // I should probably call both or update the API. For SAFETY, I will call /verify separately if changed.
        
        if (user.isVerified !== formData.isVerified) {
             await fetch(`/api/users/${id}/verify`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified: formData.isVerified }),
             });
        }

        toast.success('User berhasil diperbarui!');
        router.push('/admin/users');
      } else {
        toast.error(data.error || 'Gagal memperbarui user');
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
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">{formData.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold mb-2">
                    {formData.name.charAt(0)}
                </div>
                <p className="font-medium text-center">{formData.name}</p>
                <Badge className={`mt-2 ${roleColors[formData.role]}`}>{formData.role}</Badge>
            </div>
            
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <UserIcon className="w-4 h-4" />
                    <span>ID: {user?.id?.substring(0, 8)}...</span>
                </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Bergabung: {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
            <Card>
            <CardHeader>
                <CardTitle>Informasi User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="name"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                    />
                </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                         className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                    />
                </div>
                </div>

                <div className="space-y-2">
                 <Label htmlFor="phone">No. Telepon</Label>
                  <div className="relative">
                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <Input
                         id="phone"
                         type="tel"
                          className="pl-10"
                         value={formData.phone}
                         onChange={(e) => handleChange('phone', e.target.value)}
                     />
                 </div>
                </div>

                <div className="space-y-2">
                 <Label htmlFor="password">Password Baru (Opsional)</Label>
                  <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <Input
                         id="password"
                         type="password"
                          className="pl-10"
                         value={formData.password || ''}
                         onChange={(e) => handleChange('password', e.target.value)}
                         placeholder="Biarkan kosong jika tidak ingin mengubah"
                     />
                 </div>
                </div>
            </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <CardTitle>Status & Keamanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Status Verifikasi</p>
                            <p className="text-sm text-muted-foreground">
                            User terverifikasi memiliki akses lebih
                            </p>
                        </div>
                        <Switch
                            checked={formData.isVerified}
                            onCheckedChange={(checked) => handleChange('isVerified', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
            <Link href="/admin/users">
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
    </div>
  );
}
