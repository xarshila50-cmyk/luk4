import { ImagePlus } from 'lucide-react';

import { useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { CreatePostForm } from '../components/create-post-form';

export function CreatePostPage() {
  const { t } = useI18n();

  return (
    <PageContainer className="gap-6">
      <section className="bg-card rounded-lg border p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
            <ImagePlus className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{t('Create Post')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('Give away an unwanted item for free.')}
            </p>
          </div>
        </div>
      </section>

      <CreatePostForm />
    </PageContainer>
  );
}
