'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Building2, Wallet, Check, Copy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, paymentMethods } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const quickAmounts = [25000, 50000, 100000, 250000, 500000, 1000000];

const iconMap = {
  QrCode,
  Building2,
  Wallet,
};

export default function DonationModal({ isOpen, onClose, campaign }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAmountSelect = (value) => {
    setAmount(value.toString());
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    setStep(1);
    setAmount('');
    setSelectedPayment(null);
    setName('');
    setMessage('');
    setIsAnonymous(false);
    onClose();
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText('8888 0812 3456 7890');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const numericAmount = parseInt(amount.replace(/\D/g, '')) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && 'Pilih Nominal Donasi'}
            {step === 2 && 'Pilih Metode Pembayaran'}
            {step === 3 && 'Selesaikan Pembayaran'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Amount Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((value) => (
                  <Button
                    key={value}
                    variant={amount === value.toString() ? 'default' : 'outline'}
                    className={cn(
                      'h-auto py-3 text-sm',
                      amount === value.toString() && 'bg-emerald-500 hover:bg-emerald-600'
                    )}
                    onClick={() => handleAmountSelect(value)}
                  >
                    {formatCurrency(value).replace('Rp', 'Rp ')}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Atau masukkan nominal lain</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="pl-10"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setAmount(value);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nama (opsional)</Label>
                <Input
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isAnonymous}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Sembunyikan nama saya (Hamba Allah)
                </label>
              </div>

              <div className="space-y-2">
                <Label>Doa/Pesan (opsional)</Label>
                <Textarea
                  placeholder="Tulis doa atau pesan untuk penerima donasi..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                disabled={numericAmount < 10000}
                onClick={handleNext}
              >
                Lanjutkan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {numericAmount > 0 && numericAmount < 10000 && (
                <p className="text-xs text-red-500 text-center">
                  Minimal donasi Rp 10.000
                </p>
              )}
            </motion.div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Donasi</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(numericAmount)}
                </p>
              </div>

              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = iconMap[method.icon] || Wallet;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-4 rounded-lg border transition-colors',
                        selectedPayment === method.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-border hover:border-emerald-300'
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{method.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                      {selectedPayment === method.id && (
                        <Check className="w-5 h-5 text-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Kembali
                </Button>
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  disabled={!selectedPayment}
                  onClick={handleNext}
                >
                  Bayar Sekarang
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment Instructions */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center p-6 bg-emerald-50 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Donasi Berhasil Dibuat!</h3>
                <p className="text-sm text-muted-foreground">
                  Silakan selesaikan pembayaran dalam 24 jam
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Pembayaran</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(numericAmount)}
                  </span>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <p className="text-sm font-medium">Nomor Virtual Account</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-muted rounded text-lg font-mono">
                      8888 0812 3456 7890
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyVA}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * Ini adalah simulasi pembayaran (MOCK)
                  </p>
                </div>
              </div>

              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                onClick={handleClose}
              >
                Selesai
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
