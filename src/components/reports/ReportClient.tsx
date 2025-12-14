
'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2 } from "lucide-react";
import type { TestOrder } from "@/lib/types";
import { generateReportAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { downloadFile } from "@/lib/utils";

interface ReportClientProps {
    order: TestOrder;
}

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
            const static_html = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Report</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 11pt; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { padding: 4px; }
                    .header-table td { vertical-align: top; }
                    @page {
                        mso-footer: f1;
                        margin-bottom: 1.25in;
                    }
                    div.footer {
                        position: fixed;
                        bottom: 0;
                        right: 0;
                        width: 100%;
                    }
                </style>
                </head>
                <body>
                    <table class="header-table" style="width: 100%;">
                        <tr>
                            <td style="width: 33%; text-align: left;">
                                <h2 style="font-size: 24px; font-weight: bold; margin: 0;">DR. BHONSLE'S LABORATORY</h2>
                            </td>
                            <td style="width: 34%; text-align: center; font-size: 10pt;">
                                27, SHANTI CENTRE,<br />3RD FLOOR, SEC-17, VASHI,<br />NAVI MUMBAI - 400 705.<br />TIME: 8.00 AM. TO 9.00 PM.<br />PH.: 7977173732 / 8779508920<br />EMAIL.:drbhonsleslab@gmail.com
                            </td>
                            <td style="width: 33%; text-align: right;">
                                <h3 style="font-size: 18px; font-weight: bold; margin: 0;">DR. S. T. BHONSLE</h3>
                                <p style="margin: 0;">M.D., D.P.B. | CONSULTING PATHOLOGIST</p>
                            </td>
                        </tr>
                    </table>
                    <hr />
                     <table style="width: 100%; margin-top: 2px; margin-bottom: 2px; font-size: 11pt; line-height: 1;">
                        <tr>
                            <td><strong>Patient's Name</strong>: ${order.patient?.fullName}</td>
                            <td><strong>Date</strong>: ${new Date(order.orderDate).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <td><strong>Referred By</strong>: ${order.referredBy}</td>
                            <td><strong>Lab No</strong>: ${order.orderId}</td>
                        </tr>
                        <tr>
                            <td><strong>Specimen</strong>: ${order.specimen}</td>
                             ${order.patient ? `<td><strong>Age/Sex</strong>: ${calculateAge(order.patient.dateOfBirth)} / ${order.patient.gender}</td>` : ''}
                        </tr>
                    </table>
                    <hr />
                    <h3 style="text-align: center; text-decoration: underline; margin-top: 20px; font-size: 14pt;">REPORT</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11pt;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Test Name</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Result</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Normal Range</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.tests.map(test => `
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${test.testName}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${test.resultValue || 'N/A'}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${test.normalRange || 'N/A'}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${test.technicianNotes || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="footer" style="text-align: right; margin-top: 120px;">
                         <div style="mso-element:footer" id="f1">
                             <p style="margin-bottom: 0px;">&nbsp;</p>
                             <p style="margin-top: 40px; margin-bottom: 0;"><strong>Dr. S.T. Bhonsle</strong></p>
                             <p style="margin: 0;">MD, DPB</p>
                        </div>
                    </div>
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
                description: "The Word document report has been downloaded successfully.",
            });
        } else {
            toast({
                title: "Error Generating Report",
                description: result.message || "An unknown error occurred.",
                variant: "destructive",
            });
        }
        setIsGenerating(false);
    };

    const hasResults = order.tests.some(t => t.resultValue);

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-start text-sm">
                    <div className="text-left flex-1">
                        <h2 className="text-2xl font-bold">DR. BHONSLE'S LABORATORY</h2>
                    </div>
                    <div className="text-center text-muted-foreground whitespace-pre-line flex-1 text-[10px] leading-tight">
                        <p>
                            27, SHANTI CENTRE,
                            <br />
                            3RD FLOOR, SEC-17, VASHI,
                            <br />
                            NAVI MUMBAI - 400 705.
                            <br />
                            TIME: 8.00 AM. TO 9.00 PM.
                            <br />
                            PH.: 7977173732 / 8779508920
                            <br />
                            EMAIL.:drbhonsleslab@gmail.com
                        </p>
                    </div>
                    <div className="text-right flex-1">
                        <h3 className="text-lg font-bold">DR. S. T. BHONSLE</h3>
                        <p className="text-muted-foreground">
                            M.D., D.P.B. | CONSULTING PATHOLOGIST
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-0.5 flex flex-col min-h-[600px]">
                 <Separator />
                <div className="grid grid-cols-2 gap-x-8 gap-y-0">
                    <div>
                        <span className="font-semibold w-28 inline-block">Patient's Name</span>: {order.patient?.fullName}
                    </div>
                    <div>
                         <span className="font-semibold w-20 inline-block">Date</span>: {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                     <div>
                        <span className="font-semibold w-28 inline-block">Referred By</span>: {order.referredBy}
                    </div>
                     <div>
                        <span className="font-semibold w-20 inline-block">Lab No</span>: {order.orderId}
                    </div>
                    <div>
                        <span className="font-semibold w-28 inline-block">Specimen</span>: {order.specimen}
                    </div>
                    {order.patient && 
                        <div>
                            <span className="font-semibold w-20 inline-block">Age/Sex</span>: {calculateAge(order.patient.dateOfBirth)} / {order.patient.gender}
                        </div>
                    }
                </div>
                <Separator />
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-2 text-center underline">REPORT</h3>
                     <div className="border rounded-lg mt-4">
                        <div className="grid grid-cols-4 font-semibold p-2 bg-muted">
                            <div>Test Name</div>
                            <div className="text-center">Result</div>
                            <div className="text-center">Normal Range</div>
                            <div className="text-right">Notes</div>
                        </div>
                        {order.tests.map((test, index) => (
                            <div key={index} className="grid grid-cols-4 p-2 border-t">
                                <div>{test.testName}</div>
                                <div className="text-center">{test.resultValue || 'N/A'}</div>
                                <div className="text-center">{test.normalRange || 'N/A'}</div>
                                <div className="text-right">{test.technicianNotes || 'NA'}</div>
                            </div>
                        ))}
                    </div>
                     {!hasResults && (
                        <p className="text-center text-muted-foreground mt-4">
                            Results are not yet available for this order.
                        </p>
                    )}
                </div>
            </CardContent>
            <Separator />
            <CardFooter className="justify-between">
                <div>
                     <Button onClick={handleDownloadDoc} disabled={isGenerating || !hasResults}>
                        {isGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Download Report
                    </Button>
                </div>
                <div className="text-right">
                    <p className="font-semibold">Dr. S.T. Bhonsle</p>
                    <p>MD, DPB</p>
                </div>
            </CardFooter>
        </Card>
    );
}
