# 顧客管理・合祀管理・区画管理の統合ガイド

## データ一元管理の方針

すべての情報は**顧客データ（Customer型）を中心**に一元管理されます。

## データ構造

### 顧客データ（Customer）が保持する情報

```typescript
Customer {
  // 基本情報
  customerCode: string
  name: string
  address: string
  ...

  // 区画情報（統合済み）
  plotInfo: {
    plotNumber: string
    section: string
    usage: 'in_use' | 'available' | 'reserved'
    size: string
    price: string
    contractDate: Date
  }

  // 合祀情報（配列で複数管理）
  collectiveBurialInfo: [{
    id: string  // 合祀申込ID
    type: 'family' | 'relative' | 'other'
    persons: [{  // 合祀故人一覧
      name: string
      deathDate: Date
      relationship: string
      ...
    }]
    ceremonies: [{  // 法要情報
      date: Date
      officiant: string
      ...
    }]
    status: 'planned' | 'completed' | 'cancelled'
    ...
  }]
}
```

## データフローの概要

### 1. 合祀申込の流れ

```
合祀申込フォーム入力
  ↓
区画番号で顧客を自動検索
  ↓
合祀申込データ作成
  ↓
【自動】顧客の collectiveBurialInfo に追加
  ↓
顧客データが更新される
```

### 2. データ参照の流れ

```
顧客管理画面
  ↓
顧客詳細 → 合祀タブ
  ↓
顧客の collectiveBurialInfo を表示
  （合祀一覧と同じデータ）
```

```
合祀一覧画面
  ↓
全顧客の collectiveBurialInfo を集約
  ↓
合祀申込一覧として表示
```

## 主要な統合機能

### 1. 自動連携機能

**実装済み**: `customer-collective-burial-integration.ts`

- `integrateCollectiveBurialToCustomer()`: 合祀申込を顧客データに統合
- `getTotalCollectiveBurialPersons()`: 全顧客の合祀人数を集計
- `getCustomerCollectiveBurialPersonsCount()`: 顧客ごとの合祀人数

### 2. 人数管理

- **合祀申込時**: 全顧客の合祀人数を自動集計して上限チェック
- **顧客詳細**: その顧客の合祀人数を表示
- **合祀一覧**: 全体の収容状況を表示

### 3. データ整合性の保証

```typescript
// 合祀申込作成時に自動で顧客データに統合
createCollectiveBurialApplication(data)
  ↓
integrateCollectiveBurialToCustomer(application)
  ↓
顧客の collectiveBurialInfo[] に追加
```

## 今後の拡張

### 区画管理との統合

区画情報も顧客の `plotInfo` に既に統合されています：

```
区画管理画面
  ↓
顧客の plotInfo を参照
  ↓
空き区画 / 使用中区画を表示
```

### 履歴管理

すべての変更は顧客データの `updatedAt` で追跡されます。

## 注意事項

1. **合祀申込は必ず区画情報と紐付ける**
   - 区画番号が必須
   - 顧客が見つからない場合は警告

2. **データの二重管理を避ける**
   - 合祀情報は顧客データに統合済み
   - 合祀一覧は顧客データから生成

3. **人数集計は常に顧客データから**
   - `getTotalCollectiveBurialPersons()` を使用
   - キャンセル分は除外して集計
