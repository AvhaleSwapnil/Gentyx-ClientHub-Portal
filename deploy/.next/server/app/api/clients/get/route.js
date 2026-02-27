(()=>{var a={};a.id=4807,a.ids=[4807],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},1708:a=>{"use strict";a.exports=require("node:process")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4573:a=>{"use strict";a.exports=require("node:buffer")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},12412:a=>{"use strict";a.exports=require("assert")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19185:a=>{"use strict";a.exports=require("dgram")},19472:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>E,patchFetch:()=>D,routeModule:()=>z,serverHooks:()=>C,workAsyncStorage:()=>A,workUnitAsyncStorage:()=>B});var d={};c.r(d),c.d(d,{GET:()=>y});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(27143),w=c(22161),x=c.n(w);async function y(a){try{let b=await (0,v.getDbPool)(),{searchParams:c}=new URL(a.url),d=Math.max(parseInt(c.get("page")||"1"),1),e=Math.max(parseInt(c.get("pageSize")||"10"),1),f=(c.get("q")||"").trim(),g=(c.get("status")||"ALL").trim(),h=(c.get("archiveFilter")||"ALL").trim(),i=(d-1)*e,j=b.request().input("Q",x().VarChar(255),f).input("StatusFilter",x().VarChar(50),g).input("ArchiveFilter",x().VarChar(50),h).input("PageSize",x().Int,e).input("Offset",x().Int,i),k=await j.query(`

      SET NOCOUNT ON;

      /* ============================================
         STEP 1 — BASE CLIENT QUERY (search filter)
         Joins service centers and CPAs early for search
      ==============================================*/
      WITH ClientBase AS (
        SELECT
          c.client_id,
          c.client_name,
          c.code,
          c.client_status,
          c.sla_number,
          c.primary_contact_first_name,
          c.primary_contact_last_name,
          c.primary_contact_name,
          c.primary_contact_email,
          c.primary_contact_phone,
          c.created_at,
          c.updated_at,
          c.service_center_id,
          c.cpa_id,
          ISNULL(c.is_archived, 0) AS is_archived,
          sc.center_name AS service_center_name,
          cp.cpa_name AS cpa_name
        FROM dbo.Clients c
        LEFT JOIN dbo.service_centers sc ON sc.service_center_id = c.service_center_id
        LEFT JOIN dbo.cpa_centers cp ON cp.cpa_id = c.cpa_id
        WHERE
          -- Archive filter
          (
            @ArchiveFilter = 'ALL' 
            OR (@ArchiveFilter = 'active' AND ISNULL(c.is_archived, 0) = 0)
            OR (@ArchiveFilter = 'archived' AND c.is_archived = 1)
          )
          AND (
            @Q = '' OR
            c.client_name LIKE '%' + @Q + '%' OR
            c.code LIKE '%' + @Q + '%' OR
            c.primary_contact_name LIKE '%' + @Q + '%' OR
            sc.center_name LIKE '%' + @Q + '%' OR
            cp.cpa_name LIKE '%' + @Q + '%'
          )
      ),

      /* ============================================
         STEP 2 — COMPUTE STAGE NAME AND STATUS
      ==============================================*/
      ClientWithStage AS (
        SELECT
          cb.*,

          stage_name = COALESCE(
            -- 1. In Progress Stage
            (
              SELECT TOP 1 cs.stage_name
              FROM dbo.client_stages cs
              WHERE cs.client_id = cb.client_id
                AND cs.status = 'In Progress'
              ORDER BY cs.order_number
            ),

            -- 2. Last Completed Stage
            (
              SELECT TOP 1 cs.stage_name
              FROM dbo.client_stages cs
              WHERE cs.client_id = cb.client_id
                AND cs.status = 'Completed'
              ORDER BY cs.order_number DESC
            ),

            -- 3. First Not Started Required Stage
            (
              SELECT TOP 1 cs.stage_name
              FROM dbo.client_stages cs
              WHERE cs.client_id = cb.client_id
                AND cs.status = 'Not Started'
                AND cs.is_required = 1
              ORDER BY cs.order_number
            )
          ),

          -- FINAL CLIENT STATUS LOGIC
          status =
            CASE
              -- 1. NO STAGES AT ALL → NOT STARTED
              WHEN NOT EXISTS (
                SELECT 1 FROM dbo.client_stages cs
                WHERE cs.client_id = cb.client_id
              ) THEN 'Not Started'

              -- 2. ALL STAGES COMPLETED
              WHEN NOT EXISTS (
                SELECT 1 FROM dbo.client_stages cs
                WHERE cs.client_id = cb.client_id
                  AND cs.status <> 'Completed'
              ) THEN 'Completed'

              -- 3. ALL STAGES NOT STARTED
              WHEN NOT EXISTS (
                SELECT 1 FROM dbo.client_stages cs
                WHERE cs.client_id = cb.client_id
                  AND cs.status <> 'Not Started'
              ) THEN 'Not Started'

              -- 4. MIXED (Completed + In Progress + Not Started)
              ELSE 'In Progress'
            END

        FROM ClientBase cb
      ),

      /* ============================================
         STEP 3 — STAGE PROGRESS (STAGE + SUBTASK LOGIC)
      ==============================================*/
      ClientStageProgress AS (
        SELECT
          cws.*,

          total_stages = (
            SELECT COUNT(*)
            FROM dbo.client_stages cs
            WHERE cs.client_id = cws.client_id
          ),

          completed_stages = (
            SELECT COUNT(*)
            FROM dbo.client_stages cs
            WHERE cs.client_id = cws.client_id
              AND (
                cs.status = 'Completed'
                OR (
                  -- Stage has subtasks AND all subtasks are completed
                  EXISTS (
                    SELECT 1 FROM dbo.client_stage_subtasks st
                    WHERE st.client_stage_id = cs.client_stage_id
                  )
                  AND NOT EXISTS (
                    SELECT 1
                    FROM dbo.client_stage_subtasks st
                    WHERE st.client_stage_id = cs.client_stage_id
                      AND st.status <> 'Completed'
                  )
                )
              )
          )

        FROM ClientWithStage cws
      ),

      /* ============================================
         STEP 4 — APPLY STATUS FILTER
      ==============================================*/
      FilteredClients AS (
        SELECT *
        FROM ClientStageProgress
        WHERE @StatusFilter = 'ALL' OR status = @StatusFilter
      )

      /* ============================================
         FINAL SELECT — RECORDSET[0]
      ==============================================*/
      SELECT
        fc.client_id,
        fc.client_name,
        fc.code,
        fc.client_status,
        fc.status,
        fc.sla_number,
        fc.primary_contact_first_name,
        fc.primary_contact_last_name,
        fc.primary_contact_name,
        fc.primary_contact_email,
        fc.primary_contact_phone,
        fc.created_at,
        fc.updated_at,

        fc.service_center_id,
        fc.service_center_name,
        sc.email AS service_center_email,

        fc.cpa_id,
        fc.cpa_name,
        cp.email AS cpa_email,

        fc.stage_name,

        fc.total_stages,
        fc.completed_stages,

        last_message_at = LastMsg.created_at,
        last_message_body = LastMsg.body,
        last_message_sender_role = LastMsg.sender_role,

        progress =
          CASE 
            WHEN fc.total_stages = 0 THEN 0
            ELSE (fc.completed_stages * 100.0) / fc.total_stages
          END,

        fc.is_archived

      FROM FilteredClients fc
      LEFT JOIN dbo.service_centers sc
        ON sc.service_center_id = fc.service_center_id
      LEFT JOIN dbo.cpa_centers cp
        ON cp.cpa_id = fc.cpa_id
      OUTER APPLY (
        SELECT TOP 1 m.created_at, m.body, m.sender_role
        FROM dbo.onboarding_messages m
        WHERE m.client_id = fc.client_id
          -- Only fetch messages from Admin-Client conversation thread
          AND (
            (m.sender_role = 'ADMIN' AND m.receiver_role = 'CLIENT')
            OR (m.sender_role = 'CLIENT' AND m.receiver_role = 'ADMIN')
          )
        ORDER BY m.created_at DESC
      ) LastMsg
      ORDER BY 
        -- Archived clients always at bottom
        fc.is_archived ASC,
        -- When searching, sort by relevance (exact client_name matches first)
        CASE WHEN @Q <> '' THEN
          CASE 
            -- Exact client name match (highest priority)
            WHEN fc.client_name LIKE @Q THEN 1
            -- Client name starts with search term
            WHEN fc.client_name LIKE @Q + '%' THEN 2
            -- Client name contains search term
            WHEN fc.client_name LIKE '%' + @Q + '%' THEN 3
            -- Code matches
            WHEN fc.code LIKE '%' + @Q + '%' THEN 4
            -- Primary contact matches
            WHEN fc.primary_contact_name LIKE '%' + @Q + '%' THEN 5
            -- Service center / CPA matches (lowest priority)
            ELSE 6
          END
        ELSE 0 END,
        -- Sort by most recent message, then created_at
        COALESCE(LastMsg.created_at, fc.created_at) DESC
      OFFSET @Offset ROWS
      FETCH NEXT @PageSize ROWS ONLY;

      /* ============================================
         TOTAL COUNT (with same filters) — RECORDSET[1]
      ==============================================*/
      ;WITH ClientBase AS (
        SELECT
          c.client_id
        FROM dbo.Clients c
        LEFT JOIN dbo.service_centers sc ON sc.service_center_id = c.service_center_id
        LEFT JOIN dbo.cpa_centers cp ON cp.cpa_id = c.cpa_id
        WHERE
          -- Archive filter
          (
            @ArchiveFilter = 'ALL' 
            OR (@ArchiveFilter = 'active' AND ISNULL(c.is_archived, 0) = 0)
            OR (@ArchiveFilter = 'archived' AND c.is_archived = 1)
          )
          AND (
            @Q = '' OR
            c.client_name LIKE '%' + @Q + '%' OR
            c.code LIKE '%' + @Q + '%' OR
            c.primary_contact_name LIKE '%' + @Q + '%' OR
            sc.center_name LIKE '%' + @Q + '%' OR
            cp.cpa_name LIKE '%' + @Q + '%'
          )
      ),
      ClientWithStatus AS (
        SELECT
          cb.client_id,
          status =
            CASE
              WHEN NOT EXISTS (
                SELECT 1 FROM dbo.client_stages cs
                WHERE cs.client_id = cb.client_id
              ) THEN 'Not Started'

              WHEN NOT EXISTS (
                SELECT 1 FROM dbo.client_stages cs
                WHERE cs.client_id = cb.client_id
                  AND cs.status <> 'Completed'
              ) THEN 'Completed'

              WHEN NOT EXISTS (
                SELECT 1 FROM dbo.client_stages cs
                WHERE cs.client_id = cb.client_id
                  AND cs.status <> 'Not Started'
              ) THEN 'Not Started'

              ELSE 'In Progress'
            END
        FROM ClientBase cb
      )
      SELECT COUNT(*) AS total
      FROM ClientWithStatus
      WHERE @StatusFilter = 'ALL' OR status = @StatusFilter;
    `),l=Array.isArray(k.recordsets)?k.recordsets:[],m=l[0]||[],n=l[1]?.[0]?.total??0;return u.NextResponse.json({success:!0,data:m,page:d,pageSize:e,total:n})}catch(a){return console.error("GET /api/clients/get error:",a),u.NextResponse.json({success:!1,error:"Failed to fetch clients"},{status:500})}}let z=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/clients/get/route",pathname:"/api/clients/get",filename:"route",bundlePath:"app/api/clients/get/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Web_App_Projects\\mysage-clienthub-azure-dec-v1 - AntiGravity V2\\app\\api\\clients\\get\\route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:A,workUnitAsyncStorage:B,serverHooks:C}=z;function D(){return(0,g.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:B})}async function E(a,b,c){var d;let e="/api/clients/get/route";"/index"===e&&(e="/");let g=await z.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||z.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===z.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>z.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>z.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await z.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await z.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await z.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},21820:a=>{"use strict";a.exports=require("os")},27143:(a,b,c)=>{"use strict";c.d(b,{getDbPool:()=>h});var d=c(22161),e=c.n(d);let f={user:process.env.AZURE_SQL_USERNAME,password:process.env.AZURE_SQL_PASSWORD,server:process.env.AZURE_SQL_SERVER,database:process.env.AZURE_SQL_DATABASE,options:{encrypt:!0}},g=null;async function h(){if(g)return g;try{return g=await e().connect(f),console.log("✔️ DB Connected"),g}catch(a){throw console.error("❌ DB Connection Error:",a),a}}},27910:a=>{"use strict";a.exports=require("stream")},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31421:a=>{"use strict";a.exports=require("node:child_process")},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},37067:a=>{"use strict";a.exports=require("node:http")},38522:a=>{"use strict";a.exports=require("node:zlib")},41204:a=>{"use strict";a.exports=require("string_decoder")},44708:a=>{"use strict";a.exports=require("node:https")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},48161:a=>{"use strict";a.exports=require("node:os")},51455:a=>{"use strict";a.exports=require("node:fs/promises")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},57075:a=>{"use strict";a.exports=require("node:stream")},57729:()=>{},57975:a=>{"use strict";a.exports=require("node:util")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66136:a=>{"use strict";a.exports=require("timers")},73024:a=>{"use strict";a.exports=require("node:fs")},73136:a=>{"use strict";a.exports=require("node:url")},76760:a=>{"use strict";a.exports=require("node:path")},77598:a=>{"use strict";a.exports=require("node:crypto")},78335:()=>{},78474:a=>{"use strict";a.exports=require("node:events")},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81115:a=>{"use strict";a.exports=require("constants")},81630:a=>{"use strict";a.exports=require("http")},83997:a=>{"use strict";a.exports=require("tty")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,3974,2161],()=>b(b.s=19472));module.exports=c})();