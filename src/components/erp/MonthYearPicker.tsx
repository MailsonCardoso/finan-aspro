import { useState } from "react";
import { ChevronDown } from "lucide-react";

const months = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

interface MonthYearPickerProps {
    month: string;
    year: string;
    onChange: (month: string, year: string) => void;
}

export function MonthYearPicker({ month, year, onChange }: MonthYearPickerProps) {
    return (
        <div className="flex items-center gap-2 bg-card border rounded-xl px-3 py-1.5 shadow-sm">
            <div className="relative flex items-center">
                <select
                    value={month}
                    onChange={(e) => onChange(e.target.value, year)}
                    className="appearance-none bg-transparent pr-8 pl-2 py-1 text-sm font-semibold focus:outline-none cursor-pointer text-foreground"
                >
                    {months.map((m) => (
                        <option key={m.value} value={m.value} className="bg-card text-foreground">
                            {m.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="h-4 w-4 absolute right-2 pointer-events-none text-muted-foreground" />
            </div>

            <div className="h-4 w-[1px] bg-border mx-1" />

            <div className="relative flex items-center">
                <select
                    value={year}
                    onChange={(e) => onChange(month, e.target.value)}
                    className="appearance-none bg-transparent pr-8 pl-2 py-1 text-sm font-semibold focus:outline-none cursor-pointer text-foreground"
                >
                    {years.map((y) => (
                        <option key={y} value={y} className="bg-card text-foreground">
                            {y}
                        </option>
                    ))}
                </select>
                <ChevronDown className="h-4 w-4 absolute right-2 pointer-events-none text-muted-foreground" />
            </div>
        </div>
    );
}
