export type LabId =
    | 'lab_001_bhonsle'
    | 'lab_002_megascan'
    | 'lab_003_general'
    | 'lab_004_path'
    | 'lab_005_clinic';

export type UserRole = 'admin' | 'staff';

export interface UserContext {
    user_uid: string;
    lab_context: {
        id: LabId;
        display_name: string;
        theme: string;
        db_root: string;
    };
    access_control: {
        is_admin: boolean;
        can_manage_users: boolean;
        can_edit_branding: boolean;
        can_view_financials: boolean;
    };
}

export const LAB_REGISTRY: Record<LabId, { name: string; theme: string }> = {
    lab_001_bhonsle: { name: "Dr. Bhonsle Laboratory", theme: "blue" },
    lab_002_megascan: { name: "MegaScan Imaging", theme: "red" },
    lab_003_general: { name: "Niriksha Pathology", theme: "green" },
    lab_004_path: { name: "Lab-4", theme: "purple" },
    lab_005_clinic: { name: "Lab-5", theme: "orange" },
};

export const USER_DIRECTORY: Record<string, { lab_id: LabId; role: UserRole }> = {
    uid_bhonsle_main: { lab_id: 'lab_001_bhonsle', role: 'admin' },
    uid_megascan_main: { lab_id: 'lab_002_megascan', role: 'admin' },
    uid_lab3_main: { lab_id: 'lab_003_general', role: 'admin' },
    uid_lab4_main: { lab_id: 'lab_004_path', role: 'admin' },
    uid_lab5_main: { lab_id: 'lab_005_clinic', role: 'admin' },
};

export function getUserContext(uid: string): UserContext | null {
    const user = USER_DIRECTORY[uid];
    if (!user) return null;

    const lab = LAB_REGISTRY[user.lab_id];
    const isAdmin = user.role === 'admin';

    return {
        user_uid: uid,
        lab_context: {
            id: user.lab_id,
            display_name: lab.name,
            theme: lab.theme,
            db_root: `/laboratories/${user.lab_id}`,
        },
        access_control: {
            is_admin: isAdmin,
            can_manage_users: isAdmin,
            can_edit_branding: isAdmin,
            can_view_financials: isAdmin,
        },
    };
}
