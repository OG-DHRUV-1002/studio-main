
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
import { useAuth } from "@/lib/auth-context";
import { downloadFile } from "@/lib/utils";
import { PROFILE_DEFINITIONS } from "@/lib/profile-definitions";

interface ReportClientProps {
    order: TestOrder;
}

// ... (imports remain)

export function ReportClient({ order }: ReportClientProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const calculateAge = (dob: Date) => {
        const ageDifMs = Date.now() - new Date(dob).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const getReportTitle = (testSubset: typeof order.tests) => {
        // 1. Check Hardcoded Specimen from Profile Definitions (Highest Priority)
        const hardcodedSpecimens = new Set<string>();
        testSubset.forEach(t => {
            const profile = PROFILE_DEFINITIONS.find(p => p.profile_name === t.testName || p.profile_name.toLowerCase() === t.testName.toLowerCase());
            if (profile?.specimen) {
                hardcodedSpecimens.add(profile.specimen);
            }
        });

        if (hardcodedSpecimens.size > 0) {
            const specs = Array.from(hardcodedSpecimens).sort();

            // Special Override for Semen to maintain specific title format
            if (specs.length === 1 && specs[0].toLowerCase() === 'semen') {
                return "SEMEN ANALYSIS REPORT";
            }

            // General case: Join specimens
            // Replace commas with & for better readability in title (e.g. "Blood, Urine") -> "BLOOD & URINE"
            const titleSpecs = specs.map(s => s.replace(/,/g, ' &')).join(" & ").toUpperCase();
            return `EXAMINATION OF ${titleSpecs}`;
        }

        // 2. Check explicit specimen field first if available (common in clinical orders)
        if (order.specimen) {
            const spec = order.specimen.toLowerCase();
            if (spec.includes('blood') || spec.includes('serum') || spec.includes('plasma')) return "EXAMINATION OF BLOOD";
            if (spec.includes('urine')) return "EXAMINATION OF URINE";
            if (spec.includes('stool') || spec.includes('faeces')) return "EXAMINATION OF STOOL";
            if (spec.includes('sputum')) return "EXAMINATION OF SPUTUM";
            if (spec.includes('semen')) return "SEMEN ANALYSIS REPORT";
            // Generic fallback for manual entry
            return `EXAMINATION OF ${order.specimen.toUpperCase()}`;
        }

        // 3. Inference from Test Names (Fallback or if specimen is blank)
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

            // --- MASTER REPORT ENGINE V4 HELPERS ---

            const getTestCategory = (testName: string) => {
                const name = testName.toUpperCase();
                // CASE 1: HAEMATOLOGY & CLINICAL PATH
                if (name.includes('CBC') || name.includes('HAEMOGRAM') || name.includes('HEMOGRAM') || name.includes('ESR') || name.includes('HB') || name.includes('PCV') || name.includes('PLATELET')) return 'HAEMATOLOGY';
                if (name.includes('URINE') || name.includes('STOOL') || name.includes('SEMEN') || name.includes('SPUTUM') || name.includes('FLUID')) return 'CLINICAL_PATH';

                // CASE 2: BIOCHEMISTRY
                if (name.includes('LIPID') || name.includes('LIVER') || name.includes('RENAL') || name.includes('KIDNEY') || name.includes('DIABETIC') || name.includes('SUGAR') || name.includes('IRON') || name.includes('ELECTROLYTE') || name.includes('CALCIUM') || name.includes('PHOSPHORUS') || name.includes('AMYLASE') || name.includes('SGOT') || name.includes('SGPT')) return 'BIOCHEMISTRY';
                if (name.includes('THYROID') || name.includes('TSH') || name.includes('FSH') || name.includes('LH') || name.includes('PROLACTIN') || name.includes('HCG') || name.includes('INFERTILITY')) return 'HORMONES'; // Treated similar to Biochem usually

                // CASE 3: SEROLOGY
                if (name.includes('HIV') || name.includes('HBSAG') || name.includes('HCV') || name.includes('VDRL') || name.includes('WIDAL') || name.includes('DENGUE') || name.includes('MALARIA') || name.includes('RA FACTOR') || name.includes('ASO') || name.includes('CRP') || name.includes('UPT') || name.includes('COOMB')) return 'SEROLOGY';

                // CASE 4: MICROBIOLOGY
                if (name.includes('CULTURE')) return 'MICROBIOLOGY';

                return 'OTHER';
            };

            const getFooterText = (category: string) => {
                switch (category) {
                    case 'BIOCHEMISTRY': return "Method: Photometry / Kinetic / ISE.";
                    case 'HAEMATOLOGY': return "Method: Cell Counter / Flow Cytometry / Westergren's Method.";
                    case 'SEROLOGY': return "Method: Immunochromatography (Rapid Card) / Agglutination.";
                    case 'HORMONES': return "Method: CLIA / ELFA.";
                    case 'CLINICAL_PATH': return "Method: Manual Microscopy & Dipstick Chemistry.";
                    case 'MICROBIOLOGY': return "Method: Conventional Culture & Sensitivity.";
                    default: return "Method: Fully Automated Laboratory Technologies.";
                }
            };

            // Injection Map for Header Rows
            const getInjectionHeader = (key: string, profileName: string) => {
                const pName = profileName.toUpperCase();

                // HAEMATOLOGY (CBC)
                if (pName.includes('CBC') || pName.includes('HAEMOGRAM')) {
                    if (key === 'mcv') return "RBC INDICES";
                    if (key === 'neutrophils') return "DIFFERENTIAL LEUCOCYTE COUNT";
                    if (key === 'platelet') return "PLATELET COUNT";
                }

                // BIOCHEMISTRY (LIPID)
                if (pName.includes('LIPID') && key === 'cholesterol') return "LIPID PROFILE";
                if ((pName.includes('LIVER') || pName.includes('LFT')) && key === 'bil_total') return "LIVER FUNCTION TEST";
                if ((pName.includes('RENAL') || pName.includes('KIDNEY') || pName.includes('RFT')) && key === 'bun') return "RENAL FUNCTION TEST";

                // CLINICAL PATH (URINE/STOOL/SEMEN)
                if (pName.includes('URINE')) {
                    if (key === 'color' && !pName.includes('CULTURE')) return "PHYSICAL EXAMINATION";
                    if (key === 'urine_protein') return "CHEMICAL EXAMINATION";
                    if (key === 'pus_cells') return "MICROSCOPIC EXAMINATION";
                }
                if (pName.includes('STOOL')) {
                    if (key === 'stool_color') return "PHYSICAL EXAMINATION";
                    if (key === 'ova') return "MICROSCOPIC EXAMINATION";
                }
                if (pName.includes('SEMEN')) {
                    if (key === 'volume') return "PHYSICAL EXAMINATION";
                    if (key === 'sperm_count') return "MICROSCOPIC EXAMINATION";
                    if (key === 'motility') return "MOTILITY STUDY";
                }

                return null;
            };

            const getSectionHeader = (key: string, profileName: string) => {
                const pName = profileName.toUpperCase();
                // CBC / HAEMOGRAM
                if (pName.includes('CBC') || pName.includes('HEMOGRAM')) {
                    if (key === 'mcv') return "RBC INDICES";
                    if (key === 'neutrophils') return "DIFFERENTIAL LEUCOCYTE COUNT";
                    if (key === 'platelet') return "PLATELET COUNT";
                }
                // URINE - (Note: Profile definitions already have headers, but ignoring to follow prompt strictness if needed, or augmenting)
                // If profile has native headers, we rely on input_type='header'. This helper is for *Injections*.

                return null;
            };

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
                const category = getTestCategory(test.testName);

                if (profile && test.resultValue && test.resultValue.startsWith('{')) {
                    try {
                        const results = JSON.parse(test.resultValue);
                        return profile.components.map(comp => {
                            // 1. INJECTION LOGIC
                            const injectionTitle = getInjectionHeader(comp.key, test.testName);
                            let injectionRow = '';
                            if (injectionTitle) {
                                injectionRow = `
                                    <tr>
                                        <td colspan="4" style="font-weight:bold; text-decoration:underline; padding-top:10px; padding-bottom:5px; font-size:10pt;">
                                            ${injectionTitle}
                                        </td>
                                    </tr>
                                `;
                            }

                            // Existing Header Component Logic (Urine/Semen/Stool usually have these)
                            if (comp.input_type === 'header') {
                                return `
                                    <tr>
                                        <td colspan="4" style="font-weight: bold; font-size: 11pt; padding-top: 15px; padding-bottom: 5px; text-transform: uppercase; text-decoration: underline;">
                                            ${comp.label}
                                        </td>
                                    </tr>
                                `;
                            }

                            // CASE 4: MICROBIOLOGY
                            if (category === 'MICROBIOLOGY') {
                                if (comp.key === 'culture_status') {
                                    const status = results[comp.key] || '-';
                                    if (status.includes('Growth Detected')) {
                                        return `
                                            <tr>
                                                <td colspan="4" style="padding: 10px 0;">
                                                    <strong>Result: ${status}</strong>
                                                    <br><br>
                                                    <table style="width: 100%; border: 1px dotted #000; border-collapse: collapse;">
                                                        <tr style="background-color: #f0f0f0;">
                                                            <th style="padding: 5px; border: 1px dotted #000; text-align: left;">ANTIBIOTIC NAME</th>
                                                            <th style="padding: 5px; border: 1px dotted #000; text-align: left;">SENSITIVITY</th>
                                                        </tr>
                                                        <tr><td style="padding: 5px; border: 1px dotted #000;">Amikacin</td><td style="padding: 5px; border: 1px dotted #000;">Sensitive (S)</td></tr>
                                                        <tr><td style="padding: 5px; border: 1px dotted #000;">Gentamicin</td><td style="padding: 5px; border: 1px dotted #000;">Resistant (R)</td></tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        `;
                                    }
                                }
                            }

                            // CASE 3: SEROLOGY
                            const isSerology = category === 'SEROLOGY';
                            const resultVal = results[comp.key] || '-';
                            const isPositive = isSerology && (resultVal.toLowerCase().includes('reactive') || resultVal.toLowerCase().includes('positive'));

                            if (isSerology) {
                                return `
                                    ${injectionRow}
                                    <tr>
                                        <td style="padding-left: 5px; padding-top: 5px; padding-bottom: 5px; width: 40%;">${comp.label}</td>
                                        <td style="padding-top: 5px; padding-bottom: 5px; width: 30%; font-weight: ${isPositive ? 'bold' : 'normal'};">
                                            ${resultVal}
                                        </td>
                                        <td style="padding-top: 5px; padding-bottom: 5px; width: 5%;">-</td>
                                        <td style="padding-top: 5px; padding-bottom: 5px; width: 25%;">${isPositive ? 'Negative' : ''}</td>
                                    </tr>
                                `;
                            }

                            // STANDARD RENDERING (Biochemistry, Haematology, etc.)
                            return `
                                ${injectionRow}
                                <tr>
                                    <td style="padding-left: 5px; padding-top: 5px; padding-bottom: 5px; width: 35%;">${comp.label}</td>
                                    <td style="padding-top: 5px; padding-bottom: 5px; width: 25%; font-weight: ${isPositive ? 'bold' : 'normal'};">
                                        ${resultVal}
                                    </td>
                                    <td style="padding-top: 5px; padding-bottom: 5px; width: 15%;">${comp.unit || '-'}</td>
                                    <td style="padding-top: 5px; padding-bottom: 5px; width: 25%;">${comp.validation?.ref_range_text || ''}</td>
                                </tr>
                            `;
                        }).join('');
                    } catch (e) { }
                }

                // Style 5: Single Parameter / Fallback
                return `
                    <tr>
                        <td style="padding-top: 5px; padding-bottom: 5px; width: 35%;">${test.testName}</td>
                        <td style="padding-top: 5px; padding-bottom: 5px; width: 25%; font-weight: bold;">${test.resultValue || '-'}</td>
                        <td style="padding-top: 5px; padding-bottom: 5px; width: 15%;">-</td>
                        <td style="padding-top: 5px; padding-bottom: 5px; width: 25%;">${test.normalRange || '-'}</td>
                    </tr>
                `;
            };

            const pagesHtml = order.tests.map((test, index) => {
                const title = getReportTitle([test]);
                const isLast = index === order.tests.length - 1;
                const category = getTestCategory(test.testName);
                const footerText = getFooterText(category);

                return `
                    <div style="${!isLast ? 'page-break-after: always; mso-page-break-after: always;' : ''}">
                        <!-- 1 Line Empty Space for Header -->
                        <p>&nbsp;</p>

                        ${renderHeader()}

                        <!-- Main Content Box -->
                        <div style="border: 1px solid #000; padding: 20px; margin-top: 10px;">
                            <h3 style="text-align: center; text-transform: uppercase; text-decoration: underline; margin-bottom: 20px; font-size: 14pt;">${title}</h3>

                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th style="text-align: left; width: 35%; border-bottom: 1px solid #000; padding: 5px;">TEST</th>
                                        <th style="text-align: left; width: 25%; border-bottom: 1px solid #000; padding: 5px;">RESULT</th>
                                        <th style="text-align: left; width: 15%; border-bottom: 1px solid #000; padding: 5px;">UNIT</th>
                                        <th style="text-align: left; width: 25%; border-bottom: 1px solid #000; padding: 5px;">REFERENCE RANGE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${renderTestContent(test)}
                                </tbody>
                            </table>

                            <!-- Dynamic Methodology Footer -->
                            <div style="font-size: 9pt; margin-top: 20px; border-top: 1px dotted #000; padding-top: 5px;">
                                <strong>Method:</strong> ${footerText}<br>
                            </div>

                            ${user?.lab_context?.id === 'lab_001_bhonsle' ? `
                                <div style="margin-top: 40px; text-align: right; padding-right: 10px; page-break-inside: avoid;">
                                    <!-- Spacing for Stamp -->
                                    <br><br><br>
                                    <div style="font-weight: bold; font-size: 11pt; text-transform: uppercase;">Dr. S.T. Bhonsle</div>
                                    <div style="font-weight: bold; font-size: 10pt;">MD, DPB</div>
                                </div>
                            ` : ''}
                        </div>

                         <p align="center" style="font-weight:bold; margin-top: 20px;">
                            --- *** End of Report *** ---
                        </p>
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
