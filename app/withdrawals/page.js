'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, DollarSign, History, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function WithdrawalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    campaignId: '',
    amount: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  // Calculate available balance for selected campaign
  const selectedCampaign = campaigns.find(c => c.id === formData.campaignId);
  const claimedAmount = selectedCampaign ? selectedCampaign.claimedAmount || 0 : 0;
  const availableBalance = selectedCampaign ? (parseFloat(selectedCampaign.current_amount || 0) - claimedAmount) : 0;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/login?redirect=/withdrawals');
        return;
    }

    const fetchData = async () => {
        try {
            // Need user.id
            const [campRes, withRes] = await Promise.all([
                fetch(`/api/campaigns?organizerId=${user.id}`), // Fetch user campaigns
                fetch(`/api/withdrawals?userId=${user.id}`) // Fetch history
            ]);
            
            const campData = await campRes.json();
            const withData = await withRes.json();
            
            let userCampaigns = [];
            if (campData.success) {
                userCampaigns = campData.data;
            }

            let userWithdrawals = [];
            if (withData.success) {
                userWithdrawals = withData.data;
            }

            // Calculate claimed amount per campaign from withdrawals history (if API doesn't provide)
            // Or better, fetch withdrawal stats per campaign or calc locally
            const claimedMap = {};
            userWithdrawals.forEach(w => {
                 if (w.status !== 'rejected') {
                     claimedMap[w.campaign_id] = (claimedMap[w.campaign_id] || 0) + parseFloat(w.amount);
                 }
            });

            const processedCampaigns = userCampaigns.map(c => ({
                ...c,
                claimedAmount: claimedMap[c.id] || 0
            }));

            setCampaigns(processedCampaigns);
            setWithdrawals(userWithdrawals);
        } catch (e) {
            console.error(e);
            toast.error('Gagal mengambil data');
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [user, authLoading, router]);

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleCampaignChange = (val) => {
      setFormData({ ...formData, campaignId: val });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.campaignId) {
          toast.error('Pilih campaign');
          return;
      }
      if (parseFloat(formData.amount) > availableBalance) {
          toast.error('Saldo tidak mencukupi');
          return;
      }
      
      setSubmitting(true);
      try {
          const res = await fetch('/api/withdrawals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  userId: user.id,
                  ...formData
              })
          });
          const data = await res.json();
          if (data.success) {
              toast.success('Permintaan pencairan dikirim');
              setFormData({ ...formData, amount: '', campaignId: '' }); // Reset
              // Refresh data? Simply add to list
              // ideally refresh whole data to update balance
              window.location.reload(); 
          } else {
              toast.error(data.error);
          }
      } catch (e) {
          toast.error('Terjadi kesalahan');
      } finally {
          setSubmitting(false);
      }
  };

  if (authLoading || loading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Pencairan Dana</h1>
      
      <Tabs defaultValue="request">
          <TabsList className="mb-6">
              <TabsTrigger value="request">Ajukan Pencairan</TabsTrigger>
              <TabsTrigger value="history">Riwayat Pencairan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="request">
              <Card>
                  <CardHeader>
                      <CardTitle>Formulir Pengajuan</CardTitle>
                      <CardDescription>Dana akan ditransfer ke rekening yang terdaftar.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="space-y-2">
                              <Label>Pilih Campaign</Label>
                              <Select onValueChange={handleCampaignChange} value={formData.campaignId}>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Pilih campaign..." />
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

                          {formData.campaignId && (
                              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 mb-4">
                                  <p className="text-sm text-emerald-800">Saldo Tersedia:</p>
                                  <p className="text-2xl font-bold text-emerald-600">
                                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(availableBalance)}
                                  </p>
                                  <p className="text-xs text-emerald-600 mt-1">
                                      Terkumpul: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedCampaign?.current_amount || 0)} 
                                      Wait, claimed: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(claimedAmount)}
                                  </p>
                              </div>
                          )}

                          <div className="space-y-2">
                              <Label htmlFor="amount">Jumlah Penarikan (Rp)</Label>
                              <Input 
                                id="amount" 
                                type="number" 
                                placeholder="0" 
                                value={formData.amount} 
                                onChange={handleChange} 
                                required 
                              />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="bankName">Nama Bank</Label>
                                  <Input id="bankName" value={formData.bankName} onChange={handleChange} required placeholder="BCA" />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="accountNumber">Nomor Rekening</Label>
                                  <Input id="accountNumber" value={formData.accountNumber} onChange={handleChange} required placeholder="123xxx" />
                              </div>
                          </div>
                          
                          <div className="space-y-2">
                              <Label htmlFor="accountHolder">Nama Pemilik Rekening</Label>
                              <Input id="accountHolder" value={formData.accountHolder} onChange={handleChange} required placeholder="Nama Anda" />
                          </div>

                          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajukan Pencairan'}
                          </Button>
                      </form>
                  </CardContent>
              </Card>
          </TabsContent>
          
          <TabsContent value="history">
              <Card>
                  <CardHeader>
                      <CardTitle>Riwayat Transaksi</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-4">
                          {withdrawals.length === 0 ? (
                              <p className="text-center text-muted-foreground py-8">Belum ada riwayat pencairan.</p>
                          ) : (
                              withdrawals.map(w => (
                                  <div key={w.id} className="flex items-center justify-between p-4 border rounded-lg">
                                      <div>
                                          <p className="font-medium">{w.campaign_title || 'Unknown Campaign'}</p>
                                          <p className="text-sm text-gray-500">{new Date(w.created_at).toLocaleDateString()}</p>
                                          {w.admin_note && <p className="text-xs text-red-500 mt-1">Note: {w.admin_note}</p>}
                                      </div>
                                      <div className="text-right">
                                          <p className="font-bold">
                                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(w.amount)}
                                          </p>
                                          <span className={`text-xs px-2 py-1 rounded-full ${
                                              w.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                              w.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                              w.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                              'bg-yellow-100 text-yellow-700'
                                          }`}>
                                              {w.status.toUpperCase()}
                                          </span>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}
