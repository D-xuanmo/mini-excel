import React from 'react'

/** 表格组件入口 props */
export interface TableProps {
  /** 默认行 */
  rowNumber: number;
  
  /** 默认列 */
  columnNumber: number;
  
  /** 是否为只读，不带任何操作 */
  readonly?: boolean;
  
  /** 自定义渲染单元格 */
  customRenderCell?: (cell: TableCellType) => React.ReactNode;
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
