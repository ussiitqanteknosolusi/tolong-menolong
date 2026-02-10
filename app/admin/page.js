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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/mock-data';

// Mock dashboard data
const dashboardStats = {
  totalDonations: 2456000000,
  totalDonationsGrowth: 12.5,
  totalCampaigns: 156,
  activeCampaigns: 89,
  totalDonors: 15234,
  donorsGrowth: 8.2,
  totalUsers: 23456,
  pendingWithdrawals: 45000000,
};

const recentDonations = [
  { id: 1, donor: 'Ahmad Hidayat', campaign: 'Operasi Jantung Bayi Raffa', amount: 500000, time: '5 menit lalu' },
  { id: 2, donor: 'Hamba Allah', campaign: 'Bantu Anak Yatim Pendidikan', amount: 1000000, time: '15 menit lalu' },
  { id: 3, donor: 'Dewi Lestari', campaign: 'Bantuan Korban Banjir', amount: 250000, time: '30 menit lalu' },
  { id: 4, donor: 'Budi Santoso', campaign: 'Pembangunan Masjid Desa', amount: 2000000, time: '1 jam lalu' },
  { id: 5, donor: 'Rina Wati', campaign: 'Beasiswa Mahasiswa', amount: 750000, time: '2 jam lalu' },
];

const topCampaigns = [
  { id: 1, title: 'Operasi Jantung Bayi Raffa', progress: 80, amount: 198750000 },
  { id: 2, title: 'Bantuan Korban Banjir Kalimantan', progress: 65, amount: 325000000 },
  { id: 3, title: 'Bantu Anak Yatim Pendidikan', progress: 58, amount: 87500000 },
  { id: 4, title: 'Pembangunan Masjid Desa', progress: 52, amount: 156000000 },
];

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Donasi',
      value: formatCurrency(dashboardStats.totalDonations),
      change: `+${dashboardStats.totalDonationsGrowth}%`,
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      title: 'Total Campaign',
      value: dashboardStats.totalCampaigns.toString(),
      subtext: `${dashboardStats.activeCampaigns} aktif`,
      icon: Megaphone,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Donatur',
      value: dashboardStats.totalDonors.toLocaleString('id-ID'),
      change: `+${dashboardStats.donorsGrowth}%`,
      changeType: 'positive',
      icon: Heart,
      color: 'bg-pink-500',
    },
    {
      title: 'Total Users',
      value: dashboardStats.totalUsers.toLocaleString('id-ID'),
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

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
              {recentDonations.map((donation) => (
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
                    <p className="text-xs text-muted-foreground">{donation.time}</p>
                  </div>
                </div>
              ))}
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
              {topCampaigns.map((campaign, index) => (
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
                    Terkumpul: {formatCurrency(campaign.amount)}
                  </p>
                </div>
              ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-2xl font-bold text-yellow-700">12</p>
              <p className="text-sm text-yellow-600">Campaign Pending Review</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">5</p>
              <p className="text-sm text-blue-600">Permintaan Pencairan</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-2xl font-bold text-red-700">3</p>
              <p className="text-sm text-red-600">Laporan Masuk</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
