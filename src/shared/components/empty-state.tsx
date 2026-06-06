import { PackageOpen } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <PackageOpen
        className="text-muted-foreground size-5"
        aria-hidden="true"
      />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  );
}
