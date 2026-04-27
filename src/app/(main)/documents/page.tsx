'use client';

import { DocumentManagement } from '@/components/document-management';
import { DesktopOnlyGate } from '@/components/desktop-only-gate';

export default function DocumentsPage() {
  return (
    <DesktopOnlyGate description="書類発行はテンプレート選択・フィールド入力・PDFプレビューを伴うため、画面幅 768px 以上のPCでの利用をお願いします。">
      <DocumentManagement />
    </DesktopOnlyGate>
  );
}
