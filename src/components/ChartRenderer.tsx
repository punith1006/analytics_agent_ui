"use client";

import React from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

// Professional color palette
const COLORS = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#06b6d4", "#f97316", "#84cc16",
];

interface ChartConfig {
    type: "line" | "bar" | "area" | "pie" | "scatter";
    title: string;
    data: Record<string, unknown>[];
    xAxis: { dataKey: string; label: string; angle?: number; tickMargin?: number };
    yAxis: { dataKey: string; label: string };
    series: { dataKey: string; name: string; color: string; fill?: string; strokeDasharray?: string }[];
    height?: number;
}

// Event fired when user clicks on a chart data point
export interface DataPointClickEvent {
    dimension: string;      // The x-axis dimension (e.g., "category_name")
    value: unknown;         // The y-axis value (e.g., 45)
    label: string;          // Display label (e.g., "Technology")
    seriesName: string;     // The series clicked (e.g., "Enrollments")
    rawData: Record<string, unknown>;  // Full data point object
    mouseX: number;         // Mouse X position for popover
    mouseY: number;         // Mouse Y position for popover
}

interface ChartRendererProps {
    config: ChartConfig;
    className?: string;
    onDataPointClick?: (event: DataPointClickEvent) => void;
}

export default function ChartRenderer({ config, className = "", onDataPointClick }: ChartRendererProps) {
    const { type, title, data, xAxis, yAxis, series, height = 400 } = config;

    // Track mouse position for popover placement
    const mousePosition = React.useRef({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        mousePosition.current = { x: e.clientX, y: e.clientY };
    };

    if (!data || data.length === 0) {
        return (
            <div className={`flex h-64 items-center justify-center rounded-xl bg-gray-50 ${className}`}>
                <p className="text-gray-500">No data available for visualization</p>
            </div>
        );
    }

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 20, right: 30, left: 20, bottom: 60 },
        };

        switch (type) {
            case "line":
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey={xAxis.dataKey}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            angle={xAxis.angle || 0}
                            tickMargin={xAxis.tickMargin || 10}
                        />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 20 }} />
                        {series.map((s, idx) => (
                            <Line
                                key={idx}
                                type="monotone"
                                dataKey={s.dataKey}
                                stroke={s.color || COLORS[idx % COLORS.length]}
                                strokeWidth={3}
                                dot={{ fill: s.color || COLORS[idx % COLORS.length], r: 5, strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 8, strokeWidth: 2, stroke: "#fff" }}
                                strokeDasharray={s.strokeDasharray}
                                name={s.name}
                            />
                        ))}
                    </LineChart>
                );

            case "bar":
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey={xAxis.dataKey}
                            tick={{ fill: "#6b7280", fontSize: 12 }}
                            angle={xAxis.angle || 0}
                            tickMargin={xAxis.tickMargin || 10}
                        />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 20 }} />
                        {series.map((s, idx) => (
                            <Bar
                                key={idx}
                                dataKey={s.dataKey}
                                fill={s.fill || s.color || COLORS[idx % COLORS.length]}
                                name={s.name}
                                radius={[8, 8, 0, 0]}
                                cursor={onDataPointClick ? "pointer" : undefined}
                                onClick={(barData) => {
                                    if (onDataPointClick && barData) {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const dataRecord = barData as unknown as Record<string, unknown>;
                                        onDataPointClick({
                                            dimension: xAxis.dataKey,
                                            value: dataRecord[s.dataKey],
                                            label: String(dataRecord[xAxis.dataKey] ?? ""),
                                            seriesName: s.name,
                                            rawData: dataRecord,
                                            mouseX: mousePosition.current.x,
                                            mouseY: mousePosition.current.y
                                        });
                                    }
                                }}
                            />
                        ))}
                    </BarChart>
                );

            case "area":
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            {series.map((s, idx) => (
                                <linearGradient key={idx} id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={s.color || COLORS[idx % COLORS.length]} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={s.color || COLORS[idx % COLORS.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey={xAxis.dataKey} tick={{ fill: "#6b7280", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 20 }} />
                        {series.map((s, idx) => (
                            <Area
                                key={idx}
                                type="monotone"
                                dataKey={s.dataKey}
                                stroke={s.color || COLORS[idx % COLORS.length]}
                                strokeWidth={2}
                                fill={`url(#gradient-${idx})`}
                                name={s.name}
                            />
                        ))}
                    </AreaChart>
                );

            case "pie":
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={140}
                            paddingAngle={3}
                            dataKey={yAxis.dataKey}
                            nameKey={xAxis.dataKey}
                            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                            labelLine={{ stroke: "#6b7280" }}
                            onClick={(pieData) => {
                                if (onDataPointClick && pieData) {
                                    onDataPointClick({
                                        dimension: xAxis.dataKey,
                                        value: pieData[yAxis.dataKey as keyof typeof pieData],
                                        label: String(pieData.name ?? pieData[xAxis.dataKey as keyof typeof pieData] ?? ""),
                                        seriesName: yAxis.dataKey,
                                        rawData: pieData as unknown as Record<string, unknown>,
                                        mouseX: mousePosition.current.x,
                                        mouseY: mousePosition.current.y
                                    });
                                }
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    cursor={onDataPointClick ? "pointer" : undefined}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                            }}
                        />
                        <Legend />
                    </PieChart>
                );

            case "scatter":
                return (
                    <ScatterChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey={xAxis.dataKey} tick={{ fill: "#6b7280", fontSize: 12 }} name={xAxis.label} />
                        <YAxis dataKey={yAxis.dataKey} tick={{ fill: "#6b7280", fontSize: 12 }} name={yAxis.label} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                            }}
                        />
                        <Legend />
                        <Scatter name={series[0]?.name || "Data"} data={data} fill={series[0]?.color || COLORS[0]} />
                    </ScatterChart>
                );

            default:
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey={xAxis.dataKey} tick={{ fill: "#6b7280" }} />
                        <YAxis tick={{ fill: "#6b7280" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={yAxis.dataKey} fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                    </BarChart>
                );
        }
    };

    return (
        <div
            className={`rounded-2xl bg-white p-6 shadow-xl ${className}`}
            onMouseMove={handleMouseMove}
        >
            <h3 className="mb-6 text-xl font-bold text-gray-800">{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}
