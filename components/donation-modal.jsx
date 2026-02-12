'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Building2, Wallet, Check, Copy, ArrowRight, Loader2, ExternalLink, CreditCard } from 'lucide-react';
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

export default function DonationModal({ isOpen, onClose, campaign, user }) {
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
  const [balance, setBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('xendit'); // 'xendit' or 'wallet'

  useEffect(() => {
    if (isOpen && user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        
        // Fetch balance
        fetch(`/api/users/${user.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) setBalance(parseFloat(data.data.balance || 0));
          })
          .catch(err => console.error(err));
    }
  }, [isOpen, user]);

  const handleAmountSelect = (value) => {
    setAmount(value.toString());
  };

  const handleCreateDonation = async () => {
    setLoading(true);
    setError('');

    const numericAmount = parseInt(amount);

    if (paymentMethod === 'wallet' && balance < numericAmount) {
      setError('Saldo Kantong Donasi tidak mencukupi. Silakan Top Up atau pilih metode lain.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = paymentMethod === 'wallet' ? '/api/donations/pay-with-wallet' : '/api/donations';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          userId: user.id, // Ensure userId is sent for wallet payment
          amount: numericAmount,
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
    setMessage('');
    setIsAnonymous(false);
    setPaymentData(null);
    setError('');
    // Reset defaults but keep user data
    if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
    }
    onClose();
  };

  const numericAmount = parseInt(amount.replace(/\D/g, '')) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && 'Buat Donasi'}
            {step === 2 && (paymentMethod === 'wallet' ? 'Donasi Berhasil' : 'Selesaikan Pembayaran')}
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

              {/* Payment Method Selection */}
               <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <div className="grid grid-cols-1 gap-2">
                    <div 
                        onClick={() => setPaymentMethod('xendit')}
                        className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between",
                            paymentMethod === 'xendit' ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">Transfer Bank / QRIS / E-Wallet</span>
                        </div>
                        {paymentMethod === 'xendit' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>

                    <div 
                        onClick={() => numericAmount <= balance && setPaymentMethod('wallet')}
                        className={cn(
                            "p-3 rounded-lg border transition-all flex items-center justify-between",
                            numericAmount > balance ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer",
                            paymentMethod === 'wallet' ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Saldo Kantong Donasi</p>
                                <p className="text-xs text-muted-foreground">Saldo: {formatCurrency(balance)}</p>
                            </div>
                        </div>
                        {paymentMethod === 'wallet' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    {numericAmount > balance && (
                        <p className="text-xs text-red-500 ml-1">Saldo tidak mencukupi untuk nominal ini.</p>
                    )}
                </div>
              </div>

              {/* User Details */}
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
                disabled={numericAmount < 10000 || loading || (paymentMethod === 'wallet' && balance < numericAmount)}
                onClick={handleCreateDonation}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'wallet' ? 'Bayar Sekarang' : 'Lanjut ke Pembayaran'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Payment or Success */}
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
                <h3 className="font-semibold text-lg mb-2">
                    {paymentMethod === 'wallet' ? 'Donasi Berhasil!' : 'Donasi Berhasil Dibuat!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {paymentMethod === 'wallet' 
                    ? 'Terima kasih atas kebaikan Anda. Donasi telah disalurkan.' 
                    : 'Silakan selesaikan pembayaran'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Donasi</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(paymentData.amount)}
                  </span>
                </div>

                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Metode Bayar</span>
                  <span className="font-medium text-sm">
                    {paymentMethod === 'wallet' ? 'Saldo Kantong Donasi' : 'Xendit Gateway'}
                  </span>
                </div>

                {paymentMethod === 'xendit' && paymentData.invoiceUrl && (
                  <a
                    href={paymentData.invoiceUrl}
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
                
                {paymentMethod === 'wallet' && (
                    <p className="text-xs text-center text-emerald-600">
                        Saldo Anda saat ini: {formatCurrency(balance - paymentData.amount)}
                    </p>
                )}
              </div>

              <Button
                variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
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
