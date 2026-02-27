(()=>{var a={};a.id=3575,a.ids=[3575],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},1708:a=>{"use strict";a.exports=require("node:process")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4573:a=>{"use strict";a.exports=require("node:buffer")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},12412:a=>{"use strict";a.exports=require("assert")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19185:a=>{"use strict";a.exports=require("dgram")},21820:a=>{"use strict";a.exports=require("os")},27143:(a,b,c)=>{"use strict";c.d(b,{getDbPool:()=>h});var d=c(22161),e=c.n(d);let f={user:process.env.AZURE_SQL_USERNAME,password:process.env.AZURE_SQL_PASSWORD,server:process.env.AZURE_SQL_SERVER,database:process.env.AZURE_SQL_DATABASE,options:{encrypt:!0}},g=null;async function h(){if(g)return g;try{return g=await e().connect(f),console.log("✔️ DB Connected"),g}catch(a){throw console.error("❌ DB Connection Error:",a),a}}},27910:a=>{"use strict";a.exports=require("stream")},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31421:a=>{"use strict";a.exports=require("node:child_process")},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},37067:a=>{"use strict";a.exports=require("node:http")},38522:a=>{"use strict";a.exports=require("node:zlib")},41204:a=>{"use strict";a.exports=require("string_decoder")},44708:a=>{"use strict";a.exports=require("node:https")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},48161:a=>{"use strict";a.exports=require("node:os")},51455:a=>{"use strict";a.exports=require("node:fs/promises")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},57075:a=>{"use strict";a.exports=require("node:stream")},57729:()=>{},57975:a=>{"use strict";a.exports=require("node:util")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},65845:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>E,patchFetch:()=>D,routeModule:()=>z,serverHooks:()=>C,workAsyncStorage:()=>A,workUnitAsyncStorage:()=>B});var d={};c.r(d),c.d(d,{GET:()=>y});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(27143),w=c(22161),x=c.n(w);async function y(a){try{let b=new URL(a.url),c=b.searchParams.get("clientId"),d=b.searchParams.get("conversationBetween"),e=b.searchParams.get("serviceCenterId"),f=b.searchParams.get("cpaId");console.log("\uD83D\uDCE8 Fetching messages:",{clientId:c,conversationBetween:d,serviceCenterId:e,cpaId:f});let g=await (0,v.getDbPool)(),h="",i="";if(d){let a=d.split(",");h=a[0]||"",i=a[1]||""}let j=c?parseInt(c):0,k=j>0?j:null,l=e?parseInt(e):null,m=f?parseInt(f):null,n="",o=g.request(),p="SERVICE_CENTER"===h||"SERVICE_CENTER"===i,q="CPA"===h||"CPA"===i;k&&p&&l?(n=`
        SELECT 
          m.message_id,
          m.client_id,
          m.sender_role,
          m.receiver_role,
          m.body,
          m.parent_message_id,
          m.attachment_url,
          m.attachment_name,
          m.created_at,
          m.service_center_id,
          c.client_name
        FROM dbo.onboarding_messages m
        LEFT JOIN dbo.Clients c ON m.client_id = c.client_id
        WHERE m.client_id = @client_id
          AND (m.service_center_id = @service_center_id OR m.service_center_id IS NULL)
          AND (
            (m.sender_role = @role1 AND m.receiver_role = @role2)
            OR (m.sender_role = @role2 AND m.receiver_role = @role1)
          )
        ORDER BY m.created_at ASC
      `,o.input("client_id",x().Int,k).input("service_center_id",x().Int,l).input("role1",x().VarChar(50),h).input("role2",x().VarChar(50),i)):k&&q&&m?(n=`
        SELECT 
          m.message_id,
          m.client_id,
          m.sender_role,
          m.receiver_role,
          m.body,
          m.parent_message_id,
          m.attachment_url,
          m.attachment_name,
          m.created_at,
          m.cpa_id,
          c.client_name
        FROM dbo.onboarding_messages m
        LEFT JOIN dbo.Clients c ON m.client_id = c.client_id
        WHERE m.client_id = @client_id
          AND (m.cpa_id = @cpa_id OR m.cpa_id IS NULL)
          AND (
            (m.sender_role = @role1 AND m.receiver_role = @role2)
            OR (m.sender_role = @role2 AND m.receiver_role = @role1)
          )
        ORDER BY m.created_at ASC
      `,o.input("client_id",x().Int,k).input("cpa_id",x().Int,m).input("role1",x().VarChar(50),h).input("role2",x().VarChar(50),i)):k?h||i?(n=`
          SELECT 
            m.message_id,
            m.client_id,
            m.sender_role,
            m.receiver_role,
            m.body,
            m.parent_message_id,
            m.attachment_url,
            m.attachment_name,
            m.created_at,
            c.client_name
          FROM dbo.onboarding_messages m
          LEFT JOIN dbo.Clients c ON m.client_id = c.client_id
          WHERE m.client_id = @client_id
            AND (
              (m.sender_role = @role1 AND m.receiver_role = @role2)
              OR (m.sender_role = @role2 AND m.receiver_role = @role1)
            )
          ORDER BY m.created_at ASC
        `,o.input("client_id",x().Int,k).input("role1",x().VarChar(50),h).input("role2",x().VarChar(50),i)):(n=`
          SELECT 
            m.message_id,
            m.client_id,
            m.sender_role,
            m.receiver_role,
            m.body,
            m.parent_message_id,
            m.attachment_url,
            m.attachment_name,
            m.created_at,
            c.client_name,
            m.service_center_id,
            m.cpa_id
          FROM dbo.onboarding_messages m
          LEFT JOIN dbo.Clients c ON m.client_id = c.client_id
          WHERE m.client_id = @client_id
          ORDER BY m.created_at ASC
        `,o.input("client_id",x().Int,k)):l?(n=`
        SELECT 
          m.message_id,
          m.client_id,
          m.sender_role,
          m.receiver_role,
          m.body,
          m.parent_message_id,
          m.attachment_url,
          m.attachment_name,
          m.created_at,
          m.service_center_id,
          NULL as client_name
        FROM dbo.onboarding_messages m
        WHERE (m.client_id IS NULL OR m.client_id = 0)
          AND m.service_center_id = @service_center_id
          AND (
            (m.sender_role = @role1 AND m.receiver_role = @role2)
            OR (m.sender_role = @role2 AND m.receiver_role = @role1)
          )
        ORDER BY m.created_at ASC
      `,o.input("service_center_id",x().Int,l).input("role1",x().VarChar(50),h).input("role2",x().VarChar(50),i)):m?(n=`
        SELECT 
          m.message_id,
          m.client_id,
          m.sender_role,
          m.receiver_role,
          m.body,
          m.parent_message_id,
          m.attachment_url,
          m.attachment_name,
          m.created_at,
          m.cpa_id,
          NULL as client_name
        FROM dbo.onboarding_messages m
        WHERE (m.client_id IS NULL OR m.client_id = 0)
          AND m.cpa_id = @cpa_id
          AND (
            (m.sender_role = @role1 AND m.receiver_role = @role2)
            OR (m.sender_role = @role2 AND m.receiver_role = @role1)
          )
        ORDER BY m.created_at ASC
      `,o.input("cpa_id",x().Int,m).input("role1",x().VarChar(50),h).input("role2",x().VarChar(50),i)):(n=`
        SELECT 
          m.message_id,
          m.client_id,
          m.sender_role,
          m.receiver_role,
          m.body,
          m.parent_message_id,
          m.attachment_url,
          m.attachment_name,
          m.created_at,
          NULL as client_name
        FROM dbo.onboarding_messages m
        WHERE (m.client_id IS NULL OR m.client_id = 0)
          AND m.service_center_id IS NULL
          AND m.cpa_id IS NULL
          AND (
            (m.sender_role = @role1 AND m.receiver_role = @role2)
            OR (m.sender_role = @role2 AND m.receiver_role = @role1)
          )
        ORDER BY m.created_at ASC
      `,o.input("role1",x().VarChar(50),h).input("role2",x().VarChar(50),i));let r=await o.query(n);return console.log(`✅ Found ${r.recordset.length} messages`),u.NextResponse.json({success:!0,data:r.recordset})}catch(a){return console.error("GET /api/messages/get error:",a),u.NextResponse.json({success:!1,error:String(a)},{status:500})}}let z=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/messages/get/route",pathname:"/api/messages/get",filename:"route",bundlePath:"app/api/messages/get/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Web_App_Projects\\mysage-clienthub-azure-dec-v1 - AntiGravity V2\\app\\api\\messages\\get\\route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:A,workUnitAsyncStorage:B,serverHooks:C}=z;function D(){return(0,g.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:B})}async function E(a,b,c){var d;let e="/api/messages/get/route";"/index"===e&&(e="/");let g=await z.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||z.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===z.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>z.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>z.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await z.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await z.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await z.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},66136:a=>{"use strict";a.exports=require("timers")},73024:a=>{"use strict";a.exports=require("node:fs")},73136:a=>{"use strict";a.exports=require("node:url")},76760:a=>{"use strict";a.exports=require("node:path")},77598:a=>{"use strict";a.exports=require("node:crypto")},78335:()=>{},78474:a=>{"use strict";a.exports=require("node:events")},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81115:a=>{"use strict";a.exports=require("constants")},81630:a=>{"use strict";a.exports=require("http")},83997:a=>{"use strict";a.exports=require("tty")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,3974,2161],()=>b(b.s=65845));module.exports=c})();