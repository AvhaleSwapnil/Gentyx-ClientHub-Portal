import { createServerClient } from "@/lib/supabase";

/**
 * Fetch all stages + tasks for a client from Supabase
 */
export async function fetchClientStagesAndTasks(clientId: number) {
  const supabase = createServerClient();

  const { data: stages, error: stagesError } = await supabase
    .from('client_stages')
    .select('*')
    .eq('client_id', clientId)
    .order('order_number', { ascending: true });

  if (stagesError) throw stagesError;

  const { data: tasks, error: tasksError } = await supabase
    .from('client_stage_subtasks')
    .select('*, client_stages!inner(client_id)')
    .eq('client_stages.client_id', clientId)
    .order('order_number', { ascending: true });

  if (tasksError) throw tasksError;

  return {
    stages: stages || [],
    tasks: tasks || []
  };
}

/**
 * Calculate stage completion: Completed if ALL tasks are done
 */
function calculateStageStatus(tasksForStage: any[]) {
  if (tasksForStage.length === 0) return "Not Started";

  const allCompleted = tasksForStage.every(t => (t.status || "").toLowerCase() === "completed");

  if (allCompleted) return "Completed";

  const anyStarted = tasksForStage.some(t => {
    const s = (t.status || "").toLowerCase();
    return s === "completed" || s === "in progress";
  });

  if (anyStarted) return "In Progress";

  return "Not Started";
}

/**
 * MAIN LOGIC — Calculate overall client progress
 */
export async function calculateClientProgress(clientId: number) {
  const supabase = createServerClient();

  const { stages, tasks } = await fetchClientStagesAndTasks(clientId);

  if (stages.length === 0) {
    await updateClientProgressInDb(clientId, 0, null, null, "Not Started");
    return { progress: 0, nextStage: null };
  }

  const totalStages = stages.length;
  let completedStagesCount = 0;

  for (const stage of stages) {
    const stageTasks = tasks.filter(t => t.client_stage_id === stage.client_stage_id);
    const calculatedStatus = calculateStageStatus(stageTasks);

    if (calculatedStatus === "Completed") completedStagesCount++;

    if (stage.status !== calculatedStatus) {
      await supabase
        .from('client_stages')
        .update({ 
          status: calculatedStatus,
          updated_at: new Date().toISOString()
        })
        .eq('client_stage_id', stage.client_stage_id);

      stage.status = calculatedStatus;
    }
  }

  const progress = totalStages > 0 ? Math.round((completedStagesCount / totalStages) * 100) : 0;
  const nextStage = stages.find(s => s.status !== "Completed") || null;
  const clientStatus = progress === 100 ? "Completed" : (progress > 0 ? "In Progress" : "Not Started");

  await updateClientProgressInDb(
    clientId, 
    progress, 
    nextStage?.client_stage_id || null, 
    nextStage?.stage_name || null, 
    clientStatus
  );

  return { progress, nextStage };
}

async function updateClientProgressInDb(
    clientId: number, 
    progress: number, 
    stageId: number | null, 
    stageName: string | null, 
    status: string
) {
  const supabase = createServerClient();
  await supabase
    .from('Clients')
    .update({
      progress,
      stage_id: stageId,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('client_id', clientId);
}
