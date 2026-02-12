'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/verifications');
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch requests', error);
      toast.error('Gagal mengambil data verifikasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/verifications/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action, 
            reason: action === 'reject' ? rejectReason : undefined 
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Permintaan berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`);
        setRequests((prev) => prev.filter((req) => req.id !== id));
        setSelectedRequest(null);
        setRejectReason('');
      } else {
        toast.error(data.error || 'Gagal memproses permintaan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setActionLoading(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Verifikasi User</h1>
          <p className="text-muted-foreground">
            Daftar permintaan verifikasi akun organizer.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nama Bank</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Tidak ada permintaan verifikasi pending.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.userName}</TableCell>
                    <TableCell>{req.userEmail}</TableCell>
                    <TableCell>{req.bankName} - {req.accountNumber}</TableCell>
                    <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(req)}>
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
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Verifikasi</DialogTitle>
            <DialogDescription>Tinjau data yang dikirimkan user.</DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <Label className="text-muted-foreground">Nama User</Label>
                   <p className="font-medium text-lg">{selectedRequest.userName}</p>
                   <p className="text-sm text-gray-500">{selectedRequest.userEmail}</p>
                </div>
                <div>
                   <Label className="text-muted-foreground">Info Rekening</Label>
                   <p className="font-medium">{selectedRequest.bankName}</p>
                   <p>{selectedRequest.accountNumber}</p>
                   <p className="text-sm">A.N. {selectedRequest.accountHolder}</p>
                </div>
              </div>

              <div className="space-y-2">
                 <Label className="font-semibold block mb-2">Dokumen Identitas</Label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded p-2">
                        <p className="text-sm mb-2 font-medium">Foto KTP</p>
                        {selectedRequest.ktpUrl ? (
                            <img src={selectedRequest.ktpUrl} alt="KTP" className="w-full h-auto rounded object-contain max-h-[300px]" onError={(e) => e.target.src = 'https://placehold.co/400x300?text=Invalid+Image'} />
                        ) : <p className="text-red-500">No Image</p>}
                        <p className="text-xs text-gray-400 mt-1 break-all">{selectedRequest.ktpUrl}</p>
                    </div>
                    <div className="border rounded p-2">
                        <p className="text-sm mb-2 font-medium">Foto Selfie</p>
                         {selectedRequest.selfieUrl ? (
                            <img src={selectedRequest.selfieUrl} alt="Selfie" className="w-full h-auto rounded object-contain max-h-[300px]" onError={(e) => e.target.src = 'https://placehold.co/400x300?text=Invalid+Image'} />
                        ) : <p className="text-red-500">No Image</p>}
                        <p className="text-xs text-gray-400 mt-1 break-all">{selectedRequest.selfieUrl}</p>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-4 border-t pt-4">
                  <div className="space-y-2">
                      <Label>Alasan Penolakan (Jika menolak)</Label>
                      <Input 
                        placeholder="Contoh: Foto KTP buram, Nama rekening tidak sesuai" 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                  </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="destructive" onClick={() => handleAction(selectedRequest.id, 'reject')} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-2" /> Tolak</>}
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction(selectedRequest.id, 'approve')} disabled={actionLoading}>
                 {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Setujui & Verifikasi</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
