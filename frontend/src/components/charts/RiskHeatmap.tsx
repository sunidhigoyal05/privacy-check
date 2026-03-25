import { Tooltip } from '@nextui-org/react';

interface HeatmapRow {
  data_type: string;
  [key: string]: string | number;
}

interface RiskHeatmapProps {
  data: HeatmapRow[];
}

const STAGES = ['collection', 'storage', 'processing', 'sharing', 'retention'];

const getColor = (value: number): string => {
  if (value >= 0.8) return 'bg-danger-400';
  if (value >= 0.6) return 'bg-warning-400';
  if (value >= 0.4) return 'bg-warning-200';
  if (value >= 0.2) return 'bg-success-200';
  return 'bg-success-100';
};

const getTextColor = (value: number): string => {
  if (value >= 0.6) return 'text-white';
  return 'text-gray-700';
};

export default function RiskHeatmap({ data }: RiskHeatmapProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">Data Type</th>
            {STAGES.map(stage => (
              <th key={stage} className="text-center text-xs font-medium text-gray-500 pb-3 capitalize px-2">
                {stage}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td className="text-sm text-gray-700 py-1.5 pr-4 capitalize font-medium">{row.data_type}</td>
              {STAGES.map(stage => {
                const value = Number(row[stage]) || 0;
                return (
                  <td key={stage} className="px-1 py-1.5">
                    <Tooltip content={`${row.data_type} → ${stage}: ${Math.round(value * 100)}% risk`}>
                      <div className={`${getColor(value)} ${getTextColor(value)} rounded-lg px-3 py-2 text-center text-xs font-medium cursor-default transition-all hover:scale-105`}>
                        {Math.round(value * 100)}%
                      </div>
                    </Tooltip>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
