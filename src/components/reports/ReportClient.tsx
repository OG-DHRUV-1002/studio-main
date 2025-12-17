
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

    const handleDownloadDoc = async () => {
        setIsGenerating(true);
        const result = await generateReportAction(order.orderId);

        if (result.success) {
            // Updated HTML for Clean, Pre-printed Stationery Format
            const static_html = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Report</title>
                <style>
                    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.2; }
                    table { border-collapse: collapse; width: 100%; border: none; }
                    th, td { padding: 4px; border: none; } 
                    .header-spacer { height: 100px; } /* Approx 5 lines space */
                    .footer-spacer { height: 80px; } /* Approx 4 lines space */
                    @page {
                        margin-top: 2.0in; /* Leave space for pre-printed header */
                        margin-bottom: 1.0in;
                    }
                </style>
                </head>
                <body>
                    <!-- 5 Lines Empty Space for Header -->
                    <p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>

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

                    <br />

                    <h3 style="text-align: center; text-transform: uppercase;">LABORATORY REPORT</h3>

                    <table style="width: 100%; margin-top: 10px;">
                        <thead>
                            <tr style="border-bottom: 1px solid #000;"> <!-- Minimal separator like the image -->
                                <th style="text-align: left; width: 40%;">TEST</th>
                                <th style="text-align: left; width: 30%;">RESULT</th>
                                <th style="text-align: left; width: 30%;">REFERENCE RANGE</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.tests.map(test => {
                const profile = PROFILE_DEFINITIONS.find(p => p.profile_name === test.testName);
                if (profile && test.resultValue && test.resultValue.startsWith('{')) {
                    try {
                        const results = JSON.parse(test.resultValue);
                        const rows = profile.components.map(comp => `
                                            <tr>
                                                <td style="padding-left: 0;">${comp.label}</td>
                                                <td>${results[comp.key] || '-'} ${comp.unit}</td>
                                                <td>${comp.validation?.ref_range_text || ''}</td>
                                            </tr>
                                        `).join('');

                        return `
                                            <tr>
                                                <td colspan="3" style="padding-top: 10px;">
                                                    <div style="font-weight: bold; text-decoration: underline;">${test.testName}</div>
                                                </td>
                                            </tr>
                                            ${rows}
                                        `;
                    } catch (e) { }
                }
                return `
                                    <tr>
                                        <td>${test.testName}</td>
                                        <td>${test.resultValue || '-'}</td>
                                        <td>${test.normalRange || '-'}</td>
                                    </tr>
                                `;
            }).join('')}
                        </tbody>
                    </table>

                     <!-- 4 Lines Empty Space for Footer -->
                    <br /><br /><br /><br />
                     <p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>
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
        <Card className="max-w-4xl mx-auto border-0 shadow-none"> {/* Clean Preview */}
            <CardContent className="space-y-6 p-8 font-calibri text-lg"> {/* Preview mimicking the doc */}

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

                <div className="text-center font-bold text-xl uppercase mt-8 mb-4">
                    LABORATORY REPORT
                </div>

                <div className="space-y-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-3 font-bold border-b border-black pb-2">
                        <div>TEST</div>
                        <div>RESULT</div>
                        <div>REFERENCE RANGE</div>
                    </div>

                    {order.tests.map((test, index) => {
                        const profile = PROFILE_DEFINITIONS.find(p => p.profile_name === test.testName);
                        if (profile && test.resultValue && test.resultValue.startsWith('{')) {
                            try {
                                const results = JSON.parse(test.resultValue);
                                return (
                                    <div key={index} className="space-y-1 mt-4">
                                        <div className="font-bold underline">{test.testName}</div>
                                        {profile.components.map(comp => (
                                            <div key={comp.key} className="grid grid-cols-3">
                                                <div>{comp.label}</div>
                                                <div>{results[comp.key] || '-'} {comp.unit}</div>
                                                <div>{comp.validation?.ref_range_text || ''}</div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            } catch (e) { }
                        }
                        return (
                            <div key={index} className="grid grid-cols-3 mt-2">
                                <div>{test.testName}</div>
                                <div>{test.resultValue || '-'}</div>
                                <div>{test.normalRange || '-'}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Spacer Simulation */}
                <div className="h-24 bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-muted-foreground text-sm mt-12">
                    (Space for Pre-printed Footer)
                </div>

            </CardContent>
            <CardFooter className="justify-center">
                <Button onClick={handleDownloadDoc} disabled={isGenerating || !hasResults}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download Word Document
                </Button>
            </CardFooter>
        </Card>
    );
}
