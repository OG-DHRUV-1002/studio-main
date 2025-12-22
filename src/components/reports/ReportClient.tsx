
'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2 } from "lucide-react";
import type { TestOrder } from "@/lib/types";
import { format } from "date-fns";

import { generateReportAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { downloadFile } from "@/lib/utils";
import { PROFILE_DEFINITIONS } from "@/lib/profile-definitions";

interface ReportClientProps {
    order: TestOrder;
}

// ... (imports remain)

export function ReportClient({ order }: ReportClientProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const calculateAge = (dob: Date) => {
        const ageDifMs = Date.now() - new Date(dob).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const getReportTitle = (testSubset: typeof order.tests) => {
        // 1. Check explicit specimen field first if available (common in clinical orders)
        if (order.specimen) {
            const spec = order.specimen.toLowerCase();
            if (spec.includes('blood') || spec.includes('serum') || spec.includes('plasma')) return "EXAMINATION OF BLOOD";
            if (spec.includes('urine')) return "EXAMINATION OF URINE";
            if (spec.includes('stool') || spec.includes('faeces')) return "EXAMINATION OF STOOL";
            if (spec.includes('sputum')) return "EXAMINATION OF SPUTUM";
            if (spec.includes('semen')) return "SEMEN ANALYSIS REPORT";
        }

        // 2. Inference from Test Names (Fallback or if specimen is blank)
        const testNames = testSubset.map(t => t.testName.toUpperCase()).join(' ');

        // Keywords for Sputum
        if (testNames.includes('SPUTUM')) return "EXAMINATION OF SPUTUM";

        // Keywords for Stool
        if (testNames.includes('STOOL')) return "EXAMINATION OF STOOL";

        // Keywords for Urine
        if (testNames.includes('URINE')) return "EXAMINATION OF URINE";

        // Keywords for Semen
        if (testNames.includes('SEMEN')) return "SEMEN ANALYSIS REPORT";

        // Keywords for Blood/Serum (Most common, so checked last as default-ish)
        if (testNames.includes('BLOOD') || testNames.includes('SERUM') || testNames.includes('HEMOGRAM') || testNames.includes('CBC') || testNames.includes('LIPID') || testNames.includes('LIVER') || testNames.includes('RENAL') || testNames.includes('THYROID') || testNames.includes('BIOCHEMISTRY')) {
            return "EXAMINATION OF BLOOD";
        }

        return "LABORATORY REPORT";
    };

    const handleDownloadDoc = async () => {
        setIsGenerating(true);
        const result = await generateReportAction(order.orderId);

        if (result.success) {

            const renderHeader = () => `
                <table style="width: 100%; margin-bottom: 20px;">
                    <tr>
                        <td style="text-align: left; width: 50%;">
                            Patient Name : <strong>${order.patient?.fullName}</strong>
                        </td>
                        <td style="text-align: right; width: 50%;">
                            Lab No: <strong>${order.orderId}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">
                            Referred by : ${order.referredBy || 'Self'}
                        </td>
                        <td style="text-align: right;">
                            Date : ${format(new Date(order.orderDate), "dd/MM/yyyy")}
                        </td>
                    </tr>
                    ${order.patient ? `
                    <tr>
                        <td style="text-align: left;">
                            Age/Sex : ${calculateAge(order.patient.dateOfBirth)} / ${order.patient.gender}
                        </td>
                         <td style="text-align: right;"></td>
                    </tr>
                    ` : ''}
                </table>
            `;

            const renderTestContent = (test: typeof order.tests[0]) => {
                const profile = PROFILE_DEFINITIONS.find(p => p.profile_name === test.testName);
                if (profile && test.resultValue && test.resultValue.startsWith('{')) {
                    try {
                        const results = JSON.parse(test.resultValue);
                        return profile.components.map(comp => {
                            if (comp.input_type === 'header') {
                                return `
                                    <tr>
                                        <td colspan="3" style="font-weight: bold; padding-top: 10px; padding-bottom: 5px; text-transform: uppercase;">
                                            ${comp.label}
                                        </td>
                                    </tr>
                                `;
                            }
                            return `
                                <tr>
                                    <td style="padding-left: 0;">${comp.label}</td>
                                    <td>${results[comp.key] || '-'} ${comp.unit}</td>
                                    <td>${comp.validation?.ref_range_text || ''}</td>
                                </tr>
                            `;
                        }).join('');
                    } catch (e) { }
                }
                return `
                    <tr>
                        <td>${test.testName}</td>
                        <td>${test.resultValue || '-'}</td>
                        <td>${test.normalRange || '-'}</td>
                    </tr>
                `;
            };

            const pagesHtml = order.tests.map((test, index) => {
                const title = getReportTitle([test]);
                const isLast = index === order.tests.length - 1;

                return `
                    <div style="${!isLast ? 'page-break-after: always; mso-page-break-after: always;' : ''}">
                        <!-- 1 Line Empty Space for Header -->
                        <p>&nbsp;</p>

                        ${renderHeader()}

                        <h3 style="text-align: center; text-transform: uppercase; text-decoration: underline;">${title}</h3>

                        <table style="width: 100%; margin-top: 10px;">
                            <thead>
                                <tr style="border-bottom: 1px solid #000;">
                                    <th style="text-align: left; width: 40%;">TEST</th>
                                    <th style="text-align: left; width: 30%;">RESULT</th>
                                    <th style="text-align: left; width: 30%;">REFERENCE RANGE</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${renderTestContent(test)}
                            </tbody>
                        </table>
                    </div>
                    ${!isLast ? '<br clear=all style="mso-special-character:line-break;page-break-before:always">' : ''}
                `;
            }).join('');

            // Updated HTML for Clean, Pre-printed Stationery Format
            const static_html = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Report</title>
                <style>
                    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.2; }
                    table { border-collapse: collapse; width: 100%; border: none; }
                    th, td { padding: 4px; border: none; } 
                    
                    @page {
                        size: 21cm 29.7cm;
                        margin: 1.0in;
                    }
                </style>
                </head>
                <body>
                    <!-- Main Content -->
                    ${pagesHtml}
                </body>
                </html>
            `;
            const dataUri = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(static_html);

            downloadFile(
                dataUri,
                `report-${order.orderId}.doc`
            );

            toast({
                title: "Report Downloaded",
                description: "Clean format report downloaded.",
            });
        } else {
            toast({
                title: "Error",
                description: result.message,
                variant: "destructive",
            });
        }
        setIsGenerating(false);
    };

    const hasResults = order.tests.some(t => t.resultValue);

    return (
        <div className="space-y-8">
            <div className="flex justify-end max-w-4xl mx-auto mb-4">
                <Button onClick={handleDownloadDoc} disabled={isGenerating || !hasResults}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download Word Document
                </Button>
            </div>

            {order.tests.map((test, index) => {
                const title = getReportTitle([test]);

                return (
                    <Card key={index} className="max-w-4xl mx-auto border-0 shadow-lg mb-8 min-h-[1123px] flex flex-col">
                        <CardContent className="space-y-6 p-8 font-calibri text-lg flex-1 relative">
                            {/* Header Spacer Simulation */}
                            <div className="h-24 bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-muted-foreground text-sm mb-8">
                                (Space for Pre-printed Header)
                            </div>

                            <div className="grid grid-cols-2 gap-y-2">
                                <div>Patient Name : <span className="font-bold">{order.patient?.fullName}</span></div>
                                <div className="text-right">Lab No: <span className="font-bold">{order.orderId}</span></div>

                                <div>Referred by : {order.referredBy || 'Self'}</div>
                                <div className="text-right">Date : {format(new Date(order.orderDate), "dd/MM/yyyy")}</div>

                                {order.patient && (
                                    <div>Age/Sex : {calculateAge(order.patient.dateOfBirth)} / {order.patient.gender}</div>
                                )}
                            </div>

                            <div className="text-center font-bold text-xl uppercase mt-4 mb-4 underline">
                                {title}
                            </div>

                            <div className="space-y-4">
                                {/* Table Header */}
                                <div className="grid grid-cols-3 font-bold border-b border-black pb-2">
                                    <div>TEST</div>
                                    <div>RESULT</div>
                                    <div>REFERENCE RANGE</div>
                                </div>

                                {(() => {
                                    const profile = PROFILE_DEFINITIONS.find(p => p.profile_name === test.testName);
                                    if (profile && test.resultValue && test.resultValue.startsWith('{')) {
                                        try {
                                            const results = JSON.parse(test.resultValue);
                                            return (
                                                <div className="space-y-1 mt-4">
                                                    {profile.components.map(comp => {
                                                        if (comp.input_type === 'header') {
                                                            return (
                                                                <div key={comp.key} className="font-bold underline mt-4 mb-2 text-sm uppercase">
                                                                    {comp.label}
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div key={comp.key} className="grid grid-cols-3">
                                                                <div>{comp.label}</div>
                                                                <div>{results[comp.key] || '-'} {comp.unit}</div>
                                                                <div>{comp.validation?.ref_range_text || ''}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        } catch (e) { }
                                    }
                                    return (
                                        <div className="grid grid-cols-3 mt-2">
                                            <div>{test.testName}</div>
                                            <div>{test.resultValue || '-'}</div>
                                            <div>{test.normalRange || '-'}</div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </CardContent>
                        <div className="bg-muted/20 p-2 text-center text-xs text-muted-foreground border-t">
                            Page {index + 1} of {order.tests.length}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
