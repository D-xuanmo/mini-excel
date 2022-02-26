import { CoordinateFormattedType, TableCellType } from '../types'

/** 拖拽方向 */
export type DragDirection = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | null

/**
 * 数字转数组
 * @param num 数组长度
 * @param item 每项数据
 */
export const numberToArray = (num: number, item?: any) => Array(num).fill(item)

/**
 * 生成单元格配置
 * @param coordinate 坐标
 */
export function generateCell(coordinate: string = ''): TableCellType {
  return {
    rowSpan: 1,
    colSpan: 1,
    width: 200,
    height: 50,
    coordinate,
    mergedCoordinate: null
  }
}

/**
 * 生成表格扁平数据结构列表
 * @param rows 总行数
 * @param columns 总列数
 */
export function generateFlatTableRows(rows: number, columns: number) {
  let result: TableCellType[] = []
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      result.push(generateCell(`${i}_${j}`))
    }
  }
  return result
}

/**
 * 根据总列数生成 excel 表头格式
 * @param columns 总列数
 */
export function generateTableHead(columns: number): string[] {
  const letters: string[] = []
  const start = 'A'.charCodeAt(0)
  const end = 'Z'.charCodeAt(0)
  let count = 0
  for (let i = start; i <= end; i++) {
    letters.push(String.fromCharCode(i))
  }
  return numberToArray(columns).map((item, index) => {
    const i = index % 26
    if (i === 0) count++
    return numberToArray(count).map(() => letters[i]).join('')
  })
}

/**
 * 获取表格总行数
 * @param cells 表格所有的单元格
 * @param column 总列数
 */
export const getTableRowNumber = (cells: TableCellType[], column: number) => Math.ceil(flatTableRow(cells).length / column)

/**
 * 通过每行任意坐标获取当前行所有坐标的索引
 * @param cells 所有单元格
 * @param coordinates 任意坐标
 * @param column 总列数
 */
export function getRowIndexListByCoordinate(cells: TableCellType[], coordinates: string | string[], column: number) {
  const indexList: number[] = []
  
  const generateIndexList = (coordinate: string) => {
    // 获取每行的第一个坐标的索引
    const firstIndex = Math.floor(coordinateToIndex(coordinate, column) / column) * column
    for (let i = 0; i < column; i++) {
      indexList.push(firstIndex + i)
    }
  }
  if (Array.isArray(coordinates)) {
    const { startCoordinate, endCoordinate } = buildSelectionCoordinates(cells, coordinates, column)
    const coordinateRange = getCoordinateRange(cells, startCoordinate, endCoordinate, column)
    coordinateRange.forEach((item) => generateIndexList(item))
  } else {
    generateIndexList(coordinates)
  }
  return Array.from(new Set(indexList))
}

/**
 * 坐标转换为下标
 * 当前单元格的下标 = x + y + (column - 1) * x
 * 下标需要 - 1，所以总列数需要 - 1
 * @param coordinate 坐标
 * @param column 总列数
 */
export function coordinateToIndex(coordinate: string, column: number) {
  const [x, y] = coordinate.split('_')
  return +x + +y + (column - 1) * +x
}

/**
 * 索引转换为坐标
 * @param index 当前单元格索引
 * @param column 总列数
 */
export function indexToCoordinate(index: number, column: number) {
  // x = 索引 / 总列数
  const x = Math.floor(index / column)
  
  // y = 索引 % 总列数
  const y = index % column
  
  return `${x}_${y}`
}

/**
 * 坐标求和
 * @param coordinate 坐标
 */
export function sumCoordinate(coordinate: string) {
  const [x, y] = coordinate.split('_')
  return Number(x) + Number(y)
}

/**
 * 是否为多行
 * @param coordinates 任意坐标
 */
export function isMultiRows(coordinates: string[]) {
  return Array.from(new Set(coordinates.map((item) => item.split('_')[0]))).length > 1
}

/**
 * 是否选中多列
 * @param coordinates 任意坐标
 */
export function isMultiColumns(coordinates: string[]) {
  return Array.from(new Set(coordinates.map((item) => item.split('_')[1]))).length > 1
}

