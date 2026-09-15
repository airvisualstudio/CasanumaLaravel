import React, { useState } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
    Brackets,
    Search,
    User,
    Home,
    CreditCard,
    Building2,
    Calendar,
    Sparkles,
    Check,
    Copy,
} from 'lucide-react';
import { toast } from 'sonner';

export interface TokenItem {
    token: string;
    label: string;
    sample?: string;
    desc?: string;
}

export interface VariablePickerProps {
    availableTokens: Record<string, { label: string; tokens: TokenItem[] }>;
    onInsertToken: (token: string) => void;
    triggerButton?: React.ReactNode;
}

export default function VariablePicker({
    availableTokens,
    onInsertToken,
    triggerButton,
}: VariablePickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const getCategoryIcon = (key: string) => {
        switch (key) {
            case 'lead':
                return <User className="size-3.5 text-blue-500" />;
            case 'unit':
                return <Home className="size-3.5 text-emerald-500" />;
            case 'booking':
                return <CreditCard className="size-3.5 text-purple-500" />;
            case 'developer':
                return <Building2 className="size-3.5 text-amber-500" />;
            case 'system':
                return <Calendar className="size-3.5 text-slate-500" />;
            default:
                return <Sparkles className="size-3.5 text-indigo-500" />;
        }
    };

    // Flatten or filter tokens
    const categories = Object.entries(availableTokens);

    const filteredItems: { categoryKey: string; categoryLabel: string; item: TokenItem }[] = [];

    categories.forEach(([key, group]) => {
        if (activeCategory === 'all' || activeCategory === key) {
            group.tokens.forEach((item) => {
                const q = search.toLowerCase();
                if (
                    !q ||
                    item.token.toLowerCase().includes(q) ||
                    item.label.toLowerCase().includes(q) ||
                    (item.desc && item.desc.toLowerCase().includes(q))
                ) {
                    filteredItems.push({
                        categoryKey: key,
                        categoryLabel: group.label,
                        item,
                    });
                }
            });
        }
    });

    const handleSelect = (token: string) => {
        onInsertToken(token);
        setCopiedToken(token);
        toast.success(`Variabel ${token} disisipkan ke dokumen!`);
        setTimeout(() => setCopiedToken(null), 1500);
    };

    const handleCopy = (e: React.MouseEvent, token: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(token);
        setCopiedToken(token);
        toast.info(`Variabel ${token} disalin ke clipboard!`);
        setTimeout(() => setCopiedToken(null), 1500);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {triggerButton || (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary font-medium text-xs rounded-lg transition-all"
                    >
                        <Brackets className="size-3.5" />
                        <span>Sisipkan Variabel</span>
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent
                align="start"
                sideOffset={6}
                className="w-96 p-0 shadow-2xl rounded-2xl border-border bg-popover/95 backdrop-blur-md"
            >
                {/* Header & Search */}
                <div className="p-3 border-b border-border space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <Sparkles className="size-3.5 text-primary" />
                            <span>Variabel Dinamis Dokumen</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4">
                            {filteredItems.length} Variabel
                        </Badge>
                    </div>

                    <div className="relative">
                        <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari token, cth: nama, harga, unit..."
                            className="h-8 pl-8 pr-2.5 text-xs rounded-lg bg-background border-border/60"
                        />
                    </div>

                    {/* Category tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                        <button
                            type="button"
                            onClick={() => setActiveCategory('all')}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                                activeCategory === 'all'
                                    ? 'bg-primary text-primary-foreground font-semibold'
                                    : 'bg-background hover:bg-muted text-muted-foreground'
                            }`}
                        >
                            Semua
                        </button>
                        {categories.map(([k, grp]) => (
                            <button
                                key={k}
                                type="button"
                                onClick={() => setActiveCategory(k)}
                                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 ${
                                    activeCategory === k
                                        ? 'bg-primary text-primary-foreground font-semibold'
                                        : 'bg-background hover:bg-muted text-muted-foreground'
                                }`}
                            >
                                {getCategoryIcon(k)}
                                <span>{grp.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Token list */}
                <ScrollArea className="h-72 p-2">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                            Tidak ada variabel yang sesuai pencarian.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredItems.map(({ categoryKey, item }) => {
                                const isCopied = copiedToken === item.token;
                                return (
                                    <div
                                        key={item.token}
                                        onClick={() => handleSelect(item.token)}
                                        className="group flex items-start justify-between p-2 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 cursor-pointer transition-all text-left"
                                    >
                                        <div className="space-y-0.5 min-w-0 pr-2">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <code className="text-xs font-mono font-semibold text-primary bg-primary/10 px-1 py-0.5 rounded">
                                                    {item.token}
                                                </code>
                                                <span className="text-xs font-medium text-foreground">
                                                    {item.label}
                                                </span>
                                            </div>
                                            {item.desc && (
                                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                                    {item.desc}
                                                </p>
                                            )}
                                            {item.sample && (
                                                <p className="text-[10px] text-muted-foreground/80 font-mono italic">
                                                    Contoh: {item.sample}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => handleCopy(e, item.token)}
                                                title="Salin token"
                                            >
                                                {isCopied ? (
                                                    <Check className="size-3 text-emerald-500" />
                                                ) : (
                                                    <Copy className="size-3" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-2 border-t border-border bg-muted/20 text-[11px] text-muted-foreground text-center">
                    Klik untuk menyisipkan langsung ke editor kursor
                </div>
            </PopoverContent>
        </Popover>
    );
}
