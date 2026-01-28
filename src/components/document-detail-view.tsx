'use client';

/**
 * 書類詳細表示コンポーネント
 */

import { Button } from '@/components/ui/button';
import {
  useDocumentDetail,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
} from '@/hooks/useDocuments';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  FileText,
  Calendar,
  User,
  MapPin,
  File,
} from 'lucide-react';

interface DocumentDetailViewProps {
  documentId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export function DocumentDetailView({
  documentId,
  onBack,
  onEdit,
  onDelete,
  onDownload,
}: DocumentDetailViewProps) {
  const { data, isLoading, error, refresh } = useDocumentDetail(documentId);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-matsu-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        <div className="p-4 bg-beni-50 text-beni-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        <div className="p-8 text-center text-sumi-500">
          <FileText className="mx-auto h-12 w-12 text-sumi-300 mb-2" />
          書類が見つかりません
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <h2 className="text-2xl font-bold text-sumi-900">{data.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => onEdit(documentId)}>
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Button>
          {data.fileName && (
            <Button variant="outline" onClick={() => onDownload(documentId)}>
              <Download className="mr-2 h-4 w-4" />
              ダウンロード
            </Button>
          )}
          <Button
            variant="outline"
            className="text-beni-600 hover:text-beni-700 hover:bg-beni-50"
            onClick={() => onDelete(documentId)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </Button>
        </div>
      </div>

      {/* メイン情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg border border-sumi-200 p-6">
          <h3 className="text-lg font-semibold text-sumi-900 mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-matsu-600" />
            基本情報
          </h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-sumi-500">書類名</dt>
              <dd className="text-sumi-900 font-medium">{data.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-sumi-500">種類</dt>
              <dd>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-ai-100 text-ai-800">
                  {DOCUMENT_TYPE_LABELS[data.type]}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-sumi-500">ステータス</dt>
              <dd>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${DOCUMENT_STATUS_COLORS[data.status]}`}
                >
                  {DOCUMENT_STATUS_LABELS[data.status]}
                </span>
              </dd>
            </div>
            {data.description && (
              <div>
                <dt className="text-sm text-sumi-500">説明</dt>
                <dd className="text-sumi-900">{data.description}</dd>
              </div>
            )}
            {data.notes && (
              <div>
                <dt className="text-sm text-sumi-500">備考</dt>
                <dd className="text-sumi-900 whitespace-pre-wrap">{data.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* ファイル情報 */}
        <div className="bg-white rounded-lg border border-sumi-200 p-6">
          <h3 className="text-lg font-semibold text-sumi-900 mb-4 flex items-center">
            <File className="mr-2 h-5 w-5 text-matsu-600" />
            ファイル情報
          </h3>
          {data.fileName ? (
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-sumi-500">ファイル名</dt>
                <dd className="text-sumi-900">{data.fileName}</dd>
              </div>
              <div>
                <dt className="text-sm text-sumi-500">ファイルサイズ</dt>
                <dd className="text-sumi-900">{formatFileSize(data.fileSize)}</dd>
              </div>
              <div>
                <dt className="text-sm text-sumi-500">MIMEタイプ</dt>
                <dd className="text-sumi-900">{data.mimeType || '-'}</dd>
              </div>
              {data.generatedAt && (
                <div>
                  <dt className="text-sm text-sumi-500">生成日時</dt>
                  <dd className="text-sumi-900">{formatDate(data.generatedAt)}</dd>
                </div>
              )}
              {data.sentAt && (
                <div>
                  <dt className="text-sm text-sumi-500">送付日時</dt>
                  <dd className="text-sumi-900">{formatDate(data.sentAt)}</dd>
                </div>
              )}
            </dl>
          ) : (
            <div className="text-center py-8 text-sumi-500">
              <File className="mx-auto h-12 w-12 text-sumi-300 mb-2" />
              ファイルがアップロードされていません
            </div>
          )}
        </div>

        {/* 関連情報 */}
        <div className="bg-white rounded-lg border border-sumi-200 p-6">
          <h3 className="text-lg font-semibold text-sumi-900 mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-matsu-600" />
            関連情報
          </h3>
          <dl className="space-y-4">
            {data.customer ? (
              <div>
                <dt className="text-sm text-sumi-500">顧客</dt>
                <dd className="text-sumi-900">
                  <div className="font-medium">{data.customer.name}</div>
                  {data.customer.nameKana && (
                    <div className="text-sm text-sumi-500">{data.customer.nameKana}</div>
                  )}
                </dd>
              </div>
            ) : (
              <div className="text-sumi-500">顧客情報なし</div>
            )}
            {data.contractPlot ? (
              <div>
                <dt className="text-sm text-sumi-500 flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  区画
                </dt>
                <dd className="text-sumi-900">
                  {data.contractPlot.physicalPlot.areaName} - {data.contractPlot.physicalPlot.plotNumber}
                </dd>
              </div>
            ) : (
              <div className="text-sumi-500">区画情報なし</div>
            )}
          </dl>
        </div>

        {/* 日時情報 */}
        <div className="bg-white rounded-lg border border-sumi-200 p-6">
          <h3 className="text-lg font-semibold text-sumi-900 mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-matsu-600" />
            日時情報
          </h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-sumi-500">作成日時</dt>
              <dd className="text-sumi-900">{formatDate(data.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm text-sumi-500">更新日時</dt>
              <dd className="text-sumi-900">{formatDate(data.updatedAt)}</dd>
            </div>
            {data.createdBy && (
              <div>
                <dt className="text-sm text-sumi-500">作成者</dt>
                <dd className="text-sumi-900">{data.createdBy}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* テンプレートデータ（デバッグ用、必要に応じて表示） */}
      {data.templateData && Object.keys(data.templateData).length > 0 && (
        <div className="bg-white rounded-lg border border-sumi-200 p-6">
          <h3 className="text-lg font-semibold text-sumi-900 mb-4">テンプレートデータ</h3>
          <pre className="text-sm text-sumi-700 bg-sumi-50 p-4 rounded overflow-x-auto">
            {JSON.stringify(data.templateData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
