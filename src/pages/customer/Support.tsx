import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    LifeBuoy, MessageSquare, Send, Paperclip, Ticket,
    MessageCircleQuestion, Clock, CheckCircle2, AlertCircle, X,
    Loader2, History
} from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const mockTickets = [
    { id: 'TKT-1029', category: 'Transaction Issue', priority: 'High', status: 'Open', date: new Date() },
    { id: 'TKT-0942', category: 'Card Replacement', priority: 'Medium', status: 'Pending', date: subDays(new Date(), 2) },
    { id: 'TKT-0811', category: 'Technical Support', priority: 'Low', status: 'Resolved', date: subDays(new Date(), 10) },
];

const faqs = [
    { q: "How do I reset my transaction PIN?", a: "You can reset your PIN by navigating to the Security page and entering a new 4-digit code in the 'Transaction PIN' section." },
    { q: "What should I do if my card is lost or stolen?", a: "Please use the 'Freeze Account' feature in the Security page immediately, and then raise a 'Card Replacement' ticket here." },
    { q: "How long do inter-bank transfers take?", a: "Standard transfers take 1-2 business days. Instant wire transfers are processed within minutes but carry a fee." },
    { q: "Can I download statements for tax purposes?", a: "Yes, visit the Statements page to generate and download PDFs or Excel files for any custom date range." }
];

export default function Support() {
    // Ticket Form State
    const [ticketCategory, setTicketCategory] = useState('');
    const [ticketPriority, setTicketPriority] = useState('');
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketDesc, setTicketDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Live Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMsg, setChatMsg] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { sender: 'bot', text: 'Hello! I am PrimeBot. How can I assist you with your banking today?', time: new Date() }
    ]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);

    // Scroll chat to bottom
    useEffect(() => {
        if (isChatOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, isChatOpen, isTyping]);

    // Handlers
    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketCategory || !ticketPriority) {
            toast.error("Please select a category and priority.");
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Support ticket TKT-1030 raised successfully! We will get back to you shortly.");
            setTicketCategory('');
            setTicketPriority('');
            setTicketSubject('');
            setTicketDesc('');
        }, 1500);
    };

    const handleSendChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMsg.trim()) return;

        const newMsg = { sender: 'user', text: chatMsg, time: new Date() };
        setChatHistory(prev => [...prev, newMsg]);
        setChatMsg('');
        setIsTyping(true);

        // Simulate Bot Response
        setTimeout(() => {
            setIsTyping(false);
            setChatHistory(prev => [...prev, {
                sender: 'bot',
                text: "Thanks for reaching out! I've logged your query. An agent will connect with you here in a moment.",
                time: new Date()
            }]);
        }, 2000);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Open': return <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3" /> Open</span>;
            case 'Pending': return <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
            case 'Resolved': return <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
            default: return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-6xl mx-auto pb-10">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">Help & Support</h1>
                    <p className="text-muted-foreground text-sm mt-1">Get assistance, raise tickets, and find answers to common questions.</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column (Ticket Form + Chat Trigger) */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Live Chat Prompter Card */}
                        <GlassCard className="p-6 bg-primary/5 border-primary/20 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary glow-primary">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Need immediate help?</h3>
                            <p className="text-sm text-muted-foreground mb-6">Chat with our 24/7 virtual assistant or connect to a live human agent.</p>
                            <Button onClick={() => setIsChatOpen(true)} className="w-full">Start Live Chat</Button>
                        </GlassCard>

                        {/* Raise Ticket Form */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-2 mb-6 text-primary">
                                <Ticket className="w-5 h-5" />
                                <h3 className="font-semibold text-lg">Raise a Ticket</h3>
                            </div>
                            <form onSubmit={handleTicketSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={ticketCategory} onValueChange={setTicketCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select issue category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="transaction">Transaction Issue</SelectItem>
                                            <SelectItem value="card">Card Services</SelectItem>
                                            <SelectItem value="account">Account Access</SelectItem>
                                            <SelectItem value="technical">Technical Support</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select value={ticketPriority} onValueChange={setTicketPriority}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low (General Query)</SelectItem>
                                            <SelectItem value="medium">Medium (Requires Action)</SelectItem>
                                            <SelectItem value="high">High (Urgent/Money stuck)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Input value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} placeholder="Brief description of the issue" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Details</Label>
                                    <Textarea value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} placeholder="Please provide as much information as possible..." rows={4} required />
                                </div>
                                <div className="pt-2">
                                    <Button variant="outline" type="button" className="w-full border-dashed mb-4" onClick={() => toast.info("Attachment selection simulated")}>
                                        <Paperclip className="w-4 h-4 mr-2" /> Attach Files or Screenshots
                                    </Button>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Submit Ticket'}
                                    </Button>
                                </div>
                            </form>
                        </GlassCard>

                    </div>

                    {/* Right Column (Tickets Table + FAQs) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Ticket History */}
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-primary">
                                    <History className="w-5 h-5" />
                                    <h3 className="font-semibold text-lg">Recent Tickets</h3>
                                </div>
                            </div>
                            <div className="rounded-md border border-border/50 overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-secondary/50">
                                        <TableRow>
                                            <TableHead className="w-[100px]">ID</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockTickets.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell className="font-medium text-xs font-mono">{t.id}</TableCell>
                                                <TableCell className="text-sm">{t.category}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{format(t.date, 'MMM dd, yyyy')}</TableCell>
                                                <TableCell>
                                                    <span className={`text-xs font-medium ${t.priority === 'High' ? 'text-destructive' : t.priority === 'Medium' ? 'text-orange-500' : 'text-primary'}`}>
                                                        {t.priority}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right flex justify-end">
                                                    {getStatusBadge(t.status)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </GlassCard>

                        {/* FAQs */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-2 mb-6 text-orange-400">
                                <MessageCircleQuestion className="w-5 h-5" />
                                <h3 className="font-semibold text-lg">Frequently Asked Questions</h3>
                            </div>
                            <Accordion type="single" collapsible className="w-full space-y-2">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="border border-border/50 bg-secondary/20 rounded-lg px-4 data-[state=open]:bg-secondary/40 transition-colors">
                                        <AccordionTrigger className="hover:no-underline font-medium text-left">
                                            {faq.q}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed">
                                            {faq.a}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </GlassCard>

                    </div>
                </div>
            </div>

            {/* LIVE CHAT WIDGET */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] bg-background border border-border/50 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden glass-card"
                    >
                        {/* Chat Header */}
                        <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <LifeBuoy className="w-5 h-5" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-primary rounded-full"></span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Live Support</h4>
                                    <p className="text-xs text-primary-foreground/80">Typically replies in under 1m</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white" onClick={() => setIsChatOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                        : 'bg-secondary text-foreground rounded-tl-sm'
                                        }`}>
                                        <p className="text-sm">{msg.text}</p>
                                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {format(msg.time, 'HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-3 bg-background border-t border-border/50">
                            <form onSubmit={handleSendChat} className="flex items-center gap-2">
                                <Input
                                    className="flex-1 rounded-full bg-secondary/50 focus-visible:ring-1"
                                    placeholder="Type your message..."
                                    value={chatMsg}
                                    onChange={(e) => setChatMsg(e.target.value)}
                                />
                                <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!chatMsg.trim() || isTyping}>
                                    <Send className="w-4 h-4 ml-0.5" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
