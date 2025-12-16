import { NextResponse } from 'next/server';

export async function GET() {
    const config = {
        "interface_id": "reg_pro_v3",
        "validation_mode": "strict",
        "layout_grid": "compact_3_row",
        "logic_hooks": [
            {
                "trigger_field": "title",
                "action": "set_value",
                "target_field": "gender",
                "map": {
                    "Mr.": "Male",
                    "Master": "Male",
                    "Mrs.": "Female",
                    "Ms.": "Female"
                }
            }
        ],
        "fields": [
            // --- ROW 1 ---
            { "key": "reg_date", "label": "Reg. Date", "default": "today", "read_only": true, "width": "33%" },
            { "key": "lab_id", "label": "Lab ID", "context_bind": "lab_id", "read_only": true, "width": "33%" },
            { "key": "reg_by", "label": "Registered By", "type": "select", "options": ["Receptionist 1", "Receptionist 2"], "width": "33%" },

            // --- ROW 2 ---
            { "key": "mobile", "label": "Mobile", "type": "number", "max_len": 10, "width": "25%" },
            { "key": "title", "label": "Title", "type": "select", "options": ["Mr.", "Mrs.", "Ms.", "Master", "Baby of", "Dr."], "width": "15%" },
            { "key": "first_name", "label": "First Name", "type": "text", "width": "30%" },
            { "key": "last_name", "label": "Last Name", "type": "text", "width": "30%" },

            // --- ROW 3 ---
            { "key": "age", "label": "Age (Yrs)", "type": "number", "width": "20%" },
            { "key": "gender", "label": "Gender", "type": "select", "options": ["Male", "Female"], "read_only": false, "width": "20%" },
            { "key": "email", "label": "Email", "type": "email", "width": "60%" },

            // --- ROW 4 ---
            { "key": "address", "label": "Address", "type": "text", "width": "100%" },

            // --- ROW 5 ---
            { "key": "consulting_dr", "label": "Consulting Dr.", "type": "async_select", "width": "50%" },
            { "key": "remarks", "label": "Remarks", "type": "text", "width": "50%" }
        ]
    };

    return NextResponse.json(config);
}
