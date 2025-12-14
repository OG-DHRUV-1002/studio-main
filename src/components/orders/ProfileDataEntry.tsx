'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ProfileDefinition, ProfileComponent } from '@/lib/profile-definitions';
// import { evaluate } from 'mathjs'; // We might need this, or use simple eval/function

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
                            if (val === undefined || val === '' || isNaN(Number(val))) {
                                readyToCalc = false;
                            } else {
                                formula = formula.replace(match, String(val));
                            }
                        });
                    }

                    if (readyToCalc) {
                        try {
                            // Safe eval using Function constructor or simple logic
                            // For simplicity in this env, we'll use a basic evaluator or Function
                            // NOTE: 'eval' is dangerous in general, but here inputs are numbers
                            // Better to use a small math parser if possible, but for LIMS MVP we limit scope.
                            // We will use Function() for strict math evaluation.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50">
            <div className="col-span-1 md:col-span-2">
                <h4 className="font-semibold text-lg text-primary">{profile.profile_name}</h4>
                <p className="text-xs text-muted-foreground mb-4">Enter parameters below. Auto-calculations will trigger automatically.</p>
            </div>
            {profile.components.map(comp => (
                <div key={comp.key} className="space-y-2">
                    <Label htmlFor={comp.key} className="text-xs font-medium">
                        {comp.label} {comp.unit ? `(${comp.unit})` : ''}
                    </Label>

                    {comp.input_type === 'dropdown' ? (
                        <Select
                            value={String(values[comp.key] || '')}
                            onValueChange={(v) => handleChange(comp.key, v)}
                        >
                            <SelectTrigger id={comp.key}>
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
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={comp.validation?.ref_range_text || ''}
                        />
                    ) : (
                        <Input
                            id={comp.key}
                            type={comp.input_type === 'number' || comp.input_type === 'calculated' ? 'number' : 'text'}
                            value={values[comp.key] || ''}
                            onChange={(e) => handleChange(comp.key, e.target.value)}
                            readOnly={comp.input_type === 'calculated'}
                            placeholder={comp.validation?.ref_range_text || ''}
                            className={comp.input_type === 'calculated' ? 'bg-gray-100 font-semibold' : ''}
                        />
                    )}
                    {comp.validation?.ref_range_text && (
                        <p className="text-[10px] text-muted-foreground">Range: {comp.validation.ref_range_text}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
