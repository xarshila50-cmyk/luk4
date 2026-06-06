import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type PageContainerProps = HTMLAttributes<HTMLElement>;

export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <main
      id={props.id ?? 'main-content'}
      className={cn(
        'mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 pb-24 sm:px-6 md:py-8 md:pb-8 lg:px-8',
        className,
      )}
      {...props}
    />
  );
}
