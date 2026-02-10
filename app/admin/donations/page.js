'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/mock-data';

// Mock donations data
const mockDonations = [
  {
    id: '1',
    externalId: 'DON-ABC12345',
    donorName: 'Ahmad Hidayat',
    donorEmail: 'ahmad@email.com',
    donorPhone: '08123456789',
    campaignTitle: 'Operasi Jantung Bayi Raffa',
    amount: 500000,
    message: 'Semoga lekas sembuh!',
    status: 'paid',
    paymentMethod: 'VIRTUAL_ACCOUNT',
    paymentChannel: 'BCA',
    createdAt: '2025-06-10T10:30:00Z',
    paidAt: '2025-06-10T10:35:00Z',
  },
  {
    id: '2',
    externalId: 'DON-DEF67890',
    donorName: 'Hamba Allah',
    donorEmail: null,
    donorPhone: null,
    campaignTitle: 'Bantu Anak Yatim Pendidikan',
    amount: 1000000,
    message: 'Bismillah',
    status: 'paid',
    paymentMethod: 'QRIS',
    paymentChannel: 'QRIS',
    createdAt: '2025-06-10T09:15:00Z',
    paidAt: '2025-06-10T09:20:00Z',
  },
  {
    id: '3',
    externalId: 'DON-GHI11111',
    donorName: 'Dewi Lestari',
    donorEmail: 'dewi@email.com',
    donorPhone: '08234567890',
    campaignTitle: 'Bantuan Korban Banjir',
    amount: 250000,
    message: '',
    status: 'pending',
    paymentMethod: 'EWALLET',
    paymentChannel: 'OVO',
    createdAt: '2025-06-10T11:00:00Z',
    paidAt: null,
  },
  {
    id: '4',
    externalId: 'DON-JKL22222',
    donorName: 'Budi Santoso',
    donorEmail: 'budi@email.com',
    donorPhone: '08345678901',
    campaignTitle: 'Pembangunan Masjid Desa',
    amount: 2000000,
    message: 'Semoga menjadi amal jariyah',
    status: 'paid',
    paymentMethod: 'VIRTUAL_ACCOUNT',
    paymentChannel: 'MANDIRI',
    createdAt: '2025-06-09T14:00:00Z',
    paidAt: '2025-06-09T14:30:00Z',
  },
  {
    id: '5',
    externalId: 'DON-MNO33333',
    donorName: 'Rina Wati',
    donorEmail: 'rina@email.com',
    donorPhone: '08456789012',
    campaignTitle: 'Beasiswa Mahasiswa',
    amount: 750000,
    message: 'Semangat belajar!',
    status: 'expired',
    paymentMethod: 'VIRTUAL_ACCOUNT',
    paymentChannel: 'BRI',
    createdAt: '2025-06-08T08:00:00Z',
    paidAt: null,
  },
];

const statusConfig = {
  paid: { label: 'Berhasil', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  failed: { label: 'Gagal', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function DonationsPage() {
  const [donations, setDonations] = useState(mockDonations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.externalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = donations
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPending = donations
    .filter((d) => d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const handleViewDetail = (donation) => {
    setSelectedDonation(donation);
    setIsDetailOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Donasi</h1>
          <p className="text-muted-foreground">Lihat dan kelola semua transaksi donasi</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{donations.length}</p>
            <p className="text-sm text-muted-foreground">Total Transaksi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalPaid)}
            </p>
            <p className="text-sm text-muted-foreground">Total Berhasil</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalPending)}
            </p>
            <p className="text-sm text-muted-foreground">Total Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-600">
              {donations.filter((d) => d.status === 'paid').length}
            </p>
            <p className="text-sm text-muted-foreground">Transaksi Sukses</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari donatur, ID transaksi, atau campaign..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="paid">Berhasil</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="failed">Gagal</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Transaksi</TableHead>
                  <TableHead>Donatur</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.map((donation) => {
                  const status = statusConfig[donation.status];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {donation.externalId}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{donation.donorName}</p>
                          {donation.donorEmail && (
                            <p className="text-xs text-muted-foreground">
                              {donation.donorEmail}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-[150px]">
                          {donation.campaignTitle}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(donation.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{donation.paymentChannel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(donation.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(donation)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredDonations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Tidak ada donasi ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Donasi</DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID Transaksi</span>
                  <code className="text-sm">{selectedDonation.externalId}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nominal</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(selectedDonation.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={statusConfig[selectedDonation.status].color}>
                    {statusConfig[selectedDonation.status].label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Informasi Donatur</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Nama:</span> {selectedDonation.donorName}</p>
                  <p><span className="text-muted-foreground">Email:</span> {selectedDonation.donorEmail || '-'}</p>
                  <p><span className="text-muted-foreground">Telepon:</span> {selectedDonation.donorPhone || '-'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Informasi Pembayaran</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Metode:</span> {selectedDonation.paymentMethod}</p>
                  <p><span className="text-muted-foreground">Channel:</span> {selectedDonation.paymentChannel}</p>
                  <p><span className="text-muted-foreground">Dibuat:</span> {formatDate(selectedDonation.createdAt)}</p>
                  <p><span className="text-muted-foreground">Dibayar:</span> {formatDate(selectedDonation.paidAt)}</p>
                </div>
              </div>

              {selectedDonation.message && (
                <div className="space-y-2">
                  <h4 className="font-medium">Pesan</h4>
                  <p className="text-sm text-muted-foreground italic">
                    "{selectedDonation.message}"
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
