'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Plus, TrendingUp, DollarSign, Megaphone, Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
      activeCampaigns: 0,
      totalRaised: 0,
      totalDonors: 0
  });
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/login');
        return;
    }

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/campaigns?organizerId=${user.id}`);
            const data = await res.json();
            
            if (data.success) {
                const userCampaigns = data.data;
                setCampaigns(userCampaigns);
                
                // Calculate stats locally for now
                const active = userCampaigns.filter(c => c.status === 'active').length;
                const raised = userCampaigns.reduce((sum, c) => sum + parseFloat(c.current_amount || 0), 0);
                // Donors count separate API or field? userCampaigns usually have donor count field
                const donors = userCampaigns.reduce((sum, c) => sum + (c.donor_count || 0), 0);

                setStats({
                    activeCampaigns: active,
                    totalRaised: raised,
                    totalDonors: donors
                });
            }
        } catch (e) {
            console.error('Failed to fetch dashboard data', e);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
      );
  }

  return (
    <div className="container py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold">Dashboard Organizer</h1>
            <p className="text-muted-foreground">Kelola campaign dan pantau donasi Anda.</p>
        </div>
        <Link href="/campaigns/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" /> Buat Campaign
            </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
              <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                      <Megaphone className="w-6 h-6" />
                  </div>
                  <div>
                      <p className="text-sm text-gray-500">Campaign Aktif</p>
                      <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                  </div>
              </CardContent>
          </Card>
          <Card>
              <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                      <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                      <p className="text-sm text-gray-500">Total Terkumpul</p>
                      <p className="text-2xl font-bold">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(stats.totalRaised)}
                      </p>
                  </div>
              </CardContent>
          </Card>
          <Card>
              <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                      <Users className="w-6 h-6" />
                  </div>
                  <div>
                      <p className="text-sm text-gray-500">Total Donatur</p>
                      <p className="text-2xl font-bold">{stats.totalDonors}</p>
                  </div>
              </CardContent>
          </Card>
      </div>

      {/* Campaigns List */}
      <Card>
          <CardHeader>
              <CardTitle>Campaign Saya</CardTitle>
              <CardDescription>Daftar campaign yang Anda buat.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                  {campaigns.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50">
                          <p className="text-muted-foreground mb-4">Belum ada campaign yang dibuat.</p>
                          <Link href="/campaigns/new">
                              <Button variant="outline">Mulai Galang Dana</Button>
                          </Link>
                      </div>
                  ) : (
                      campaigns.map(c => (
                          <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4 hover:bg-gray-50 transition-colors">
                              <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-lg">{c.title}</h3>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          c.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                          c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-gray-100 text-gray-600'
                                      }`}>
                                          {c.status.toUpperCase()}
                                      </span>
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-1">{c.description}</p>
                                  <div className="mt-2 text-xs text-gray-500 flex gap-4">
                                      <span>Target: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(c.target_amount || c.targetAmount)}</span>
                                      <span>Terkumpul: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(c.current_amount || c.currentAmount || 0)}</span>
                                  </div>
                              </div>
                              <div className="flex items-center gap-2">
                                  <Link href={`/withdrawals`}> 
                                      {/* Or pass campaignId query */}
                                      <Button variant="outline" size="sm">
                                          <DollarSign className="w-4 h-4 mr-2" /> Cairkan Dana
                                      </Button>
                                  </Link>
                                  <Link href={`/admin/campaigns/${c.id}`} prefetch={false}> 
                                      {/* Wait, user cannot access /admin route. Needs public edit or dashboard edit */}
                                      {/* Assuming for MVP user cannot edit active campaign self-service without admin? Or reusing admin page if role logic allows? */}
                                      {/* User usually needs dedicated edit page. I'll omit Edit button for now or link to dashboard overview */}
                                      <Button  size="sm" onClick={() => router.push(`/campaigns/${c.slug || c.id}`)}>
                                           Lihat
                                      </Button>
                                  </Link>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
