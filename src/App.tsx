import React, { useRef } from 'react'
import './App.css'
import Table from './components/Table'
import { TableRef } from './components/Table/types'

function App() {
  const tableRef = useRef<TableRef>()
  return <>
    <button onClick={() => tableRef?.current?.merge()}>合并</button>
    <button onClick={() => tableRef?.current?.split()}>拆分</button>
    <button onClick={() => tableRef?.current?.clean()}>清除选区</button>
    <Table
      ref={tableRef}
      rowNumber={10}
      columnNumber={10}
    />
  </>
}

export default App
