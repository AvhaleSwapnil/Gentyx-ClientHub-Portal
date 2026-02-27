// app/api/tasks/get/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q");
    const taskType = searchParams.get("taskType"); // ONBOARDING | ASSIGNED
    const assignedRole = searchParams.get("assignedRole"); // CLIENT | CPA | SERVICE_CENTER | ADMIN
    const dueFrom = searchParams.get("dueFrom");
    const dueTo = searchParams.get("dueTo");
    const clientId = searchParams.get("clientId");
    const taskId = searchParams.get("taskId");

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 20);
    const offset = (page - 1) * pageSize;

    const supabase = createServerClient();

    // 🔹 Query the unified View
    let query = supabase
      .from('v_combined_tasks')
      .select('*', { count: 'exact' });

    // 🔹 Apply Filters
    if (taskType && taskType !== 'ALL') {
      query = query.eq('task_type', taskType);
    }
    if (assignedRole && assignedRole !== 'ALL') {
      query = query.eq('assigned_role', assignedRole);
    }
    if (dueFrom) {
      query = query.gte('due_date', dueFrom);
    }
    if (dueTo) {
      query = query.lte('due_date', dueTo);
    }
    if (clientId) {
      query = query.eq('client_id', Number(clientId));
    }
    if (taskId) {
      query = query.eq('id', Number(taskId));
    }
    if (q) {
      query = query.or(`title.ilike.%${q}%,client_name.ilike.%${q}%`);
    }

    const { data: tasks, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: tasks,
      total: count || 0,
      page,
      pageSize
    });

  } catch (err: any) {
    console.error("GET /api/tasks/get error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
