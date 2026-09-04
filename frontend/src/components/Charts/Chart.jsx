const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const PieChart = ({ data = [], title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let cumulative = 0;

  const slices = data.map((item, i) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += item.value;
    const endAngle = (cumulative / total) * 360;
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    const d = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { d, color: item.color || COLORS[i % COLORS.length], label: item.label, value: item.value };
  });

  return (
    <div>
      {title && <p className="mb-3 text-sm font-medium text-gray-700">{title}</p>}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <svg viewBox="0 0 100 100" className="h-40 w-40 shrink-0">
          {slices.map((slice, i) => (
            <path key={i} d={slice.d} fill={slice.color} />
          ))}
          <circle cx="50" cy="50" r="20" fill="white" />
        </svg>
        <div className="space-y-2">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-gray-600">{slice.label}</span>
              <span className="font-medium text-gray-900">
                {Math.round((slice.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BarChart = ({ data = [], title, color = "#3b82f6" }) => {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      {title && <p className="mb-3 text-sm font-medium text-gray-700">{title}</p>}
      <div className="flex h-48 items-end justify-around gap-2 px-2">
        {data.map((item, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-medium text-gray-700">{item.value}</span>
            <div
              className="w-full max-w-[40px] rounded-t-md transition-all"
              style={{
                height: `${(item.value / max) * 100}%`,
                minHeight: item.value > 0 ? "4px" : "0",
                backgroundColor: item.color || color,
              }}
            />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChart = ({ data = [], title, color = "#3b82f6" }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * 280 + 10;
      const y = 120 - (d.value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      {title && <p className="mb-3 text-sm font-medium text-gray-700">{title}</p>}
      <svg viewBox="0 0 300 140" className="h-48 w-full">
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="10"
            y1={10 + i * 25}
            x2="290"
            y2={10 + i * 25}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          points={points}
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1 || 1)) * 280 + 10;
          const y = 120 - (d.value / max) * 100;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill={color} />
              <text x={x} y="135" textAnchor="middle" className="fill-gray-500 text-[8px]">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const HorizontalBarChart = ({ data = [], title }) => {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div>
      {title && (
        <p className="mb-3 text-sm font-medium text-gray-700">{title}</p>
      )}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.label || index}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-medium text-slate-800">{item.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (item.value / max) * 100)}%`,
                  background: item.color || COLORS[index % COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Chart = ({ type = "bar", data = [], title, color }) => {
  if (type === "pie") return <PieChart data={data} title={title} />;
  if (type === "line") return <LineChart data={data} title={title} color={color} />;
  if (type === "hbar") return <HorizontalBarChart data={data} title={title} />;
  return <BarChart data={data} title={title} color={color} />;
};

export default Chart;