/**
 * 获取坐标区间
 * @param cells 所有单元格
 * @param firstCoordinate 第一个坐标
 * @param lastCoordinate 最后一个坐标
 * @param column 总列数
 */
export function getCoordinateRange(
  cells: TableCellType[],
  firstCoordinate: string,
  lastCoordinate: string,
  column: number
): string[] {
  if (!firstCoordinate || !lastCoordinate) return []
  const [firstX, firstY] = firstCoordinate.split('_')
  const [lastX, lastY] = lastCoordinate.split('_')
  function generateCoordinates(minx: number, maxX: number, minY: number, maxY: number) {
    const result: string[] = []
    for (let x = minx; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const coordinate = `${x}_${y}`
        const currentCell = cells[coordinateToIndex(coordinate, column)]
        result.push(coordinate)
        if (currentCell.firstCoordinate) result.push(currentCell.firstCoordinate)
        if (currentCell.mergedCoordinate) result.push(currentCell.mergedCoordinate)
      }
    }
    return Array.from(new Set(result))
  }
  function findMaxAndMinCoordinate(coordinates: string[]) {
    const _rows = coordinates.map((item) => +item.split('_')[0])
    const _columns = coordinates.map((item) => +item.split('_')[1])
    const minx = Math.min(..._rows)
    const maxX = Math.max(..._rows)
    const minY = Math.min(..._columns)
    const maxY = Math.max(..._columns)
    return { minx, maxX, minY, maxY }
  }
  const minX = Math.min(+firstX, +lastX)
  const maxX = Math.max(+firstX, +lastX)
  const minY = Math.min(+firstY, +lastY)
  const maxY = Math.max(+firstY, +lastY)
  
  // 第一次查找所有坐标
  const coordinates = generateCoordinates(
    Math.min(+firstX, +lastX),
    Math.max(+firstX, +lastX),
    Math.min(+firstY, +lastY),
    Math.max(+firstY, +lastY)
  )
  const {
    minx: newMinX,
    maxX: newMaxX,
    minY: newMinY,
    maxY: newMaxY
  } = findMaxAndMinCoordinate(coordinates)
  
  // 如果两次查找的结果不相等，说明还有合并的单元格未找到，则继续查找
  if (minX !== newMinX || maxX !== newMaxX || minY !== newMinY || maxY !== newMaxY) {
    return getCoordinateRange(cells, `${newMinX}_${newMinY}`, `${newMaxX}_${newMaxY}`, column)
  }
  return coordinates
}

/**
 * 通过坐标转换为对应索引列表
 * @param cells 所有单元格
 * @param firstCoordinate 第一个坐标
 * @param lastCoordinate 最后一个坐标
 * @param column 总列表
 */
export function coordinatesToIndexList(
  cells: TableCellType[],
  firstCoordinate: string,
  lastCoordinate: string,
  column: number
) {
  return getCoordinateRange(cells, firstCoordinate, lastCoordinate, column).map((item) => coordinateToIndex(item, column))
}

/**
 * 通过选区的最小坐标和最大坐标生成选区所有坐标
 * @param cells 所有单元格
 * @param coordinates 坐标
 * @param column 总列数
 */
export function buildSelectionCoordinates(
  cells: TableCellType[],
  coordinates: string[],
  column: number
) {
  const rows: number[] = []
  const columns: number[] = []
  let startCoordinate, endCoordinate
  coordinates.forEach((item) => {
    if (item) {
      const [x, y] = item.split('_')
      rows.push(+x)
      columns.push(+y)
    }
  })
  startCoordinate = `${Math.min(...rows)}_${Math.min(...columns)}`
  endCoordinate = `${Math.max(...rows)}_${Math.max(...columns)}`
  return {
    startCoordinate,
    endCoordinate,
    indexList: coordinatesToIndexList(cells, startCoordinate, endCoordinate, column)
  }
}

/**
 * 表格选择的坐标转换为数组索引、rowSpan、colSpan
 * @param coordinate 坐标数组
 * @param column 表格列数
 */
