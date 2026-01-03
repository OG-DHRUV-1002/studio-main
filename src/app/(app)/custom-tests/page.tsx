import { CustomTestBuilder } from "@/components/admin/CustomTestBuilder";

export default function CustomTestsPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Master Test Builder (God Mode)</h1>
            <CustomTestBuilder />
        </div>
    );
}
