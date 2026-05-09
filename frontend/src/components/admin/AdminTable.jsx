export default function AdminTable({ columns = [], children }) {
  return (
    <div className="tableWrapper">
      <table className="adminTable">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}