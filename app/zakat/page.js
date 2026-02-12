'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Coins, ChevronLeft, Calculator, ChevronRight, Heart,
  Wallet, Info
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth-provider';

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount || 0);
}

const ZAKAT_TYPES = [
  {
    id: 'penghasilan',
    title: 'Zakat Penghasilan',
    desc: 'Zakat dari pendapatan/gaji bulanan',
    rate: 0.025,
    icon: Wallet,
    color: 'emerald',
  },
  {
    id: 'maal',
    title: 'Zakat Maal',
    desc: 'Zakat dari harta yang disimpan selama 1 tahun',
    rate: 0.025,
    icon: Coins,
    color: 'blue',
  },
  {
    id: 'fitrah',
    title: 'Zakat Fitrah',
    desc: 'Zakat wajib di bulan Ramadhan',
    rate: null,
    fixedAmount: 40000,
    icon: Heart,
    color: 'purple',
  },
];

export default function ZakatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(null);
  const [income, setIncome] = useState('');
  const [members, setMembers] = useState(1);
  const [result, setResult] = useState(null);

  const calculateZakat = () => {
    if (!selectedType) return;

    const type = ZAKAT_TYPES.find(t => t.id === selectedType);
    let zakatAmount = 0;

    if (type.id === 'fitrah') {
      zakatAmount = type.fixedAmount * members;
    } else {
      const incomeVal = parseInt(income) || 0;
      zakatAmount = Math.round(incomeVal * type.rate);
    }

    setResult({
      type: type.title,
      amount: zakatAmount,
    });
  };

  return (
    <main className="pb-24 md:pb-12 bg-gray-50/50 min-h-screen">
      <div className="container py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Saya Menunaikan Zakat</h1>
        </div>

        {/* Info Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 border-none shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-gray-900 text-sm block mb-1">Menunaikan zakat melalui BerbagiPath</span>
                  Zakat adalah kewajiban bagi setiap Muslim yang mampu. Hitung dan salurkan zakat Anda 
                  melalui platform kami untuk memastikan tersalurkan kepada yang berhak.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Zakat Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
            Pilih Jenis Zakat
          </h2>
          <div className="space-y-3">
            {ZAKAT_TYPES.map(type => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <Card 
                  key={type.id}
                  className={`border cursor-pointer transition-all shadow-sm ${
                    isSelected
                      ? `border-${type.color}-500 bg-${type.color}-50/50 shadow-md`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => { setSelectedType(type.id); setResult(null); }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      isSelected 
                        ? `bg-${type.color}-100 text-${type.color}-600` 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{type.title}</p>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-emerald-500' : 'text-gray-300'}`} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Calculator */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
              Kalkulator Zakat
            </h2>
            <Card className="mb-6 border-none shadow-sm">
              <CardContent className="p-4 space-y-4">
                {selectedType === 'fitrah' ? (
                  <div>
                    <p className="text-sm font-medium mb-2">Jumlah Jiwa</p>
                    <div className="flex items-center gap-3">
                      <Button 
                        size="sm" variant="outline"
                        onClick={() => setMembers(Math.max(1, members - 1))}
                      >
                        -
                      </Button>
                      <span className="text-2xl font-bold w-12 text-center">{members}</span>
                      <Button 
                        size="sm" variant="outline"
                        onClick={() => setMembers(members + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      × {formatCurrency(40000)} per jiwa
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      {selectedType === 'penghasilan' ? 'Penghasilan Bulanan' : 'Total Harta (yang tersimpan 1 tahun)'}
                    </p>
                    <Input
                      type="number"
                      placeholder="Masukkan jumlah"
                      value={income}
                      onChange={e => setIncome(e.target.value)}
                      className="bg-gray-50 text-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Nisab: 2.5% dari {selectedType === 'penghasilan' ? 'penghasilan' : 'harta'}
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                  onClick={calculateZakat}
                >
                  <Calculator className="w-4 h-4" />
                  Hitung Zakat
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
              <CardContent className="p-6 text-center">
                <Coins className="w-10 h-10 mx-auto mb-3 opacity-80" />
                <p className="text-sm opacity-80 mb-1">{result.type} Anda</p>
                <p className="text-3xl font-bold mb-4">
                  {formatCurrency(result.amount)}
                </p>
                <Button 
                  className="bg-white text-emerald-700 hover:bg-emerald-50 w-full"
                  onClick={() => router.push('/')}
                >
                  Salurkan Sekarang
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}
