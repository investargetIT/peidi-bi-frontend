/**
 * 统一处理函数，处理多种格式的数据并转换为数组
 * @param data - 输入数据，可以是JSON字符串、Markdown代码块、数组或对象
 * @returns 统一转换为数组格式
 */
export function normalizeToArray(data: any): any[] {
  if (!data) return [];

  let processedData = data;

  // 如果是字符串，尝试解析
  if (typeof data === "string") {
    try {
      // 处理Markdown代码块格式
      if (data.includes("```json")) {
        // 提取JSON部分
        const jsonMatch = data.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          processedData = JSON.parse(jsonMatch[1].trim());
        } else {
          // 如果没有找到代码块，尝试直接解析整个字符串
          processedData = JSON.parse(data.trim());
        }
      } else {
        // 直接解析JSON字符串
        processedData = JSON.parse(data.trim());
      }
    } catch (error) {
      console.error("数据解析失败:", error);
      return [];
    }
  }

  // 处理解析后的数据
  if (Array.isArray(processedData)) {
    return processedData;
  }

  if (
    processedData &&
    typeof processedData === "object" &&
    !Array.isArray(processedData)
  ) {
    return [processedData];
  }

  return [];
}
