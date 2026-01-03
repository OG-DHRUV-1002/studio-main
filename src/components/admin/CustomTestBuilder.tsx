'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { insertCustomTest } from "@/lib/db";
import { CustomTestDefinition } from "@/lib/types";
import {
    Bold, Italic, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered,
    Table as TableIcon, Plus, Trash2, Save, Type,
    Loader2, HelpCircle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function CustomTestBuilder() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Test Meta
    const [testName, setTestName] = useState('');
    const [price, setPrice] = useState('0');
    const [testCode, setTestCode] = useState('');
    const [department, setDepartment] = useState('Pathology');
    const [isStatic, setIsStatic] = useState(false);

    // Variable Insertion State
    const [varName, setVarName] = useState('');
    const [varUnit, setVarUnit] = useState('');
    const [isVarDialogOpen, setIsVarDialogOpen] = useState(false);

    // State for Workflow Mode
    const [mode, setMode] = useState<'intro' | 'editor'>('intro');
    const [existingTests, setExistingTests] = useState<CustomTestDefinition[]>([]);
    const [standardTests, setStandardTests] = useState<any[]>([]);
    const [openCombobox, setOpenCombobox] = useState(false);

    // Fetch existing tests on mount
    useEffect(() => {
        async function loadTests() {
            // Load Custom Tests
            if (user?.lab_context?.id) {
                try {
                    const { getCustomTests } = await import('@/lib/db');
                    const tests = await getCustomTests(user.lab_context.id);
                    setExistingTests(tests);
                } catch (e) { console.error(e); }
            }

            // Load Standard Tests
            try {
                const { PROFILE_DEFINITIONS } = await import('@/lib/profile-definitions');
                // DEDUPLICATE AND SORT
                const unique = Array.from(new Map(PROFILE_DEFINITIONS.map(item => [item.profile_id, item])).values());
                const sorted = unique.sort((a, b) => a.profile_name.localeCompare(b.profile_name));
                setStandardTests(sorted);
            } catch (e) { console.error(e); }
        }
        loadTests();
    }, [user]);

    // Handler for creating new test
    const handleCreateNew = () => {
        setTestName('');
        setTestCode('');
        setPrice('0');
        setDepartment('Pathology');
        setIsStatic(false);
        editor?.commands.setContent(`
            <h2>TEST REPORT</h2>
            <p>Enter your report format here...</p>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                <tbody>
                    <tr>
                        <th style="border: 1px solid black; padding: 8px;"><strong>Test Parameter</strong></th>
                        <th style="border: 1px solid black; padding: 8px;"><strong>Result</strong></th>
                        <th style="border: 1px solid black; padding: 8px;"><strong>Unit</strong></th>
                        <th style="border: 1px solid black; padding: 8px;"><strong>Ref. Range</strong></th>
                    </tr>
                </tbody>
            </table>
        `);
        setMode('editor');
    };

    // Handler for editing existing test
    const handleEditTest = (testId: string) => {
        setOpenCombobox(false); // Close combobox on selection

        // Check Custom Tests First
        const customTest = existingTests.find(t => t.test_code === testId || t.id === testId);
        if (customTest) {
            setTestName(customTest.test_name);
            setTestCode(customTest.test_code);
            setPrice(customTest.price.toString());
            setDepartment(customTest.department || 'Pathology');
            setIsStatic(customTest.is_static || false);

            let content = customTest.html_template || '';
            if (!content && customTest.report_config) {
                content = `<h2>${customTest.test_name}</h2>` + customTest.report_config.components.map((c: any) => `<p>${c.label}: {{${c.key}}}</p>`).join('');
            }
            if (!content) content = `<p>No template found.</p>`;

            editor?.commands.setContent(content);
            setMode('editor');
            return;
        }

        // Check Standard Tests
        const standardTest = standardTests.find(t => t.profile_id === testId);
        if (standardTest) {
            setTestName(standardTest.profile_name);
            setTestCode(standardTest.profile_id); // Keep original ID as code
            setPrice('0'); // Default price for standard tests (usually undefined in definition)
            setDepartment('Pathology');

            // CONVERT COMPONENT STRUCTURE TO HTML TABLE
            let rows = '';
            standardTest.components.forEach((comp: any) => {
                if (comp.input_type === 'header') {
                    rows += `
                        <tr>
                            <td colspan="4" style="border: 1px solid black; padding: 8px; background-color: #f0f0f0;"><strong>${comp.label}</strong></td>
                        </tr>
                     `;
                } else {
                    rows += `
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;">${comp.label}</td>
                            <td style="border: 1px solid black; padding: 8px;">{{${comp.key}}}</td>
                            <td style="border: 1px solid black; padding: 8px;">${comp.unit || ''}</td>
                            <td style="border: 1px solid black; padding: 8px;">${comp.validation?.ref_range_text || ''}</td>
                        </tr>
                     `;
                }
            });

            const html = `
                <h2>${standardTest.profile_name}</h2>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                    <tbody>
                        <tr>
                            <th style="border: 1px solid black; padding: 8px;"><strong>Test Parameter</strong></th>
                            <th style="border: 1px solid black; padding: 8px;"><strong>Result</strong></th>
                            <th style="border: 1px solid black; padding: 8px;"><strong>Unit</strong></th>
                            <th style="border: 1px solid black; padding: 8px;"><strong>Ref. Range</strong></th>
                        </tr>
                        ${rows}
                    </tbody>
                </table>
             `;

            editor?.commands.setContent(html);
            setMode('editor');
        }
    };

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Table.configure({ resizable: true, HTMLAttributes: { class: 'border-collapse table-auto w-full border border-black' } }),
            TableRow,
            TableHeader,
            TableCell.configure({ HTMLAttributes: { class: 'border border-black p-2' } }),
        ],
        content: '', // Content is set by handlers
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[500px]',
            },
        },
    });

    const insertVariable = () => {
        if (!varName) return;
        const key = `{{${varName}}}`;
        editor?.chain().focus().insertContent(key).run();
        setVarName('');
        setVarUnit('');
        setIsVarDialogOpen(false);
    };

    const handleSave = async () => {
        if (!user?.lab_context?.id) return;
        if (!testName) {
            toast({ title: "Error", description: "Test Name is required", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const htmlContent = editor?.getHTML() || '';
            const code = testCode || `CUST_${Date.now()}`;

            // EXTRACT VARIABLES
            // Regex to find {{VariableName}}
            const regex = /{{(.*?)}}/g;
            const matches = htmlContent.match(regex);
            const inputSchema: any[] = [];

            if (matches) {
                const uniqueVars = Array.from(new Set(matches));
                uniqueVars.forEach(v => {
                    const cleanKey = v.replace('{{', '').replace('}}', '');
                    inputSchema.push({
                        key: cleanKey,
                        label: cleanKey, // Default label to key
                        type: 'text'
                    });
                });
            }

            const def: CustomTestDefinition = {
                id: '', // Will be set by Firebase (or logic inside generic DB handler)
                test_code: code,
                test_name: testName,
                department: department,
                price: parseFloat(price) || 0,
                html_template: htmlContent,
                input_schema: inputSchema,
                is_static: isStatic
            };

            await insertCustomTest(user.lab_context.id, def);

            toast({ title: "Success", description: "Test Template Saved Successfully!" });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save test", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    if (!editor) {
        return null;
    }

    if (mode === 'intro') {
        return (
            <div className="max-w-4xl mx-auto space-y-8 mt-12">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Custom Test Builder</h2>
                    <p className="text-muted-foreground">Create new test templates or edit existing ones.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="hover:border-primary cursor-pointer transition-all" onClick={handleCreateNew}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-6 w-6 text-primary" />
                                Create New Test
                            </CardTitle>
                            <CardDescription>
                                Start from scratch with a blank template.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-32 bg-slate-50 border border-dashed rounded-md flex items-center justify-center text-muted-foreground">
                                Blank Canvas
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Type className="h-6 w-6 text-blue-600" />
                                Edit Existing Test
                            </CardTitle>
                            <CardDescription>
                                Update an existing test template.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCombobox}
                                        className="w-full justify-between"
                                    >
                                        Select a test to edit...
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search test..." />
                                        <CommandList>
                                            <CommandEmpty>No test found.</CommandEmpty>

                                            {/* CUSTOM TESTS GROUP */}
                                            {existingTests.length > 0 && (
                                                <CommandGroup heading="Custom Tests">
                                                    {existingTests.map((test) => (
                                                        <CommandItem
                                                            key={test.id || test.test_code}
                                                            value={test.test_name + " " + test.test_code} // Search by name or code
                                                            onSelect={() => handleEditTest(test.test_code)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    "opacity-0" // Always hidden as acts like action button
                                                                )}
                                                            />
                                                            {test.test_name}
                                                            <span className="ml-2 text-xs text-muted-foreground">({test.test_code})</span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            )}

                                            <CommandSeparator />

                                            {/* STANDARD LIBRARY GROUP */}
                                            <CommandGroup heading="Standard Library">
                                                {standardTests.map((test) => (
                                                    <CommandItem
                                                        key={test.profile_id}
                                                        value={test.profile_name}
                                                        onSelect={() => handleEditTest(test.profile_id)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                "opacity-0"
                                                            )}
                                                        />
                                                        {test.profile_name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <div className="text-xs text-muted-foreground">
                                Search and select a test from the library to load its template.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => setMode('intro')}>
                    ← Back to Selection
                </Button>
            </div>

            {/* META DATA CARD */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Details</CardTitle>
                    <CardDescription>Configure the basic test information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Test Name</Label>
                            <Input value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="e.g. Lipid Profile" />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input value={testCode} onChange={(e) => setTestCode(e.target.value)} placeholder="e.g. LIPID_01" />
                        </div>
                        <div className="space-y-2">
                            <Label>Price (₹)</Label>
                            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pathology">Pathology</SelectItem>
                                    <SelectItem value="Microbiology">Microbiology</SelectItem>
                                    <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                                    <SelectItem value="Serology">Serology</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-2">
                        <Switch id="static-mode" checked={isStatic} onCheckedChange={setIsStatic} />
                        <Label htmlFor="static-mode">Static Report (No Data Entry)</Label>
                    </div>
                    <p className="text-[0.8rem] text-muted-foreground mt-1">
                        If enabled, this test will skip the Data Entry screen and be ready for printing immediately after ordering.
                    </p>
                </CardContent>
            </Card>

            {/* EDITOR CARD */}
            <Card className="flex-1 flex flex-col min-h-[700px]">
                <CardHeader className="border-b pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                            {/* TEXT FORMATTING */}
                            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-muted' : ''}><Bold className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-muted' : ''}><Italic className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-muted' : ''}><UnderlineIcon className="h-4 w-4" /></Button>

                            <div className="w-px h-6 bg-slate-300 mx-2" />

                            {/* ALIGNMENT */}
                            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}><AlignLeft className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}><AlignCenter className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}><AlignRight className="h-4 w-4" /></Button>

                            <div className="w-px h-6 bg-slate-300 mx-2" />

                            {/* LISTS */}
                            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-muted' : ''}><List className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-muted' : ''}><ListOrdered className="h-4 w-4" /></Button>

                            <div className="w-px h-6 bg-slate-300 mx-2" />

                            {/* TABLES */}
                            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon className="h-4 w-4 mr-1" /> Add Table</Button>
                            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>+Col</Button>
                            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>+Row</Button>
                            <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>

                        </div>

                        <div className="flex gap-2">
                            {/* SYNTAX GUIDE */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                                        <HelpCircle className="h-5 w-5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Template Variables</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Use curly braces to create dynamic fields.
                                        </p>
                                        <div className="rounded bg-muted p-2 text-xs font-mono">
                                            <p>Patient: {"{{PatientName}}"}</p>
                                            <p>Result: {"{{Hemoglobin}}"}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            These will become input fields in Data Entry.
                                        </p>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* INSERT VARIABLE */}
                            <Dialog open={isVarDialogOpen} onOpenChange={setIsVarDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-dashed border-primary text-primary hover:bg-primary/10">
                                        <Plus className="h-4 w-4 mr-1" /> Insert Field
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Insert Data Field</DialogTitle>
                                        <DialogDescription>
                                            Adding a field like "Hemoglobin" will create an input box in the Result Entry form.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Field Name</Label>
                                            <Input
                                                value={varName}
                                                onChange={(e) => setVarName(e.target.value)}
                                                placeholder="e.g. Hemoglobin"
                                                onKeyDown={(e) => e.key === 'Enter' && insertVariable()}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={insertVariable}>Insert Placeholder</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Template
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-auto bg-white">
                    <div className="min-h-[29.7cm] w-[21cm] mx-auto bg-white shadow-sm border my-8 p-[1in]">
                        <EditorContent editor={editor} />
                    </div>
                </CardContent>
            </Card>

            <style jsx global>{`
                .ProseMirror {
                    outline: none;
                }
                .ProseMirror table {
                    border-collapse: collapse;
                    table-layout: fixed;
                    width: 100%;
                    margin: 0;
                    overflow: hidden;
                }
                .ProseMirror td,
                .ProseMirror th {
                    min-width: 1em;
                    border: 1px solid #ced4da;
                    padding: 3px 5px;
                    vertical-align: top;
                    box-sizing: border-box;
                    position: relative;
                }
                .ProseMirror th {
                    font-weight: bold;
                    text-align: left;
                    background-color: #f1f3f5;
                }
                .ProseMirror .selectedCell:after {
                    z-index: 2;
                    position: absolute;
                    content: "";
                    left: 0; right: 0; top: 0; bottom: 0;
                    background: rgba(200, 200, 255, 0.4);
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}

