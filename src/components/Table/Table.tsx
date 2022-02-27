import React, { useState, useImperativeHandle } from 'react'
import TBody from './TBody'
import THead from './THead'
import { TableProps } from './types'
import './index.css'
import { getElementParent } from './utils/dom'
import {
  buildSelectionCoordinates,
  coordinatesToIndexList,
  flatTableRow,
  generateFlatTableRows,
  generateTableMap,
  getCoordinateRange,
  mergeTable,
  splitTable
} from './utils'

function Table(props: TableProps, ref: any) {
  const { rowNumber, columnNumber, customRenderCell } = props
  const [rows, setRows] = useState(generateTableMap(generateFlatTableRows(rowNumber, columnNumber), columnNumber))
  const [selectedCoordinates, setSelectedCoordinates] = useState<Array<string>>([])
  const [selectedIndexList, setSelectedIndexList] = useState<Array<number>>([])
  
  function onMouseDown(event: React.MouseEvent) {
    // 记录当前触发 onmousedown 的元素
    const currentTarget = event.currentTarget as HTMLElement
    
    // 当前点击的单元格
    // event.target 在 td 元素存在子级的情况，获取的不一定是 td，所以需要递归查询父级为 td 的元素
    const cell = getElementParent(event.target as HTMLElement, 'td')
  
    // 扁平化数据，方便后续处理
    const flatRows = flatTableRow(rows)
  
    // 开始坐标
    const startCoordinate = cell?.dataset.coordinate!
    
    // 如果当前单元格已经被合并过，则还需记录合并后的坐标
    const startMergedCoordinate = cell?.dataset.mergedCoordinate ?? ''
    
    if (event.button !== 0) {
      setSelectedCoordinates([startCoordinate])
      setSelectedIndexList(coordinatesToIndexList(flatRows, startCoordinate, startCoordinate, columnNumber))
      return
    }

    // 如果触发元素不是 td，不执行后续操作
    if (!cell) return
    
    // 记录所有的坐标，坐标池
    let allCoordinates: string[] = [startCoordinate, startMergedCoordinate]
    
    function setEndPosition(event: React.MouseEvent) {
      allCoordinates = [startCoordinate, startMergedCoordinate]
      // 当前鼠标停留的单元格
      const currentCell = getElementParent(event.target as HTMLElement, 'td')
      
      // 当前鼠标停留单元格坐标
      const currentCellCoordinate = currentCell?.dataset.coordinate ?? ''
      allCoordinates.push(currentCellCoordinate)
      
      // 如果当前单元格被合并过，则需要一起被记录
      const currentMergedCoordinate = currentCell?.dataset.mergedCoordinate
      if (currentMergedCoordinate) allCoordinates.push(currentMergedCoordinate)
      
      // 通过坐标池计算得出真实的开始坐标、结束坐标
      // 鼠标点击时，记录的开始坐标如果存在反向选区时，坐标就会不准确
      const {
        startCoordinate: _startCoordinate,
        endCoordinate
      } = buildSelectionCoordinates(flatRows, allCoordinates, columnNumber)
      
      // 将已经计算后的坐标区间做记录
      setSelectedCoordinates(getCoordinateRange(flatRows, _startCoordinate, endCoordinate, columnNumber))
      
      // 计算后的坐标区间下标
      setSelectedIndexList(coordinatesToIndexList(flatRows, _startCoordinate, endCoordinate, columnNumber))
    }
    
    currentTarget.onmousemove = (event: any) => setEndPosition(event)
    
    currentTarget.onmouseup = (event: any) => {
      // 记录最后一次坐标信息
      setEndPosition(event)
      
      // 清除事件
      currentTarget.onmousemove = null
      currentTarget.onmouseup = null
    }
  }
  
  function clean() {
    setSelectedCoordinates([])
    setSelectedIndexList([])
  }
  
  useImperativeHandle(ref, () => ({
    merge: () => setRows(mergeTable(flatTableRow(rows), selectedCoordinates, columnNumber)),
    split: () => setRows(splitTable(flatTableRow(rows), selectedIndexList, columnNumber)),
    clean
  }))
  
  return <table className="d-table-container" onMouseDown={onMouseDown}>
    <THead columnNumber={columnNumber} />
    <TBody
      rows={rows}
      rowNumber={rowNumber}
      columnNumber={columnNumber}
      selectedList={selectedIndexList}
      customRenderCell={customRenderCell}
    />
  </table>
}

export default React.forwardRef(Table)
