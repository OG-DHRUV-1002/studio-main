'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { USER_DIRECTORY } from "@/lib/admin-config";

export function UserSwitcher() {
    const { loginAs, loading } = useAuth();

    // Convert directory to array for easier mapping
    const users = Object.entries(USER_DIRECTORY).map(([uid, config]) => ({
        uid,
        ...config
    }));

    return (
        <div className="flex flex-wrap gap-2">
            {users.map((u) => (
                <Button
                    key={u.uid}
                    variant="outline"
                    size="sm"
                    onClick={() => loginAs(u.uid)}
                    disabled={loading}
                >
                    Switch to {u.role === 'admin' ? 'Admin' : 'Staff'} ({u.lab_id.replace('lab_', '').replace('_', ' ')})
                </Button>
            ))}
        </div>
    );
}
