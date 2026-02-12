'use client';

import { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Eye, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch('/api/admin/withdrawals');
      const data = await response.json();
      if (data.success) {
        setWithdrawals(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals', error);
      toast.error('Gagal mengambil data pencairan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note: adminNote }), // action: 'approve', 'reject', 'complete'
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Success ${action}`);
        setWithdrawals((prev) => prev.map((w) => w.id === id ? { ...w, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'completed', admin_note: adminNote } : w));
        setSelected(null);
        setAdminNote('');
      } else {
        toast.error(data.error || 'Gagal memproses permintaan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
      switch(status) {
          case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
          case 'approved': return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Disetujui</Badge>;
          case 'rejected': return <Badge variant="destructive">Ditolak</Badge>;
          case 'completed': return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">Selesai</Badge>;
          default: return <Badge variant="outline">{status}</Badge>;
      }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permintaan Pencairan</h1>
          <p className="text-muted-foreground">
            Kelola pencairan dana dari organizer.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pencairan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organizer</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Tidak ada data pencairan.
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">
                        {w.organizer_name}
                        <br/><span className="text-xs text-gray-400">{w.organizer_email}</span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={w.campaign_title}>{w.campaign_title}</TableCell>
                    <TableCell className="font-bold text-emerald-600">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(w.amount)}
                    </TableCell>
                    <TableCell>
                        {w.bank_name}<br/><span className="text-xs text-gray-500">{w.account_number}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(w.status)}</TableCell>
                    <TableCell>{new Date(w.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelected(w)}>
                        <Eye className="w-4 h-4 mr-2" /> Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Pencairan</DialogTitle>
            <DialogDescription>ID: {selected?.id}</DialogDescription>
          </DialogHeader>
          
          {selected && (
            <div className="space-y-4 py-4">
               <div>
                   <Label className="text-muted-foreground">Info Rekening Tujuan</Label>
                   <div className="bg-gray-50 p-3 rounded-lg border mt-1">
                       <p className="font-bold">{selected.bank_name}</p>
                       <p className="text-lg tracking-wide">{selected.account_number}</p>
                       <p className="text-sm text-gray-600">A.N. {selected.account_holder}</p>
                   </div>
               </div>
               
               <div>
                   <Label className="text-muted-foreground">Jumlah Pencairan</Label>
                   <p className="text-2xl font-bold text-emerald-600">
                       {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selected.amount)}
                   </p>
               </div>

               {selected.status === 'pending' && (
                   <div className="space-y-2">
                      <Label>Catatan Admin (Opsional)</Label>
                      <Textarea 
                        placeholder="Alasan penolakan atau bukti transfer" 
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                      />
                   </div>
               )}
               
               {selected.status !== 'pending' && selected.admin_note && (
                   <div>
                       <Label className="text-muted-foreground">Catatan Admin</Label>
                       <p className="text-sm border p-2 rounded bg-gray-50">{selected.admin_note}</p>
                   </div>
               )}

            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            {selected?.status === 'pending' ? (
                <>
                    <Button variant="destructive" onClick={() => handleAction(selected.id, 'reject')} disabled={actionLoading}>
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tolak'}
                    </Button>
                     <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAction(selected.id, 'approve')} disabled={actionLoading}>
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Setujui Permintaan'}
                    </Button>
                </>
            ) : selected?.status === 'approved' ? (
                 <Button className="bg-emerald-600 hover:bg-emerald-700 w-full" onClick={() => handleAction(selected.id, 'complete')} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tandai Selesai (Sudah Transfer)'}
                </Button>
            ) : (
                <Button variant="outline" onClick={() => setSelected(null)}>Tutup</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
