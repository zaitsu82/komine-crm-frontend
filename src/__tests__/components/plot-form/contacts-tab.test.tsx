import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ContactsTab } from '@/components/plot-form/ContactsTab';
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
