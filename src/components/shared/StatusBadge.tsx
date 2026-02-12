import { cn } from '@/lib/utils';

type Status = 'completed' | 'pending' | 'failed' | 'active' | 'blocked' | 'frozen' | 'approved' | 'rejected' | 'verified' | 'closed';

const statusStyles: Record<Status, string> = {
  completed: 'bg-success/15 text-success border-success/20',
  approved: 'bg-success/15 text-success border-success/20',
  verified: 'bg-success/15 text-success border-success/20',
  active: 'bg-success/15 text-success border-success/20',
  pending: 'bg-warning/15 text-warning border-warning/20',
  failed: 'bg-destructive/15 text-destructive border-destructive/20',
  rejected: 'bg-destructive/15 text-destructive border-destructive/20',
  blocked: 'bg-destructive/15 text-destructive border-destructive/20',
  frozen: 'bg-primary/15 text-primary border-primary/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
      statusStyles[status] || statusStyles.pending
    )}>
      {status}
    </span>
  );
}
