-- RPC Function to atomically save client onboarding stages and subtasks
-- This replaces existing stages/subtasks for the client with the provided set.

CREATE OR REPLACE FUNCTION public.save_client_onboarding_data(
    p_client_id INT,
    p_stages JSONB
)
RETURNS VOID AS $$
DECLARE
    stage_rec JSONB;
    subtask_rec JSONB;
    v_stage_id INT;
    v_order INT := 1;
    v_sub_order INT := 1;
BEGIN
    -- 1. Delete existing subtasks first (due to FK)
    DELETE FROM public.client_stage_subtasks
    WHERE client_stage_id IN (
        SELECT client_stage_id 
        FROM public.client_stages 
        WHERE client_id = p_client_id
    );
    
    -- 2. Delete existing stages
    DELETE FROM public.client_stages WHERE client_id = p_client_id;

    -- 3. Insert new stages
    FOR stage_rec IN SELECT * FROM jsonb_array_elements(p_stages)
    LOOP
        INSERT INTO public.client_stages (
            client_id,
            stage_name,
            status,
            order_number,
            is_required,
            created_at,
            updated_at
        ) VALUES (
            p_client_id,
            stage_rec->>'name',
            COALESCE(stage_rec->>'status', 'Not Started'),
            COALESCE((stage_rec->>'order')::INT, v_order),
            COALESCE((stage_rec->>'isRequired')::BOOLEAN, true),
            NOW(),
            NOW()
        ) RETURNING client_stage_id INTO v_stage_id;

        v_order := v_order + 1;

        -- 4. Insert subtasks
        IF stage_rec ? 'subtasks' AND jsonb_typeof(stage_rec->'subtasks') = 'array' THEN
            v_sub_order := 1;
            FOR subtask_rec IN SELECT * FROM jsonb_array_elements(stage_rec->'subtasks')
            LOOP
                INSERT INTO public.client_stage_subtasks (
                    client_stage_id,
                    subtask_title,
                    status,
                    order_number,
                    document_required,
                    created_at,
                    updated_at
                ) VALUES (
                    v_stage_id,
                    subtask_rec->>'title',
                    COALESCE(subtask_rec->>'status', 'Not Started'),
                    COALESCE((subtask_rec->>'order_number')::INT, (subtask_rec->>'order')::INT, v_sub_order),
                    COALESCE((subtask_rec->>'document_required')::BOOLEAN, false),
                    NOW(),
                    NOW()
                );
                v_sub_order := v_sub_order + 1;
            END LOOP;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
