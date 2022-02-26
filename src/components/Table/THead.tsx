import { TableProps } from './types'
import { generateTableHead } from './utils'

export interface THeadProps extends Pick<TableProps, 'columnNumber'> {
}

function THead(props: THeadProps) {
  const { columnNumber } = props
  const cells = generateTableHead(columnNumber).map((cell) => (
    <th key={cell}>{cell}</th>
  ))
  return <thead><tr>{cells}</tr></thead>
}

export default THead
