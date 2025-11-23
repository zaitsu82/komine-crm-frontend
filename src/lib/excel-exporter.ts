import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Customer } from '@/types/customer';
import { formatDateWithEra } from '@/lib/utils';

/**
 * Export Invoice to Excel with Professional Design
 */
export const exportInvoiceToExcel = async (customer: Customer) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('御請求書');

    // Set column widths for a clean A4 layout
    // A: Margin, B: Label/No, C: Content/Item, D: Qty, E: Unit, F: Price, G: Amount, H: Margin
    worksheet.columns = [
        { header: '', key: 'A', width: 2 },
        { header: '', key: 'B', width: 5 },
        { header: '', key: 'C', width: 35 },
        { header: '', key: 'D', width: 8 },
        { header: '', key: 'E', width: 6 },
        { header: '', key: 'F', width: 30 }, // Widened for Sender Info
        { header: '', key: 'G', width: 10 }, // Stamp column
        { header: '', key: 'H', width: 2 },
    ];

    // --- Header ---
    worksheet.mergeCells('B2:G3');
    const titleCell = worksheet.getCell('B2');
    titleCell.value = '御 請 求 書';
    titleCell.font = { size: 24, bold: true, name: 'Meiryo' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.border = { bottom: { style: 'double' } }; // Decorative underline

    // --- Meta Info (Top Right) ---
    const today = new Date();
    const invoiceNumber = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}-${customer.customerCode}`;

    worksheet.mergeCells('F4:G4');
    worksheet.getCell('F4').value = `請求No.  ${invoiceNumber}`;
    worksheet.getCell('F4').alignment = { horizontal: 'right' };
    worksheet.getCell('F4').font = { size: 10 };

    worksheet.mergeCells('F5:G5');
    worksheet.getCell('F5').value = `請求日:  ${formatDateWithEra(today)}`;
    worksheet.getCell('F5').alignment = { horizontal: 'right' };
    worksheet.getCell('F5').font = { size: 10 };

    // --- Recipient (Top Left) ---
    worksheet.mergeCells('B6:E6');
    const recipientName = worksheet.getCell('B6');
    recipientName.value = `${customer.name}  様`;
    recipientName.font = { size: 16, bold: true, underline: true };

    worksheet.mergeCells('B7:E7');
    worksheet.getCell('B7').value = `〒${customer.postalCode || ''} ${customer.address}`;
    worksheet.getCell('B7').font = { size: 10 };

    // --- Sender Info (Right Side) ---
    const senderStartRow = 7;
    // No horizontal merge for sender info to allow stamp in column G
    const senderName = worksheet.getCell(`F${senderStartRow}`);
    senderName.value = '小峰霊園 管理事務所';
    senderName.font = { size: 12, bold: true };

    worksheet.getCell(`F${senderStartRow + 1}`).value = '〒XXX-XXXX';

    worksheet.getCell(`F${senderStartRow + 2}`).value = '〇〇県〇〇市〇〇町1-2-3';

    worksheet.getCell(`F${senderStartRow + 3}`).value = 'TEL: 03-XXXX-XXXX';

    worksheet.getCell(`F${senderStartRow + 4}`).value = '担当者: 〇〇';

    // Stamp Placeholder (Red Box) in Column G
    worksheet.mergeCells(`G${senderStartRow}:G${senderStartRow + 3}`);
    const stampCell = worksheet.getCell(`G${senderStartRow}`);
    stampCell.value = '印';
    stampCell.alignment = { horizontal: 'center', vertical: 'middle' };
    stampCell.font = { color: { argb: 'FFFF0000' } }; // Red text
    stampCell.border = {
        top: { style: 'medium', color: { argb: 'FFFF0000' } },
        left: { style: 'medium', color: { argb: 'FFFF0000' } },
        bottom: { style: 'medium', color: { argb: 'FFFF0000' } },
        right: { style: 'medium', color: { argb: 'FFFF0000' } }
    };

    // --- Subject & Details ---
    worksheet.mergeCells('B10:E10');
    worksheet.getCell('B10').value = '件名： 永代使用料および管理料のご請求';
    worksheet.getCell('B10').border = { bottom: { style: 'thin' } };

    worksheet.mergeCells('B12:E12');
    worksheet.getCell('B12').value = '下記の通り、ご請求申し上げます。';

    // Payment Deadline
    worksheet.getCell('B14').value = 'お支払期限：';
    worksheet.getCell('B14').font = { bold: true };
    worksheet.mergeCells('C14:E14');
    const deadline = new Date(today);
    deadline.setDate(deadline.getDate() + 14); // 2 weeks later default
    worksheet.getCell('C14').value = formatDateWithEra(deadline);

    // Bank Info
    worksheet.getCell('B15').value = 'お振込先：';
    worksheet.getCell('B15').font = { bold: true };
    worksheet.mergeCells('C15:E15');
    worksheet.getCell('C15').value = '〇〇銀行 〇〇支店';
    worksheet.mergeCells('C16:E16');
    worksheet.getCell('C16').value = '普通 1234567';
    worksheet.mergeCells('C17:E17');
    worksheet.getCell('C17').value = 'カ）コミネレイエン';

    // --- Total Amount ---
    worksheet.mergeCells('B19:C19');
    worksheet.getCell('B19').value = '合計金額：';
    worksheet.getCell('B19').font = { size: 12, bold: true };
    worksheet.getCell('B19').border = { bottom: { style: 'thick' } };

    let totalAmount = 0;
    if (customer.usageFee?.usageFee) totalAmount += Number(customer.usageFee.usageFee);
    if (customer.managementFee?.managementFee) totalAmount += Number(customer.managementFee.managementFee);

    worksheet.mergeCells('D19:E19');
    const totalCell = worksheet.getCell('D19');
    totalCell.value = totalAmount;
    totalCell.numFmt = '"¥"#,##0';
    totalCell.font = { size: 16, bold: true };
    totalCell.alignment = { horizontal: 'right' };
    totalCell.border = { bottom: { style: 'thick' } };

    // --- Details Table ---
    const headerRowIdx = 22;
    const headers = ['No.', '項目', '数量', '単位', '単価', '金額'];
    const headerKeys = ['B', 'C', 'D', 'E', 'F', 'G'];

    headerKeys.forEach((key, idx) => {
        const cell = worksheet.getCell(`${key}${headerRowIdx}`);
        cell.value = headers[idx];
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' } // Light Gray
        };
        cell.font = { bold: true, color: { argb: 'FF000000' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    let currentRow = headerRowIdx + 1;
    let itemNo = 1;

    const addRow = (item: string, qty: number, unit: string, price: number, amount: number) => {
        worksheet.getCell(`B${currentRow}`).value = itemNo++;
        worksheet.getCell(`C${currentRow}`).value = item;
        worksheet.getCell(`D${currentRow}`).value = qty;
        worksheet.getCell(`E${currentRow}`).value = unit;
        worksheet.getCell(`F${currentRow}`).value = price;
        worksheet.getCell(`G${currentRow}`).value = amount;

        // Styling
        ['B', 'C', 'D', 'E', 'F', 'G'].forEach(key => {
            const cell = worksheet.getCell(`${key}${currentRow}`);
            cell.border = {
                left: { style: 'thin' },
                right: { style: 'thin' },
                bottom: { style: 'dotted' }
            };
            if (key === 'B' || key === 'D' || key === 'E') cell.alignment = { horizontal: 'center' };
            if (key === 'F' || key === 'G') {
                cell.alignment = { horizontal: 'right' };
                cell.numFmt = '#,##0';
            }
        });
        currentRow++;
    };

    if (customer.usageFee?.usageFee) {
        addRow(
            `永代使用料 (${customer.section || ''} ${customer.plotNumber || ''})`,
            1,
            '式',
            Number(customer.usageFee.unitPrice || 0),
            Number(customer.usageFee.usageFee)
        );
    }

    if (customer.managementFee?.managementFee) {
        addRow(
            `年間管理料 (${customer.managementFee.billingYears || '1'}年分)`,
            1,
            '式',
            Number(customer.managementFee.unitPrice || 0),
            Number(customer.managementFee.managementFee)
        );
    }

    // Fill empty rows to look nice (up to 10 rows total in table)
    while (itemNo <= 10) {
        ['B', 'C', 'D', 'E', 'F', 'G'].forEach(key => {
            const cell = worksheet.getCell(`${key}${currentRow}`);
            cell.border = {
                left: { style: 'thin' },
                right: { style: 'thin' },
                bottom: { style: 'dotted' }
            };
        });
        worksheet.getCell(`B${currentRow}`).value = itemNo++;
        currentRow++;
    }

    // Table Footer (Subtotal, Tax, Total)
    const footerStartRow = currentRow;

    // Subtotal
    worksheet.getCell(`F${footerStartRow}`).value = '小計';
    worksheet.getCell(`F${footerStartRow}`).font = { bold: true };
    worksheet.getCell(`F${footerStartRow}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`F${footerStartRow}`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    worksheet.getCell(`G${footerStartRow}`).value = totalAmount;
    worksheet.getCell(`G${footerStartRow}`).numFmt = '"¥"#,##0';
    worksheet.getCell(`G${footerStartRow}`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // Tax (Assuming 10% included or calculated? Let's say 0 for now or just show total)
    // Simple version: Just Total
    worksheet.getCell(`F${footerStartRow + 1}`).value = '合計金額';
    worksheet.getCell(`F${footerStartRow + 1}`).font = { bold: true };
    worksheet.getCell(`F${footerStartRow + 1}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`F${footerStartRow + 1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
    worksheet.getCell(`F${footerStartRow + 1}`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    worksheet.getCell(`G${footerStartRow + 1}`).value = totalAmount;
    worksheet.getCell(`G${footerStartRow + 1}`).numFmt = '"¥"#,##0';
    worksheet.getCell(`G${footerStartRow + 1}`).font = { bold: true };
    worksheet.getCell(`G${footerStartRow + 1}`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // --- Remarks Box ---
    const remarksRow = footerStartRow + 3;
    worksheet.mergeCells(`B${remarksRow}:B${remarksRow + 3}`);
    const remarksLabel = worksheet.getCell(`B${remarksRow}`);
    remarksLabel.value = '備考';
    remarksLabel.alignment = { horizontal: 'center', vertical: 'middle' };
    remarksLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
    remarksLabel.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    worksheet.mergeCells(`C${remarksRow}:G${remarksRow + 3}`);
    const remarksContent = worksheet.getCell(`C${remarksRow}`);
    remarksContent.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // Generate File
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `御請求書_${customer.name}_${formatDateWithEra(today)}.xlsx`);
};

/**
 * Export Postcard Data to Excel (Visual Layout)
 */
export const exportPostcardToExcel = async (customer: Customer) => {
    const workbook = new ExcelJS.Workbook();

    // --- Sheet 1: Address Side (宛名面) ---
    const addressSheet = workbook.addWorksheet('宛名面');

    // Setup columns for visual layout (approximate postcard ratio)
    // A: Margin, B: Postal, C: Margin, D: Address, E: Name, F: Sender, G: Margin
    addressSheet.columns = [
        { header: '', key: 'A', width: 2 },
        { header: '', key: 'B', width: 10 },
        { header: '', key: 'C', width: 5 },
        { header: '', key: 'D', width: 40 }, // Address
        { header: '', key: 'E', width: 30 }, // Name
        { header: '', key: 'F', width: 25 }, // Sender
        { header: '', key: 'G', width: 2 },
    ];

    // Postal Code (Top Left)
    addressSheet.mergeCells('B2:C3');
    const postalCell = addressSheet.getCell('B2');
    postalCell.value = `〒 ${customer.postalCode || '000-0000'}`;
    postalCell.font = { size: 14, name: 'Meiryo' };
    postalCell.alignment = { horizontal: 'left', vertical: 'top' };

    // Address (Vertical-ish layout simulation using text wrapping)
    addressSheet.mergeCells('D5:D15');
    const addressCell = addressSheet.getCell('D5');
    addressCell.value = customer.address;
    addressCell.font = { size: 14, name: 'Meiryo' };
    addressCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };

    // Name (Center, Large)
    addressSheet.mergeCells('E5:E15');
    const nameCell = addressSheet.getCell('E5');
    nameCell.value = `${customer.name}  様`;
    nameCell.font = { size: 20, bold: true, name: 'Meiryo' };
    nameCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    // Sender Info (Bottom Left/Center)
    addressSheet.mergeCells('F10:F15');
    const senderCell = addressSheet.getCell('F10');
    senderCell.value = `差出人:\n小峰霊園 管理事務所\n〒XXX-XXXX\n〇〇県〇〇市〇〇町1-2-3`;
    senderCell.font = { size: 10, name: 'Meiryo' };
    senderCell.alignment = { horizontal: 'left', vertical: 'bottom', wrapText: true };


    // --- Sheet 2: Content Side (裏面) ---
    const contentSheet = workbook.addWorksheet('裏面（文面）');
    contentSheet.columns = [
        { header: '', key: 'A', width: 5 },
        { header: '', key: 'B', width: 60 },
        { header: '', key: 'C', width: 5 },
    ];

    contentSheet.mergeCells('B2:B3');
    const titleCell = contentSheet.getCell('B2');
    titleCell.value = '合祀法要のご案内';
    titleCell.font = { size: 18, bold: true, name: 'Meiryo' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    contentSheet.mergeCells('B5:B20');
    const bodyCell = contentSheet.getCell('B5');
    const buriedPersonName = customer.buriedPersons?.[0]?.name || '〇〇';

    bodyCell.value = `拝啓

時下ますますご清祥のこととお慶び申し上げます。

さて、この度、故 ${buriedPersonName} 様の
合祀法要を執り行いますので、ご案内申し上げます。

ご多忙中とは存じますが、何卒ご参列賜りますよう
お願い申し上げます。

敬具

令和〇年〇月〇日

小峰霊園 管理事務所`;

    bodyCell.font = { size: 12, name: 'Meiryo' };
    bodyCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };

    // Generate File
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `はがきデータ_${customer.name}.xlsx`);
};
