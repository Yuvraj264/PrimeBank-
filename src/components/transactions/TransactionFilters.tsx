import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export interface FilterState {
    search: string;
    type: string;
    status: string;
    dateRange: DateRange | undefined;
    minAmount: number;
    maxAmount: number;
}

interface Props {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function TransactionFilters({ filters, setFilters }: Props) {
    const [isAmountOpen, setIsAmountOpen] = useState(false);
    const [tempAmount, setTempAmount] = useState([filters.minAmount, filters.maxAmount]);

    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            type: 'all',
            status: 'all',
            dateRange: undefined,
            minAmount: 0,
            maxAmount: 100000
        });
        setTempAmount([0, 100000]);
    };

    const activeFiltersCount =
        (filters.type !== 'all' ? 1 : 0) +
        (filters.status !== 'all' ? 1 : 0) +
        (filters.dateRange?.from ? 1 : 0) +
        (filters.minAmount > 0 || filters.maxAmount < 100000 ? 1 : 0);

    return (
        <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search descriptions, references..."
                        className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary/30"
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                    />
                </div>

                <div className="flex gap-2 flex-wrap md:flex-nowrap">
                    {/* Type Filter */}
                    <Select value={filters.type} onValueChange={(val) => updateFilter('type', val)}>
                        <SelectTrigger className="w-full md:w-[150px] bg-background/50 border-border/50">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="deposit">Deposit</SelectItem>
                            <SelectItem value="withdrawal">Withdrawal</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                            <SelectItem value="bill_payment">Bill Payment</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={filters.status} onValueChange={(val) => updateFilter('status', val)}>
                        <SelectTrigger className="w-full md:w-[130px] bg-background/50 border-border/50">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Date Picker Popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={`w-full md:w-[220px] justify-start text-left font-normal bg-background/50 border-border/50 ${!filters.dateRange && 'text-muted-foreground'}`}>
                                {filters.dateRange?.from ? (
                                    filters.dateRange.to ? (
                                        <>
                                            {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                                            {format(filters.dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(filters.dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Select Date Range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border border-border/50 shadow-md" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={filters.dateRange?.from}
                                selected={filters.dateRange}
                                onSelect={(range) => updateFilter('dateRange', range)}
                                numberOfMonths={2}
                                className="bg-card rounded-md"
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Amount Range Filter */}
                    <Popover open={isAmountOpen} onOpenChange={setIsAmountOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full md:w-[150px] bg-background/50 border-border/50">
                                <Filter className="w-4 h-4 mr-2" />
                                Amount
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-5 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium leading-none">Amount Range</h4>
                                    <span className="text-sm text-muted-foreground">${tempAmount[0]} - ${tempAmount[1] === 100000 ? '100k+' : tempAmount[1]}</span>
                                </div>
                                <Slider
                                    min={0}
                                    max={100000}
                                    step={1000}
                                    value={tempAmount}
                                    onValueChange={setTempAmount}
                                    className="mt-6"
                                />
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <Button variant="ghost" size="sm" onClick={() => setTempAmount([0, 100000])}>Reset</Button>
                                <Button size="sm" onClick={() => {
                                    setFilters(prev => ({ ...prev, minAmount: tempAmount[0], maxAmount: tempAmount[1] }));
                                    setIsAmountOpen(false);
                                }}>
                                    Apply
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {activeFiltersCount > 0 && (
                        <Button variant="ghost" className="px-3 text-muted-foreground hover:text-foreground" onClick={clearFilters}>
                            <X className="w-4 h-4 mr-1" /> Clear ({activeFiltersCount})
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
