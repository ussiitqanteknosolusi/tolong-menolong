'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Building2, Wallet, Check, Copy, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
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

export default function DonationModal({ isOpen, onClose, campaign }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  const handleAmountSelect = (value) => {
    setAmount(value.toString());
  };

  const handleCreateDonation = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          amount: parseInt(amount),
          name: isAnonymous ? 'Hamba Allah' : name,
          email: email,
          phone: phone,
          message: message,
          isAnonymous: isAnonymous,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Gagal membuat donasi');
      }

      setPaymentData(data.data);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setAmount('');
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setIsAnonymous(false);
    setPaymentData(null);
    setError('');
    onClose();
  };

  const numericAmount = parseInt(amount.replace(/\D/g, '')) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && 'Buat Donasi'}
            {step === 2 && 'Selesaikan Pembayaran'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Donation Form */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

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
                <Label>Nama</Label>
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
                <Label>Email (opsional)</Label>
                <Input
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>No. HP (opsional)</Label>
                <Input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
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
                disabled={numericAmount < 10000 || loading}
                onClick={handleCreateDonation}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Lanjut ke Pembayaran
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              {numericAmount > 0 && numericAmount < 10000 && (
                <p className="text-xs text-red-500 text-center">
                  Minimal donasi Rp 10.000
                </p>
              )}
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && paymentData && (
            <motion.div
              key="step2"
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
                  Silakan selesaikan pembayaran
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Pembayaran</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(paymentData.payment.amount)}
                  </span>
                </div>

                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">ID Donasi</span>
                  <span className="font-mono text-sm">
                    {paymentData.donation.externalId}
                  </span>
                </div>

                {paymentData.payment.invoiceUrl && (
                  <a
                    href={paymentData.payment.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Bayar Sekarang via Xendit
                    </Button>
                  </a>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  Anda akan diarahkan ke halaman pembayaran Xendit.
                  Pilih metode pembayaran: QRIS, Transfer Bank, atau E-Wallet.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleClose}
              >
                Tutup
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
