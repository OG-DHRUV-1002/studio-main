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
        // Extended details for Receipt
        subtitle?: string;
        address?: string[]; // Array for multi-line address
        email?: string;
        phone?: string;
        whatsapp?: string;
        license_no?: string;
    };
    access_control: {
        is_admin: boolean;
        can_manage_users: boolean;
        can_edit_branding: boolean;
        can_view_financials: boolean;
    };
}

export const LAB_REGISTRY: Record<LabId, {
    name: string;
    theme: string;
    subtitle?: string;
    address?: string[];
    email?: string;
    phone?: string;
    whatsapp?: string;
    license_no?: string;
}> = {
    lab_001_bhonsle: {
        name: "Dr. Bhonsle Laboratory",
        theme: "blue",
        address: ["Main Street, City Center", "Mumbai - 400001"],
        phone: "9876543210"
    },
    lab_002_megascan: {
        name: "MegaScan Imaging",
        theme: "red",
        address: ["Imaging Plaza, 2nd Floor", "Sector 5, Navi Mumbai"],
        phone: "022-12345678"
    },
    lab_003_general: {
        name: "Niriksha Pathology",
        theme: "green",
        subtitle: "Day & Night Pathology Lab & Blood Bank",
        address: [
            "1, Paras Darshan, M.G. Road, Ghatkopar (E)",
            "M - 77"
        ],
        email: "anvikshalab@gmail.com",
        phone: "35134351/2/3/4",
        whatsapp: "8591265830",
        license_no: "L123456789"
    },
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
            subtitle: lab.subtitle,
            address: lab.address,
            email: lab.email,
            phone: lab.phone,
            whatsapp: lab.whatsapp,
            license_no: lab.license_no,
        },
        access_control: {
            is_admin: isAdmin,
            can_manage_users: isAdmin,
            can_edit_branding: isAdmin,
            can_view_financials: isAdmin,
        },
    };
}
