'use client';

import { useState } from 'react';
import {
  Search,
  MoreHorizontal,
  UserPlus,
  Mail,
  Phone,
  BadgeCheck,
  Ban,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

// Mock users data
const mockUsers = [
  {
    id: '1',
    name: 'Ahmad Hidayat',
    email: 'ahmad@email.com',
    phone: '08123456789',
    role: 'user',
    isVerified: true,
    totalDonations: 5500000,
    donationCount: 8,
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'Yayasan Cahaya Harapan',
    email: 'yayasan@email.com',
    phone: '08234567890',
    role: 'organizer',
    isVerified: true,
    totalDonations: 0,
    campaignCount: 3,
    createdAt: '2025-02-01',
  },
  {
    id: '3',
    name: 'Dewi Lestari',
    email: 'dewi@email.com',
    phone: '08345678901',
    role: 'user',
    isVerified: false,
    totalDonations: 2750000,
    donationCount: 5,
    createdAt: '2025-03-10',
  },
  {
    id: '4',
    name: 'Admin Utama',
    email: 'admin@berbagipath.com',
    phone: '08456789012',
    role: 'admin',
    isVerified: true,
    totalDonations: 0,
    donationCount: 0,
    createdAt: '2024-12-01',
  },
  {
    id: '5',
    name: 'Budi Santoso',
    email: 'budi@email.com',
    phone: '08567890123',
    role: 'user',
    isVerified: true,
    totalDonations: 15000000,
    donationCount: 12,
    createdAt: '2025-01-20',
  },
];

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  organizer: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-700',
};

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleVerify = (id) => {
    setUsers(
      users.map((u) => (u.id === id ? { ...u, isVerified: !u.isVerified } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Users</h1>
          <p className="text-muted-foreground">Kelola pengguna dan penggalang dana</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === 'admin').length}
            </p>
            <p className="text-sm text-muted-foreground">Admin</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">
              {users.filter((u) => u.role === 'organizer').length}
            </p>
            <p className="text-sm text-muted-foreground">Organizer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-600">
              {users.filter((u) => u.isVerified).length}
            </p>
            <p className="text-sm text-muted-foreground">Terverifikasi</p>
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
                placeholder="Cari nama atau email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead>User</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-emerald-100 text-emerald-600">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm flex items-center gap-1">
                            {user.name}
                            {user.isVerified && (
                              <BadgeCheck className="w-4 h-4 text-emerald-500" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isVerified ? (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">Unverified</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.role === 'organizer' ? (
                          <p>{user.campaignCount || 0} campaigns</p>
                        ) : (
                          <p>{user.donationCount || 0} donasi</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('id-ID')}
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
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleVerify(user.id)}>
                            <BadgeCheck className="w-4 h-4 mr-2" />
                            {user.isVerified ? 'Hapus Verifikasi' : 'Verifikasi'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="w-4 h-4 mr-2" />
                            Blokir User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Tidak ada user ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
