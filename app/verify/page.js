'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Clock, Image as ImageIcon, CreditCard, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // loading, empty, pending, approved, rejected
  const [requestData, setRequestData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState({ ktpUrl: false, selfieUrl: false });
  
  const [formData, setFormData] = useState({
    ktpUrl: '',
    selfieUrl: '',
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/login?redirect=/verify');
        return;
    }

    const checkStatus = async () => {
        try {
            const res = await fetch(`/api/verification?userId=${user.id}`);
            const data = await res.json();
            
            if (data.success && data.data) {
                setRequestData(data.data);
                setStatus(data.data.status); // approved, pending, rejected
                // if rejected, prefill form? optional
                if (data.data.status === 'rejected') {
                     setFormData({
                         ktpUrl: data.data.ktpUrl || '',
                         selfieUrl: data.data.selfieUrl || '',
                         bankName: data.data.bankName || '',
                         accountNumber: data.data.accountNumber || '',
                         accountHolder: data.data.accountHolder || ''
                     });
                }
            } else {
                setStatus('empty');
            }
        } catch (e) {
            console.error(e);
            setStatus('empty');
        }
    };
    checkStatus();
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
    }

    setUploading(prev => ({ ...prev, [field]: true }));
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData
        });
        const data = await res.json();
        
        if (data.success) {
            setFormData(prev => ({ ...prev, [field]: data.url }));
            toast.success('Upload berhasil');
        } else {
            toast.error(data.error || 'Upload gagal');
        }
    } catch (err) {
        toast.error('Gagal mengupload file');
    } finally {
        setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.ktpUrl || !formData.selfieUrl) {
        toast.error('Harap upload foto KTP dan Selfie');
        setSubmitting(false);
        return;
    }

    try {
        const res = await fetch('/api/verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                ...formData
            })
        });
        const data = await res.json();

        if (data.success) {
            toast.success('Permintaan verifikasi dikirim!');
            setStatus('pending');
            setRequestData({ ...formData, status: 'pending', createdAt: new Date() });
        } else {
            toast.error(data.error || 'Gagal mengirim permintaan');
        }
    } catch (e) {
        toast.error('Terjadi kesalahan koneksi');
    } finally {
        setSubmitting(false);
    }
  };

  if (authLoading || status === 'loading') {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  // Already Verified View
  if (status === 'approved' || user?.isVerified) {
      return (
          <div className="container max-w-2xl py-20">
              <Card className="border-emerald-500 bg-emerald-50">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                      <CheckCircle2 className="w-16 h-16 text-emerald-600 mb-4" />
                      <h2 className="text-2xl font-bold text-emerald-800 mb-2">Akun Terverifikasi</h2>
                      <p className="text-emerald-700 mb-6">
                          Selamat! Identitas Anda telah diverifikasi. Anda sekarang dapat membuat campaign penggalangan dana.
                      </p>
                      <Button onClick={() => router.push('/campaigns/new')} className="bg-emerald-600 hover:bg-emerald-700">
                          Buat Campaign Sekarang
                      </Button>
                  </CardContent>
              </Card>
          </div>
      );
  }

  // Pending View
  if (status === 'pending') {
       return (
          <div className="container max-w-2xl py-20">
              <Card className="border-blue-500 bg-blue-50">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                      <Clock className="w-16 h-16 text-blue-600 mb-4" />
                      <h2 className="text-2xl font-bold text-blue-800 mb-2">Verifikasi Sedang Diproses</h2>
                      <p className="text-blue-700 mb-6">
                          Permintaan verifikasi Anda sedang ditinjau oleh tim kami. Harap tunggu 1x24 jam.
                      </p>
                      <Button variant="outline" onClick={() => router.push('/dashboard')}>Kembali ke Dashboard</Button>
                  </CardContent>
              </Card>
          </div>
      );
  }

  // Form View (Empty or Rejected)
  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">Verifikasi Identitas</h1>

      {status === 'rejected' && (
          <Alert variant="destructive" className="mb-6">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Verifikasi Ditolak</AlertTitle>
              <AlertDescription>
                  Alasan: {requestData?.rejectionReason || 'Data tidak valid'}. Silakan perbaiki data dan ajukan ulang.
              </AlertDescription>
          </Alert>
      )}

      <Card>
          <CardHeader>
              <CardTitle>Data Diri & Rekening</CardTitle>
              <CardDescription>Lengkapi data berikut untuk menjadi Organizer.</CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Bank Info */}
                  <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                          <CreditCard className="w-4 h-4" /> Informasi Rekening Bank
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="bankName">Nama Bank</Label>
                              <Input id="bankName" placeholder="Contoh: BCA, Mandiri" value={formData.bankName} onChange={handleChange} required />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="accountNumber">Nomor Rekening</Label>
                              <Input id="accountNumber" type="number" placeholder="1234567890" value={formData.accountNumber} onChange={handleChange} required />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="accountHolder">Nama Pemilik Rekening</Label>
                          <Input id="accountHolder" placeholder="Sesuai buku tabungan" value={formData.accountHolder} onChange={handleChange} required />
                          <p className="text-xs text-muted-foreground">Harus nama pribadi sesuai KTP.</p>
                      </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Upload Dokumen
                      </h3>
                      
                      {/* Upload KTP */}
                      <div className="space-y-2">
                          <Label htmlFor="ktpUrl">Foto KTP</Label>
                          {formData.ktpUrl ? (
                              <div className="relative w-full max-w-sm h-48 border rounded-lg overflow-hidden group">
                                  <img src={formData.ktpUrl} alt="Preview KTP" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button type="button" variant="destructive" size="sm" onClick={() => setFormData(prev => ({...prev, ktpUrl: ''}))}>
                                          Hapus & Ganti
                                      </Button>
                                  </div>
                              </div>
                          ) : (
                              <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <Input 
                                        id="ktpUrl" 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'ktpUrl')}
                                        disabled={uploading.ktpUrl}
                                    />
                                    {uploading.ktpUrl && <Loader2 className="animate-spin w-4 h-4 text-emerald-600" />}
                                  </div>
                                  <p className="text-xs text-muted-foreground">Format JPG/PNG, maks 5MB. Pastikan NIK terliat jelas.</p>
                              </div>
                          )}
                      </div>

                       {/* Upload Selfie */}
                       <div className="space-y-2">
                          <Label htmlFor="selfieUrl">Foto Selfie dengan KTP</Label>
                          {formData.selfieUrl ? (
                              <div className="relative w-full max-w-sm h-48 border rounded-lg overflow-hidden group">
                                  <img src={formData.selfieUrl} alt="Preview Selfie" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button type="button" variant="destructive" size="sm" onClick={() => setFormData(prev => ({...prev, selfieUrl: ''}))}>
                                          Hapus & Ganti
                                      </Button>
                                  </div>
                              </div>
                          ) : (
                              <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <Input 
                                        id="selfieUrl" 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'selfieUrl')}
                                        disabled={uploading.selfieUrl}
                                    />
                                    {uploading.selfieUrl && <Loader2 className="animate-spin w-4 h-4 text-emerald-600" />}
                                  </div>
                                  <p className="text-xs text-muted-foreground">Format JPG/PNG, maks 5MB. Pegang KTP di samping wajah.</p>
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={submitting || uploading.ktpUrl || uploading.selfieUrl} className="bg-emerald-600 hover:bg-emerald-700">
                          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...</> : 'Kirim Verifikasi'}
                      </Button>
                  </div>
              </form>
          </CardContent>
      </Card>
    </div>
  );
}
