import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector } from '@/store';
import { accountService } from '@/services/accountService';
import { transactionService } from '@/services/transactionService';
import { toast } from 'sonner';
import { ArrowRight, Wallet, User as UserIcon, Globe, Building2 } from 'lucide-react';

export default function Transfers() {
  const { user } = useAppSelector((s) => s.auth);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getMyAccounts();
        setAccounts(data);
        if (data.length > 0) setFromAccount(data[0].id);
      } catch (error) {
        toast.error('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAccounts();
  }, [user]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || !fromAccount || !recipient) {
      toast.error('Please fill all fields correctly');
      return;
    }

    try {
      await transactionService.transfer({
        receiverAccountNumber: recipient,
        amount: Number(amount),
        description: 'Transfer',
        fromAccountId: fromAccount
      });
      toast.success('Transfer successful');
      setAmount('');
      setRecipient('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Transfer failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Transfers</h1>
          <p className="text-muted-foreground text-sm mt-1">Move money securely between accounts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2">
            <Tabs defaultValue="internal" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/30">
                <TabsTrigger value="internal" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Own Accounts
                </TabsTrigger>
                <TabsTrigger value="domestic" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Domestic
                </TabsTrigger>
                <TabsTrigger value="international" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> International
                </TabsTrigger>
              </TabsList>

              <TabsContent value="internal">
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From Account</Label>
                      <Select value={fromAccount} onValueChange={setFromAccount}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.type.replace('_', ' ')} (**** {acc.accountNumber.slice(-4)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>To Account</Label>
                      <Select onValueChange={(val) => {
                        const acc = accounts.find(a => a.id === val);
                        if (acc) setRecipient(acc.accountNumber);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.filter(a => a.id !== fromAccount).map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.type.replace('_', ' ')} (**** {acc.accountNumber.slice(-4)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-8"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Transfer Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="domestic">
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div className="space-y-2">
                    <Label>From Account</Label>
                    <Select defaultValue={accounts[0]?.id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.type.replace('_', ' ')} (**** {acc.accountNumber.slice(-4)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Account Number</Label>
                    <Input
                      placeholder="Enter account number"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-8"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Transfer Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="international">
                <div className="p-8 text-center text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>International transfers are currently disabled for your region.</p>
                </div>
              </TabsContent>
            </Tabs>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" /> Quick Transfer
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer hover:opacity-80">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xs font-bold border border-border/50">
                      U{i}
                    </div>
                    <span className="text-[10px] text-muted-foreground">User {i}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer hover:opacity-80">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                    +
                  </div>
                  <span className="text-[10px] text-muted-foreground">Add</span>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <h3 className="text-sm font-semibold mb-2">Transfer Limits</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Daily Limit</span>
                    <span className="text-muted-foreground">$5,000.00</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[35%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Monthly Limit</span>
                    <span className="text-muted-foreground">$50,000.00</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[15%] rounded-full" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
