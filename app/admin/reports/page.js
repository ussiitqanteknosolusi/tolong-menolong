'use client';

import { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/reports')
      .then(res => res.json())
      .then(data => {
        if (data.success) setReports(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
      setActionLoading(true);
      try {
           const res = await fetch(`/api/admin/reports/${id}/action`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ action }) 
           });
           const data = await res.json();
           if (data.success) {
               toast.success(`Success ${action}`);
               setReports(prev => prev.map(r => r.id === id ? { ...r, status: action === 'resolve' ? 'resolved' : 'dismissed' } : r));
               setSelected(null);
           } else {
               toast.error(data.error);
           }
      } catch (e) {
          toast.error('Error');
      } finally {
          setActionLoading(false);
      }
  };

  const getStatusBadge = (status) => {
      switch(status) {
          case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
          case 'resolved': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Resolved</Badge>; // Abuse handled
          case 'dismissed': return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Dismissed</Badge>; // False alarm
          default: return <Badge variant="outline">{status}</Badge>;
      }
  };

  if (loading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Masuk</h1>
          <p className="text-muted-foreground">Monitor laporan abuse atau fraud dari user.</p>
        </div>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Daftar Laporan</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Pelapor</TableHead>
                          <TableHead>Campaign</TableHead>
                          <TableHead>Alasan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Aksi</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {reports.length === 0 ? (
                           <TableRow>
                               <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada laporan masuk.</TableCell>
                           </TableRow>
                      ) : (
                          reports.map(r => (
                              <TableRow key={r.id}>
                                  <TableCell>{r.reporter_name || 'Anonymous'}</TableCell>
                                  <TableCell className="max-w-[200px] truncate" title={r.campaign_title}>{r.campaign_title}</TableCell>
                                  <TableCell>{r.reason}</TableCell>
                                  <TableCell>{getStatusBadge(r.status)}</TableCell>
                                  <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                      <Button variant="outline" size="sm" onClick={() => setSelected(r)}>
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

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Detail Laporan</DialogTitle>
              </DialogHeader>
              {selected && (
                  <div className="space-y-4 py-4">
                      <div>
                          <Label className="text-muted-foreground">Campaign Dilaporkan</Label>
                          <p className="font-medium">{selected.campaign_title}</p>
                      </div>
                      <div>
                          <Label className="text-muted-foreground">Alasan Pelaporan</Label>
                          <p className="font-semibold text-red-600">{selected.reason}</p>
                      </div>
                      <div>
                          <Label className="text-muted-foreground">Deskripsi Detail</Label>
                          <p className="text-sm bg-gray-50 p-3 rounded border">{selected.description || 'Tidak ada deskripsi'}</p>
                      </div>
                      
                      <div className="flex flex-col gap-2 pt-4">
                           {selected.status === 'pending' && (
                               <div className="grid grid-cols-2 gap-4">
                                   <Button variant="outline" onClick={() => handleAction(selected.id, 'dismiss')} disabled={actionLoading}>
                                       {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Abaikan / Dismiss'}
                                   </Button>
                                   <Button variant="destructive" onClick={() => handleAction(selected.id, 'resolve')} disabled={actionLoading}>
                                       {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tindak Lanjuti (Resolve)'}
                                   </Button>
                               </div>
                           )}
                      </div>
                  </div>
              )}
          </DialogContent>
      </Dialog>
    </div>
  );
}
