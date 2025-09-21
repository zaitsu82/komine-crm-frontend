'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDateWithEra } from '@/lib/utils';

// 合祀データの型定義
interface CollectiveBurialRecord {
  id: string;
  burialDate: Date;
  burialType: '家族合祀' | '親族合祀' | '一般合祀' | '永代供養合祀';
  plotNumber: string;
  plotSection: string;
  deceasedList: {
    id: string;
    name: string;
    deathDate: Date;
    age: number;
    previousPlotNumber?: string;
    transferDate?: Date;
    relationship?: string;
  }[];
  ceremonyInfo: {
    priest: string;
    sect: string;
    attendees: number;
    specialRequests?: string;
  };
  documents: {
    type: '改葬許可証' | '合祀同意書' | '死亡証明書' | '火葬許可証';
    number: string;
    issueDate: Date;
    issuedBy: string;
  }[];
  fees: {
    burialFee: number;
    ceremonyFee: number;
    maintenanceFee: number;
    totalFee: number;
    paymentStatus: '未払い' | '一部支払い済み' | '支払い済み';
    paymentDate?: Date;
  };
  notes?: string;
  registeredBy: string;
  registeredDate: Date;
  lastUpdated: Date;
}

// デモデータ
const demoCollectiveBurials: CollectiveBurialRecord[] = [
  {
    id: 'CB001',
    burialDate: new Date('2024-03-20'),
    burialType: '家族合祀',
    plotNumber: 'A-123',
    plotSection: '東区画',
    deceasedList: [
      {
        id: 'D001',
        name: '田中太郎',
        deathDate: new Date('2023-12-01'),
        age: 85,
        previousPlotNumber: 'B-456',
        transferDate: new Date('2024-03-20'),
        relationship: '父'
      },
      {
        id: 'D002',
        name: '田中花子',
        deathDate: new Date('2024-01-15'),
        age: 82,
        previousPlotNumber: 'B-456',
        transferDate: new Date('2024-03-20'),
        relationship: '母'
      }
    ],
    ceremonyInfo: {
      priest: '山田宗純',
      sect: '浄土宗',
      attendees: 15,
      specialRequests: '家族のみでの法要を希望'
    },
    documents: [
      {
        type: '改葬許可証',
        number: 'R6-123',
        issueDate: new Date('2024-03-01'),
        issuedBy: '〇〇市役所'
      },
      {
        type: '合祀同意書',
        number: 'GD-2024-001',
        issueDate: new Date('2024-02-20'),
        issuedBy: '田中家'
      }
    ],
    fees: {
      burialFee: 100000,
      ceremonyFee: 50000,
      maintenanceFee: 30000,
      totalFee: 180000,
      paymentStatus: '支払い済み',
      paymentDate: new Date('2024-03-15')
    },
    notes: '令和6年春彼岸に合わせて実施',
    registeredBy: '管理者A',
    registeredDate: new Date('2024-02-01'),
    lastUpdated: new Date('2024-03-20')
  },
  {
    id: 'CB002',
    burialDate: new Date('2024-08-13'),
    burialType: '永代供養合祀',
    plotNumber: 'C-789',
    plotSection: '永代供養区',
    deceasedList: [
      {
        id: 'D003',
        name: '佐藤次郎',
        deathDate: new Date('2024-07-01'),
        age: 78,
        relationship: '施主'
      }
    ],
    ceremonyInfo: {
      priest: '鈴木道明',
      sect: '真言宗',
      attendees: 8,
      specialRequests: 'お盆の初盆法要と併せて実施'
    },
    documents: [
      {
        type: '火葬許可証',
        number: 'K-2024-456',
        issueDate: new Date('2024-07-02'),
        issuedBy: '〇〇市斎場'
      },
      {
        type: '死亡証明書',
        number: 'D-2024-789',
        issueDate: new Date('2024-07-01'),
        issuedBy: '〇〇病院'
      }
    ],
    fees: {
      burialFee: 150000,
      ceremonyFee: 80000,
      maintenanceFee: 50000,
      totalFee: 280000,
      paymentStatus: '支払い済み',
      paymentDate: new Date('2024-08-10')
    },
    notes: '永代供養墓への合祀',
    registeredBy: '管理者B',
    registeredDate: new Date('2024-07-15'),
    lastUpdated: new Date('2024-08-13')
  }
];

