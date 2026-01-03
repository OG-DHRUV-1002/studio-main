
export interface ProfileComponent {
    label: string;
    key: string;
    unit: string;
    input_type: 'number' | 'dropdown' | 'calculated' | 'text' | 'text_area' | 'dynamic_grid' | 'header';
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
    specimen?: string;
    components: ProfileComponent[];
    ui_actions?: {
        trigger: string;
        action: string;
        message: string;
    }[];
    input_schema?: {
        key: string;
        label: string;
        unit?: string;
        type: 'text' | 'number' | 'richtext';
    }[];
}

export const PROFILE_DEFINITIONS: ProfileDefinition[] = [
    {
        profile_id: "LFT_001",
        profile_name: "HEPATIC / LFT",
        specimen: "Blood",
        components: [
            {
                label: "S Total Bilirubin",
                key: "bil_total",
                unit: "mg/dL",
                input_type: "number",
                validation: { min: 0, max: 20, ref_range_text: "0.2 - 1.2 mg/dL", panic_high: 15 }
            },
            {
                label: "Direct Bilirubin",
                key: "bil_direct",
                unit: "mg/dL",
                input_type: "number",
                validation: { min: 0, max: 10, ref_range_text: "0.0 - 0.3 mg/dL" }
            },
            {
                label: "Indirect Bilirubin",
                key: "bil_indirect",
                unit: "mg/dL",
                input_type: "calculated",
                formula: "{bil_total} - {bil_direct}",
                validation: { ref_range_text: "Calculated" }
            },
            {
                label: "S Proteins Total",
                key: "total_protein",
                unit: "g/dL",
                input_type: "number",
                validation: { min: 0, max: 15, ref_range_text: "6.0 - 8.0 g/dL" }
            },
            {
                label: "S Albumin",
                key: "albumin",
                unit: "g/dL",
                input_type: "number",
                validation: { min: 0, max: 10, ref_range_text: "3.5 - 5.5 g/dL" }
            },
            {
                label: "A/G Ratio",
                key: "ag_ratio",
                unit: "",
                input_type: "calculated",
                formula: "{albumin} / ({total_protein} - {albumin})",
                validation: { ref_range_text: "Calculated" }
            },
            {
                label: "SGOT",
                key: "sgot",
                unit: "U/L",
                input_type: "number",
                validation: { min: 0, max: 2000, ref_range_text: "< 40 U/L", panic_high: 500 }
            },
            {
                label: "SGP",
                key: "sgpt",
                unit: "U/L",
                input_type: "number",
                validation: { min: 0, max: 2000, ref_range_text: "< 40 U/L", panic_high: 500 }
            },
            {
                label: "S Alkaline Phosphatase",
                key: "alk_phos",
                unit: "U/L",
                input_type: "number",
                validation: { min: 0, max: 2000, ref_range_text: "80 - 290 U/L" }
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
        profile_name: "LIPID",
        specimen: "Blood",
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
                label: "HDL Cholesterol",
                key: "hdl",
                unit: "mg/dL",
                input_type: "number",
                validation: { min: 0, max: 200, ref_range_text: "> 40 mg/dL" }
            },
            {
                label: "LDL Cholesterol",
                key: "ldl",
                unit: "mg/dL",
                input_type: "calculated",
                formula: "({cholesterol} - {hdl}) - ({triglycerides} / 5)",
                validation: { ref_range_text: "< 100 mg/dL" }
            },
            {
                label: "S. VLDL",
                key: "vldl",
                unit: "mg/dL",
                input_type: "calculated",
                formula: "{triglycerides} / 5",
                validation: { ref_range_text: "10 - 50 mg/dL" }
            },
            {
                label: "S Chol / HDL Chol",
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
            },
            {
                label: "Appearance of serum",
                key: "lipid_appearance",
                unit: "",
                input_type: "text",
                validation: { ref_range_text: "Clear" }
            },
            {
                label: "Sample collection after",
                key: "sample_collection",
                unit: "Hours",
                input_type: "text",
                validation: { ref_range_text: "12-14 Hours Fasting" }
            }
        ]
    },
    {
        profile_id: "CARDIAC_001",
        profile_name: "CORONARY / CARDIAC ENZYMES",
        specimen: "Blood",
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
        profile_name: "DIABETIC",
        specimen: "Blood",
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
        specimen: "Blood",
        components: [
            { label: "Red Blood Cells", key: "rbc", unit: "Million/cmm", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "4.5 - 5.5 Million/cmm" } },
            { label: "Haemoglobin", key: "hb", unit: "g/dL", input_type: "number", validation: { min: 0, max: 25, ref_range_text: "M: 13-17, F: 12-15 g/dL", panic_low: 7.0 } },
            { label: "PCV", key: "pcv", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "M: 40-50, F: 36-46 %" } },
            { label: "MCV", key: "mcv", unit: "fL", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "80-100 fL" } },
            { label: "MCH", key: "mch", unit: "pg", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "27-32 pg" } },
            { label: "MCHC", key: "mchc", unit: "g/dL", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "32-36 g/dL" } },
            { label: "Platelet Count", key: "platelet", unit: "Lakh/cmm", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "1.5 - 4.5 Lakh/cmm", panic_low: 1.0 } },
            { label: "Total WBC Count", key: "wbc", unit: "/cmm", input_type: "number", validation: { min: 0, max: 50000, ref_range_text: "4,000 - 11,000 /cmm" } },
            { label: "Neutrophils", key: "neutrophils", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "40-75 %" } },
            { label: "Lymphocytes", key: "lymphocytes", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "20-45 %" } },
            { label: "Eosinophils", key: "eosinophils", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "1-6 %" } },
            { label: "Monocytes", key: "monocytes", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "2-10 %" } },
            { label: "Basophils", key: "basophils", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "0-1 %" } },
            { label: "ESR (Westergren's Method)", key: "esr", unit: "mm/1st hr", input_type: "number", validation: { min: 0, max: 150, ref_range_text: "M: 0-15, F: 0-20 mm" } },
            { label: "Abnormalities of RBCs", key: "abnormal_rbc", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Abnormalities of WBCs", key: "abnormal_wbc", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Platelets on smear study", key: "platelet_smear", unit: "", input_type: "text", validation: { ref_range_text: "Adequate" } },
            { label: "Parasites", key: "parasites", unit: "", input_type: "text", validation: { ref_range_text: "Not Seen" } }
        ] as any[], // Casting to allow 'text' input type if distinct from 'string' or logic handling textual inputs
        ui_actions: [
            { trigger: "if {hb} < 7.0", action: "toast_alert", message: "CRITICAL ALERT: Low Hemoglobin!" },
            { trigger: "if {platelet} < 1.0", action: "toast_alert", message: "CRITICAL ALERT: Low Platelet Count! Dengue Risk." }
        ]
    },
    {
        profile_id: "ESR_001",
        profile_name: "ESR",
        specimen: "Blood",
        components: [
            { label: "Erythrocyte Sedimentation Rate (ESR)", key: "esr", unit: "mm", input_type: "number", validation: { min: 0, max: 150, ref_range_text: "M: 0-15, F: 0-20 mm" } }
        ]
    },
    {
        profile_id: "HB_001",
        profile_name: "HB",
        specimen: "Blood",
        components: [
            { label: "Hemoglobin", key: "hb", unit: "g/dL", input_type: "number", validation: { min: 0, max: 25, ref_range_text: "M: 13-17, F: 12-15 g/dL" } }
        ]
    },
    {
        profile_id: "PCV_001",
        profile_name: "PCV",
        specimen: "Blood",
        components: [
            { label: "PCV", key: "pcv", unit: "%", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "M: 40-50, F: 36-46 %" } }
        ]
    },
    {
        profile_id: "COAG_001",
        profile_name: "BT.CT.PT.PTT",
        specimen: "Blood",
        components: [
            { label: "Bleeding Time", key: "bt", unit: "min", input_type: "text", validation: { ref_range_text: "1-5 min" } },
            { label: "Clotting Time", key: "ct", unit: "min", input_type: "text", validation: { ref_range_text: "5-10 min" } },
            { label: "Prothrombin Time", key: "pt_time", unit: "sec", input_type: "number", validation: { ref_range_text: "11-16 sec" } },
            { label: "Normal Control", key: "pt_control", unit: "sec", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Ratio", key: "pt_ratio", unit: "", input_type: "number", validation: { ref_range_text: "" } },
            { label: "INR Value", key: "pt_inr", unit: "", input_type: "number", validation: { ref_range_text: "0.9 - 1.2" } },
            { label: "ISI Value", key: "pt_isi", unit: "", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Partial Thromboplastin time", key: "aptt_time", unit: "sec", input_type: "number", validation: { ref_range_text: "26 - 40 sec" } },
            { label: "Normal- Control", key: "aptt_control", unit: "sec", input_type: "number", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "PLATELET_001",
        profile_name: "PLATELET COUNT",
        specimen: "Blood",
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
        specimen: "Blood",
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
        specimen: "Blood",
        components: [
            { label: "Microfilaria", key: "mf_result", unit: "", input_type: "dropdown", options: ["Not Seen", "Microfilaria Detected"], validation: { ref_range_text: "Not Seen" } }
        ]
    },
    {
        profile_id: "URINE_001",
        profile_name: "URINE",
        specimen: "Urine",
        components: [
            { label: "PHYSICAL EXAMINATION", key: "header_phys", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Quantity", key: "quantity", unit: "mL", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Colour", key: "color", unit: "", input_type: "dropdown", options: ["Pale Yellow", "Dark Yellow", "Red", "Tea Colored"], validation: { ref_range_text: "Pale Yellow" } },
            { label: "Appearance", key: "appearance", unit: "", input_type: "dropdown", options: ["Clear", "Turbid"], validation: { ref_range_text: "Clear" } },
            { label: "Reaction", key: "reaction", unit: "", input_type: "text", validation: { ref_range_text: "Acidic" } },
            { label: "Specific Gravity", key: "sp_gravity", unit: "", input_type: "number", validation: { min: 1.000, max: 1.050, ref_range_text: "1.010 - 1.030" } },

            { label: "CHEMICAL EXAMINATION", key: "header_chem", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Protein", key: "urine_protein", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++", "++++"], validation: { ref_range_text: "Nil" } },
            { label: "Glucose", key: "urine_sugar", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++", "++++"], validation: { ref_range_text: "Nil" } },
            { label: "Ketone Bodies", key: "ketones", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++"], validation: { ref_range_text: "Nil" } },
            { label: "Bile Pigments", key: "bile_pigments", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } },
            { label: "Bile Salts", key: "bile_salts", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } },
            { label: "Occult Blood", key: "occult_blood", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } },

            { label: "MICROSCOPIC EXAMINATION", key: "header_micro", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Epithelial Cells", key: "ep_cells", unit: "/hpf", input_type: "text", validation: { ref_range_text: "0-2 /hpf" } },
            { label: "Leucocytes/Pus cells", key: "pus_cells", unit: "/hpf", input_type: "text", validation: { ref_range_text: "0-5 /hpf" } },
            { label: "Red Blood Cells", key: "rbcs", unit: "/hpf", input_type: "number", validation: { ref_range_text: "Nil" } },
            { label: "Casts", key: "casts", unit: "", input_type: "dropdown", options: ["Nil", "Hyaline", "Granular", "Cellular"], validation: { ref_range_text: "Nil" } },
            { label: "Crystals", key: "crystals", unit: "", input_type: "dropdown", options: ["Nil", "Ca Oxalate", "Uric Acid", "Triple Phosphate"], validation: { ref_range_text: "Nil" } },
            { label: "Other Findings", key: "other_findings", unit: "", input_type: "text", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "STOOL_001",
        profile_name: "STOOL",
        specimen: "Stool",
        components: [
            { label: "PHYSICAL EXAMINATION:", key: "header_phys", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Colour", key: "stool_color", unit: "", input_type: "dropdown", options: ["Brown", "Black", "Clay Colored", "Red"], validation: { ref_range_text: "Brown" } },
            { label: "Consistency", key: "consistency", unit: "", input_type: "dropdown", options: ["Solid", "Semi-solid", "Loose", "Watery"], validation: { ref_range_text: "Semi-solid" } },
            { label: "Mucus", key: "mucus", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "Frank Blood", key: "frank_blood", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "Adult Worms / Segments", key: "parasite_segments", unit: "", input_type: "dropdown", options: ["Nil", "Present"], validation: { ref_range_text: "Nil" } },

            { label: "CHEMICAL EXAMINATION:", key: "header_chem", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Reaction", key: "reaction", unit: "", input_type: "text", validation: { ref_range_text: "Acidic" } },
            { label: "Occult Blood", key: "occult_blood", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } },

            { label: "MICROSCOPIC EXAMINATION:", key: "header_micro", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Ova", key: "ova", unit: "", input_type: "dropdown", options: ["Nil", "Roundworm", "Hookworm"], validation: { ref_range_text: "Nil" } },
            { label: "Cysts", key: "cyst", unit: "", input_type: "dropdown", options: ["Nil", "Giardia", "E.histolytica"], validation: { ref_range_text: "Nil" } },
            { label: "Vegetative Forms", key: "veg_forms", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Macrophages", key: "macrophages", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Leucocytes", key: "leucocytes", unit: "/hpf", input_type: "text", validation: { ref_range_text: "Occasional" } },
            { label: "Epithelial Cells", key: "ep_cells", unit: "/hpf", input_type: "text", validation: { ref_range_text: "Occasional" } },
            { label: "Red Blood Cells", key: "rbcs_stool", unit: "/hpf", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Other Findings", key: "other_findings", unit: "", input_type: "text", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "BLOOD_GROUP_001",
        profile_name: "BLOOD GROUPING & RH",
        specimen: "Blood",
        components: [
            { label: "ABO Group", key: "abo_group", unit: "", input_type: "dropdown", options: ["A", "B", "AB", "O", "Oh (Bombay)"], validation: { ref_range_text: "" } },
            { label: "Rh Factor", key: "rh_factor", unit: "", input_type: "dropdown", options: ["Positive", "Negative"], validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "WIDAL_001",
        profile_name: "WIDAL",
        specimen: "Blood",
        components: [
            { label: "'O' Antigen", key: "widal_o", unit: "", input_type: "dropdown", options: ["< 1:20", "1:20", "1:40", "1:80", "1:160", "1:320", "> 1:320"], validation: { ref_range_text: "< 1:80" } },
            { label: "'H' Antigen", key: "widal_h", unit: "", input_type: "dropdown", options: ["< 1:20", "1:20", "1:40", "1:80", "1:160", "1:320", "> 1:320"], validation: { ref_range_text: "< 1:80" } },
            { label: "'AH' Antigen", key: "widal_ah", unit: "", input_type: "dropdown", options: ["< 1:20", "1:20", "1:40", "1:80", "1:160", "1:320", "> 1:320"], validation: { ref_range_text: "< 1:80" } },
            { label: "'BH' Antigen", key: "widal_bh", unit: "", input_type: "dropdown", options: ["< 1:20", "1:20", "1:40", "1:80", "1:160", "1:320", "> 1:320"], validation: { ref_range_text: "< 1:80" } },
            { label: "Result", key: "widal_result", unit: "", input_type: "text_area", validation: { ref_range_text: "Negative" } },
            { label: "Method", key: "method", unit: "", input_type: "text", validation: { ref_range_text: "Slide Agglutination" } }
        ]
    },
    {
        profile_id: "HIV_001",
        profile_name: "HIV",
        specimen: "Blood",
        components: [
            { label: "Test", key: "hiv_test", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } },
            { label: "Method", key: "method", unit: "", input_type: "text", validation: { ref_range_text: "Immunochromatography" } },
            { label: "Material", key: "material", unit: "", input_type: "text", validation: { ref_range_text: "Serum" } }
        ],
        ui_actions: [
            { trigger: "if {hiv_test} == 'Reactive'", action: "toast_alert", message: "CRITICAL ALERT: Reactive! Suggest confirmatory test." }
        ]
    },
    {
        profile_id: "HBSAG_001",
        profile_name: "HBsAg",
        specimen: "Blood",
        components: [
            { label: "Australia Antigen", key: "hbsag_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } },
            { label: "Method", key: "method", unit: "", input_type: "text", validation: { ref_range_text: "Immunochromatography" } }
        ],
        ui_actions: [
            { trigger: "if {hbsag_result} == 'Reactive'", action: "toast_alert", message: "CRITICAL ALERT: Reactive! Suggest confirmatory test." }
        ]
    },
    {
        profile_id: "HCV_001",
        profile_name: "HCV",
        specimen: "Blood",
        components: [
            { label: "Hepatic C virus", key: "hcv_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } },
            { label: "Method", key: "method", unit: "", input_type: "text", validation: { ref_range_text: "Immunochromatography" } }
        ],
        ui_actions: [
            { trigger: "if {hcv_result} == 'Reactive'", action: "toast_alert", message: "CRITICAL ALERT: Reactive! Suggest confirmatory test." }
        ]
    },
    {
        profile_id: "VDRL_001",
        profile_name: "VDRL / RPR",
        specimen: "Blood",
        components: [
            { label: "VDLR Test", key: "vdrl_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive", "Borderline"], validation: { ref_range_text: "Non-Reactive" } },
            { label: "Method", key: "method", unit: "", input_type: "text", validation: { ref_range_text: "Slide Flocculation" } }
        ],
        ui_actions: [
            { trigger: "if {vdrl_result} == 'Reactive'", action: "toast_alert", message: "CRITICAL ALERT: Reactive! Suggest confirmatory test." }
        ]
    },
    {
        profile_id: "RA_001",
        profile_name: "RA FACTOR",
        specimen: "Blood",
        components: [
            { label: "RA Factor", key: "ra_result", unit: "IU/mL", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "< 20 IU/mL" } },
            { label: "Qualitative", key: "ra_qual", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "ASO_001",
        profile_name: "A S O",
        specimen: "Blood",
        components: [
            { label: "ASO Titre", key: "aso_result", unit: "IU/mL", input_type: "number", validation: { min: 0, max: 1000, ref_range_text: "< 200 IU/mL" } },
            { label: "Qualitative", key: "aso_qual", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "CRP_001",
        profile_name: "C-REACTIVE PROTEIN (CRP)",
        specimen: "Blood",
        components: [
            { label: "Result", key: "crp_result", unit: "mg/L", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "< 6 mg/L" } },
            { label: "Qualitative", key: "crp_qual", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } },
            { label: "Method", key: "method", unit: "", input_type: "text", validation: { ref_range_text: "Immunoturbidimetry" } }
        ]
    },
    {
        profile_id: "UPT_001",
        profile_name: "URINE PREGNANCY TEST",
        specimen: "Urine",
        components: [
            { label: "Test", key: "upt_result", unit: "", input_type: "dropdown", options: ["Negative", "Positive", "Invalid"], validation: { ref_range_text: "Negative" } },
            { label: "Method", key: "method", unit: "", input_type: "text", validation: { ref_range_text: "Immuno-Chromatography" } }
        ]
    },
    {
        profile_id: "DCT_001",
        profile_name: "DIRECT COOMB’S TEST",
        specimen: "Blood",
        components: [
            { label: "Result", key: "dct_result", unit: "", input_type: "dropdown", options: ["Negative", "Positive (1+)", "Positive (2+)", "Positive (3+)"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "SEMEN_001",
        profile_name: "SEMEN",
        specimen: "Semen",
        components: [
            { label: "PHYSICAL EXAMINATION:", key: "header_phys", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Volume", key: "volume", unit: "mL", input_type: "number", validation: { ref_range_text: "2.0 - 5.0 mL" } },
            { label: "Appearance", key: "appearance", unit: "", input_type: "text", validation: { ref_range_text: "Greyish White" } },
            { label: "Liquefaction Time", key: "liquefaction", unit: "min", input_type: "number", validation: { ref_range_text: "15 - 30 min" } },
            { label: "Deposits", key: "deposits", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Transparency", key: "transparency", unit: "", input_type: "text", validation: { ref_range_text: "Opaque" } },
            { label: "Odour", key: "odour", unit: "", input_type: "text", validation: { ref_range_text: "Fishy" } },
            { label: "Viscosity", key: "viscosity", unit: "", input_type: "text", validation: { ref_range_text: "Normal" } },

            { label: "CHEMICAL EXAMINATION:", key: "header_chem", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "pH", key: "ph", unit: "", input_type: "number", validation: { ref_range_text: "7.2 - 8.0" } },
            { label: "Fructose", key: "fructose", unit: "", input_type: "dropdown", options: ["Positive", "Negative"], validation: { ref_range_text: "Positive" } },

            { label: "MICROSCOPIC EXAMINATION:", key: "header_micro", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Sperm Count", key: "sperm_count", unit: "millions/mL", input_type: "number", validation: { ref_range_text: "60 - 150 millions/mL" } },
            { label: "Viability", key: "viability", unit: "%", input_type: "number", validation: { ref_range_text: "> 50 %" } },
            { label: "Mobility on liquefaction", key: "motility", unit: "%", input_type: "number", validation: { ref_range_text: "> 50 % Active" } },
            { label: "Abnormal Forms", key: "abnormal_forms", unit: "%", input_type: "number", validation: { ref_range_text: "< 20 %" } },
            { label: "Other Findings", key: "other_findings", unit: "", input_type: "text_area", validation: { ref_range_text: "" } },
            { label: "Spermatogenic Cells", key: "spermatogenic_cells", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Sperm entangling", key: "entangling", unit: "", input_type: "dropdown", options: ["Nil", "Present"], validation: { ref_range_text: "Nil" } },
            { label: "Leucocytes", key: "leucocytes", unit: "/hpf", input_type: "number", validation: { ref_range_text: "0-2 /hpf" } },

            { label: "BACTERIOLOGICAL EXAMINATION:", key: "header_bacterio", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Gram's Stain", key: "gram_stain", unit: "", input_type: "text", validation: { ref_range_text: "No Organisms Seen" } },
            { label: "ZN Stain", key: "zn_stain", unit: "", input_type: "text", validation: { ref_range_text: "No AFB Seen" } }
        ]
    },
    {
        profile_id: "SPUTUM_001",
        profile_name: "SPUTUM",
        specimen: "Sputum",
        components: [
            { label: "PHYSICAL EXAMINATION:", key: "header_phys", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Quantity", key: "quantity", unit: "mL", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Colour", key: "color", unit: "", input_type: "text", validation: { ref_range_text: "Whitish" } },
            { label: "Consistency", key: "consistency", unit: "", input_type: "text", validation: { ref_range_text: "Mucoid" } },
            { label: "Frank Blood", key: "frank_blood", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "Layering", key: "layering", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "Foul Smell", key: "foul_smell", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },

            { label: "CHEMICAL EXAMINATION:", key: "header_chem", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Occult Blood", key: "occult_blood", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } },
            { label: "Reaction", key: "reaction", unit: "", input_type: "text", validation: { ref_range_text: "Alkaline" } },

            { label: "MICROSCOPIC EXAMINATION:", key: "header_micro", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Pus Cells", key: "pus_cells", unit: "/hpf", input_type: "text", validation: { ref_range_text: "Occasional" } },
            { label: "Epithelial Cells", key: "ep_cells", unit: "/hpf", input_type: "text", validation: { ref_range_text: "Occasional" } },
            { label: "Red Blood Cells", key: "rbcs", unit: "/hpf", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "C L Crystals", key: "crystals", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Curshmann's Spirals", key: "spirals", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Asbestos Bodies", key: "asbestos", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Yeast Cells", key: "yeast", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Parasites", key: "parasites", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Fungus", key: "fungus", unit: "", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Other Findings", key: "other_findings", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Gram's Stain", key: "gram_stain", unit: "", input_type: "text", validation: { ref_range_text: "No Organisms Seen" } },
            { label: "Ziehl-Neelsen Stain", key: "zn_stain", unit: "", input_type: "text", validation: { ref_range_text: "No AFB Seen" } }
        ],
        ui_actions: [
            { trigger: "if {afb} != 'Not Seen'", action: "toast_alert", message: "CRITICAL ALERT: AFB Positive!" }
        ]
    },
    {
        profile_id: "MANTOUX_001",
        profile_name: "MANTOUX TEST",
        specimen: "Skin",
        components: [
            { label: "Date of Inoculation", key: "date_given", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Date of Reporting", key: "date_read", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Result (Induration)", key: "induration", unit: "mm", input_type: "number", validation: { ref_range_text: "< 10mm Negative" } },
            { label: "Impression", key: "impression", unit: "", input_type: "text", validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "RD_TITRE_001",
        profile_name: "RD ANTIBODY TITRE",
        specimen: "Blood",
        components: [
            { label: "Titre Ratio", key: "rd_titre", unit: "", input_type: "text", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "BS_FASTING_001",
        profile_name: "FASTING BLOOD SUGAR(FBS)",
        specimen: "Blood",
        components: [
            { label: "Fasting Blood Sugar(Glucose)", key: "bs_fasting", unit: "mg/dL", input_type: "number", validation: { min: 20, max: 1000, ref_range_text: "70 - 100 mg/dL" } },
            { label: "Urine Sugar Fasting", key: "urine_sugar_f", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++", "++++"], validation: { ref_range_text: "Nil" } },
            { label: "Urine Ketone Bodies", key: "urine_ketone_f", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++"], validation: { ref_range_text: "Nil" } }
        ]
    },
    {
        profile_id: "BS_PP_001",
        profile_name: "PP/PG/R BLOOD SUGAR",
        specimen: "Blood",
        components: [
            { label: "PP/PG/R Blood Sugar", key: "bs_pp", unit: "mg/dL", input_type: "number", validation: { min: 20, max: 1000, ref_range_text: "< 140 mg/dL" } },
            { label: "Urine Sugar PP/PG/R", key: "urine_sugar_pp", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++", "++++"], validation: { ref_range_text: "Nil" } },
            { label: "Urine Ketone Bodies", key: "urine_ketone_pp", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++"], validation: { ref_range_text: "Nil" } }
        ]
    },
    {
        profile_id: "BS_RANDOM_001",
        profile_name: "BLOOD SUGAR R",
        specimen: "Blood",
        components: [
            { label: "Blood Sugar Random", key: "bs_random", unit: "mg/dL", input_type: "number", validation: { min: 20, max: 1000, ref_range_text: "70 - 140 mg/dL" } }
        ]
    },
    {
        profile_id: "HBA1C_001",
        profile_name: "GLYCOSYLATED HB",
        specimen: "Blood",
        components: [
            { label: "Glycosylated Hemoglobin (HbA1c)", key: "hba1c", unit: "%", input_type: "number", validation: { min: 3, max: 20, ref_range_text: "< 5.7% Non-Diabetic" } },
            { label: "Normal Range in Non Diabetics", key: "info_normal", unit: "", input_type: "text", validation: { ref_range_text: "4.0 - 6.0 %" } },
            { label: "Good Control", key: "info_good", unit: "", input_type: "text", validation: { ref_range_text: "6.0 - 7.0 %" } },
            { label: "Fair Control", key: "info_fair", unit: "", input_type: "text", validation: { ref_range_text: "7.0 - 8.0 %" } },
            { label: "Poor Control", key: "info_poor", unit: "", input_type: "text", validation: { ref_range_text: "> 8.0 %" } },
            { label: "Method Used", key: "method", unit: "", input_type: "text", validation: { ref_range_text: "Ion Exchange Resin" } }
        ]
    },
    {
        profile_id: "IRON_001",
        profile_name: "S. IRON, TIBC, % SAT",
        specimen: "Blood",
        components: [
            { label: "S. Iron", key: "iron", unit: "mcg/dL", input_type: "number", validation: { min: 0, max: 500, ref_range_text: "60 - 170 mcg/dL" } },
            { label: "TIBC", key: "tibc", unit: "mcg/dL", input_type: "number", validation: { min: 0, max: 800, ref_range_text: "240 - 450 mcg/dL" } },
            { label: "% Saturation", key: "transferrin_sat", unit: "%", input_type: "calculated", formula: "({iron} / {tibc}) * 100", validation: { ref_range_text: "20 - 50 %" } }
        ]
    },
    {
        profile_id: "KIDNEY_001",
        profile_name: "RENAL FUNCTIONAL TEST (RFT)",
        specimen: "Blood",
        components: [
            { label: "Blood Urea Nitrogen", key: "bun", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "7 - 20 mg/dL" } },
            { label: "Creatinine", key: "creatinine", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "0.6 - 1.2 mg/dL" } },
            { label: "Uric acid", key: "uric_acid", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "3.5 - 7.2 mg/dL" } },
            { label: "Calcium", key: "calcium", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "8.5 - 10.5 mg/dL" } },
            { label: "Phosphorous", key: "phosphorus", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "2.5 - 4.5 mg/dL" } },
            { label: "Total Proteins", key: "total_protein", unit: "g/dL", input_type: "number", validation: { min: 0, max: 15, ref_range_text: "6.0 - 8.0 g/dL" } },
            { label: "Albumin", key: "albumin", unit: "g/dL", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "3.5 - 5.5 g/dL" } },
            { label: "A/G", key: "ag_ratio", unit: "", input_type: "calculated", formula: "{albumin} / ({total_protein} - {albumin})", validation: { ref_range_text: "Calculated" } },
            { label: "Cholesterol", key: "cholesterol", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 800, ref_range_text: "< 200 mg/dL" } },

            { label: "S. ELECTROLYTE", key: "header_lytes", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Sodium", key: "sodium", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "135 - 145 mEq/L" } },
            { label: "Potassium", key: "potassium", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "3.5 - 5.1 mEq/L" } },
            { label: "Chlorides", key: "chloride", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "96 - 106 mEq/L" } }
        ],
        ui_actions: [
            { trigger: "if {potassium} > 6.0", action: "toast_alert", message: "CRITICAL ALERT: High Potassium!" }
        ]
    },
    {
        profile_id: "ELECTROLYTES_001",
        profile_name: "S. ELECTROLYTES",
        specimen: "Blood",
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
        specimen: "Blood",
        components: [
            { label: "S. Amylase", key: "amylase", unit: "U/L", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "28 - 100 U/L" } }
        ]
    },
    {
        profile_id: "CALCIUM_001",
        profile_name: "S. CALCIUM",
        specimen: "Blood",
        components: [
            { label: "S. Calcium (Total)", key: "calcium", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "8.5 - 10.5 mg/dL" } }
        ]
    },
    {
        profile_id: "PHOSPHORUS_001",
        profile_name: "S. PHOSPHORUS",
        specimen: "Blood",
        components: [
            { label: "S. Phosphorus", key: "phosphorus", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "2.5 - 4.5 mg/dL" } }
        ]
    },
    {
        profile_id: "THYROID_001",
        profile_name: "THYROID PROFILE (T3, T4, TSH)",
        specimen: "Blood",
        components: [
            { label: "T3 (Triiodothyronine)", key: "t3", unit: "ng/mL", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "0.60 - 1.81 ng/mL" } },
            { label: "T4 (Thyroxine)", key: "t4", unit: "ug/dL", input_type: "number", validation: { min: 0, max: 30, ref_range_text: "5.01 - 12.45 ug/dL" } },
            { label: "TSH (Thyroid Stimulating Hormone)", key: "tsh", unit: "uIU/mL", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "0.35 - 5.50 uIU/mL" } }
        ]
    },
    {
        profile_id: "INFERTILITY_001",
        profile_name: "INFERTILITY / HORMONAL ASSAY",
        specimen: "Blood",
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
        specimen: "Blood",
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
        specimen: "Urine",
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
        specimen: "Pus",
        components: [
            { label: "Culture Status", key: "culture_status", unit: "", input_type: "dropdown", options: ["Sterile / No Growth", "Growth Detected", "Contaminated"], validation: { ref_range_text: "Sterile" } },
            { label: "Organism Name", key: "organism_name", unit: "", input_type: "text", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "HISTOPATH_001",
        profile_name: "HISTOPATHOLOGY REPORT",
        specimen: "Tissue",
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
        specimen: "Fluid, Tissue",
        components: [
            { label: "Site of Aspiration", key: "aspiration_site", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Microscopic Examination", key: "microscopy_text", unit: "", input_type: "text_area", validation: { ref_range_text: "" } },
            { label: "Impression / Diagnosis", key: "impression", unit: "", input_type: "text_area", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "FLUID_ANALYSIS_001",
        profile_name: "BODY FLUID ANALYSIS (ASCITIC/PLEURAL/CSF)",
        specimen: "Fluid",
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
    },
    // --- BIOCHEMISTRY START ---
    {
        profile_id: "S_BILIRUBIN_001",
        profile_name: "S. BILIRUBIN",
        specimen: "Blood",
        components: [
            { label: "Bilirubin Total", key: "bil_total", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "0.2 - 1.2 mg/dL" } },
            { label: "Bilirubin Direct", key: "bil_direct", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "0.0 - 0.3 mg/dL" } },
            { label: "Bilirubin Indirect", key: "bil_indirect", unit: "mg/dL", input_type: "calculated", formula: "{bil_total} - {bil_direct}", validation: { ref_range_text: "Calculated" } }
        ]
    },
    {
        profile_id: "SGOT_001",
        profile_name: "S. G. O. T",
        specimen: "Blood",
        components: [
            { label: "SGOT / AST", key: "sgot", unit: "U/L", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "< 40 U/L", panic_high: 500 } }
        ]
    },
    {
        profile_id: "SGPT_001",
        profile_name: "S. G. P. T",
        specimen: "Blood",
        components: [
            { label: "SGPT / ALT", key: "sgpt", unit: "U/L", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "< 40 U/L", panic_high: 500 } }
        ]
    },
    {
        profile_id: "ALK_PHOS_001",
        profile_name: "S. ALKALINE PHOSPHATASE",
        specimen: "Blood",
        components: [
            { label: "S. Alkaline Phosphatase", key: "alk_phos", unit: "U/L", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "80 - 290 U/L" } }
        ]
    },
    {
        profile_id: "LDH_001",
        profile_name: "S. LDH",
        specimen: "Blood",
        components: [
            { label: "LDH", key: "ldh", unit: "U/L", input_type: "number", validation: { min: 0, max: 3000, ref_range_text: "140 - 280 U/L" } }
        ]
    },
    {
        profile_id: "URIC_ACID_001",
        profile_name: "S. URIC ACID",
        specimen: "Blood",
        components: [
            { label: "S. Uric Acid", key: "uric_acid", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "M: 3.5-7.2, F: 2.6-6.0 mg/dL" } }
        ]
    },
    {
        profile_id: "TOTAL_PROTEINS_001",
        profile_name: "S. PROTEINS",
        specimen: "Blood",
        components: [
            { label: "S. Total Proteins", key: "total_protein", unit: "g/dL", input_type: "number", validation: { min: 0, max: 15, ref_range_text: "6.0 - 8.0 g/dL" } },
            { label: "S. Albumin", key: "albumin", unit: "g/dL", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "3.5 - 5.5 g/dL" } },
            { label: "S. Globulin", key: "globulin", unit: "g/dL", input_type: "calculated", formula: "{total_protein} - {albumin}", validation: { ref_range_text: "Calculated" } },
            { label: "A/G Ratio", key: "ag_ratio", unit: "", input_type: "calculated", formula: "{albumin} / {globulin}", validation: { ref_range_text: "Calculated" } }
        ]
    },
    {
        profile_id: "ACID_PHOS_001",
        profile_name: "S. ACID PHOSPHATASE",
        specimen: "Blood",
        components: [
            { label: "Acid Phosphatase (Total)", key: "acid_phos_total", unit: "U/L", input_type: "number", validation: { ref_range_text: "0 - 9 U/L" } },
            { label: "Prostatic Fraction", key: "acid_phos_pros", unit: "U/L", input_type: "number", validation: { ref_range_text: "0 - 3 U/L" } }
        ]
    },
    {
        profile_id: "CHOLESTEROL_001",
        profile_name: "S. CHOLESTEROL",
        specimen: "Blood",
        components: [
            { label: "S. Cholesterol", key: "cholesterol", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 800, ref_range_text: "< 200 mg/dL" } }
        ]
    },
    {
        profile_id: "HDL_001",
        profile_name: "S. HDL CHOL",
        specimen: "Blood",
        components: [
            { label: "S. HDL Cholesterol", key: "hdl", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "> 40 mg/dL" } }
        ]
    },
    {
        profile_id: "LDL_001",
        profile_name: "S. LDL CHOL",
        specimen: "Blood",
        components: [
            { label: "S. LDL Cholesterol", key: "ldl", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 500, ref_range_text: "< 100 mg/dL" } }
        ]
    },
    {
        profile_id: "TRIGLYCERIDES_001",
        profile_name: "S. TRIGLYCERIDES",
        specimen: "Blood",
        components: [
            { label: "S. Triglycerides", key: "triglycerides", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "< 150 mg/dL" } }
        ]
    },
    {
        profile_id: "CPK_TOTAL_001",
        profile_name: "S. CPK TOTAL",
        specimen: "Blood",
        components: [
            { label: "CPK Total", key: "cpk_total", unit: "U/L", input_type: "number", validation: { min: 0, max: 5000, ref_range_text: "25 - 170 U/L" } }
        ]
    },
    {
        profile_id: "CK_MB_001",
        profile_name: "S. CK MB",
        specimen: "Blood",
        components: [
            { label: "CK-MB", key: "ck_mb", unit: "IU/L", input_type: "number", validation: { min: 0, max: 500, ref_range_text: "0 - 25 IU/L" } }
        ]
    },
    {
        profile_id: "GLYCO_HB_001",
        profile_name: "GLYCOSYLATED HB",
        specimen: "Blood",
        components: [
            { label: "HbA1c", key: "hba1c", unit: "%", input_type: "number", validation: { min: 3, max: 20, ref_range_text: "< 5.7% Non-Diabetic" } },
            { label: "Mean Est. Glucose", key: "eag", unit: "mg/dL", input_type: "calculated", formula: "(28.7 * {hba1c}) - 46.7", validation: { ref_range_text: "Calculated" } }
        ]
    },
    {
        profile_id: "BICARB_001",
        profile_name: "S. BICARBONATE",
        specimen: "Blood",
        components: [
            { label: "Bicarbonate", key: "bicarb", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "22 - 29 mEq/L" } }
        ]
    },
    {
        profile_id: "AMMONIA_001",
        profile_name: "PLASMA AMMONIA",
        specimen: "Blood",
        components: [
            { label: "Plasma Ammonia", key: "ammonia", unit: "mcg/dL", input_type: "number", validation: { min: 0, max: 500, ref_range_text: "15 - 45 mcg/dL" } }
        ]
    },
    {
        profile_id: "CALCIUM_SINGLE_001",
        profile_name: "CALCIUM", // Matches tests.ts Name
        specimen: "Blood",
        components: [
            { label: "S. Calcium", key: "calcium", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "8.5 - 10.5 mg/dL" } }
        ]
    },
    {
        profile_id: "BLOOD_UREA_001",
        profile_name: "BLOOD UREA",
        specimen: "Blood",
        components: [
            { label: "Blood Urea", key: "blood_urea", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 300, ref_range_text: "15 - 40 mg/dL" } }
        ]
    },
    // --- SEROLOGY START ---
    {
        profile_id: "GROUP_001",
        profile_name: "GROUP", // Matches tests.ts "GROUP"
        specimen: "Blood",
        components: [
            { label: "ABO Group", key: "abo_group", unit: "", input_type: "dropdown", options: ["A", "B", "AB", "O", "Oh (Bombay)"], validation: { ref_range_text: "" } },
            { label: "Rh Factor", key: "rh_factor", unit: "", input_type: "dropdown", options: ["Positive", "Negative"], validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "PROTHROMBIN_001",
        profile_name: "PROTHROMBIN TIME",
        specimen: "Blood",
        components: [
            { label: "Prothrombin time", key: "pt_time", unit: "Seconds", input_type: "number", validation: { ref_range_text: "11-16 Seconds" } },
            { label: "Normal control", key: "pt_control", unit: "Seconds", input_type: "number", validation: { ref_range_text: "" } },
            { label: "ISI value", key: "pt_isi", unit: "", input_type: "number", validation: { ref_range_text: "" } },
            { label: "INR value", key: "pt_inr", unit: "", input_type: "number", validation: { ref_range_text: "0.8 - 1.2" } }
        ]
    },
    {
        profile_id: "RA_TEST_001",
        profile_name: "R A TEST",
        specimen: "Blood",
        components: [
            { label: "RA Factor", key: "ra_result", unit: "IU/mL", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "< 20 IU/mL" } },
            { label: "Qualitative", key: "ra_qual", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "ASO_TEST_001",
        profile_name: "A S O",
        specimen: "Blood",
        components: [
            { label: "ASO Titre", key: "aso_result", unit: "IU/mL", input_type: "number", validation: { min: 0, max: 1000, ref_range_text: "< 200 IU/mL" } },
            { label: "Qualitative", key: "aso_qual", unit: "", input_type: "dropdown", options: ["Negative", "Positive"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "AUSTRALIA_AG_001",
        profile_name: "AUSTRALIA ANTIGEN",
        specimen: "Blood",
        components: [
            { label: "HBsAg Result", key: "hbsag_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive", "Borderline"], validation: { ref_range_text: "Non-Reactive" } }
        ],
        ui_actions: [
            { trigger: "if {hbsag_result} == 'Reactive'", action: "toast_alert", message: "CRITICAL ALERT: Reactive!" }
        ]
    },
    {
        profile_id: "VDRL_TEST_001",
        profile_name: "VDRL",
        specimen: "Blood",
        components: [
            { label: "VDRL Result", key: "vdrl_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive", "Borderline"], validation: { ref_range_text: "Non-Reactive" } }
        ]
    },
    {
        profile_id: "HIV_TEST_001",
        profile_name: "HIV",
        specimen: "Blood",
        components: [
            { label: "HIV Result", key: "hiv_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive", "Borderline"], validation: { ref_range_text: "Non-Reactive" } }
        ]
    },
    // --- BACTERIOLOGY START ---
    {
        profile_id: "CUL_THROAT_001",
        profile_name: "CUL. THROAT SWAB",
        specimen: "Swab",
        components: [
            { label: "Culture Status", key: "culture_status", unit: "", input_type: "dropdown", options: ["Sterile / No Growth", "Growth Detected", "Contaminated"], validation: { ref_range_text: "Sterile" } },
            { label: "Organism Name", key: "organism_name", unit: "", input_type: "text", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "CUL_BLOOD_001",
        profile_name: "CULTURE BLOOD",
        specimen: "Blood",
        components: [
            { label: "Culture Status", key: "culture_status", unit: "", input_type: "dropdown", options: ["Sterile / No Growth", "Growth Detected", "Contaminated"], validation: { ref_range_text: "Sterile" } },
            { label: "Organism Name", key: "organism_name", unit: "", input_type: "text", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "CUL_CSF_001",
        profile_name: "CULTURE CSF",
        specimen: "Fluids",
        components: [
            { label: "Culture Status", key: "culture_status", unit: "", input_type: "dropdown", options: ["Sterile / No Growth", "Growth Detected", "Contaminated"], validation: { ref_range_text: "Sterile" } },
            { label: "Organism Name", key: "organism_name", unit: "", input_type: "text", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "CSF_PERI_001",
        profile_name: "CSF/PERICARDIAL FL",
        specimen: "Fluid",
        components: [
            { label: "Fluid Type", key: "fluid_type", unit: "", input_type: "dropdown", options: ["CSF", "Pericardial Fluid"], validation: { ref_range_text: "" } },
            { label: "Appearance", key: "appearance", unit: "", input_type: "text", validation: { ref_range_text: "Clear" } },
            { label: "Total Cell Count", key: "cell_count", unit: "/cmm", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Protein", key: "protein", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Sugar", key: "sugar", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "ASCITIC_PLEURAL_001",
        profile_name: "ASCITIC /PLEURAL FL",
        specimen: "Fluid",
        components: [
            { label: "Fluid Type", key: "fluid_type", unit: "", input_type: "dropdown", options: ["Ascitic Fluid", "Pleural Fluid"], validation: { ref_range_text: "" } },
            { label: "Appearance", key: "appearance", unit: "", input_type: "text", validation: { ref_range_text: "Clear" } },
            { label: "Total Cell Count", key: "cell_count", unit: "/cmm", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Protein", key: "protein", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "" } },
            { label: "Sugar", key: "sugar", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "THYROID_TESTS_001",
        profile_name: "T3 T4 TSH",
        specimen: "Blood",
        components: [
            { label: "T3", key: "t3", unit: "ng/mL", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "0.60 - 1.81 ng/mL" } },
            { label: "T4", key: "t4", unit: "ug/dL", input_type: "number", validation: { min: 0, max: 30, ref_range_text: "5.01 - 12.45 ug/dL" } },
            { label: "TSH", key: "tsh", unit: "uIU/mL", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "0.35 - 5.50 uIU/mL" } }
        ]
    },
    {
        profile_id: "LH_FSH_001",
        profile_name: "LH FSH",
        specimen: "Blood",
        components: [
            { label: "LH", key: "lh", unit: "mIU/mL", input_type: "number", validation: { ref_range_text: "Cycle Dependent" } },
            { label: "FSH", key: "fsh", unit: "mIU/mL", input_type: "number", validation: { ref_range_text: "Cycle Dependent" } }
        ]
    },
    {
        profile_id: "PROLACTIN_001",
        profile_name: "PROLACTIN",
        specimen: "Blood",
        components: [
            { label: "Prolactin", key: "prolactin", unit: "ng/mL", input_type: "number", validation: { ref_range_text: "4.8 - 23.3 ng/mL" } }
        ]
    },
    {
        profile_id: "BETA_HCG_001",
        profile_name: "BETA HCG",
        specimen: "Blood",
        components: [
            { label: "Beta HCG", key: "beta_hcg", unit: "mIU/mL", input_type: "number", validation: { ref_range_text: "< 5.0 mIU/mL (Non-pregnant)" } }
        ]
    },
    {
        profile_id: "TORCH_PANEL_001",
        profile_name: "TORCH",
        specimen: "Blood",
        components: [
            { label: "Toxo IgG", key: "toxo_igg", unit: "IU/mL", input_type: "number", validation: { ref_range_text: "Negative" } },
            { label: "Toxo IgM", key: "toxo_igm", unit: "Index", input_type: "number", validation: { ref_range_text: "Negative" } },
            { label: "Rubella IgG", key: "rubella_igg", unit: "IU/mL", input_type: "number", validation: { ref_range_text: "Negative" } },
            { label: "Rubella IgM", key: "rubella_igm", unit: "Index", input_type: "number", validation: { ref_range_text: "Negative" } },
            { label: "CMV IgG", key: "cmv_igg", unit: "IU/mL", input_type: "number", validation: { ref_range_text: "Negative" } },
            { label: "CMV IgM", key: "cmv_igm", unit: "Index", input_type: "number", validation: { ref_range_text: "Negative" } },
            { label: "HSV 1&2 IgG", key: "hsv_igg", unit: "Index", input_type: "number", validation: { ref_range_text: "Negative" } },
            { label: "HSV 1&2 IgM", key: "hsv_igm", unit: "Index", input_type: "number", validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "CYTOLOGY_001",
        profile_name: "CYTOLOGY",
        specimen: "Fluid, Tissue",
        components: [
            { label: "Site", key: "site", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Microscopy", key: "microscopy", unit: "", input_type: "text_area", validation: { ref_range_text: "" } },
            { label: "Impression", key: "impression", unit: "", input_type: "text_area", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "HISTOPATHOLOGY_001",
        profile_name: "HISTOPATHOLOGY",
        specimen: "Tissue",
        components: [
            { label: "Specimen", key: "specimen", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Gross Appearance", key: "gross", unit: "", input_type: "text_area", validation: { ref_range_text: "" } },
            { label: "Microscopy", key: "microscopy", unit: "", input_type: "text_area", validation: { ref_range_text: "" } },
            { label: "Impression", key: "impression", unit: "", input_type: "text_area", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "WESTERN_BLOT_001",
        profile_name: "WESTERN BLOT TEST",
        specimen: "Blood",
        components: [
            { label: "gp160", key: "gp160", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "gp120", key: "gp120", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "p66", key: "p66", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "p55", key: "p55", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "p51", key: "p51", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "gp41", key: "gp41", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "p31", key: "p31", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "p24", key: "p24", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "p17", key: "p17", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "Conclusion", key: "conclusion", unit: "", input_type: "dropdown", options: ["Negative", "Indeterminate", "Positive"], validation: { ref_range_text: "Negative" } }
        ]
    },
    {
        profile_id: "ANY_OTHER_001",
        profile_name: "ANY OTHER TEST",
        specimen: "Unknown",
        components: [
            { label: "Test Parameter", key: "parameter", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Result", key: "result", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Remark", key: "remark", unit: "", input_type: "text_area", validation: { ref_range_text: "" } }
        ]
    }
    ,
    // --- MASTER CHECKUP PROFILES START ---
    {
        profile_id: "SMA_12_001",
        profile_name: "SMA – 12",
        specimen: "Blood",
        components: [
            { label: "S. Albumin", key: "albumin", unit: "g/dL", input_type: "number", validation: { ref_range_text: "3.5 - 5.5 g/dL" } },
            { label: "S. Alkaline Phosphatase", key: "alk_phos", unit: "U/L", input_type: "number", validation: { ref_range_text: "80 - 290 U/L" } },
            { label: "SGOT / AST", key: "sgot", unit: "U/L", input_type: "number", validation: { ref_range_text: "< 40 U/L" } },
            { label: "SGPT / ALT", key: "sgpt", unit: "U/L", input_type: "number", validation: { ref_range_text: "< 40 U/L" } },
            { label: "Bilirubin Total", key: "bil_total", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "0.2 - 1.2 mg/dL" } },
            { label: "Blood Urea", key: "blood_urea", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "15 - 40 mg/dL" } },
            { label: "S. Calcium", key: "calcium", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "8.5 - 10.5 mg/dL" } },
            { label: "S. Cholesterol", key: "cholesterol", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "< 200 mg/dL" } },
            { label: "Blood Sugar Fasting", key: "bs_fasting", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "70 - 100 mg/dL" } },
            { label: "LDH", key: "ldh", unit: "U/L", input_type: "number", validation: { ref_range_text: "140 - 280 U/L" } },
            { label: "S. Phosphorus", key: "phosphorus", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "2.5 - 4.5 mg/dL" } },
            { label: "S. Total Proteins", key: "total_protein", unit: "g/dL", input_type: "number", validation: { ref_range_text: "6.0 - 8.0 g/dL" } }
        ]
    },
    {
        profile_id: "TOTAL_BODY_001",
        profile_name: "TOTAL BODY",
        specimen: "Blood",
        components: [
            // CBC
            { label: "Haemoglobin (Hb)", key: "hb", unit: "g/dL", input_type: "number", validation: { ref_range_text: "M: 13-17, F: 12-15" } },
            { label: "Total WBC Count", key: "wbc", unit: "/cmm", input_type: "number", validation: { ref_range_text: "4,000 - 11,000" } },
            { label: "DC - Neutrophils", key: "neutrophils", unit: "%", input_type: "number", validation: { ref_range_text: "40-75 %" } },
            { label: "DC - Lymphocytes", key: "lymphocytes", unit: "%", input_type: "number", validation: { ref_range_text: "20-45 %" } },
            { label: "ESR", key: "esr", unit: "mm", input_type: "number", validation: { ref_range_text: "M: 0-15, F: 0-20" } },
            // SUGAR
            { label: "Blood Sugar Fasting", key: "bs_fasting", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "70 - 100" } },
            { label: "Blood Sugar PP", key: "bs_pp", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "< 140" } },
            // LIPID
            { label: "S. Cholesterol", key: "cholesterol", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "< 200" } },
            { label: "S. Triglycerides", key: "triglycerides", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "< 150" } },
            { label: "S. HDL", key: "hdl", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "> 40" } },
            { label: "S. LDL", key: "ldh", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "< 100" } },
            // LFT
            { label: "Bilirubin Total", key: "bil_total", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "0.2 - 1.2" } },
            { label: "SGOT", key: "sgot", unit: "U/L", input_type: "number", validation: { ref_range_text: "< 40" } },
            { label: "SGPT", key: "sgpt", unit: "U/L", input_type: "number", validation: { ref_range_text: "< 40" } },
            { label: "Alk. Phosphatase", key: "alk_phos", unit: "U/L", input_type: "number", validation: { ref_range_text: "80 - 290" } },
            // KFT
            { label: "Blood Urea", key: "blood_urea", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "15 - 40" } },
            { label: "S. Creatinine", key: "creatinine", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "0.7 - 1.3" } },
            { label: "S. Uric Acid", key: "uric_acid", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "3.5 - 7.2" } }
        ]
    },
    {
        profile_id: "HYPERTENSION_001",
        profile_name: "HYPERTENSION",
        specimen: "Blood",
        components: [
            // LIPID
            { label: "S. Cholesterol", key: "cholesterol", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "< 200" } },
            { label: "S. Triglycerides", key: "triglycerides", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "< 150" } },
            { label: "S. HDL", key: "hdl", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "> 40" } },
            { label: "S. LDL", key: "ldh", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "< 100" } },
            // KIDNEY + ELECTROLYTES
            { label: "Blood Urea", key: "blood_urea", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "15 - 40" } },
            { label: "S. Creatinine", key: "creatinine", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "0.7 - 1.3" } },
            { label: "Sodium (Na+)", key: "sodium", unit: "mEq/L", input_type: "number", validation: { ref_range_text: "135 - 145" } },
            { label: "Potassium (K+)", key: "potassium", unit: "mEq/L", input_type: "number", validation: { ref_range_text: "3.5 - 5.1" } },
            { label: "Chloride (Cl-)", key: "chloride", unit: "mEq/L", input_type: "number", validation: { ref_range_text: "96 - 106" } }
        ]
    },
    {
        profile_id: "CARDIAC_CHECKUP_001",
        profile_name: "CARDIAC", // Distinct from ENZYMES
        specimen: "Blood",
        components: [
            { label: "ECG Findings", key: "ecg_findings", unit: "", input_type: "text_area", validation: { ref_range_text: "Normal Sinus Rhythm" } },
            { label: "S. Cholesterol", key: "cholesterol", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "< 200" } },
            { label: "S. Triglycerides", key: "triglycerides", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "< 150" } },
            { label: "S. HDL", key: "hdl", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "> 40" } },
            { label: "S. LDL", key: "ldh", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "< 100" } },
            { label: "Blood Sugar Fasting", key: "bs_fasting", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "70 - 100" } },
            { label: "S. Creatinine", key: "creatinine", unit: "mg/dL", input_type: "number", validation: { ref_range_text: "0.7 - 1.3" } }
        ]
    },
    // --- CULTURE PROFILES START ---
    {
        profile_id: "CULTURE_URINE_001",
        profile_name: "CULTURE URINE",
        specimen: "Urine",
        components: [
            { label: "Microscopy", key: "microscopy", unit: "", input_type: "text_area", validation: { ref_range_text: "Pus Cells: 0-2 /hpf, RBCs: Nil, Epith: Nil" } },
            { label: "Organism Isolated", key: "organism", unit: "", input_type: "text", validation: { ref_range_text: "Sterile / No Growth" } },
            { label: "Colony Count", key: "colony_count", unit: "CFU/mL", input_type: "text", validation: { ref_range_text: "< 10^3 CFU/mL" } },
            { label: "Antibiotic Sensitivity", key: "sensitivity", unit: "", input_type: "text_area", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "CULTURE_STOOL_001",
        profile_name: "CULTURE STOOL",
        specimen: "Stool",
        components: [
            { label: "Consistency", key: "consistency", unit: "", input_type: "dropdown", options: ["Solid", "Semi-Solid", "Soft", "Loose", "Watery"], validation: { ref_range_text: "Semi-Solid" } },
            { label: "Color", key: "color", unit: "", input_type: "text", validation: { ref_range_text: "Brown" } },
            { label: "Mucus", key: "mucus", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "Blood", key: "blood", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "Parasites (Ova/Cyst)", key: "parasites", unit: "", input_type: "text_area", validation: { ref_range_text: "None Seen" } },
            { label: "Organism Isolated", key: "organism", unit: "", input_type: "text", validation: { ref_range_text: "Normal Flora" } },
            { label: "Antibiotic Sensitivity", key: "sensitivity", unit: "", input_type: "text_area", validation: { ref_range_text: "" } }
        ]
    },
    {
        profile_id: "CULTURE_PUS_001",
        profile_name: "CULTURE PUS",
        specimen: "Pus",
        components: [
            { label: "Specimen Source", key: "source", unit: "", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Gram Stain", key: "gram_stain", unit: "", input_type: "text_area", validation: { ref_range_text: "No Organisms Seen" } },
            { label: "Organism Isolated", key: "organism", unit: "", input_type: "text", validation: { ref_range_text: "Sterile / No Growth" } },
            { label: "Antibiotic Sensitivity", key: "sensitivity", unit: "", input_type: "text_area", validation: { ref_range_text: "" } }
        ]
    },

    {
        profile_id: "PSA_001",
        profile_name: "PSA (TOTAL)",
        specimen: "Blood",
        components: [
            { label: "Total PSA", key: "psa_total", unit: "ng/mL", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "< 4.0 ng/mL" } }
        ]
    },
    {
        profile_id: "URINE_MICROALBUMIN_001",
        profile_name: "URINE MICROALBUMIN",
        specimen: "Urine",
        components: [
            { label: "Urinary Microalbumin", key: "microalbumin", unit: "mg/L", input_type: "number", validation: { ref_range_text: "< 20 mg/L" } },
            { label: "Urine Creatinine", key: "urine_creatinine", unit: "g/L", input_type: "number", validation: { ref_range_text: "0.3 - 3.0 g/L" } },
            { label: "Albumin/Creatinine Ratio", key: "ac_ratio", unit: "mg/g", input_type: "calculated", formula: "{microalbumin} / {urine_creatinine}", validation: { ref_range_text: "< 30 mg/g" } }
        ]
    },
    {
        profile_id: "TRIPLE_H_001",
        profile_name: "TRIPLE H MARKERS",
        specimen: "Blood",
        components: [
            { label: "HIV I & II", key: "hiv_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } },
            { label: "HBsAg", key: "hbsag_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } },
            { label: "HCV", key: "hcv_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } }
        ],
        ui_actions: [
            { trigger: "if {hiv_result} == 'Reactive'", action: "toast_alert", message: "CRITICAL: HIV Reactive" },
            { trigger: "if {hbsag_result} == 'Reactive'", action: "toast_alert", message: "CRITICAL: HBsAg Reactive" },
            { trigger: "if {hcv_result} == 'Reactive'", action: "toast_alert", message: "CRITICAL: HCV Reactive" }
        ]
    },
    {
        profile_id: "BONE_METABOLIC_001",
        profile_name: "BONE METABOLIC PROFILE",
        specimen: "Blood",
        components: [
            { label: "S. Calcium", key: "calcium", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "8.5 - 10.5 mg/dL" } },
            { label: "S. Phosphorous", key: "phosphorus", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "2.5 - 4.5 mg/dL" } },
            { label: "S. Uric Acid", key: "uric_acid", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "3.5 - 7.2 mg/dL" } },
            { label: "S. Creatinine", key: "creatinine", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "0.6 - 1.2 mg/dL" } }
        ]
    },
    {
        profile_id: "TRIPLE_H_001",
        profile_name: "TRIPLE-H",
        specimen: "Blood",
        components: [
            { label: "HUMAN IMMUNODEFICIENCY VIRUS (HIV)", key: "hiv_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } },
            { label: "HEPATITIS B SURFACE ANTIGEN (HBsAg)", key: "hbsag_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } },
            { label: "HEPATITIS C VIRUS (HCV)", key: "hcv_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } }
        ]
    },
    {
        profile_id: "ANC_PROFILE_001",
        profile_name: "A.N.C PROFILE",
        specimen: "Blood, Urine(routine)",
        components: [
            { label: "HAEMOGRAM", key: "header_cbc", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Haemoglobin", key: "hb", unit: "g/dL", input_type: "number", validation: { min: 0, max: 25, ref_range_text: "12 - 15 g/dL" } },
            { label: "Total WBC Count", key: "wbc", unit: "/cmm", input_type: "number", validation: { min: 0, max: 50000, ref_range_text: "4000 - 11000 /cmm" } },
            { label: "Platelet Count", key: "platelet", unit: "Lakh/cmm", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "1.5 - 4.5 Lakh/cmm" } },

            { label: "BLOOD GROUP & Rh", key: "header_group", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Blood Group", key: "abo_group", unit: "", input_type: "dropdown", options: ["A", "B", "AB", "O"], validation: { ref_range_text: "" } },
            { label: "Rh Factor", key: "rh_factor", unit: "", input_type: "dropdown", options: ["Positive", "Negative"], validation: { ref_range_text: "" } },

            { label: "BIOCHEMISTRY", key: "header_bio", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Blood Sugar (Random)", key: "rbs", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 500, ref_range_text: "70 - 140 mg/dL" } },
            { label: "TSH", key: "tsh", unit: "uIU/mL", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "0.35 - 5.50 uIU/mL" } },

            { label: "SEROLOGY", key: "header_sero", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "HIV", key: "hiv_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } },
            { label: "HBsAg", key: "hbsag_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } },
            { label: "VDRL", key: "vdrl_result", unit: "", input_type: "dropdown", options: ["Non-Reactive", "Reactive"], validation: { ref_range_text: "Non-Reactive" } },

            { label: "URINE ROUTINE", key: "header_urine", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Pus Cells", key: "urine_pus", unit: "/hpf", input_type: "text", validation: { ref_range_text: "0 - 5 /hpf" } },
            { label: "Epithelial Cells", key: "urine_ep", unit: "/hpf", input_type: "text", validation: { ref_range_text: "0 - 5 /hpf" } },
            { label: "Albumin", key: "urine_alb", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "Present"], validation: { ref_range_text: "Nil" } },
            { label: "Sugar", key: "urine_sugar", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "Present"], validation: { ref_range_text: "Nil" } }
        ]
    }, // Added comma here
    {
        profile_id: "BIOCHEMISTRY_PROFILE_001",
        profile_name: "BIOCHEMISTRY",
        specimen: "Blood",
        components: [
            { label: "Fasting Blood Sugar", key: "bs_fasting", unit: "mg/dL", input_type: "number", validation: { min: 20, max: 1000, ref_range_text: "70 - 100 mg/dL" } },
            { label: "Fasting Urine Sugar", key: "urine_sugar_f", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++", "++++"], validation: { ref_range_text: "Nil" } },
            { label: "Fasting Urine Ketones", key: "urine_ketone_f", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++"], validation: { ref_range_text: "Nil" } },

            { label: "PP/PG/R Blood Sugar", key: "bs_pp", unit: "mg/dL", input_type: "number", validation: { min: 20, max: 1000, ref_range_text: "< 140 mg/dL" } },
            { label: "Urine Sugar", key: "urine_sugar_pp", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++", "++++"], validation: { ref_range_text: "Nil" } },
            { label: "Urine Ketones", key: "urine_ketone_pp", unit: "", input_type: "dropdown", options: ["Nil", "Trace", "+", "++", "+++"], validation: { ref_range_text: "Nil" } },

            { label: "Blood Urea Nitrogen", key: "bun", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 100, ref_range_text: "7 - 20 mg/dL" } },
            { label: "Blood Urea", key: "blood_urea", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 300, ref_range_text: "15 - 40 mg/dL" } },
            { label: "S Creatinine", key: "creatinine", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "0.6 - 1.2 mg/dL" } },

            { label: "S Bilirubin Total", key: "bil_total", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "0.2 - 1.2 mg/dL" } },
            { label: "S Bilirubin Direct", key: "bil_direct", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "0.0 - 0.3 mg/dL" } },
            { label: "S Bilirubin Indirect", key: "bil_indirect", unit: "mg/dL", input_type: "calculated", formula: "{bil_total} - {bil_direct}", validation: { ref_range_text: "Calculated" } },

            { label: "SGPT", key: "sgpt", unit: "U/L", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "< 40 U/L" } },
            { label: "SGOT", key: "sgot", unit: "U/L", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "< 40 U/L" } },
            { label: "S Alkaline Phosphatase", key: "alk_phos", unit: "U/L", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "80 - 290 U/L" } },

            { label: "S Proteins Total", key: "total_protein", unit: "g/dL", input_type: "number", validation: { min: 0, max: 15, ref_range_text: "6.0 - 8.0 g/dL" } },
            { label: "S Albumin", key: "albumin", unit: "g/dL", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "3.5 - 5.5 g/dL" } },
            { label: "A/G Ratio", key: "ag_ratio", unit: "", input_type: "calculated", formula: "{albumin} / ({total_protein} - {albumin})", validation: { ref_range_text: "Calculated" } },

            { label: "S Cholesterol", key: "cholesterol", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 800, ref_range_text: "< 200 mg/dL" } },
            { label: "HDL Cholesterol", key: "hdl", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "> 40 mg/dL" } },
            { label: "LDL Cholesterol", key: "ldl", unit: "mg/dL", input_type: "calculated", formula: "({cholesterol} - {hdl}) - ({triglycerides} / 5)", validation: { ref_range_text: "< 100 mg/dL" } },
            { label: "S Triglycerides", key: "triglycerides", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "< 150 mg/dL" } },

            { label: "S GGT", key: "ggt", unit: "U/L", input_type: "number", validation: { min: 0, max: 1000, ref_range_text: "9 - 48 U/L" } },
            { label: "S LDH", key: "ldh", unit: "U/L", input_type: "number", validation: { min: 0, max: 3000, ref_range_text: "140 - 280 U/L" } },
            { label: "S CPK", key: "cpk_total", unit: "U/L", input_type: "number", validation: { min: 0, max: 5000, ref_range_text: "25 - 170 U/L" } },
            { label: "S CK-mb", key: "ck_mb", unit: "IU/L", input_type: "number", validation: { min: 0, max: 500, ref_range_text: "0 - 25 IU/L" } },

            { label: "S Uric Acid", key: "uric_acid", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "3.5 - 7.2 mg/dL" } },
            { label: "S Calcium", key: "calcium", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "8.5 - 10.5 mg/dL" } },
            { label: "S Phosphorous", key: "phosphorus", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "2.5 - 4.5 mg/dL" } },
            { label: "S Amylase", key: "amylase", unit: "U/L", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "28 - 100 U/L" } },

            { label: "S Sodium", key: "sodium", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "135 - 145 mEq/L" } },
            { label: "S Potassium", key: "potassium", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "3.5 - 5.1 mEq/L" } },
            { label: "S.Chloride", key: "chloride", unit: "mEq/L", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "96 - 106 mEq/L" } },
            { label: "S. Lipase", key: "lipase", unit: "U/L", input_type: "number", validation: { min: 0, max: 500, ref_range_text: "13 - 60 U/L" } }
        ]
    },
    {
        profile_id: "G6PD_001",
        profile_name: "G6-PD TEST",
        specimen: "Blood",
        components: [
            { label: "G6PD Test", key: "g6pd_val", unit: "U/g Hb", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "4.6 - 13.5 U/g Hb" } },
            { label: "Method", key: "method", unit: "", input_type: "text", validation: { ref_range_text: "Kinetic" } },
            { label: "Normal Range", key: "normal_range_txt", unit: "", input_type: "text", validation: { ref_range_text: "4.6 - 13.5 U/g Hb" } }
        ]
    },
    {
        profile_id: "ASCITIC_TEST_001",
        profile_name: "ASCITIC TEST",
        specimen: "Fluid",
        components: [
            // PHYSICAL EXAMINATION
            { label: "PHYSICAL EXAMINATION", key: "physical_header", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Volume", key: "volume", unit: "ml", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Colour", key: "colour", unit: "", input_type: "text", validation: { ref_range_text: "Pale Yellow" } },
            { label: "Appearance", key: "appearance", unit: "", input_type: "text", validation: { ref_range_text: "Clear" } },
            { label: "Blood", key: "blood", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },
            { label: "Clot", key: "clot", unit: "", input_type: "dropdown", options: ["Absent", "Present"], validation: { ref_range_text: "Absent" } },

            // CHEMICAL EXAMINATION
            { label: "CHEMICAL EXAMINATION", key: "chemical_header", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Proteins", key: "proteins", unit: "g/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "" } },
            { label: "Sugar", key: "sugar", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 500, ref_range_text: "" } },
            { label: "Albumin", key: "albumin", unit: "g/dL", input_type: "number", validation: { min: 0, max: 10, ref_range_text: "" } },

            // MICROSCOPIC EXAMINATION
            { label: "MICROSCOPIC EXAMINATION", key: "microscopic_header", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Total RBC's count", key: "rbc_count", unit: "/cmm", input_type: "text", validation: { ref_range_text: "Nil" } },
            { label: "Total WBC's count", key: "wbc_count", unit: "/cmm", input_type: "text", validation: { ref_range_text: "" } },
            { label: "Differential Count", key: "diff_count", unit: "", input_type: "text", validation: { ref_range_text: "" } },

            // BACTERIOLOGICAL EXAMINATION
            { label: "BACTERIOLOGICAL EXAMINATION", key: "bacterio_header", unit: "", input_type: "header", validation: { ref_range_text: "" } },
            { label: "Gram's Stain", key: "gram_stain", unit: "", input_type: "text", validation: { ref_range_text: "No Organisms detected" } },
            { label: "Ziehl Neelsen Stain", key: "zn_stain", unit: "", input_type: "text", validation: { ref_range_text: "No AFB seen" } }
        ]
    },
    {
        profile_id: "URINARY_VOL_24H_001",
        profile_name: "24 HOURS URINARY VOLUME",
        specimen: "Urine",
        components: [
            { label: "24 hour Urinary Volume", key: "vol_24h", unit: "ml/24hr", input_type: "number", validation: { min: 0, max: 5000, ref_range_text: "800 - 2000 ml/24hr" } },
            { label: "Urinary MicroAlbumin", key: "micro_alb", unit: "mg/L", input_type: "number", validation: { min: 0, max: 500, ref_range_text: "< 20 mg/L" } },
            { label: "24 hours Urinary Microalbumin", key: "micro_alb_24h", unit: "mg/24hr", input_type: "calculated", formula: "({micro_alb} * {vol_24h}) / 1000", validation: { ref_range_text: "< 30 mg/24hr" } },
            { label: "Normal Range", key: "normal_range_txt", unit: "", input_type: "text", validation: { ref_range_text: "< 30 mg/24hr" } }
        ]
    },
    {
        profile_id: "AEC_001",
        profile_name: "ABSOLUTE EOSINOPHIL COUNT",
        specimen: "Blood",
        components: [
            { label: "Absolute Eosinophil Count", key: "aec", unit: "/cmm", input_type: "number", validation: { min: 0, max: 2000, ref_range_text: "20 - 500 /cmm" } }
        ]
    },
    {
        profile_id: "CREATININE_001",
        profile_name: "S. CREATININE",
        specimen: "Blood",
        components: [
            { label: "S. Creatinine", key: "creatinine", unit: "mg/dL", input_type: "number", validation: { min: 0, max: 20, ref_range_text: "0.6 - 1.2 mg/dL" } },
            { label: "Method", key: "method", unit: "", input_type: "text", validation: { ref_range_text: "Jaffe's" } },

            // Header or Info Section for eGFR
            { label: "Role of eGFR in chronic kidney disease", key: "egfr_header", unit: "", input_type: "header", validation: { ref_range_text: "" } },

            { label: "eGFR", key: "egfr", unit: "mL/min", input_type: "number", validation: { min: 0, max: 200, ref_range_text: "> 90 mL/min" } },
            { label: "Stage", key: "ckd_stage", unit: "", input_type: "text", validation: { ref_range_text: "" } }
        ]
    }
];
