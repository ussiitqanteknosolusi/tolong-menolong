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
  MoreHorizontal,
  CreditCard,
  Calendar,
  User,
  MessageCircle,
  Loader2,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  DialogDescription,
}
from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/mock-data';
import { toast } from 'sonner';

const statusColors = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-gray-100 text-gray-700',
  failed: 'bg-red-100 text-red-700',
};

export default function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/donations');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setDonations(data.data);
      } else {
        toast.error(data.message || 'Gagal mengambil data donasi');
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Gagal mengambil data donasi');
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.externalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (donation.campaignTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = donations
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPending = donations
    .filter((d) => d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPaymentChannel = (channel) => {
    if (!channel) return 'N/A';
    // Common DOKU/midtrans channel codes mapping
    const mapping = {
      'VIRTUAL_ACCOUNT_BCA': 'BCA Virtual Account',
      'VIRTUAL_ACCOUNT_MANDIRI': 'Mandiri Virtual Account',
      'VIRTUAL_ACCOUNT_BRI': 'BRI Virtual Account',
      'VIRTUAL_ACCOUNT_BNI': 'BNI Virtual Account',
      'VIRTUAL_ACCOUNT_PERMATA': 'Permata Virtual Account',
      'VIRTUAL_ACCOUNT_CIMB': 'CIMB Virtual Account',
      'VIRTUAL_ACCOUNT_DANAMON': 'Danamon Virtual Account',
      'CREDIT_CARD': 'Kartu Kredit',
      'OVO': 'OVO',
      'DANA': 'DANA',
      'LINKAJA': 'LinkAja',
      'SHOPEEPAY': 'ShopeePay',
      'QRIS': 'QRIS',
    };
    return mapping[channel] || channel.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

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
            <Button variant="outline" size="icon" onClick={fetchDonations}>
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
                        <Badge variant="outline">{formatPaymentChannel(donation.paymentChannel)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[donation.status]}>
                          {donation.status === 'paid' ? 'Berhasil' : donation.status === 'pending' ? 'Pending' : donation.status === 'expired' ? 'Expired' : 'Gagal'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(donation.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedDonation(donation)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Detail Transaksi
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
      <Dialog open={!!selectedDonation} onOpenChange={() => setSelectedDonation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>
              ID: {selectedDonation?.externalId}
            </DialogDescription>
          </DialogHeader>

          {selectedDonation && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={statusColors[selectedDonation.status]}>
                    {selectedDonation.status === 'paid' ? 'Berhasil' : selectedDonation.status === 'pending' ? 'Pending' : selectedDonation.status === 'expired' ? 'Expired' : 'Gagal'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Jumlah Donasi</span>
                  <span className="font-bold text-lg text-emerald-600">
                    {formatCurrency(selectedDonation.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tanggal</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedDonation.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Informasi Donatur</p>
                    <p className="text-sm text-muted-foreground">{selectedDonation.donorName}</p>
                    <p className="text-xs text-muted-foreground">{selectedDonation.donorEmail || '-'}</p>
                    <p className="text-xs text-muted-foreground">{selectedDonation.donorPhone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Metode Pembayaran</p>
                    <p className="text-sm text-muted-foreground uppercase">
                      {formatPaymentChannel(selectedDonation.paymentChannel)}
                    </p>
                    {selectedDonation.paymentMethod && selectedDonation.paymentMethod !== 'DOKU' && (
                        <p className="text-xs text-muted-foreground uppercase">{selectedDonation.paymentMethod}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Waktu Transaksi</p>
                    <p className="text-sm text-muted-foreground">Dibuat: {formatDate(selectedDonation.createdAt)}</p>
                    <p className="text-sm text-muted-foreground">Dibayar: {formatDate(selectedDonation.paidAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Pesan / Doa</p>
                    <p className="text-sm text-muted-foreground italic">
                      "{selectedDonation.message || 'Tidak ada pesan'}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                 <p className="text-xs text-muted-foreground text-center">
                    Terima kasih telah berdonasi melalui BerbagiPath
                 </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