export default function CollectiveBurialManagement() {
  const [selectedBurial, setSelectedBurial] = useState<CollectiveBurialRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'register'>('list');
  const [editMode, setEditMode] = useState(false);

  const filteredBurials = demoCollectiveBurials.filter(burial => 
    burial.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    burial.deceasedList.some(d => d.name.includes(searchTerm)) ||
    burial.burialType.includes(searchTerm)
  );

  const handleSelectBurial = (burial: CollectiveBurialRecord) => {
    setSelectedBurial(burial);
    setCurrentView('detail');
  };

  const handleNewRegistration = () => {
    setSelectedBurial(null);
    setCurrentView('register');
    setEditMode(true);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedBurial(null);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* アクセシブルヘッダー - 高齢者向け改善 */}
      <header role="banner" className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-3 tracking-wide">合祀管理システム</h1>
          <p className="text-purple-100 text-lg leading-relaxed">
            ご家族様が一緒にお眠りいただける合祀のお手続き管理
          </p>
          {/* アクセシビリティ情報 */}
          <div className="sr-only">
            このページでは、合祀の申し込み、記録の確認、関連書類の管理ができます。
            キーボードのTabキーで項目を移動できます。
          </div>
        </div>
      </header>

      <main role="main" className="container mx-auto p-8">
        {currentView === 'list' && (
          <>
            {/* 高齢者向け検索・新規登録エリア */}
            <Card className="mb-8 shadow-lg border-2">
              <CardHeader className="bg-blue-50 pb-6">
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                  🔍 合祀記録を探す
                </CardTitle>
                <p className="text-gray-600 text-lg">
                  墓所番号、ご家族のお名前、合祀の種類で検索できます
                </p>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="space-y-6">
                  {/* 検索フィールド - 高齢者向け改善 */}
                  <div>
                    <Label htmlFor="search-input" className="text-lg font-semibold mb-3 block">
                      検索キーワード
                    </Label>
                    <Input
                      id="search-input"
                      placeholder="例：A-123、田中太郎、家族合祀"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-xl h-14 border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      aria-describedby="search-help"
                    />
                    <p id="search-help" className="text-gray-600 mt-2 text-base">
                      墓所番号（A-123）、故人様のお名前、合祀の種類（家族合祀など）で検索できます
                    </p>
                  </div>
                  
                  {/* アクション - 大きなボタンに改善 */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      onClick={handleNewRegistration}
                      className="bg-purple-600 hover:bg-purple-700 text-xl h-16 px-8 font-semibold shadow-lg"
                      aria-label="新しい合祀の申し込みを登録する"
                    >
                      ➕ 新しい合祀申し込み
                    </Button>
                    
                    {/* 絞り込みボタン（将来の拡張用） */}
                    <Button 
                      variant="outline"
                      className="text-lg h-16 px-6 border-2 border-gray-300"
                      aria-label="詳細な条件で絞り込み検索"
                    >
                      🔧 詳細検索
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 遺族に配慮した合祀記録一覧 */}
            <Card className="shadow-lg">
              <CardHeader className="bg-green-50 pb-6">
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                  📋 合祀記録一覧
                </CardTitle>
                <CardDescription className="text-lg text-gray-700">
                  {filteredBurials.length > 0 
                    ? `${filteredBurials.length}件の合祀記録が見つかりました` 
                    : '該当する記録が見つかりません'}
                </CardDescription>
                {searchTerm && (
                  <p className="text-base text-blue-600 mt-2">
                    「{searchTerm}」での検索結果
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {filteredBurials.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-xl text-gray-600 mb-4">該当する記録が見つかりません</p>
                    <p className="text-gray-500">検索条件を変更してお試しください</p>
                  </div>
                ) : (
                  <div className="space-y-6" role="list" aria-label="合祀記録一覧">
                    {filteredBurials.map((burial) => (
                      <Card 
                        key={burial.id}
                        role="listitem"
                        tabIndex={0}
                        className="cursor-pointer hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        onClick={() => handleSelectBurial(burial)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectBurial(burial);
                          }
                        }}
                        aria-label={`合祀記録：${burial.deceasedList.map(d => d.name).join('、')}様 ${formatDateWithEra(burial.burialDate)} ${burial.burialType}`}
                      >
                        <CardContent className="p-6">
                          {/* モバイル対応のレスポンシブグリッド */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex flex-col">
                              <span className="text-base text-gray-600 font-medium mb-2">ご安置日</span>
                              <span className="text-lg font-semibold text-gray-800">
                                {formatDateWithEra(burial.burialDate)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base text-gray-600 font-medium mb-2">墓所番号</span>
                              <span className="text-lg font-semibold text-purple-700">
                                {burial.plotNumber}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base text-gray-600 font-medium mb-2">ご安置の形</span>
                              <span className="text-lg font-semibold text-green-700">
                                {burial.burialType}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base text-gray-600 font-medium mb-2">ご一緒の方々</span>
                              <span className="text-lg font-semibold text-gray-800">
                                {burial.deceasedList.length}名様
                              </span>
                            </div>
                          </div>
                          
                          {/* 故人名リスト - 心理的配慮 */}
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-base text-gray-600 mb-2 font-medium">
                              ご安置されている方々：
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {burial.deceasedList.map((deceased, index) => (
                                <span 
                                  key={deceased.id}
                                  className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-base font-medium"
                                >
                                  {deceased.name}様
                                  {deceased.relationship && (
                                    <span className="text-blue-600 ml-1">
                                      ({deceased.relationship})
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* アクセシビリティ情報 */}
                          <div className="sr-only">
                            詳細を確認するには、このカードをクリックまたはエンターキーを押してください。
                            宗派：{burial.ceremonyInfo.sect}、
                            参列者：{burial.ceremonyInfo.attendees}名
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {currentView === 'detail' && selectedBurial && (
          <>
            {/* アクセシブルな詳細画面ナビゲーション */}
            <nav aria-label="詳細画面操作" className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white rounded-lg shadow-lg border-2">
                {/* 戻るボタン - 高齢者向け改善 */}
                <Button 
                  variant="outline" 
                  onClick={handleBackToList}
                  className="text-lg h-12 px-6 border-2 border-gray-400 hover:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  aria-label="合祀記録一覧に戻る"
                >
                  ⬅️ 一覧に戻る
                </Button>
                
                {/* 操作ボタン群 */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!editMode && (
                    <Button 
                      onClick={() => setEditMode(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-lg h-12 px-6 font-semibold"
                      aria-label="この記録を編集する"
                    >
                      ✏️ 内容を編集
                    </Button>
                  )}
                  {editMode && (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => setEditMode(false)}
                        className="text-lg h-12 px-6 border-2 border-gray-400"
                        aria-label="編集をキャンセルして元に戻す"
                      >
                        ❌ 編集キャンセル
                      </Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-lg h-12 px-6 font-semibold"
                        onClick={() => {
                          setEditMode(false);
                          alert('変更内容を保存しました');
                        }}
                        aria-label="編集内容を保存する"
                      >
                        💾 変更を保存
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* 現在の状態表示 */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-lg text-blue-800">
                  {editMode ? 
                    '📝 編集モード：内容を変更できます' : 
                    '👁️ 閲覧モード：内容を確認できます'
                  }
                </p>
                <p className="text-blue-600 mt-1">
                  現在表示中：{selectedBurial.deceasedList.map(d => d.name).join('、')}様の合祀記録
                </p>
              </div>
            </nav>

            <Tabs defaultValue="basic" className="w-full">
              {/* 高齢者対応・アクセシブルタブナビゲーション */}
              <TabsList 
                className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto gap-2 bg-gray-100 p-2 rounded-xl"
                role="tablist"
                aria-label="合祀記録の詳細情報タブ"
              >
                <TabsTrigger 
                  value="basic" 
                  className="text-lg py-4 px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold rounded-lg"
                  aria-label="基本的な合祀情報を表示"
                >
                  📋 基本情報
                </TabsTrigger>
                <TabsTrigger 
                  value="deceased" 
                  className="text-lg py-4 px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold rounded-lg"
                  aria-label="故人様の詳細情報を表示"
                >
                  👥 故人様
                </TabsTrigger>
                <TabsTrigger 
                  value="ceremony" 
                  className="text-lg py-4 px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold rounded-lg"
                  aria-label="法要・儀式の情報を表示"
                >
                  🙏 法要
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  className="text-lg py-4 px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold rounded-lg"
                  aria-label="関連書類の情報を表示"
                >
                  📄 書類
                </TabsTrigger>
                <TabsTrigger 
                  value="fees" 
                  className="text-lg py-4 px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold rounded-lg"
                  aria-label="料金情報を表示"
                >
                  💰 料金
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <Card>
                  <CardHeader className="bg-purple-50">
                    <CardTitle>合祀基本情報</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label>合祀ID</Label>
                        <Input 
                          value={selectedBurial.id} 
                          disabled 
                          className="bg-gray-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="burial-type" className="text-lg font-semibold mb-2 block">
                          合祀の種類
                        </Label>
                        {editMode ? (
                          <Select defaultValue={selectedBurial.burialType}>
                            <SelectTrigger 
                              id="burial-type"
                              className="h-12 text-lg border-2 focus:border-purple-500"
                              aria-label="合祀の種類を選択"
                            >
                              <SelectValue placeholder="合祀の種類を選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="家族合祀" className="text-lg py-3">
                                🏠 家族合祀（ご家族での合祀）
                              </SelectItem>
                              <SelectItem value="親族合祀" className="text-lg py-3">
                                👨‍👩‍👧‍👦 親族合祀（ご親族での合祀）
                              </SelectItem>
                              <SelectItem value="一般合祀" className="text-lg py-3">
                                🤝 一般合祀（その他の方との合祀）
                              </SelectItem>
                              <SelectItem value="永代供養合祀" className="text-lg py-3">
                                🙏 永代供養合祀（永代にわたる供養）
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input 
                            value={selectedBurial.burialType} 
                            disabled 
                            className="bg-yellow-50 h-12 text-lg"
                          />
                        )}
                      </div>
                      <div>
                        <Label>合祀実施日</Label>
                        <Input 
                          value={formatDateWithEra(selectedBurial.burialDate)} 
                          disabled={!editMode}
                          className={editMode ? "" : "bg-yellow-50"}
                        />
                      </div>
                      <div>
                        <Label>墓所番号</Label>
                        <Input 
                          value={selectedBurial.plotNumber} 
                          disabled={!editMode}
                          className={editMode ? "" : "bg-yellow-50"}
                        />
                      </div>
                      <div>
                        <Label>区画</Label>
                        <Input 
                          value={selectedBurial.plotSection} 
                          disabled={!editMode}
                          className={editMode ? "" : "bg-yellow-50"}
                        />
                      </div>
                      <div>
                        <Label>登録者</Label>
                        <Input 
                          value={selectedBurial.registeredBy} 
                          disabled 
                          className="bg-gray-100"
                        />
                      </div>
                    </div>
                    {selectedBurial.notes && (
                      <div className="mt-6">
                        <Label>備考</Label>
                        <textarea 
                          className={`w-full p-2 border rounded ${editMode ? "" : "bg-yellow-50"}`}
                          rows={3}
                          value={selectedBurial.notes}
                          disabled={!editMode}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deceased">
                <Card>
                  <CardHeader className="bg-indigo-50">
                    <CardTitle>合祀対象者一覧</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {selectedBurial.deceasedList.map((deceased, index) => (
                        <Card key={deceased.id} className="border-l-4 border-indigo-500">
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>故人名</Label>
                                <Input 
                                  value={deceased.name} 
                                  disabled={!editMode}
                                  className={editMode ? "" : "bg-yellow-50"}
                                />
                              </div>
                              <div>
                                <Label>死亡日</Label>
                                <Input 
                                  value={formatDateWithEra(deceased.deathDate)} 
                                  disabled={!editMode}
                                  className={editMode ? "" : "bg-yellow-50"}
                                />
                              </div>
                              <div>
                                <Label>享年</Label>
                                <Input 
                                  value={`${deceased.age}歳`} 
                                  disabled={!editMode}
                                  className={editMode ? "" : "bg-yellow-50"}
                                />
                              </div>
                              {deceased.previousPlotNumber && (
                                <>
                                  <div>
                                    <Label>移転元墓所</Label>
                                    <Input 
                                      value={deceased.previousPlotNumber} 
                                      disabled={!editMode}
                                      className={editMode ? "" : "bg-yellow-50"}
                                    />
                                  </div>
                                  <div>
                                    <Label>移転日</Label>
                                    <Input 
                                      value={deceased.transferDate ? formatDateWithEra(deceased.transferDate) : ''} 
                                      disabled={!editMode}
                                      className={editMode ? "" : "bg-yellow-50"}
                                    />
                                  </div>
                                </>
                              )}
                              {deceased.relationship && (
                                <div>
                                  <Label>続柄</Label>
                                  <Input 
                                    value={deceased.relationship} 
                                    disabled={!editMode}
                                    className={editMode ? "" : "bg-yellow-50"}
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {editMode && (
                        <Button variant="outline" className="w-full">
                          + 故人を追加
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ceremony">
                <Card>
                  <CardHeader className="bg-green-50">
                    <CardTitle>法要・儀式情報</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label>導師名</Label>
                        <Input 
                          value={selectedBurial.ceremonyInfo.priest} 
                          disabled={!editMode}
                          className={editMode ? "" : "bg-yellow-50"}
                        />
                      </div>
                      <div>
                        <Label>宗派</Label>
                        {editMode ? (
                          <select className="w-full p-2 border rounded">
                            <option value={selectedBurial.ceremonyInfo.sect}>{selectedBurial.ceremonyInfo.sect}</option>
                            <option value="浄土宗">浄土宗</option>
                            <option value="浄土真宗">浄土真宗</option>
                            <option value="真言宗">真言宗</option>
                            <option value="天台宗">天台宗</option>
                            <option value="臨済宗">臨済宗</option>
                            <option value="曹洞宗">曹洞宗</option>
                            <option value="日蓮宗">日蓮宗</option>
                            <option value="その他">その他</option>
                          </select>
                        ) : (
                          <Input 
                            value={selectedBurial.ceremonyInfo.sect} 
                            disabled 
                            className="bg-yellow-50"
                          />
                        )}
                      </div>
                      <div>
                        <Label>参列者数</Label>
                        <Input 
                          value={`${selectedBurial.ceremonyInfo.attendees}名`} 
                          disabled={!editMode}
                          className={editMode ? "" : "bg-yellow-50"}
                        />
                      </div>
                      <div>
                        <Label>特別要望</Label>
                        <Input 
                          value={selectedBurial.ceremonyInfo.specialRequests || 'なし'} 
                          disabled={!editMode}
                          className={editMode ? "" : "bg-yellow-50"}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader className="bg-blue-50">
                    <CardTitle>関連書類管理</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {selectedBurial.documents.map((doc, index) => (
                        <Card key={index} className="border-l-4 border-blue-500">
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>書類種別</Label>
                                <Input 
                                  value={doc.type} 
                                  disabled={!editMode}
                                  className={editMode ? "" : "bg-yellow-50"}
                                />
                              </div>
                              <div>
                                <Label>書類番号</Label>
                                <Input 
                                  value={doc.number} 
                                  disabled={!editMode}
                                  className={editMode ? "" : "bg-yellow-50"}
                                />
                              </div>
                              <div>
                                <Label>発行日</Label>
                                <Input 
                                  value={formatDateWithEra(doc.issueDate)} 
                                  disabled={!editMode}
                                  className={editMode ? "" : "bg-yellow-50"}
                                />
                              </div>
                              <div>
                                <Label>発行元</Label>
                                <Input 
                                  value={doc.issuedBy} 
                                  disabled={!editMode}
                                  className={editMode ? "" : "bg-yellow-50"}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {editMode && (
                        <Button variant="outline" className="w-full">
                          + 書類を追加
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fees">
                <Card>
                  <CardHeader className="bg-orange-50">
                    <CardTitle>料金情報</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label>合祀料</Label>
                        <Input 
                          value={`¥${selectedBurial.fees.burialFee.toLocaleString()}`} 
                          disabled={!editMode}
                          className={editMode ? "" : "bg-yellow-50"}
                        />
                      </div>
                      <div>
                        <Label>法要料</Label>
                        <Input 
                          value={`¥${selectedBurial.fees.ceremonyFee.toLocaleString()}`} 
                          disabled={!editMode}
                          className={editMode ? "" : "bg-yellow-50"}
                        />
                      </div>
                      <div>
                        <Label>管理料</Label>
                        <Input 
                          value={`¥${selectedBurial.fees.maintenanceFee.toLocaleString()}`} 
                          disabled={!editMode}
                          className={editMode ? "" : "bg-yellow-50"}
                        />
                      </div>
                      <div>
                        <Label>合計金額</Label>
                        <Input 
                          value={`¥${selectedBurial.fees.totalFee.toLocaleString()}`} 
                          disabled 
                          className="bg-gray-100 font-bold text-lg"
                        />
                      </div>
                      <div>
                        <Label>支払い状況</Label>
                        {editMode ? (
                          <select className="w-full p-2 border rounded">
                            <option value={selectedBurial.fees.paymentStatus}>{selectedBurial.fees.paymentStatus}</option>
                            <option value="未払い">未払い</option>
                            <option value="一部支払い済み">一部支払い済み</option>
                            <option value="支払い済み">支払い済み</option>
                          </select>
                        ) : (
                          <Input 
                            value={selectedBurial.fees.paymentStatus} 
                            disabled 
                            className={`font-semibold ${
                              selectedBurial.fees.paymentStatus === '支払い済み' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          />
                        )}
                      </div>
                      {selectedBurial.fees.paymentDate && (
                        <div>
                          <Label>支払い日</Label>
                          <Input 
                            value={formatDateWithEra(selectedBurial.fees.paymentDate)} 
                            disabled={!editMode}
                            className={editMode ? "" : "bg-yellow-50"}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {currentView === 'register' && (
          <>
            {/* 高齢者向け新規登録フォーム */}
            <nav aria-label="新規登録画面操作" className="mb-8">
              <Button 
                variant="outline" 
                onClick={handleBackToList}
                className="text-lg h-12 px-6 border-2 border-gray-400 hover:border-gray-600"
                aria-label="新規登録をキャンセルして一覧に戻る"
              >
                ⬅️ 新規登録をキャンセル
              </Button>
            </nav>
            
            <Card className="shadow-xl border-2">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white pb-8">
                <CardTitle className="text-3xl font-bold mb-3">
                  ➕ 新しい合祀のお申し込み
                </CardTitle>
                <CardDescription className="text-purple-100 text-lg leading-relaxed">
                  ご家族様が一緒にお眠りいただく合祀のお手続きを登録いたします。<br/>
                  分からないことがございましたら、いつでもお声がけください。
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form className="space-y-10" role="form" aria-label="合祀申し込みフォーム">
                  {/* 進行状況表示 */}
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-blue-800 mb-2">
                      📝 記入手順
                    </h3>
                    <ol className="text-blue-700 text-lg space-y-1">
                      <li>1. 合祀の種類と実施日を選択</li>
                      <li>2. 墓所の場所を入力</li>
                      <li>3. 故人様の情報を追加</li>
                      <li>4. 内容を確認して登録</li>
                    </ol>
                  </div>

                  {/* 基本情報セクション */}
                  <fieldset className="border-2 border-gray-200 rounded-xl p-8">
                    <legend className="text-2xl font-bold text-gray-800 px-4 mb-6">
                      📋 基本情報
                    </legend>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <Label htmlFor="new-burial-type" className="text-lg font-semibold mb-3 block">
                          合祀の種類 <span className="text-red-600">*</span>
                        </Label>
                        <Select required>
                          <SelectTrigger 
                            id="new-burial-type"
                            className="h-14 text-lg border-2 focus:border-purple-500"
                            aria-describedby="burial-type-help"
                          >
                            <SelectValue placeholder="どのような合祀をご希望ですか？" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="家族合祀" className="text-lg py-4">
                              🏠 家族合祀（ご家族での合祀）
                            </SelectItem>
                            <SelectItem value="親族合祀" className="text-lg py-4">
                              👨‍👩‍👧‍👦 親族合祀（ご親族での合祀）
                            </SelectItem>
                            <SelectItem value="一般合祀" className="text-lg py-4">
                              🤝 一般合祀（その他の方との合祀）
                            </SelectItem>
                            <SelectItem value="永代供養合祀" className="text-lg py-4">
                              🙏 永代供養合祀（永代にわたる供養）
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p id="burial-type-help" className="text-gray-600 mt-2 text-base">
                          ご希望に合った合祀の形をお選びください
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="new-burial-date" className="text-lg font-semibold mb-3 block">
                          ご安置予定日 <span className="text-red-600">*</span>
                        </Label>
                        <Input 
                          id="new-burial-date"
                          type="date" 
                          required
                          className="h-14 text-lg border-2 focus:border-purple-500"
                          aria-describedby="burial-date-help"
                        />
                        <p id="burial-date-help" className="text-gray-600 mt-2 text-base">
                          合祀を予定されている日をお選びください
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="new-plot-number" className="text-lg font-semibold mb-3 block">
                          墓所番号 <span className="text-red-600">*</span>
                        </Label>
                        <Input 
                          id="new-plot-number"
                          placeholder="例：A-123"
                          required
                          className="h-14 text-lg border-2 focus:border-purple-500"
                          aria-describedby="plot-number-help"
                        />
                        <p id="plot-number-help" className="text-gray-600 mt-2 text-base">
                          墓所番号をご記入ください（例：A-123）
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="new-section" className="text-lg font-semibold mb-3 block">
                          区画名 <span className="text-red-600">*</span>
                        </Label>
                        <Input 
                          id="new-section"
                          placeholder="例：東区画、永代供養区"
                          required
                          className="h-14 text-lg border-2 focus:border-purple-500"
                          aria-describedby="section-help"
                        />
                        <p id="section-help" className="text-gray-600 mt-2 text-base">
                          区画の名前をご記入ください（例：東区画）
                        </p>
                      </div>
                    </div>
                  </fieldset>
                  
                  {/* 故人情報セクション */}
                  <fieldset className="border-2 border-gray-200 rounded-xl p-8">
                    <legend className="text-2xl font-bold text-gray-800 px-4 mb-6">
                      👥 故人様の情報
                    </legend>
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">👥</div>
                      <p className="text-xl text-gray-600 mb-6">
                        こちらで故人様の情報を追加できます
                      </p>
                      <Button 
                        type="button"
                        variant="outline" 
                        className="text-xl h-16 px-8 border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                        aria-label="故人様の情報を追加"
                      >
                        ➕ 故人様を追加
                      </Button>
                    </div>
                  </fieldset>

                  {/* 提出ボタン */}
                  <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8 border-t-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleBackToList}
                      className="text-xl h-16 px-8 border-2 border-gray-400"
                      aria-label="新規登録をキャンセル"
                    >
                      ❌ キャンセル
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-xl h-16 px-12 font-bold shadow-lg"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('新しい合祀のお申し込みを受け付けました');
                        handleBackToList();
                      }}
                      aria-label="合祀の申し込みを登録"
                    >
                      📝 お申し込みを登録
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}