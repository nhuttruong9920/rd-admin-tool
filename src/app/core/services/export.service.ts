import { Injectable } from '@angular/core';

import { Workbook } from 'exceljs';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private download(
    href: string,
    fileName: string,
    fileExtension: string,
  ): void {
    const formattedFileName = fileName.replace(/ /g, '_').replace(/\//g, '-');
    const link = document.createElement('a');
    link.download = `${formattedFileName}.${fileExtension}`;
    link.href = href;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !window.navigator.userAgent.includes('Macintosh');

    if (isIOS) {
      window.open(href, '_blank');
      return;
    }

    link.click();
  }

  private getCellVisualLength(value: string): number {
    const mandarinRegex = /[\u4e00-\u9fa5]/g;
    const mandarinMatches = value.match(mandarinRegex);
    if (mandarinMatches) {
      return (
        value.length - mandarinMatches.length + mandarinMatches.length * 2.15
      );
    } else {
      return value.length;
    }
  }

  exportDataToExcel(
    data: {
      sheetName: string;
      items: Record<string, unknown>[];
      sheetTopHeader: string | null;
    }[],
    fileName: string,
    callback?: (workbook: Workbook) => void,
  ): void {
    const workbook = new Workbook();

    if (callback) {
      callback(workbook);
    }

    data.forEach(({ sheetName, items, sheetTopHeader }) => {
      const worksheet = workbook.addWorksheet(sheetName);

      if (items.length > 0) {
        const headers = Object.keys(items[0]);
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '808080' },
          };
        });

        worksheet.spliceRows(1, 0, [sheetTopHeader]);
        worksheet.mergeCells(1, 1, 1, headers.length);

        const topRow = worksheet.getCell('A1');
        worksheet.getRow(1).height = 50;
        topRow.font = { bold: true };
        topRow.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };

        headers.forEach((header, columnIndex) => {
          let maxLength = this.getCellVisualLength(header);
          items.forEach((item: Record<string, unknown>) => {
            const cellValue = String(item[header]);
            const cellLength = this.getCellVisualLength(cellValue);
            if (cellLength > maxLength) {
              maxLength = cellLength;
            }
          });
          worksheet.getColumn(columnIndex + 1).width = maxLength + 2;
        });

        items.forEach((item: Record<string, unknown>) => {
          const row: unknown[] = [];
          headers.forEach((header) => {
            row.push(item[header]);
          });
          worksheet.addRow(row);
        });
      }
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const href = URL.createObjectURL(blob);
      this.download(href, fileName, 'xlsx');
    });
  }

  exportExcelWithCustomSheet(
    fileName: string,
    callback?: (workbook: Workbook) => void,
  ): void {
    const workbook = new Workbook();

    if (callback) {
      callback(workbook);
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const href = URL.createObjectURL(blob);
      this.download(href, fileName, 'xlsx');
    });
  }
}
