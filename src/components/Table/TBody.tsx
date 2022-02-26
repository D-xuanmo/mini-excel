import { TableCellType, TableProps } from './types'
import { coordinateToIndex } from './utils'

export interface TBodyProps extends Pick<TableProps, 'rowNumber' | 'columnNumber' | 'customRenderCell'> {
  rows: Array<Array<TableCellType>>;
  selectedList: Array<number>;
}

export default function TBody(props: TBodyProps) {
  const { rows, columnNumber, selectedList, customRenderCell } = props
  const tableRows = rows.map((row, index) => {
    const cells = row.map((cell) => {
      if (!cell.rowSpan) return null
      return <td
        key={cell.coordinate}
        width={cell.width}
        height={cell.height}
        rowSpan={cell.rowSpan}
        colSpan={cell.colSpan}
        className={selectedList.includes(coordinateToIndex(cell.coordinate, columnNumber)) ? 'is-active' : undefined}
        data-coordinate={cell.coordinate}
        data-merged-coordinate={cell.mergedCoordinate}
      >{customRenderCell?.(cell)}</td>
    })
    return <tr key={index.toString()}>{cells}</tr>
  })
  return <tbody>{tableRows}</tbody>
}
