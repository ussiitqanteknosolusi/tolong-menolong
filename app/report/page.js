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
import { Loader2, Flag, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    campaignId: '',
    reason: '',
    description: '',
  });

  useEffect(() => {
    // Fetch active campaigns to report
    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/campaigns?status=active');
            const data = await res.json();
            if (data.success) {
                setCampaigns(data.data);
            }
        } catch (e) {
            console.error('Failed to fetch campaigns');
        }
    };
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.campaignId || !formData.reason) {
          toast.error('Mohon lengkapi data laporan');
          return;
      }
      
      setLoading(true);
      try {
          const res = await fetch('/api/reports', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  userId: user?.id,
                  ...formData
              })
          });
          const data = await res.json();
          if (data.success) {
              toast.success('Laporan berhasil dikirim. Terima kasih atas kepedulian Anda.');
              setFormData({ campaignId: '', reason: '', description: '' });
              setTimeout(() => router.push('/'), 2000);
          } else {
              toast.error(data.error || 'Gagal mengirim laporan');
          }
      } catch (e) {
          toast.error('Terjadi kesalahan');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="container max-w-xl py-10 min-h-screen flex items-center justify-center">
      <Card className="w-full">
          <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-red-100 text-red-600 rounded-full">
                      <Flag className="w-6 h-6" />
                  </div>
              </div>
              <CardTitle className="text-2xl">Laporkan Pelanggaran</CardTitle>
              <CardDescription>Bantu kami menjaga keamanan dengan melaporkan campaign yang mencurigakan.</CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                      <Label htmlFor="campaignId">Campaign yang dilaporkan *</Label>
                      <Select 
                        value={formData.campaignId} 
                        onValueChange={(val) => setFormData({...formData, campaignId: val})}
                      >
                          <SelectTrigger>
                              <SelectValue placeholder="Pilih Campaign" />
                          </SelectTrigger>
                          <SelectContent>
                              {campaigns.map(c => (
                                  <SelectItem key={c.id} value={c.id}>
                                      {c.title}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="reason">Alasan Pelaporan *</Label>
                      <Select 
                        value={formData.reason} 
                        onValueChange={(val) => setFormData({...formData, reason: val})}
                      >
                          <SelectTrigger>
                              <SelectValue placeholder="Pilih Alasan" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="fraud">Indikasi Penipuan</SelectItem>
                              <SelectItem value="content">Konten Tidak Pantas / SARA</SelectItem>
                              <SelectItem value="fake_identity">Identitas Palsu</SelectItem>
                              <SelectItem value="misuse">Penyalahgunaan Dana</SelectItem>
                              <SelectItem value="other">Lainnya</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="description">Detail Laporan</Label>
                      <Textarea 
                          id="description" 
                          placeholder="Jelaskan secara detail temuan atau kekhawatiran Anda..." 
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={4}
                      />
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Laporan'}
                  </Button>
              </form>
          </CardContent>
      </Card>
    </div>
  );
}
