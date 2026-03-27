import * as ExcelJS from "exceljs";

export interface SheetData {
  sheetName: string;
  rows: any[][];
  headers: string[];
  data: Record<string, any>[];
}

/**
 * 从 public 目录加载 Excel 文件并解析数据
 * @param filePath - Excel 文件路径（相对于 public 目录）
 * @returns Promise<SheetData[]> - 返回所有工作表的数据
 */
export const loadExcelFile = async (filePath: string): Promise<SheetData[]> => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`无法加载 Excel 文件：${filePath}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const sheets: SheetData[] = [];

    workbook.eachSheet((worksheet, sheetId) => {
      const rows: any[][] = [];
      const headers: string[] = [];
      const data: Record<string, any>[] = [];

      worksheet.eachRow((row, rowNumber) => {
        const rowData = Array.isArray(row.values) ? row.values.slice(1) : [];
        rows.push(rowData);

        if (rowNumber === 1) {
          headers.push(...rowData.map((cell: any) => String(cell || "")));
        } else if (headers.length > 0) {
          const rowObj: Record<string, any> = {};
          headers.forEach((header, index) => {
            if (header.trim()) {
              rowObj[header] = rowData[index];
            }
          });
          if (Object.keys(rowObj).length > 0) {
            data.push(rowObj);
          }
        }
      });

      sheets.push({
        sheetName: worksheet.name,
        rows,
        headers,
        data
      });
    });

    return sheets;
  } catch (error) {
    console.error("加载 Excel 失败:", error);
    throw error;
  }
};

/**
 * 获取指定索引的工作表数据
 * @param sheets - 所有工作表数据
 * @param index - 工作表索引
 * @returns 工作表数据或 null
 */
export const getSheetByIndex = (
  sheets: SheetData[],
  index: number
): SheetData | null => {
  if (index >= 0 && index < sheets.length) {
    return sheets[index];
  }
  return null;
};

/**
 * 获取指定名称的工作表数据
 * @param sheets - 所有工作表数据
 * @param name - 工作表名称
 * @returns 工作表数据或 null
 */
export const getSheetByName = (
  sheets: SheetData[],
  name: string
): SheetData | null => {
  return sheets.find(sheet => sheet.sheetName === name) || null;
};
