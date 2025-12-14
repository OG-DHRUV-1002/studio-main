
export interface ProfileComponent {
    label: string;
    key: string;
    unit: string;
    input_type: 'number' | 'dropdown' | 'calculated' | 'text' | 'text_area' | 'dynamic_grid';
    options?: string[];
    formula?: string; // e.g. "{alb} / {glob}"
    validation?: {
        min?: number;
        max?: number;
        ref_range_text: string;
        panic_low?: number;
        panic_high?: number;
    };
}

export interface ProfileDefinition {
    profile_id: string;
    profile_name: string;
    components: ProfileComponent[];
    ui_actions?: {
        trigger: string;
        action: string;
        message: string;
    }[];
}

export const PROFILE_DEFINITIONS: ProfileDefinition[] = [
    {
        profile_id: "LFT_001",
        profile_name: "HEPATIC / LFT (Liver Function Test)",
        components: [
            {
                label: "Bilirubin Total",
                key: "bil_total",
                unit: "mg/dL",
                input_type: "number",
                validation: { min: 0, max: 20, ref_range_text: "0.2 - 1.2 mg/dL", panic_high: 15 }
            },
            {
                label: "Bilirubin Direct",
                key: "bil_direct",
                unit: "mg/dL",
                input_type: "number",
                validation: { min: 0, max: 10, ref_range_text: "0.0 - 0.3 mg/dL" }
            },
            {
                label: "Bilirubin Indirect",
                key: "bil_indirect",
                unit: "mg/dL",
                input_type: "calculated",
                formula: "{bil_total} - {bil_direct}",
                validation: { ref_range_text: "Calculated" }
            },
            {
                label: "SGOT / AST",
                key: "sgot",
                unit: "U/L",
                input_type: "number",
                validation: { min: 0, max: 2000, ref_range_text: "< 40 U/L", panic_high: 500 }
            },
            {
                label: "SGPT / ALT",
                key: "sgpt",
                unit: "U/L",
                input_type: "number",
                validation: { min: 0, max: 2000, ref_range_text: "< 40 U/L", panic_high: 500 }
            },
            {
                label: "S. Alkaline Phosphatase",
                key: "alk_phos",
                unit: "U/L",
                input_type: "number",
                validation: { min: 0, max: 2000, ref_range_text: "80 - 290 U/L" }
            },
            {
                label: "S. Total Proteins",
                key: "total_protein",
                unit: "g/dL",
                input_type: "number",
                validation: { min: 0, max: 15, ref_range_text: "6.0 - 8.0 g/dL" }
            },
            {
                label: "S. Albumin",
                key: "albumin",
                unit: "g/dL",
                input_type: "number",
                validation: { min: 0, max: 10, ref_range_text: "3.5 - 5.5 g/dL" }
            },
            {
                label: "S. Globulin",
                key: "globulin",
                unit: "g/dL",
                input_type: "calculated",
                formula: "{total_protein} - {albumin}",
                validation: { ref_range_text: "Calculated" }
            },
            {
                label: "A/G Ratio",
                key: "ag_ratio",
                unit: "",
                input_type: "calculated",
                formula: "{albumin} / {globulin}",
                validation: { ref_range_text: "Calculated" }
            }
        ],
        ui_actions: [
            {
                trigger: "if {bil_total} > 2.0",
                action: "toast_alert",
                message: "High Bilirubin detected."
            }
        ]
    },
    {
        profile_id: "LIPID_001",
        profile_name: "LIPID PROFILE",
        components: [
            {
                label: "S. Cholesterol",
                key: "cholesterol",
                unit: "mg/dL",
                input_type: "number",
                validation: { min: 0, max: 800, ref_range_text: "< 200 mg/dL", panic_high: 300 }
            },
            {
                label: "S. Triglycerides",
                key: "triglycerides",
                unit: "mg/dL",
                input_type: "number",
                validation: { min: 0, max: 2000, ref_range_text: "< 150 mg/dL", panic_high: 500 }
            },
            {
                label: "S. HDL Cholesterol",
                key: "hdl",
                unit: "mg/dL",
                input_type: "number",
                validation: { min: 0, max: 200, ref_range_text: "> 40 mg/dL" }
            },
            {
                label: "S. LDL Cholesterol",
                key: "ldl",
                unit: "mg/dL",
                input_type: "calculated",
                formula: "({cholesterol} - {hdl}) - ({triglycerides} / 5)", // Basic calculation, real app might use conditional Friedewald
                validation: { ref_range_text: "< 100 mg/dL" }
            },
            {
                label: "S. VLDL Cholesterol",
                key: "vldl",
                unit: "mg/dL",
                input_type: "calculated",
                formula: "{triglycerides} / 5",
                validation: { ref_range_text: "10 - 50 mg/dL" }
            },
            {
                label: "Chol/HDL Ratio",
                key: "chol_hdl_ratio",
                unit: "",
                input_type: "calculated",
                formula: "{cholesterol} / {hdl}",
                validation: { ref_range_text: "< 5.0" }
            },
            {
                label: "LDL/HDL Ratio",
                key: "ldl_hdl_ratio",
                unit: "",
                input_type: "calculated",
                formula: "{ldl} / {hdl}",
                validation: { ref_range_text: "< 3.0" }
            }
        ]
    },
    {
        profile_id: "CARDIAC_001",
        profile_name: "CARDIAC PROFILE",
        components: [
            { label: "CPK Total", key: "cpk_total", unit: "U/L", input_type: "number", validation: { min: 0, max: 5000, ref_range_text: "25 - 170 U/L" } },
            { label: "CK-MB", key: "ck_mb", unit: "IU/L", input_type: "number", validation: { min: 0, max: 500, ref_range_text: "0 - 25 IU/L" } },
            { label: "LDH", key: "ldh", unit: "U/L", input_type: "number", validation: { min: 0, max: 3000, ref_range_text: "140 - 280 U/L" } },
            { label: "SGOT / AST", key: "sgot_cardiac", unit: "U/L", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "< 40 U/L" } },
            { label: "Troponin I", key: "trop_i", unit: "ng/mL", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } },
            { label: "Troponin T", key: "trop_t", unit: "ng/mL", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "DIABETIC_001",
        profile_name: "DIABETIC PROFILE",
        components: [
            { label: "Blood Sugar Fasting", key: "bs_fasting", unit: "mg/dL", input_type: "number", validation: { min: 20, max: 1000, ref_range_text: "70 - 100 mg/dL" } },
            { label: "Blood Sugar PP", key: "bs_pp", unit: "mg/dL", input_type: "number", validation: { min: 20, max: 1000, ref_range_text: "< 140 mg/dL" } },
            { label: "HbA1c", key: "hba1c", unit: "%", input_type: "number", validation: { min: 3, max: 20, ref_range_text: "< 5.7% Non-Diabetic" } },
            { label: "Mean Est. Glucose", key: "eag", unit: "mg/dL", input_type: "calculated", formula: "(28.7 * {hba1c}) - 46.7", validation: { ref_range_text: "Calculated" } },
            { label: "Urine Sugar (Fasting)", key: "urine_sugar_f", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++", "++++"], validation: { ref_range_text: "Nil" } },
            { label: "Urine Sugar (PP)", key: "urine_sugar_pp", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++", "++++"], validation: { ref_range_text: "Nil" } }
        ]
    },
    {
        profile_id: "CBC_001",
        profile_name: "CBC/HAEMOGRAM",
        components: [
            { label: "Haemoglobin (Hb)", key: "hb", unit: "g/dL", input_type: "number", validation: { min: 0, max: 25, ref_range_text: "M: 13-17, F: 12-15 g/dL", panic_low: 7.0 } },
            { label: "Total WBC Count", key: "wbc", unit: "/cmm", input_type: "number", validation: { min: 0, max: 50000, ref_range_text: "4,000 - 11,000 /cmm" } },
            { label: "Neutrophils", key: "neutrophils", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "40-75 %" } },
            { label: "Lymphocytes", key: "lymphocytes", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "20-45 %" } },
            { label: "Eosinophils", key: "eosinophils", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "1-6 %" } },
            { label: "Monocytes", key: "monocytes", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "2-10 %" } },
            { label: "Basophils", key: "basophils", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "0-1 %" } },
            { label: "Platelet Count", key: "platelet", unit: "Lakh/cmm", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "1.5 - 4.5 Lakh/cmm", panic_low: 1.0 } },
            { label: "RBC Count", key: "rbc", unit: "Million/cmm", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "4.5 - 5.5 Million/cmm" } },
            { label: "PCV", key: "pcv", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "M: 40-50, F: 36-46 %" } },
            { label: "MCV", key: "mcv", unit: "fL", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "80-100 fL" } },
            { label: "MCH", key: "mch", unit: "pg", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "27-32 pg" } },
            { label: "MCHC", key: "mchc", unit: "g/dL", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "32-36 g/dL" } },
            { label: "RDW", key: "rdw", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "11-14 %" } },
            { label: "Peripheral Smear", key: "smear", unit: "", input_type: "text", validation: { ref_range_text: "Normocytic Normochromic" } }
        ] as any[], // Casting to allow 'text' input type if distinct from 'string' or logic handling textual inputs
        ui_actions: [
            { trigger: "if {hb} < 7.0", action: "toast_alert", message: "CRITICAL ALERT: Low Hemoglobin!" },
            { trigger: "if {platelet} < 1.0", action: "toast_alert", message: "CRITICAL ALERT: Low Platelet Count! Dengue Risk." }
        ]
    },
    {
        profile_id: "ESR_001",
        profile_name: "ESR",
        components: [
            { label: "ESR @ 1st Hour", key: "esr", unit: "mm", input_type: "number", validation: { min: 0, max: 150, ref_range_text: "M: 0-15, F: 0-20 mm" } }
        ]
    },
    {
        profile_id: "HB_001",
        profile_name: "HB",
        components: [
            { label: "Hemoglobin", key: "hb", unit: "g/dL", input_type: "number", validation: { min: 0, max: 25, ref_range_text: "M: 13-17, F: 12-15 g/dL" } }
        ]
    },
    {
        profile_id: "PCV_001",
        profile_name: "PCV",
        components: [
            { label: "PCV", key: "pcv", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "M: 40-50, F: 36-46 %" } }
        ]
    },
    {
        profile_id: "COAG_001",
        profile_name: "BT.CT.PT.PTT", // Matches tests.ts
        components: [
            { label: "Bleeding Time (BT)", key: "bt", unit: "Min:Sec", input_type: "number", validation: { ref_range_text: "1:00 - 5:00" } }, // Ideally time input, treating as text or number for MVP
            { label: "Clotting Time (CT)", key: "ct", unit: "Min:Sec", input_type: "number", validation: { ref_range_text: "3:00 - 10:00" } },
            { label: "PT (Test Value)", key: "pt_test", unit: "Sec", input_type: "number", validation: { ref_range_text: "11-13.5 Sec" } },
            { label: "PT (Control Value)", key: "pt_control", unit: "Sec", input_type: "number", validation: { ref_range_text: "11-13.5 Sec" } },
            { label: "INR", key: "inr", unit: "", input_type: "calculated", formula: "{pt_test} / {pt_control}", validation: { ref_range_text: "0.8 - 1.1" } },
            { label: "APTT (Test Value)", key: "aptt_test", unit: "Sec", input_type: "number", validation: { ref_range_text: "30-40 Sec" } },
            { label: "APTT (Control Value)", key: "aptt_control", unit: "Sec", input_type: "number", validation: { ref_range_text: "30-40 Sec" } }
        ]
    },
    {
        profile_id: "PLATELET_001",
        profile_name: "PLATELET COUNT",
        components: [
            { label: "Platelet Count", key: "platelet", unit: "Lakh/cmm", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "1.5 - 4.5 Lakh/cmm", panic_low: 0.5 } }
        ],
        ui_actions: [
            { trigger: "if {platelet} < 0.5", action: "toast_alert", message: "CRITICAL ALERT: Very Low Platelet Count!" }
        ]
    },
    {
        profile_id: "MP_001",
        profile_name: "MALARIAL PARASITE",
        components: [
            { label: "Malarial Parasite", key: "mp_result", unit: "", input_type: "dropdown", options: ["Not Seen", "Plasmodium Vivax Detected", "Plasmodium Falciparum Detected", "Mixed Infection"], validation: { ref_range_text: "Not Seen" } }
        ],
        ui_actions: [
            { trigger: "if {mp_result} != 'Not Seen'", action: "toast_alert", message: "CRITICAL ALERT: Positive for Malaria" }
        ]
    },
    {
        profile_id: "MF_001",
        profile_name: "MICROFILARIA",
        components: [
            { label: "Microfilaria", key: "mf_result", unit: "", input_type: "dropdown", options: ["Not Seen", "Microfilaria Detected"], validation: { ref_range_text: "Not Seen" } }
        ]
    },
    {
        profile_id: "URINE_001",
        profile_name: "URINE",
        components: [
            { label: "Color", key: "color", unit: "", input_type: "dropdown", options: ["Pale Yellow", "Dark Yellow", "Red", "Tea Colored"], validation: { ref_range_text: "Pale Yellow" } },
            { label: "Transparency", key: "transparency", unit: "", input_type: "dropdown", options: ["Clear", "Turbid"], validation: { ref_range_text: "Clear" } },
            { label: "pH", key: "ph", unit: "", input_type: "number", validation: { min: 4, max: 9, ref_range_text: "5.0 - 8.0" } },
            { label: "Specific Gravity", key: "sp_gravity", unit: "", input_type: "number", validation: { min: 1.000, max: 1.050, ref_range_text: "1.010 - 1.030" } },
            { label: "Sugar", key: "urine_sugar", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++", "++++"], validation: { ref_range_text: "Nil" } },
            { label: "Protein/Albumin", key: "urine_protein", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++", "++++"], validation: { ref_range_text: "Nil" } },
            { label: "Pus Cells", key: "pus_cells", unit: "/hpf", input_type: "number", validation: { ref_range_text: "0-5 /hpf" } },
            { label: "RBCs", key: "rbcs", unit: "/hpf", input_type: "number", validation: { ref_range_text: "Nil" } },
            { label: "Epithelial Cells", key: "ep_cells", unit: "/hpf", input_type: "number", validation: { ref_range_text: "0-2 /hpf" } },
            { label: "Casts", key: "casts", unit: "", input_type: "dropdown", options: ["Nil", "Hyaline", "Granular", "Cellular"], validation: { ref_range_text: "Nil" } },
            { label: "Crystals", key: "crystals", unit: "", input_type: "dropdown", options: ["Nil", "Ca Oxalate", "Uric Acid", "Triple Phosphate"], validation: { ref_range_text: "Nil" } }
        ]
    },
    {
        profile_id: "STOOL_001",
        profile_name: "STOOL",
        components: [
            { label: "Color", key: "stool_color", unit: "", input_type: "dropdown", options: ["Brown", "Black", "Clay Colored", "Red"], validation: { ref_range_text: "Brown" } },
            { label: "Consistency", key: "consistency", unit: "", input_type: "dropdown", options: ["Solid", "Semi-solid", "Loose", "Watery"], validation: { ref_range_text: "Semi-solid" } },
            { label: "Occult Blood", key: "occult_blood", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } },
            { label: "Reducing Sugar", key: "red_sugar", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } },
            { label: "Ova", key: "ova", unit: "", input_type: "dropdown", options: ["Nil", "Roundworm", "Hookworm"], validation: { ref_range_text: "Nil" } },
            { label: "Cyst", key: "cyst", unit: "", input_type: "dropdown", options: ["Nil", "Giardia", "E.histolytica"], validation: { ref_range_text: "Nil" } },
            { label: "Pus Cells", key: "pus_cells_stool", unit: "/hpf", input_type: "number", validation: { ref_range_text: "Nil" } },
            { label: "RBCs", key: "rbcs_stool", unit: "/hpf", input_type: "number", validation: { ref_range_text: "Nil" } }
        ]
    },
    {
        profile_id: "BLOOD_GROUP_001",
        profile_name: "BLOOD GROUPING & RH",
        components: [
            { label: "ABO Group", key: "abo_group", unit: "", input_type: "dropdown", options: ["A", "B", "AB", "O", "Oh (Bombay)"], validation: { ref_range_text: "" } },
            { label: "Rh Factor", key: "rh_factor", unit: "", input_type: "dropdown", options: ["Positive", "Negative"], validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "WIDAL_001",
        profile_name: "WIDAL TEST",
        components: [
            { label: "S. Typhi 'O'", key: "widal_o", unit: "", input_type: "dropdown", options: ["< 1:20", "1:20", "1:40", "1:80", "1:160", "1:320", "> 1:320"], validation: { ref_range_text: "< 1:80" } },
            { label: "S. Typhi 'H'", key: "widal_h", unit: "", input_type: "dropdown", options: ["< 1:20", "1:20", "1:40", "1:80", "1:160", "1:320", "> 1:320"], validation: { ref_range_text: "< 1:80" } },
            { label: "S. Paratyphi 'AH'", key: "widal_ah", unit: "", input_type: "dropdown", options: ["< 1:20", "1:20", "1:40", "1:80", "1:160", "1:320", "> 1:320"], validation: { ref_range_text: "< 1:80" } },
            { label: "S. Paratyphi 'BH'", key: "widal_bh", unit: "", input_type: "dropdown", options: ["< 1:20", "1:20", "1:40", "1:80", "1:160", "1:320", "> 1:320"], validation: { ref_range_text: "< 1:80" } }
        ]
    },
    {
        profile_id: "HIV_001",
        profile_name: "HIV (I & II)",
        components: [
            { label: "HIV Result", key: "hiv_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive", "Borderline"], validation: { ref_range_text: "Non-Reactive" } }
        ],
        ui_actions: [
            { trigger: "if {hiv_result} == 'Reactive'", action: "toast_alert", message: "CRITICAL ALERT: Reactive! Suggest confirmatory test (Western Blot/ELISA)." }
        ]
    },
    {
        profile_id: "HBSAG_001",
        profile_name: "HBsAg",
        components: [
            { label: "HBsAg Result", key: "hbsag_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive", "Borderline"], validation: { ref_range_text: "Non-Reactive" } }
        ],
        ui_actions: [
            { trigger: "if {hbsag_result} == 'Reactive'", action: "toast_alert", message: "CRITICAL ALERT: Reactive! Suggest confirmatory test." }
        ]
    },
    {
        profile_id: "HCV_001",
        profile_name: "HCV",
        components: [
            { label: "HCV Result", key: "hcv_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive", "Borderline"], validation: { ref_range_text: "Non-Reactive" } }
        ],
        ui_actions: [
            { trigger: "if {hcv_result} == 'Reactive'", action: "toast_alert", message: "CRITICAL ALERT: Reactive! Suggest confirmatory test." }
        ]
    },
    {
        profile_id: "VDRL_001",
        profile_name: "VDRL / RPR",
        components: [
            { label: "VDRL Result", key: "vdrl_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive", "Borderline"], validation: { ref_range_text: "Non-Reactive" } }
        ],
        ui_actions: [
            { trigger: "if {vdrl_result} == 'Reactive'", action: "toast_alert", message: "CRITICAL ALERT: Reactive! Suggest confirmatory test." }
        ]
    },
    {
        profile_id: "RA_001",
        profile_name: "RA FACTOR",
        components: [
            { label: "RA Factor", key: "ra_result", unit: "IU/mL", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "< 20 IU/mL" } },
            { label: "Qualitative", key: "ra_qual", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "ASO_001",
        profile_name: "ASO TITRE",
        components: [
            { label: "ASO Titre", key: "aso_result", unit: "IU/mL", input_type: "number", validation: { min: 0, max: 1000, ref_range_text: "< 200 IU/mL" } },
            { label: "Qualitative", key: "aso_qual", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "CRP_001",
        profile_name: "C-REACTIVE PROTEIN (CRP)",
        components: [
            { label: "CRP", key: "crp_result", unit: "mg/L", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "< 6 mg/L" } },
            { label: "Qualitative", key: "crp_qual", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "UPT_001",
        profile_name: "URINE PREGNANCY TEST",
        components: [
            { label: "Result", key: "upt_result", unit: "", input_type: "dropdown", options: ["Negative", "Positive", "Invalid"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "DCT_001",
        profile_name: "DIRECT COOMBS TEST",
        components: [
            { label: "Result", key: "dct_result", unit: "", input_type: "dropdown", options: ["Negative", "Positive (1+)", "Positive (2+)", "Positive (3+)"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "SEMEN_001",
        profile_name: "SEMEN ANALYSIS",
        components: [
            { label: "Volume", key: "volume", unit: "mL", input_type: "number", validation: { ref_range_text: "1.5 - 5.0 mL" } },
            { label: "Liquefaction Time", key: "liquefaction", unit: "min", input_type: "number", validation: { ref_range_text: "15 - 30 min" } },
            { label: "Viscosity", key: "viscosity", unit: "", input_type: "dropdown", options: ["Normal", "Thick", "Thin"], validation: { ref_range_text: "Normal" } },
            { label: "pH", key: "ph", unit: "", input_type: "number", validation: { min: 6, max: 9, ref_range_text: "7.2 - 8.0" } },
            { label: "Total Sperm Count", key: "sperm_count", unit: "million/mL", input_type: "number", validation: { ref_range_text: "> 15 million/mL" } },
            { label: "Motility (Active)", key: "motility_active", unit: "%", input_type: "number", validation: { ref_range_text: "> 32 %" } },
            { label: "Motility (Sluggish)", key: "motility_sluggish", unit: "%", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Motility (Non-Motile)", key: "motility_non", unit: "%", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Normal Morphology", key: "morph_normal", unit: "%", input_type: "number", validation: { ref_range_text: "> 4 %" } },
            { label: "Abnormal Morphology", key: "morph_abnormal", unit: "%", input_type: "number", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "SPUTUM_001",
        profile_name: "SPUTUM EXAMINATION",
        components: [
            { label: "AFB (TB)", key: "afb", unit: "", input_type: "dropdown", options: ["Not Seen", "Scanty", "1+", "2+", "3+"], validation: { ref_range_text: "Not Seen" } },
            { label: "Gram Stain", key: "gram_stain", unit: "", input_type: "text", validation: { ref_range_text: "" } }
        ],
        ui_actions: [
            { trigger: "if {afb} != 'Not Seen'", action: "toast_alert", message: "CRITICAL ALERT: AFB Positive!" }
        ]
    },
    {
        profile_id: "MANTOUX_001",
        profile_name: "MANTOUX TEST",
        components: [
            { label: "Induration", key: "induration", unit: "mm", input_type: "number", validation: { ref_range_text: "< 5mm Negative" } }
        ]
    },
    {
        profile_id: "RD_TITRE_001",
        profile_name: "RD ANTIBODY TITRE",
        components: [
            { label: "Titre Ratio", key: "rd_titre", unit: "", input_type: "text", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "BS_FASTING_001",
        profile_name: "BLOOD SUGAR FASTING",
        components: [
            { label: "Blood Sugar Fasting", key: "bs_fasting", unit: "mg/dL", input_type: "number", validation: { min: 20, max: 1000, ref_range_text: "70 - 100 mg/dL" } }
        ]
    },
    {
        profile_id: "BS_PP_001",
        profile_name: "BLOOD SUGAR PP",
        components: [
            { label: "Blood Sugar PP", key: "bs_pp", unit: "mg/dL", input_type: "number", validation: { min: 20, max: 1000, ref_range_text: "< 140 mg/dL" } }
        ]
    },
    {
        profile_id: "BS_RANDOM_001",
        profile_name: "BLOOD SUGAR RANDOM",
        components: [
            { label: "Blood Sugar Random", key: "bs_random", unit: "mg/dL", input_type: "number", validation: { min: 20, max: 1000, ref_range_text: "70 - 140 mg/dL" } }
        ]
    },
    {
        profile_id: "HBA1C_001",
        profile_name: "HBA1C",
        components: [
            { label: "HbA1c", key: "hba1c", unit: "%", input_type: "number", validation: { min: 3, max: 20, ref_range_text: "< 5.7% Non-Diabetic" } },
            { label: "Mean Est. Glucose", key: "eag", unit: "mg/dL", input_type: "calculated", formula: "(28.7 * {hba1c}) - 46.7", validation: { ref_range_text: "Calculated" } }
        ]
    },
    {
        profile_id: "IRON_001",
        profile_name: "IRON PROFILE",
        components: [
            { label: "S. Iron", key: "iron", unit: "mcg/dL", input_type: "number", validation: { min: 0, max: 500, ref_range_text: "60 - 170 mcg/dL" } },
            { label: "TIBC", key: "tibc", unit: "mcg/dL", input_type: "number", validation: { min: 0, max: 800, ref_range_text: "240 - 450 mcg/dL" } },
            { label: "% Saturation", key: "transferrin_sat", unit: "%", input_type: "calculated", formula: "({iron} / {tibc}) * 100", validation: { ref_range_text: "20 - 50 %" } }
        ]
    },
    {
        profile_id: "KIDNEY_001",
        profile_name: "KIDNEY FUNCTION TEST (KFT)",
        components: [
            { label: "Blood Urea", key: "blood_urea", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 300, ref_range_text: "15 - 40 mg/dL" } },
            { label: "S. Creatinine", key: "creatinine", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "M: 0.7-1.3, F: 0.6-1.1 mg/dL" } },
            { label: "S. Uric Acid", key: "uric_acid", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "M: 3.5-7.2, F: 2.6-6.0 mg/dL" } },
            { label: "Sodium (Na+)", key: "sodium", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "135 - 145 mEq/L" } },
            { label: "Potassium (K+)", key: "potassium", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "3.5 - 5.1 mEq/L", panic_high: 6.0 } },
            { label: "Chloride (Cl-)", key: "chloride", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "96 - 106 mEq/L" } }
        ],
        ui_actions: [
            { trigger: "if {potassium} > 6.0", action: "toast_alert", message: "CRITICAL ALERT: High Potassium!" }
        ]
    },
    {
        profile_id: "ELECTROLYTES_001",
        profile_name: "ELECTROLYTES",
        components: [
            { label: "Sodium (Na+)", key: "sodium", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "135 - 145 mEq/L" } },
            { label: "Potassium (K+)", key: "potassium", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "3.5 - 5.1 mEq/L", panic_high: 6.0 } },
            { label: "Chloride (Cl-)", key: "chloride", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "96 - 106 mEq/L" } }
        ],
        ui_actions: [
            { trigger: "if {potassium} > 6.0", action: "toast_alert", message: "CRITICAL ALERT: High Potassium!" }
        ]
    },
    {
        profile_id: "AMYLASE_001",
        profile_name: "S. AMYLASE",
        components: [
            { label: "S. Amylase", key: "amylase", unit: "U/L", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "28 - 100 U/L" } }
        ]
    },
    {
        profile_id: "CALCIUM_001",
        profile_name: "S. CALCIUM",
        components: [
            { label: "S. Calcium (Total)", key: "calcium", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "8.5 - 10.5 mg/dL" } }
        ]
    },
    {
        profile_id: "PHOSPHORUS_001",
        profile_name: "S. PHOSPHORUS",
        components: [
            { label: "S. Phosphorus", key: "phosphorus", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "2.5 - 4.5 mg/dL" } }
        ]
    },
    {
        profile_id: "THYROID_001",
        profile_name: "THYROID PROFILE (T3, T4, TSH)",
        components: [
            { label: "T3 (Triiodothyronine)", key: "t3", unit: "ng/mL", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "0.60 - 1.81 ng/mL" } },
            { label: "T4 (Thyroxine)", key: "t4", unit: "ug/dL", input_type: "number", validation: { min: 0, max: 30, ref_range_text: "5.01 - 12.45 ug/dL" } },
            { label: "TSH (Thyroid Stimulating Hormone)", key: "tsh", unit: "uIU/mL", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "0.35 - 5.50 uIU/mL" } }
        ]
    },
    {
        profile_id: "INFERTILITY_001",
        profile_name: "INFERTILITY / HORMONAL ASSAY",
        components: [
            { label: "FSH", key: "fsh", unit: "mIU/mL", input_type: "number", validation: { ref_range_text: "Follicular: 3.5-12.5, Mid: 4.7-21.5, Luteal: 1.7-7.7" } },
            { label: "LH", key: "lh", unit: "mIU/mL", input_type: "number", validation: { ref_range_text: "Follicular: 2.4-12.6, Mid: 14-95.6, Luteal: 1.0-11.4" } },
            { label: "Prolactin", key: "prolactin", unit: "ng/mL", input_type: "number", validation: { ref_range_text: "Non-pregnant: 4.8 - 23.3 ng/mL" } },
            { label: "Beta HCG", key: "beta_hcg", unit: "mIU/mL", input_type: "number", validation: { ref_range_text: "Non-pregnant: < 5.0 mIU/mL" } }
        ]
    },
    {
        profile_id: "TORCH_001",
        profile_name: "TORCH PANEL (IgG & IgM)",
        components: [
            { label: "Toxoplasma IgG", key: "toxo_igg", unit: "IU/mL", input_type: "number", validation: { ref_range_text: "< 8.0 Negative" } },
            { label: "Toxoplasma IgM", key: "toxo_igm", unit: "Index", input_type: "number", validation: { ref_range_text: "< 0.8 Negative" } },
            { label: "Rubella IgG", key: "rubella_igg", unit: "IU/mL", input_type: "number", validation: { ref_range_text: "< 10.0 Negative" } },
            { label: "Rubella IgM", key: "rubella_igm", unit: "Index", input_type: "number", validation: { ref_range_text: "< 0.8 Negative" } },
            { label: "CMV IgG", key: "cmv_igg", unit: "IU/mL", input_type: "number", validation: { ref_range_text: "< 6.0 Negative" } },
            { label: "CMV IgM", key: "cmv_igm", unit: "Index", input_type: "number", validation: { ref_range_text: "< 0.8 Negative" } },
            { label: "HSV 1&2 IgG", key: "hsv_igg", unit: "Index", input_type: "number", validation: { ref_range_text: "< 0.9 Negative" } },
            { label: "HSV 1&2 IgM", key: "hsv_igm", unit: "Index", input_type: "number", validation: { ref_range_text: "< 0.9 Negative" } }
        ]
    },
    {
        profile_id: "CULTURE_URINE_001",
        profile_name: "CULTURE & SENSITIVITY - URINE",
        components: [
            { label: "Culture Status", key: "culture_status", unit: "", input_type: "dropdown", options: ["Sterile / No Growth", "Growth Detected", "Contaminated"], validation: { ref_range_text: "Sterile" } },
            { label: "Organism Name", key: "organism_name", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Colony Count", key: "colony_count", unit: "CFU/mL", input_type: "text", validation: { ref_range_text: "" } }
            // Note: Antibiogram grid logic would ideally be here, simplified for now
        ],
        ui_actions: [
            { trigger: "if {culture_status} == 'Growth Detected'", action: "toast_alert", message: "Use 'Technician Notes' to enter Antibiogram details for now." }
        ]
    },
    {
        profile_id: "CULTURE_PUS_001",
        profile_name: "CULTURE & SENSITIVITY - PUS",
        components: [
            { label: "Culture Status", key: "culture_status", unit: "", input_type: "dropdown", options: ["Sterile / No Growth", "Growth Detected", "Contaminated"], validation: { ref_range_text: "Sterile" } },
            { label: "Organism Name", key: "organism_name", unit: "", input_type: "text", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "HISTOPATH_001",
        profile_name: "HISTOPATHOLOGY REPORT",
        components: [
            { label: "Specimen", key: "specimen_type", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Gross Appearance", key: "gross_appearance", unit: "", input_type: "text_area", validation: { ref_range_text: "" } },
            { label: "Microscopic Examination", key: "microscopy_text", unit: "", input_type: "text_area", validation: { ref_range_text: "" } },
            { label: "Impression / Diagnosis", key: "impression", unit: "", input_type: "text_area", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "CYTOLOGY_001",
        profile_name: "CYTOLOGY / FNAC REPORT",
        components: [
            { label: "Site of Aspiration", key: "aspiration_site", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Microscopic Examination", key: "microscopy_text", unit: "", input_type: "text_area", validation: { ref_range_text: "" } },
            { label: "Impression / Diagnosis", key: "impression", unit: "", input_type: "text_area", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "FLUID_ANALYSIS_001",
        profile_name: "BODY FLUID ANALYSIS (ASCITIC/PLEURAL/CSF)",
        components: [
            { label: "Volume", key: "volume", unit: "mL", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Appearance", key: "appearance", unit: "", input_type: "text", validation: { ref_range_text: "Clear" } },
            { label: "Total Cell Count", key: "cell_count", unit: "/cmm", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Polymorphs", key: "polymorphs", unit: "%", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Lymphocytes", key: "lymphocytes", unit: "%", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Protein", key: "protein", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Sugar", key: "sugar", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "" } },
            { label: "ADA", key: "ada", unit: "U/L", input_type: "number", validation: { ref_range_text: "< 40 U/L" } }
        ]
    }
];
