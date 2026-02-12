'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Heart,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, getProgressPercentage } from '@/lib/mock-data';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalDonations: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalDonors: 0,
    totalUsers: 0,
    recentDonations: [],
  });
  const [topCampaigns, setTopCampaigns] = useState([]);
  const [pendingCounts, setPendingCounts] = useState({
    campaigns: 0,
    verifications: 0,
    withdrawals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, campaignsRes, pendingCampRes, verifyRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/campaigns'),
          fetch('/api/campaigns?status=pending'),
          fetch('/api/admin/verifications')
        ]);

        const statsData = await statsRes.json();
        const campaignsData = await campaignsRes.json();
        const pendingCampData = await pendingCampRes.json();
        const verifyData = await verifyRes.json();

        if (statsData.success) {
          setDashboardData(statsData.data);
        }

        if (campaignsData.success) {
          // Sort by progress descending
          const sorted = campaignsData.data
            .map(c => ({
              ...c,
              progress: getProgressPercentage(c.currentAmount, c.targetAmount)
            }))
            .sort((a, b) => b.progress - a.progress)
            .slice(0, 5);
          setTopCampaigns(sorted);
        }
        
        setPendingCounts({
            campaigns: pendingCampData.success ? pendingCampData.data.length : 0,
            verifications: verifyData.success ? verifyData.data.length : 0,
            withdrawals: 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: 'Total Donasi',
      value: formatCurrency(dashboardData.totalDonations),
      // change: '+12.5%', // Hardcoded for now as API doesn't support history yet
      // changeType: 'positive',
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      title: 'Total Campaign',
      value: dashboardData.totalCampaigns.toString(),
      subtext: `${dashboardData.activeCampaigns} aktif`,
      icon: Megaphone,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Donatur',
      value: dashboardData.totalDonors.toLocaleString('id-ID'),
      // change: '+8.2%',
      // changeType: 'positive',
      icon: Heart,
      color: 'bg-pink-500',
    },
    {
      title: 'Total Users',
      value: dashboardData.totalUsers.toLocaleString('id-ID'),
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang di Admin Panel BerbagiPath</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Hari Ini
          </Button>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
            Download Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {stat.change && (
                      <span
                        className={`flex items-center text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {stat.changeType === 'positive' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.subtext || stat.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Donasi Terbaru</CardTitle>
            <Button variant="ghost" size="sm">
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentDonations.length > 0 ? (
                dashboardData.recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{donation.donor}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {donation.campaign}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-sm text-emerald-600">
                        {formatCurrency(donation.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(donation.time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada donasi terbaru</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Campaign Terpopuler</CardTitle>
            <Button variant="ghost" size="sm">
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCampaigns.length > 0 ? (
                topCampaigns.map((campaign, index) => (
                  <div key={campaign.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">
                          {index + 1}
                        </span>
                        <p className="font-medium text-sm truncate max-w-[200px]">
                          {campaign.title}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">
                        {campaign.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Terkumpul: {formatCurrency(campaign.currentAmount)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada campaign aktif</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Menunggu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-2xl font-bold text-yellow-700">{pendingCounts.campaigns}</p>
              <p className="text-sm text-yellow-600">Campaign Pending</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-2xl font-bold text-purple-700">{pendingCounts.verifications}</p>
              <p className="text-sm text-purple-600">Verifikasi User</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">{pendingCounts.withdrawals}</p>
              <p className="text-sm text-blue-600">Permintaan Pencairan</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-2xl font-bold text-red-700">0</p>
              <p className="text-sm text-red-600">Laporan Masuk</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
