import { formatYuchoAccount } from '@/components/yucho/YuchoManagement';
import type { YuchoBillingItem, YuchoBillingInfo } from '@/lib/api/yucho';

// #305: ゆうちょプレビューの「記号・番号」表示が CSV 出力と乖離しないことの回帰テスト。
// backend#367 で CSV は記号番号(yuchoSymbol/yuchoNumber)を正準ソース化したため、
// プレビューも記号番号を優先し、無いときだけ従来の支店名推定にフォールバックする。

function makeItem(info: Partial<YuchoBillingInfo> | null): YuchoBillingItem {
  return {
    category: 'management',
    sourceId: 'src-1',
    contractPlotId: 'cp-1',
    plotNumber: 'A-001',
    displayNumber: null,
    areaName: '第1期',
    contractDate: '2024-01-15',
    customerId: 'cust-1',
    customerName: '田中太郎',
    customerNameKana: 'タナカタロウ',
    billingAmount: 5000,
    billingStatus: 'unpaid',
    scheduledDate: null,
    billingMonth: 3,
    billingInfo:
      info === null
        ? null
        : {
            bankName: null,
            branchName: null,
            accountType: null,
            accountNumber: null,
            accountHolder: null,
            yuchoSymbol: null,
            yuchoNumber: null,
            ...info,
          },
  };
}

describe('formatYuchoAccount (#305)', () => {
  it('記号番号があれば「記号-番号」を優先表示する（CSVと同一ソース）', () => {
    const item = makeItem({ yuchoSymbol: '11280', yuchoNumber: '1234567' });
    expect(formatYuchoAccount(item)).toBe('11280-1234567');
  });

  it('記号番号があれば、口座(branch/account)未登録でも表示する（#170運用: 記号番号のみ登録）', () => {
    const item = makeItem({
      yuchoSymbol: '10180',
      yuchoNumber: '9876543',
      branchName: null,
      accountNumber: null,
    });
    // 従来は「—」になり口座未登録に見えていた行が、記号番号で正しく表示される
    expect(formatYuchoAccount(item)).toBe('10180-9876543');
  });

  it('記号番号が漢数字混じり等の非数字を含んでも数字のみ抽出して表示する', () => {
    const item = makeItem({ yuchoSymbol: '〇一八店 11280', yuchoNumber: '1234567' });
    expect(formatYuchoAccount(item)).toBe('11280-1234567');
  });

  it('記号番号が無い場合は従来の支店名推定にフォールバックする', () => {
    const item = makeItem({ branchName: '128', accountNumber: '1234567' });
    expect(formatYuchoAccount(item)).toBe('11280-1234567');
  });

  it('記号のみ・番号欠落のときはフォールバックする（片方欠けは記号番号扱いにしない）', () => {
    const item = makeItem({ yuchoSymbol: '11280', yuchoNumber: null, branchName: '128' });
    // 番号が無いので記号番号は使えず、支店名推定で記号のみ表示
    expect(formatYuchoAccount(item)).toBe('11280');
  });

  it('billingInfo が null のときは「—」', () => {
    expect(formatYuchoAccount(makeItem(null))).toBe('—');
  });

  it('記号番号も口座情報も無いときは「—」', () => {
    expect(formatYuchoAccount(makeItem({}))).toBe('—');
  });
});
