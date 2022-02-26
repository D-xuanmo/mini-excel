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
  mergeTable, splitTable
} from './utils'

function Table(props: TableProps, ref: any) {
  const { rowNumber, columnNumber, customRenderCell } = props
  const [rows, setRows] = useState(generateTableMap(generateFlatTableRows(rowNumber, columnNumber), columnNumber))
  const [, setStartCoordinate] = useState('')
  const [, setEndCoordinate] = useState('')
  const [selectedCoordinates, setSelectedCoordinates] = useState<Array<string>>([])
  const [selectedIndexList, setSelectedIndexList] = useState<Array<number>>([])
  
  function onMouseDown(event: React.MouseEvent) {
    const flatRows = flatTableRow(rows)
    const currentTarget = event.currentTarget as HTMLElement
    // 当前点击的单元格
    const cell = getElementParent(event.target as HTMLElement, 'td')
    // 开始坐标
    const startCoordinate = cell?.dataset.coordinate!
    const startMergedCoordinate = cell?.dataset.mergedCoordinate ?? ''
    // 记录所有的坐标
    let allCoordinates: string[] = [startCoordinate, startMergedCoordinate]
    setStartCoordinate(startCoordinate)
    
    function setEndPosition(event: React.MouseEvent) {
      allCoordinates = [startCoordinate, startMergedCoordinate]
      // 当前鼠标停留的单元格
      const currentCell = getElementParent(event.target as HTMLElement, 'td')
      
      // 当前鼠标停留单元格坐标
      const currentCellCoordinate = currentCell?.dataset.coordinate ?? ''
      
      // 如果当前单元格被合并过，则需要一起被记录
      const currentMergedCoordinate = currentCell?.dataset.mergedCoordinate
      if (currentMergedCoordinate) allCoordinates.push(currentMergedCoordinate)
      
      allCoordinates.push(currentCellCoordinate)
      
      const {
        startCoordinate: _startCoordinate,
        endCoordinate
      } = buildSelectionCoordinates(flatRows, allCoordinates, columnNumber)
      setStartCoordinate(_startCoordinate)
      setEndCoordinate(endCoordinate)
      setSelectedCoordinates(getCoordinateRange(flatRows, _startCoordinate, endCoordinate, columnNumber))
      setSelectedIndexList(coordinatesToIndexList(flatRows, _startCoordinate, endCoordinate, columnNumber))
    }
    
    currentTarget.onmousemove = (event: any) => setEndPosition(event)
    
    currentTarget.onmouseup = (event: any) => {
      setEndPosition(event)
      currentTarget.onmousemove = null
      currentTarget.onmouseup = null
    }
  }
  
  function clean() {
    setStartCoordinate('')
    setEndCoordinate('')
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
