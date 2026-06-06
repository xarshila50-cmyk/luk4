import {
  LoadingSkeleton,
  type LoadingSkeletonVariant,
} from '@/shared/components/skeleton';

type LoadingStateProps = {
  title: string;
  description: string;
  variant?: LoadingSkeletonVariant;
};

export function LoadingState({
  description,
  title,
  variant,
}: LoadingStateProps) {
  return (
    <LoadingSkeleton
      title={title}
      description={description}
      variant={variant}
    />
  );
}
