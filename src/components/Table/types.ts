import React from 'react'

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

/** 表格组件入口 props */
export interface TableProps {
  rowNumber: number;
  columnNumber: number;
  customRenderCell?: (cell: TableCellType) => React.ReactNode;
}

export interface TableRef {
  merge: () => void;
  split: () => void;
  clean: () => void;
}
