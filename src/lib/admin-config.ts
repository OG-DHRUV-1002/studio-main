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
        upiId?: string;
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
    upiId?: string;
}> = {
    lab_001_bhonsle: {
        name: "Dr. Bhonsle Laboratory",
        theme: "blue",
        address: ["27, Shanti Center, 3 Floor, Sector 17", "Vashi, Navi mumbai - 400705"],
        email: "drbhonsleslab@gmail.com",
        phone: "79771 73732 / 87795 08920",
        upiId: "q321887537@ybl"
    },
    lab_002_megascan: {
        name: "Megascan Imaging",
        theme: "red",
        address: [
            "Shop No. 29 & 30, Daffodils CHS Ltd.,",
            "Sudhakar Vishnu Londe Marg,",
            "Sector-14, Vashi, Navi Mumbai - 400703"
        ],
        email: "megascanimaging@gmail.com",
        phone: "88793 47488 / 98671 96788",
        upiId: "yogesh.dongre-googlemail.com@oksbi"
    },
    lab_003_general: {
        name: "Niriksha Pathology",
        theme: "green",
        address: [
            "NL-5/11/03, Sector 11, Nerul (E), Nerul,",
            "Navi Mumbai - 400706."
        ],
        email: "nirikshapathology.nerul@gmail.com",
        phone: "98206 40452 / 022-27702853",
        upiId: "paytmqr2810050501011eiwoccwvdbu@paytm"
    },
    lab_004_path: { name: "Seema Bhonsle", theme: "purple" },
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
            upiId: lab.upiId,
        },
        access_control: {
            is_admin: isAdmin,
            can_manage_users: isAdmin,
            can_edit_branding: isAdmin,
            can_view_financials: isAdmin,
        },
    };
}
