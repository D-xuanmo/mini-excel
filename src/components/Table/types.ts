import React from 'react'

/** 表格组件入口 props */
export interface TableProps {
  /** 默认列 */
  columnNumber: number;
  
  /** 默认行 */
  rowNumber?: number;
  
  /** 可选入渲染表格所需要的数据 */
  defaultRows?: Array<TableCellType> | Array<Array<TableCellType>>;
  
  /** 显示头部 */
  showHeader?: boolean;
  
  /** 是否为只读，不带任何操作 */
  readonly?: boolean;
  
  /** 自定义渲染单元格 */
  customRenderCell?: (cell: TableCellType) => React.ReactNode;
  
  /** 表格数据改变触发 */
  onChange?: (rows: Array<Array<TableCellType>>) => void;
  
  /** 表格选区发生改变时触发 */
  onSelect?: (coordinates: string[], indexList: number[]) => void;
}

/** 坐标转换后的类型 */
export type CoordinateFormattedType = {
  [key: string]: {
    rowSpan: number;
    colSpan: number;
    index: number;
    /** 被合并的第一个坐标 */
    firstCoordinate?: string | null;
    /** 合并之后的坐标 */
    mergedCoordinate?: string | null;
  };
}

/** 单元格类型 */
export interface TableCellType {
  rowSpan: number;
  colSpan: number;
  width: number;
  height: number;
  coordinate: string;
  /** 被合并的第一个坐标 */
  firstCoordinate?: string | null;
  /** 合并之后的坐标 */
  mergedCoordinate?: string | null;
}

export interface TableRef {
  merge: () => void;
  split: () => void;
  clean: () => void;
}
