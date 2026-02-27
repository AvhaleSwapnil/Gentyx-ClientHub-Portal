(()=>{var a={};a.id=4558,a.ids=[4558],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},1708:a=>{"use strict";a.exports=require("node:process")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4573:a=>{"use strict";a.exports=require("node:buffer")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},12412:a=>{"use strict";a.exports=require("assert")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19185:a=>{"use strict";a.exports=require("dgram")},21820:a=>{"use strict";a.exports=require("os")},27143:(a,b,c)=>{"use strict";c.d(b,{getDbPool:()=>h});var d=c(22161),e=c.n(d);let f={user:process.env.AZURE_SQL_USERNAME,password:process.env.AZURE_SQL_PASSWORD,server:process.env.AZURE_SQL_SERVER,database:process.env.AZURE_SQL_DATABASE,options:{encrypt:!0}},g=null;async function h(){if(g)return g;try{return g=await e().connect(f),console.log("✔️ DB Connected"),g}catch(a){throw console.error("❌ DB Connection Error:",a),a}}},27910:a=>{"use strict";a.exports=require("stream")},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31421:a=>{"use strict";a.exports=require("node:child_process")},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},37067:a=>{"use strict";a.exports=require("node:http")},38522:a=>{"use strict";a.exports=require("node:zlib")},41204:a=>{"use strict";a.exports=require("string_decoder")},44708:a=>{"use strict";a.exports=require("node:https")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},48161:a=>{"use strict";a.exports=require("node:os")},51455:a=>{"use strict";a.exports=require("node:fs/promises")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},57075:a=>{"use strict";a.exports=require("node:stream")},57729:()=>{},57975:a=>{"use strict";a.exports=require("node:util")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66136:a=>{"use strict";a.exports=require("timers")},73024:a=>{"use strict";a.exports=require("node:fs")},73136:a=>{"use strict";a.exports=require("node:url")},76760:a=>{"use strict";a.exports=require("node:path")},77598:a=>{"use strict";a.exports=require("node:crypto")},78335:()=>{},78474:a=>{"use strict";a.exports=require("node:events")},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81115:a=>{"use strict";a.exports=require("constants")},81630:a=>{"use strict";a.exports=require("http")},83997:a=>{"use strict";a.exports=require("tty")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{},98991:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>F,patchFetch:()=>E,routeModule:()=>A,serverHooks:()=>D,workAsyncStorage:()=>B,workUnitAsyncStorage:()=>C});var d={};c.r(d),c.d(d,{POST:()=>z});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(22161),w=c.n(v),x=c(27143),y=c(81929);async function z(a){try{let{clientName:b,code:c,slaNumber:d,primaryContactFirstName:e,primaryContactLastName:f,primaryContactName:g,primaryContactEmail:h,primaryContactPhone:i,serviceCenterId:j,cpaId:k,stageId:l,associatedUsers:m}=await a.json(),n=g||`${e||""} ${f||""}`.trim(),o=b?.trim()||n;if(!o||!h)return u.NextResponse.json({success:!1,error:"Missing required fields"},{status:400});let p=await (0,x.getDbPool)(),q=await p.request().input("clientName",w().NVarChar(255),o).query(`
        SELECT client_id, client_name 
        FROM dbo.clients 
        WHERE LOWER(client_name) = LOWER(@clientName)
      `);if(q.recordset.length>0)return u.NextResponse.json({success:!1,error:`A client named "${q.recordset[0].client_name}" already exists`},{status:409});let r=await p.request().input("email",w().NVarChar(255),h.trim().toLowerCase()).query(`
        SELECT 'client' as entity_type, client_name as name FROM dbo.clients 
        WHERE LOWER(primary_contact_email) = @email
        UNION ALL
        SELECT 'CPA' as entity_type, cpa_name as name FROM dbo.cpa_centers 
        WHERE LOWER(email) = @email
        UNION ALL
        SELECT 'service center' as entity_type, center_name as name FROM dbo.service_centers 
        WHERE LOWER(email) = @email
      `);if(r.recordset.length>0){let a=r.recordset[0];return u.NextResponse.json({success:!1,error:`This email is already used by ${a.entity_type}: "${a.name}"`},{status:409})}let s=(await p.request().input("clientName",w().NVarChar(255),o).input("code",w().NVarChar(50),c||null).input("slaNumber",w().NVarChar(50),d||null).input("primaryContactFirstName",w().NVarChar(100),e||null).input("primaryContactLastName",w().NVarChar(100),f||null).input("primaryContactName",w().NVarChar(255),n).input("primaryContactEmail",w().NVarChar(255),h).input("primaryContactPhone",w().NVarChar(50),i).input("service_center_id",w().Int,j||null).input("cpaId",w().Int,k||null).input("stageId",w().Int,l||null).query(`
        INSERT INTO dbo.clients (
          client_name,
          code,
          client_status,
          sla_number,
          primary_contact_first_name,
          primary_contact_last_name,
          primary_contact_name,
          primary_contact_email,
          primary_contact_phone,
          created_at,
          updated_at,
          stage_id,
          progress,
          status,
          cpa_id,
          service_center_id
        )
        OUTPUT INSERTED.client_id
        VALUES (
          @clientName,
          @code,
          'Active',
          @slaNumber,
          @primaryContactFirstName,
          @primaryContactLastName,
          @primaryContactName,
          @primaryContactEmail,
          @primaryContactPhone,
          GETDATE(),
          GETDATE(),
          @stageId,
          0,
          'Active',
          @cpaId,
          @service_center_id
        );
      `)).recordset[0].client_id,t=await p.request().input("email",w().NVarChar(255),h).query(`
          SELECT id FROM dbo.Users WHERE email = @email
        `);if(0===t.recordset.length){await p.request().input("email",w().NVarChar(255),h).input("password",w().NVarChar(255),"ClientHub@2025").input("role",w().NVarChar(50),"CLIENT").query(`
            INSERT INTO dbo.Users (email, password, role)
            VALUES (@email, @password, @role)
          `);try{let a=await (0,y.QV)(h,n,o,c||void 0);a?.success?console.log(`✅ Welcome email sent to client: ${h}`):console.error(`⚠️ Welcome email failed for client: ${h}`,a?.error||"Unknown error")}catch(a){console.error(`⚠️ Failed to send welcome email to client: ${h}`,a)}}if(l)try{await p.request().input("clientId",w().Int,s).input("stageId",w().Int,l).query(`
            INSERT INTO dbo.onboarding_tasks (
              stage_id,
              client_id,
              task_title,
              due_date,
              assigned_to_role,
              status,
              order_number,
              created_at
            )
            SELECT
              t.stage_id,
              @clientId,
              t.task_title,
              NULL,
              t.assigned_to_role,
              'Pending',
              t.order_number,
              GETDATE()
            FROM dbo.stage_tasks t
            WHERE t.stage_id = @stageId;
          `)}catch(a){console.error("Warning: failed to seed default tasks",a)}if(Array.isArray(m)){for(let a of m)a.name&&a.email&&await p.request().input("clientId",w().Int,s).input("name",w().NVarChar(255),a.name).input("email",w().NVarChar(255),a.email).input("role",w().NVarChar(50),a.role||"Client User").input("phone",w().NVarChar(50),a.phone||null).query(`
            INSERT INTO dbo.client_users (
              client_id,
              user_name,
              email,
              role,
              phone,
              created_at
            )
            VALUES (
              @clientId,
              @name,
              @email,
              @role,
              @phone,
              GETDATE()
            );
          `);console.log(`✅ Added ${m.length} associated users for client ID: ${s}`)}return u.NextResponse.json({success:!0,clientId:s})}catch(a){return console.error("POST /api/clients/add error:",a),u.NextResponse.json({success:!1,error:a.message||"Failed to create client"},{status:500})}}let A=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/clients/add/route",pathname:"/api/clients/add",filename:"route",bundlePath:"app/api/clients/add/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Web_App_Projects\\mysage-clienthub-azure-dec-v1 - AntiGravity V2\\app\\api\\clients\\add\\route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:B,workUnitAsyncStorage:C,serverHooks:D}=A;function E(){return(0,g.patchFetch)({workAsyncStorage:B,workUnitAsyncStorage:C})}async function F(a,b,c){var d;let e="/api/clients/add/route";"/index"===e&&(e="/");let g=await A.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||A.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===A.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>A.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>A.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await A.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},z),b}},l=await A.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await A.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,3974,2161,1186,5409,1929],()=>b(b.s=98991));module.exports=c})();