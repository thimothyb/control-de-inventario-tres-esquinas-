import ExcelJS from 'exceljs';
import { getCompanyLogoBase64 } from './imageUtils';

export const generateExcelReport = async ({ title, columns, data, companySettings, fileName }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title.substring(0, 31));

  let startRow = 1;

  try {
    const logoBase64 = await getCompanyLogoBase64(companySettings.logo);
    if (logoBase64) {
      const imageId = workbook.addImage({ base64: logoBase64, extension: 'png' });
      worksheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 80, height: 80 } });

      worksheet.mergeCells('B1:D1');
      const nameCell = worksheet.getCell('B1');
      nameCell.value = companySettings.name;
      nameCell.font = { size: 16, bold: true, color: { argb: '4F46E5' } };
      nameCell.alignment = { vertical: 'middle', horizontal: 'left' };

      worksheet.mergeCells('B2:D2');
      const rifCell = worksheet.getCell('B2');
      rifCell.value = `RIF: ${companySettings.rif}`;
      rifCell.font = { size: 11, color: { argb: '6366F1' } };
      rifCell.alignment = { vertical: 'middle', horizontal: 'left' };

      worksheet.getRow(1).height = 30;
      worksheet.getRow(2).height = 20;
      worksheet.getRow(3).height = 10;
      worksheet.getRow(4).height = 10;
      startRow = 5;
    }
  } catch { /* sin logo */ }

  const numCols = columns.length;
  const lastCol = String.fromCharCode(64 + numCols);

  worksheet.mergeCells(`A${startRow}:${lastCol}${startRow}`);
  const titleCell = worksheet.getCell(`A${startRow}`);
  titleCell.value = title;
  titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F81BD' } };
  worksheet.getRow(startRow).height = 28;

  startRow++;
  worksheet.getRow(startRow).height = 10;
  startRow++;

  worksheet.addRow(columns);
  worksheet.getRow(startRow).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(startRow).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(startRow).height = 24;

  columns.forEach((col, i) => {
    let maxLength = col.length;
    data.forEach((row) => { maxLength = Math.max(maxLength, String(row[i] || '').length); });
    worksheet.getColumn(i + 1).width = Math.max(18, Math.min(maxLength + 5, 50));
    const cell = worksheet.getRow(startRow).getCell(i + 1);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F81BD' } };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  data.forEach((row, index) => {
    const excelRow = worksheet.addRow(row);
    excelRow.height = 20;
    excelRow.alignment = { vertical: 'middle' };
    excelRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 === 0 ? 'FFFFFF' : 'F5F5F5' } };
      cell.border = { top: { style: 'thin', color: { argb: 'D3D3D3' } }, left: { style: 'thin', color: { argb: 'D3D3D3' } }, bottom: { style: 'thin', color: { argb: 'D3D3D3' } }, right: { style: 'thin', color: { argb: 'D3D3D3' } } };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || `reporte_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
