'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ProfileDefinition, ProfileComponent } from '@/lib/profile-definitions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ProfileDataEntryProps {
    profile: ProfileDefinition;
    initialValues: Record<string, any>;
    onChange: (values: Record<string, any>) => void;
}

export function ProfileDataEntry({ profile, initialValues, onChange }: ProfileDataEntryProps) {
    const [values, setValues] = useState<Record<string, any>>(initialValues || {});

    // Effect to handle calculations
    useEffect(() => {
        const newValues = { ...values };
        let hasChanges = false;

        profile.components.forEach(comp => {
            if (comp.input_type === 'calculated' && comp.formula) {
                try {
                    // Replace variables in formula like {alb} with actual values
                    let formula = comp.formula;
                    let readyToCalc = true;

                    // Iterate over keys to replace placeholders
                    // We need to match {key} patterns
                    const matches = formula.match(/\{([^}]+)\}/g);
                    if (matches) {
                        matches.forEach(match => {
                            const key = match.slice(1, -1);
                            const val = values[key];
                            // Allow calculation if value is 0, but not if undefined or empty string
                            if (val === undefined || val === '' || isNaN(Number(val))) {
                                readyToCalc = false;
                            } else {
                                formula = formula.replace(match, String(val));
                            }
                        });
                    }

                    if (readyToCalc) {
                        try {
                            // Safe eval using Function constructor
                            const calculated = new Function(`return ${formula}`)();

                            // Round to 2 decimals
                            const rounded = Math.round(calculated * 100) / 100;

                            if (newValues[comp.key] !== rounded) {
                                newValues[comp.key] = rounded;
                                hasChanges = true;
                            }
                        } catch (e) {
                            // Calculation error, ignore
                        }
                    }
                } catch (err) {
                    console.error("Formula parsing error", err);
                }
            }
        });

        if (hasChanges) {
            setValues(newValues);
            onChange(newValues);
        }
    }, [values, profile.components, onChange]);

    const handleChange = (key: string, val: string) => {
        const newValues = { ...values, [key]: val };
        setValues(newValues);
        onChange(newValues);
    };

    return (
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b">
                <h4 className="font-semibold text-primary">{profile.profile_name}</h4>
                <p className="text-xs text-muted-foreground">Enter results below.</p>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-[40%] text-black font-semibold">Test Parameter</TableHead>
                        <TableHead className="w-[30%] text-black font-semibold">Result</TableHead>
                        <TableHead className="w-[30%] text-black font-semibold">Reference Range</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {profile.components.map(comp => {
                        // Handle Header Type
                        if (comp.input_type === 'header') {
                            return (
                                <TableRow key={comp.key} className="bg-gray-100 hover:bg-gray-100">
                                    <TableCell colSpan={3} className="font-bold text-gray-800 py-2">
                                        {comp.label}
                                    </TableCell>
                                </TableRow>
                            );
                        }

                        // Normal Input logic
                        return (
                            <TableRow key={comp.key} className="hover:bg-gray-50/50">
                                <TableCell className="font-medium align-middle py-2">
                                    {comp.label}
                                    {comp.unit && <span className="text-xs text-muted-foreground ml-1">({comp.unit})</span>}
                                </TableCell>
                                <TableCell className="py-2">
                                    {comp.input_type === 'dropdown' ? (
                                        <Select
                                            value={String(values[comp.key] || '')}
                                            onValueChange={(v) => handleChange(comp.key, v)}
                                        >
                                            <SelectTrigger id={comp.key} className="h-9">
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {comp.options?.map(opt => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : comp.input_type === 'text_area' ? (
                                        <textarea
                                            id={comp.key}
                                            value={values[comp.key] || ''}
                                            onChange={(e) => handleChange(comp.key, e.target.value)}
                                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                        />
                                    ) : (
                                        <Input
                                            id={comp.key}
                                            type={comp.input_type === 'number' || comp.input_type === 'calculated' ? 'number' : 'text'}
                                            value={values[comp.key] || ''}
                                            onChange={(e) => handleChange(comp.key, e.target.value)}
                                            readOnly={comp.input_type === 'calculated'}
                                            className={`h-9 ${comp.input_type === 'calculated' ? 'bg-gray-100 font-semibold text-blue-600' : ''}`}
                                        />
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500 py-2">
                                    {comp.validation?.ref_range_text || '-'}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
