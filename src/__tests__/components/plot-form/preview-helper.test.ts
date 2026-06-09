/**
 * previewHelper buildPlotDiffSections の配列差分テスト（#222）
 *
 * 配列差分は index でなく id で突合すること（中間削除・並べ替えで
 * 別レコード同士を比較して誤った差分を表示しない）を保証する。
 */

import { buildPlotDiffSections, buildPlotPreviewSections } from '@/components/plot-form/previewHelper';
import { defaultPlotFormData } from '@/lib/validations/plot-form';
import type { PlotFormData } from '@/lib/validations/plot-form';

type BuriedPerson = NonNullable<PlotFormData['buriedPersons']>[number];

function makeBuriedPerson(overrides: Partial<BuriedPerson>): BuriedPerson {
  return {
    name: '',
    nameKana: null,
    relationship: null,
    birthDate: null,
    deathDate: null,
    gender: null,
    burialDate: null,
    posthumousName: null,
    reportDate: null,
    religion: null,
    deathPlace: null,
    causeOfDeath: null,
    chiefMournerName: null,
    chiefMournerRelationship: null,
    notes: null,
    ...overrides,
  } as BuriedPerson;
}

function makeFormData(buriedPersons: BuriedPerson[]): PlotFormData {
  return {
    ...defaultPlotFormData,
    buriedPersons,
  } as PlotFormData;
}

const personA = makeBuriedPerson({ id: 'bp-1', name: '甲野一郎', deathDate: '2020-01-01' });
const personB = makeBuriedPerson({ id: 'bp-2', name: '乙野二郎', deathDate: '2021-02-02' });
const personC = makeBuriedPerson({ id: 'bp-3', name: '丙野三郎', deathDate: '2022-03-03' });

describe('buildPlotDiffSections 配列差分の id 突合 (#222)', () => {
  it('中間要素の削除は「削除」のみ表示し、後続要素を変更扱いしない', () => {
    const original = makeFormData([personA, personB, personC]);
    // useFieldArray.remove で B を削除 → C が前詰め
    const current = makeFormData([personA, personC]);

    const sections = buildPlotDiffSections(original, current);
    const buriedSections = sections.filter((s) => s.title.startsWith('埋葬者'));

    expect(buriedSections).toHaveLength(1);
    expect(buriedSections[0].title).toBe('埋葬者 2（削除）');
    expect(buriedSections[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: '氏名', before: '乙野二郎', after: '' }),
      ])
    );
  });

  it('並べ替えのみでは差分を出さない', () => {
    const original = makeFormData([personA, personB]);
    const current = makeFormData([personB, personA]);

    const sections = buildPlotDiffSections(original, current);
    expect(sections.filter((s) => s.title.startsWith('埋葬者'))).toHaveLength(0);
  });

  it('id 無しの新規要素は表示位置の連番で「追加」と表示する', () => {
    const newPerson = makeBuriedPerson({ name: '新規四郎' }); // id 無し
    const original = makeFormData([personA]);
    const current = makeFormData([personA, newPerson]);

    const sections = buildPlotDiffSections(original, current);
    const buriedSections = sections.filter((s) => s.title.startsWith('埋葬者'));

    expect(buriedSections).toHaveLength(1);
    expect(buriedSections[0].title).toBe('埋葬者 2（追加）');
    expect(buriedSections[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: '氏名', before: '', after: '新規四郎' }),
      ])
    );
  });

  it('同一 id の内容変更はフィールド差分のみ表示する', () => {
    const changed = { ...personB, name: '乙野次郎' };
    const original = makeFormData([personA, personB]);
    const current = makeFormData([personA, changed]);

    const sections = buildPlotDiffSections(original, current);
    const buriedSections = sections.filter((s) => s.title.startsWith('埋葬者'));

    expect(buriedSections).toHaveLength(1);
    expect(buriedSections[0].title).toBe('埋葬者 2');
    expect(buriedSections[0].items).toEqual([
      { label: '氏名', before: '乙野二郎', after: '乙野次郎' },
    ]);
  });

  it('中間削除と内容変更が同時でも、変更は同一 id 同士で比較される', () => {
    // B を削除しつつ C の名前を変更
    const changedC = { ...personC, name: '丙野参郎' };
    const original = makeFormData([personA, personB, personC]);
    const current = makeFormData([personA, changedC]);

    const sections = buildPlotDiffSections(original, current);
    const buriedSections = sections.filter((s) => s.title.startsWith('埋葬者'));

    // C の変更（current 表示位置 2）と B の削除（original 表示位置 2）
    expect(buriedSections).toHaveLength(2);
    const changeSection = buriedSections.find((s) => s.title === '埋葬者 2');
    expect(changeSection?.items).toEqual([
      { label: '氏名', before: '丙野三郎', after: '丙野参郎' },
    ]);
    const deleteSection = buriedSections.find((s) => s.title === '埋葬者 2（削除）');
    expect(deleteSection?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: '氏名', before: '乙野二郎', after: '' }),
      ])
    );
  });
});

describe('buildPlotPreviewSections 享年0の扱い (#297)', () => {
  it('享年0（旧システムで未記録）は書類プレビューに印字しない', () => {
    const zero = makeBuriedPerson({ id: 'bp-0', name: '零野零', age: 0 } as Partial<BuriedPerson>);
    const sections = buildPlotPreviewSections(makeFormData([zero]));
    const buried = sections.find((s) => s.title === '埋葬者 1');
    expect(buried).toBeDefined();
    expect(buried?.items.some((i) => i.label === '享年')).toBe(false);
  });

  it('享年1以上は書類プレビューに印字する', () => {
    const aged = makeBuriedPerson({ id: 'bp-a', name: '齢野有', age: 82 } as Partial<BuriedPerson>);
    const sections = buildPlotPreviewSections(makeFormData([aged]));
    const buried = sections.find((s) => s.title === '埋葬者 1');
    expect(buried?.items).toEqual(
      expect.arrayContaining([{ label: '享年', value: '82' }]),
    );
  });
});
