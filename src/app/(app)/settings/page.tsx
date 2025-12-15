'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { updateLabSettings } from '@/lib/actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserSwitcher } from "@/components/debug/UserSwitcher";
// If toast import fails, I will remove it.

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);

    if (loading) return <div className="p-8">Loading settings...</div>;

    if (!user?.access_control.is_admin) {
        return <div className="p-8 text-red-500">Access Denied. Admin privileges required.</div>;
    }

    async function handleSubmit(formData: FormData) {
        setSaving(true);
        const res = await updateLabSettings(formData);
        setSaving(false);

        if (res.success) {
            toast({ title: "Success", description: res.message });
            // Ideally trigger a context refresh here, but page refresh works too
            window.location.reload();
        } else {
            toast({ title: "Error", description: res.message, variant: "destructive" });
        }
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Lab Configuration</h1>
            <p className="text-muted-foreground">Manage your laboratory's branding and settings.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Branding</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                name="displayName"
                                defaultValue={user.lab_context.display_name}
                                placeholder="e.g. Sunrise Diagnostics"
                            />
                            <p className="text-xs text-muted-foreground">This name appears in the header and reports.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="theme">Theme Color</Label>
                            <select
                                id="theme"
                                name="theme"
                                defaultValue={user.lab_context.theme}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="blue">Blue (Default)</option>
                                <option value="red">Red</option>
                                <option value="green">Green</option>
                                <option value="purple">Purple</option>
                                <option value="orange">Orange</option>
                            </select>
                        </div>

                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Sovereignty</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">You are administering an isolated node.</p>
                    <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                        Lab ID: {user.lab_context.id}<br />
                        DB Root: {user.lab_context.db_root}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-yellow-400 bg-yellow-50/10 dark:bg-yellow-900/10">
                <CardHeader>
                    <CardTitle className="text-yellow-600 dark:text-yellow-400 text-sm uppercase tracking-wide">Admin Verification Tool</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Use this "God Mode" switcher to jump between different isolated lab tenants and verify that data is strictly separated (different tables).
                    </p>
                    <UserSwitcher />
                </CardContent>
            </Card>
        </div>
    );
}