export function transformCoordinate(coordinate: string[], column: number) {
  const result: CoordinateFormattedType = {}
  const indexList: number[] = []
  const xArr: string[] = []
  const yArr: string[] = []
  
  // 将坐标转换为索引
  coordinate.forEach((item) => {
    const [x, y] = item.split('_')
    if (!xArr.includes(x)) xArr.push(x)
    if (!yArr.includes(y)) yArr.push(y)
    indexList.push(coordinateToIndex(item, column))
  })
  
  // 最小的为第一个点
  const firstCoordinate = Math.min(...indexList)
  const lastCoordinate = Math.max(...indexList)
  indexList.forEach((item) => {
    result[item] = {
      index: item,
      rowSpan: 0,
      colSpan: 0,
      mergedCoordinate: indexToCoordinate(lastCoordinate, column),
      firstCoordinate: indexToCoordinate(firstCoordinate, column)
    }
    if (firstCoordinate === item) {
      result[item].rowSpan = xArr.length
      result[item].colSpan = yArr.length
    }
  })
  return result
}

/**
 * 生成表格渲染地图
 * @param rows 数据行列表
 * @param column 列数
 * @example 示例数据结构：行对应 tr，列对应 td
 * [
 *   [{}, {}, {}],
 *   [{}, {}, {}],
 *   [{}, {}, {}]
 * ]
 */
export function generateTableMap(rows: TableCellType[], column: number) {
  const tableMap: Array<Array<TableCellType>> = []
  let rowIndex = -1
  let columnIndex = 0
  flatTableRow(rows).forEach((item, index) => {
    const _item = { ...item }
    if (index % column === 0) {
      rowIndex++
      columnIndex = 0
      _item.coordinate = `${rowIndex}_${columnIndex}`
      tableMap.push([_item])
    } else {
      columnIndex++
      _item.coordinate = `${rowIndex}_${columnIndex}`
      tableMap[rowIndex].push(_item)
    }
  })
  return tableMap
}

/**
 * 扁平化表格数据
 * @param rows 表格结构数据
 */
export function flatTableRow(rows: TableCellType[] | TableCellType[][]): TableCellType[] {
  if (!Array.isArray(rows[0])) return rows as any
  return (rows as TableCellType[][]).reduce((prev, curr) => [...prev, ...curr], [])
}

/**
 * 生成表格行配置
 * @param cells 所有单元格
 * @param column 列数
 * @param firstCoordinate 开始坐标
 * @param lastCoordinate 结束坐标
 */
export function generateTableRow(cells: TableCellType[], column: number, firstCoordinate?: string, lastCoordinate?: string) {
  let _rows = flatTableRow(cells)
  if (firstCoordinate && lastCoordinate) {
    const indexList = coordinatesToIndexList(cells, firstCoordinate, lastCoordinate, column)
    const coordinateFormatted = transformCoordinate(indexList.map((item) => indexToCoordinate(item, column)), column)
    _rows = _rows.map((item, index) => {
      const current = coordinateFormatted?.[index]
      const rowSpan = current?.rowSpan ?? item.rowSpan
      const colSpan = current?.colSpan ?? item.colSpan
      return {
        ...item,
        rowSpan,
        colSpan,
        mergedCoordinate: current?.mergedCoordinate ?? _rows[index]?.mergedCoordinate ?? null,
        firstCoordinate: current?.firstCoordinate ?? _rows[index]?.firstCoordinate ?? null,
      }
    })
  }
  return generateTableMap(_rows, column)
}

/**
 * 合并表格
 * @param cells 所有的单元格
 * @param coordinates 选中的任意坐标
 * @param column 总列数
 */
export function mergeTable(cells: TableCellType[], coordinates: string[], column: number) {
  const { startCoordinate, endCoordinate } = buildSelectionCoordinates(cells, coordinates, column)
  return generateTableRow(cells, column, startCoordinate, endCoordinate)
}

/**
 * 拆分表格
 * @param cells 表格单元格
 * @param indexList 选中的单元格列表
 * @param column 总列数
 */
export function splitTable(cells: TableCellType[], indexList: number[], column: number) {
  const _rows = flatTableRow(cells).map((item, index) => {
    const _item = { ...item }
    if (indexList.includes(index)) {
      _item.rowSpan = 1
      _item.colSpan = 1
      _item.mergedCoordinate = null
      _item.firstCoordinate = null
    }
    return _item
  })
  return generateTableMap(_rows, column)
}
