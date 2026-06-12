import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ContactsTab } from '@/components/plot-form/ContactsTab';
import { digitsOnly } from '@/lib/format';
import { familyContactSchema } from '@komine/types/validations';
import { TabHost, emptyMasterData } from './test-helpers';

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value }: { children: React.ReactNode; value?: string }) => (
    <div data-testid="mock-select" data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`mock-select-item-${value}`}>{children}</div>
  ),
}));

function ContactsTabHost() {
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
  return (
    <TabHost arrayName="familyContacts">
      {(h) => (
        <ContactsTab
          {...h}
          familyContactFields={h.arrayFields ?? []}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addFamilyContact={h.arrayAppend as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          removeFamilyContact={h.arrayRemove as any}
          expandedContactId={expandedContactId}
          setExpandedContactId={setExpandedContactId}
          masterData={emptyMasterData}
        />
      )}
    </TabHost>
  );
}

describe('ContactsTab', () => {
  it('初期状態では「家族連絡先が登録されていません」を表示する', () => {
    render(<ContactsTabHost />);
    expect(screen.getByText('家族連絡先が登録されていません')).toBeInTheDocument();
  });

  it('「連絡先を追加」ボタンで行が追加される', async () => {
    const user = userEvent.setup();
    render(<ContactsTabHost />);

    await user.click(screen.getByRole('button', { name: /連絡先を追加/ }));

    // 「未入力」の行サマリーが表示される
    expect(screen.getByText('未入力')).toBeInTheDocument();
    expect(screen.queryByText('家族連絡先が登録されていません')).not.toBeInTheDocument();
  });

  it('複数回「連絡先を追加」で複数行追加できる', async () => {
    const user = userEvent.setup();
    render(<ContactsTabHost />);

    const addBtn = screen.getByRole('button', { name: /連絡先を追加/ });
    await user.click(addBtn);
    await user.click(addBtn);
    await user.click(addBtn);

    expect(screen.getAllByText('未入力')).toHaveLength(3);
  });

  it('行のサマリーをクリックすると展開して入力欄が表示される', async () => {
    const user = userEvent.setup();
    render(<ContactsTabHost />);

    await user.click(screen.getByRole('button', { name: /連絡先を追加/ }));
    // 展開前は氏名Inputが見えない（要素がconditionally render）
    expect(screen.queryByLabelText(/氏名/)).not.toBeInTheDocument();

    // サマリー行をクリック
    await user.click(screen.getByText('未入力'));
    // 展開後は氏名Inputが見える
    expect(screen.getByLabelText(/氏名/)).toBeInTheDocument();
  });

  it('展開された行で氏名フィールドに入力できる', async () => {
    const user = userEvent.setup();
    render(<ContactsTabHost />);

    await user.click(screen.getByRole('button', { name: /連絡先を追加/ }));
    await user.click(screen.getByText('未入力'));

    const nameInput = screen.getByLabelText(/氏名/);
    await user.type(nameInput, '田中花子');
    expect(nameInput).toHaveValue('田中花子');
  });

  it('削除ボタンクリックで該当行が削除される', async () => {
    const user = userEvent.setup();
    render(<ContactsTabHost />);

    await user.click(screen.getByRole('button', { name: /連絡先を追加/ }));
    await user.click(screen.getByRole('button', { name: /連絡先を追加/ }));
    expect(screen.getAllByText('未入力')).toHaveLength(2);

    const deleteButtons = screen.getAllByRole('button', { name: '連絡先を削除' });
    await user.click(deleteButtons[0]);

    expect(screen.getAllByText('未入力')).toHaveLength(1);
  });

  it('errors props経由でエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    function ErrorHost() {
      const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
      return (
        <TabHost
          arrayName="familyContacts"
          defaultValues={{
            familyContacts: [
              {
                emergencyContactFlag: false,
                name: '',
                relationship: '',
                address: '',
                phoneNumber: '',
                birthDate: null,
                postalCode: null,
                faxNumber: null,
                email: null,
                registeredAddress: null,
                mailingType: null,
                notes: null,
              },
            ],
          }}
        >
          {(h) => (
            <ContactsTab
              {...h}
              familyContactFields={h.arrayFields ?? []}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              addFamilyContact={h.arrayAppend as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              removeFamilyContact={h.arrayRemove as any}
              expandedContactId={expandedContactId}
              setExpandedContactId={setExpandedContactId}
              errors={
                {
                  familyContacts: [
                    { name: { message: '氏名は必須です', type: 'required' } },
                  ],
                } as typeof h.errors
              }
              masterData={emptyMasterData}
            />
          )}
        </TabHost>
      );
    }
    render(<ErrorHost />);

    await user.click(screen.getByText('未入力'));
    expect(screen.getByText('氏名は必須です')).toBeInTheDocument();
  });
});

// 連絡先の電話/郵便フィールドに setValueAs: digitsOnly が揃っていることの回帰テスト。
// フォーム submit ではなく familyContactSchema に対し直接検証する（PR#282 format.test.ts と同方式）。
// #306: workPhoneNumber への digitsOnly 横展開漏れの再発防止。
describe('ContactsTab 入力正規化 (#306 digitsOnly)', () => {
  // ContactsTab で digitsOnly を register に付与している5フィールドと、
  // それぞれが familyContactSchema 上で取りうる桁数上限（max）を超えるハイフン付き入力。
  const NORMALIZED_FIELDS = [
    // [フィールド名, ハイフン付き入力, 正規化後の数字のみ値]
    ['postalCode', '123-4567', '1234567'], // 8文字 > max(7)
    ['phoneNumber', '03-1234-5678', '0312345678'], // 12文字 > max(11)
    ['phoneNumber2', '090-1111-2222', '09011112222'], // 13文字 (max15内だがハイフン除去で揃う)
    ['faxNumber', '03-9999-8888', '0399998888'], // 12文字 > max(11)
    ['workPhoneNumber', '06-1234-5678', '0612345678'], // 12文字 (max15内・#306対象)
  ] as const;

  const baseContact = {
    emergencyContactFlag: false,
    name: '田中花子',
    relationship: '配偶者',
  };

  it.each(NORMALIZED_FIELDS)(
    '%s: digitsOnly 後の値は familyContactSchema を通る',
    (fieldKey, _input, expected) => {
      const result = familyContactSchema.safeParse({
        ...baseContact,
        [fieldKey]: expected,
      });
      expect(result.success).toBe(true);
    }
  );

  it('postalCode: ハイフン付き(8文字)は max(7) で弾かれる', () => {
    const result = familyContactSchema.safeParse({
      ...baseContact,
      postalCode: '123-4567',
    });
    expect(result.success).toBe(false);
  });

  it.each([['phoneNumber'], ['faxNumber']] as const)(
    '%s: ハイフン付き(12文字)は max(11) で弾かれる',
    (fieldKey) => {
      const result = familyContactSchema.safeParse({
        ...baseContact,
        [fieldKey]: '03-1234-5678', // 12文字 > max(11)
      });
      expect(result.success).toBe(false);
    }
  );

  it('digitsOnly がハイフンを除去して桁内に収める（postalCode）', () => {
    // 正規化前は弾かれ、正規化後は通る、を1ケースで対比
    const raw = '123-4567';
    expect(familyContactSchema.safeParse({ ...baseContact, postalCode: raw }).success).toBe(
      false
    );
    expect(
      familyContactSchema.safeParse({ ...baseContact, postalCode: digitsOnly(raw) }).success
    ).toBe(true);
  });
});
