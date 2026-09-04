const Table = ({ headers = [], rows = [] }) => {
  const defaultHeaders = ["Column 1", "Column 2", "Column 3"];
  const defaultRows = [
    ["Row 1", "Data", "Data"],
    ["Row 2", "Data", "Data"],
  ];

  const tableHeaders = headers.length > 0 ? headers : defaultHeaders;
  const tableRows = rows.length > 0 ? rows : defaultRows;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700 transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(37,99,235,0.08)]">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800">
          <tr>
            {tableHeaders.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900">
          {tableRows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="group transition-all duration-200 hover:-translate-y-px hover:bg-slate-800/90"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="whitespace-nowrap px-4 py-3 text-sm text-slate-300 transition-colors duration-200 group-hover:text-slate-100"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
