import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ clientId: string }> }
) {
    try {
        const { clientId: clientIdParam } = await params;
        const clientId = Number(clientIdParam);

        if (!clientId) {
            return NextResponse.json({ success: false, error: "Invalid clientId" }, { status: 400 });
        }

        const supabase = createServerClient();

        const { data: tasks, error } = await supabase
            .from('onboarding_tasks')
            .select(`
                task_id,
                task_title,
                status,
                order_number,
                due_date,
                created_at,
                document_required,
                stage:onboarding_stages(stage_name)
            `)
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to legacy response format
        const formattedData = (tasks || []).map(t => {
            const stageData = Array.isArray(t.stage) ? t.stage[0] : t.stage;
            return {
                id: t.task_id,
                title: t.task_title,
                status: t.status,
                order_number: t.order_number,
                dueDate: t.due_date,
                createdAt: t.created_at,
                documentRequired: t.document_required,
                stage: (stageData as any)?.stage_name || 'N/A'
            };
        });

        return NextResponse.json({
            success: true,
            data: formattedData,
        });
    } catch (err: any) {
        console.error("GET /api/tasks/client/[clientId] error:", err);
        return NextResponse.json({ success: false, error: "Failed to fetch client tasks" }, { status: 500 });
    }
}
