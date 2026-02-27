(()=>{var a={};a.id=2978,a.ids=[2978],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},1708:a=>{"use strict";a.exports=require("node:process")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4573:a=>{"use strict";a.exports=require("node:buffer")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},12412:a=>{"use strict";a.exports=require("assert")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19185:a=>{"use strict";a.exports=require("dgram")},21820:a=>{"use strict";a.exports=require("os")},27143:(a,b,c)=>{"use strict";c.d(b,{getDbPool:()=>h});var d=c(22161),e=c.n(d);let f={user:process.env.AZURE_SQL_USERNAME,password:process.env.AZURE_SQL_PASSWORD,server:process.env.AZURE_SQL_SERVER,database:process.env.AZURE_SQL_DATABASE,options:{encrypt:!0}},g=null;async function h(){if(g)return g;try{return g=await e().connect(f),console.log("✔️ DB Connected"),g}catch(a){throw console.error("❌ DB Connection Error:",a),a}}},27910:a=>{"use strict";a.exports=require("stream")},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31421:a=>{"use strict";a.exports=require("node:child_process")},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},37067:a=>{"use strict";a.exports=require("node:http")},38522:a=>{"use strict";a.exports=require("node:zlib")},41204:a=>{"use strict";a.exports=require("string_decoder")},44708:a=>{"use strict";a.exports=require("node:https")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},48161:a=>{"use strict";a.exports=require("node:os")},51455:a=>{"use strict";a.exports=require("node:fs/promises")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},57075:a=>{"use strict";a.exports=require("node:stream")},57729:()=>{},57975:a=>{"use strict";a.exports=require("node:util")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66136:a=>{"use strict";a.exports=require("timers")},73024:a=>{"use strict";a.exports=require("node:fs")},73136:a=>{"use strict";a.exports=require("node:url")},76760:a=>{"use strict";a.exports=require("node:path")},77598:a=>{"use strict";a.exports=require("node:crypto")},78335:()=>{},78474:a=>{"use strict";a.exports=require("node:events")},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81115:a=>{"use strict";a.exports=require("constants")},81630:a=>{"use strict";a.exports=require("http")},83997:a=>{"use strict";a.exports=require("tty")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},88026:(a,b,c)=>{"use strict";c.d(b,{B1:()=>g,I9:()=>h,M8:()=>j,bz:()=>k,zk:()=>i});var d=c(27143),e=c(22161),f=c.n(e);async function g(a){try{let b=await (0,d.getDbPool)(),c=a.emailBodyPreview?a.emailBodyPreview.substring(0,2e3):null,e=await b.request().input("recipientEmail",f().NVarChar(255),a.recipientEmail).input("recipientName",f().NVarChar(255),a.recipientName||null).input("recipientRole",f().NVarChar(50),a.recipientRole||null).input("relatedEntityType",f().NVarChar(50),a.relatedEntityType||null).input("relatedEntityId",f().Int,a.relatedEntityId||null).input("relatedEntityName",f().NVarChar(255),a.relatedEntityName||null).input("emailType",f().NVarChar(100),a.emailType).input("emailSubject",f().NVarChar(500),a.emailSubject).input("emailBodyPreview",f().NVarChar(f().MAX),c).input("status",f().NVarChar(50),a.status).input("statusMessage",f().NVarChar(f().MAX),a.statusMessage||null).input("acsMessageId",f().NVarChar(255),a.acsMessageId||null).input("metadata",f().NVarChar(f().MAX),a.metadata?JSON.stringify(a.metadata):null).input("sentAt",f().DateTime2,"Sent"===a.status||"Delivered"===a.status?new Date:null).query(`
        INSERT INTO dbo.email_logs (
          recipient_email,
          recipient_name,
          recipient_role,
          related_entity_type,
          related_entity_id,
          related_entity_name,
          email_type,
          email_subject,
          email_body_preview,
          status,
          status_message,
          acs_message_id,
          metadata,
          sent_at,
          created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @recipientEmail,
          @recipientName,
          @recipientRole,
          @relatedEntityType,
          @relatedEntityId,
          @relatedEntityName,
          @emailType,
          @emailSubject,
          @emailBodyPreview,
          @status,
          @statusMessage,
          @acsMessageId,
          @metadata,
          @sentAt,
          GETDATE()
        )
      `),g=e.recordset[0]?.id;return console.log(`📧 Email logged with ID: ${g}`),g}catch(a){return console.error("❌ Failed to log email:",a),null}}async function h(a,b,c,e){try{let g=await (0,d.getDbPool)(),h="Sent"===b||"Delivered"===b?new Date:null,i="Delivered"===b?new Date:null;return await g.request().input("id",f().Int,a).input("status",f().NVarChar(50),b).input("statusMessage",f().NVarChar(f().MAX),c||null).input("acsMessageId",f().NVarChar(255),e||null).input("sentAt",f().DateTime2,h).input("deliveredAt",f().DateTime2,i).query(`
        UPDATE dbo.email_logs
        SET 
          status = @status,
          status_message = COALESCE(@statusMessage, status_message),
          acs_message_id = COALESCE(@acsMessageId, acs_message_id),
          sent_at = COALESCE(@sentAt, sent_at),
          delivered_at = COALESCE(@deliveredAt, delivered_at)
        WHERE id = @id
      `),console.log(`📧 Email log ${a} updated to status: ${b}`),!0}catch(b){return console.error(`❌ Failed to update email log ${a}:`,b),!1}}async function i(a,b){try{let c=await (0,d.getDbPool)();return await c.request().input("id",f().Int,a).input("resentBy",f().NVarChar(255),b).query(`
        UPDATE dbo.email_logs
        SET 
          resend_count = resend_count + 1,
          last_resent_at = GETDATE(),
          resent_by = @resentBy
        WHERE id = @id
      `),!0}catch(b){return console.error(`❌ Failed to log resend attempt for ${a}:`,b),!1}}async function j(a){let b=await (0,d.getDbPool)(),c=a.page||1,e=a.pageSize||20,g=[],h=b.request();if(a.recipientRole&&"all"!==a.recipientRole&&(g.push("recipient_role = @recipientRole"),h.input("recipientRole",f().NVarChar(50),a.recipientRole)),a.status&&"all"!==a.status&&(g.push("status = @status"),h.input("status",f().NVarChar(50),a.status)),a.emailType&&"all"!==a.emailType&&(g.push("email_type = @emailType"),h.input("emailType",f().NVarChar(100),a.emailType)),a.dateFrom&&(g.push("created_at >= @dateFrom"),h.input("dateFrom",f().DateTime2,new Date(a.dateFrom))),a.dateTo){g.push("created_at <= @dateTo");let b=new Date(a.dateTo);b.setDate(b.getDate()+1),h.input("dateTo",f().DateTime2,b)}a.search&&(g.push(`(
      recipient_email LIKE @search 
      OR recipient_name LIKE @search 
      OR email_subject LIKE @search
      OR related_entity_name LIKE @search
    )`),h.input("search",f().NVarChar(255),`%${a.search}%`));let i=g.length>0?`WHERE ${g.join(" AND ")}`:"",j=await h.query(`
    SELECT COUNT(*) as total FROM dbo.email_logs ${i}
  `),k=j.recordset[0]?.total||0,l=b.request();if(a.recipientRole&&"all"!==a.recipientRole&&l.input("recipientRole",f().NVarChar(50),a.recipientRole),a.status&&"all"!==a.status&&l.input("status",f().NVarChar(50),a.status),a.emailType&&"all"!==a.emailType&&l.input("emailType",f().NVarChar(100),a.emailType),a.dateFrom&&l.input("dateFrom",f().DateTime2,new Date(a.dateFrom)),a.dateTo){let b=new Date(a.dateTo);b.setDate(b.getDate()+1),l.input("dateTo",f().DateTime2,b)}return a.search&&l.input("search",f().NVarChar(255),`%${a.search}%`),l.input("offset",f().Int,(c-1)*e),l.input("pageSize",f().Int,e),{data:(await l.query(`
    SELECT 
      id,
      recipient_email as recipientEmail,
      recipient_name as recipientName,
      recipient_role as recipientRole,
      related_entity_type as relatedEntityType,
      related_entity_id as relatedEntityId,
      related_entity_name as relatedEntityName,
      email_type as emailType,
      email_subject as emailSubject,
      email_body_preview as emailBodyPreview,
      status,
      status_message as statusMessage,
      acs_message_id as acsMessageId,
      original_email_id as originalEmailId,
      resend_count as resendCount,
      last_resent_at as lastResentAt,
      resent_by as resentBy,
      created_at as createdAt,
      sent_at as sentAt,
      delivered_at as deliveredAt,
      metadata
    FROM dbo.email_logs
    ${i}
    ORDER BY created_at DESC
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
  `)).recordset.map(a=>({...a,metadata:a.metadata?JSON.parse(a.metadata):null})),total:k,page:c,pageSize:e}}async function k(a){try{let b=await (0,d.getDbPool)(),c=await b.request().input("id",f().Int,a).query(`
        SELECT 
          id,
          recipient_email as recipientEmail,
          recipient_name as recipientName,
          recipient_role as recipientRole,
          related_entity_type as relatedEntityType,
          related_entity_id as relatedEntityId,
          related_entity_name as relatedEntityName,
          email_type as emailType,
          email_subject as emailSubject,
          email_body_preview as emailBodyPreview,
          status,
          status_message as statusMessage,
          acs_message_id as acsMessageId,
          original_email_id as originalEmailId,
          resend_count as resendCount,
          last_resent_at as lastResentAt,
          resent_by as resentBy,
          created_at as createdAt,
          sent_at as sentAt,
          delivered_at as deliveredAt,
          metadata
        FROM dbo.email_logs
        WHERE id = @id
      `);if(0===c.recordset.length)return null;let e=c.recordset[0];return{...e,metadata:e.metadata?JSON.parse(e.metadata):null}}catch(b){return console.error(`❌ Failed to get email log ${a}:`,b),null}}},88525:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>C,patchFetch:()=>B,routeModule:()=>x,serverHooks:()=>A,workAsyncStorage:()=>y,workUnitAsyncStorage:()=>z});var d={};c.r(d),c.d(d,{GET:()=>w});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(88026);async function w(a){try{let b=new URL(a.url),c=parseInt(b.searchParams.get("page")||"1"),d=parseInt(b.searchParams.get("pageSize")||"20"),e=b.searchParams.get("recipientRole")||void 0,f=b.searchParams.get("status")||void 0,g=b.searchParams.get("emailType")||void 0,h=b.searchParams.get("dateFrom")||void 0,i=b.searchParams.get("dateTo")||void 0,j=b.searchParams.get("search")||void 0,k=await (0,v.M8)({page:c,pageSize:d,recipientRole:e,status:f,emailType:g,dateFrom:h,dateTo:i,search:j});return u.NextResponse.json({success:!0,...k})}catch(a){return console.error("GET /api/email-logs error:",a),u.NextResponse.json({success:!1,error:a.message||"Failed to fetch email logs"},{status:500})}}let x=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/email-logs/route",pathname:"/api/email-logs",filename:"route",bundlePath:"app/api/email-logs/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Web_App_Projects\\mysage-clienthub-azure-dec-v1 - AntiGravity V2\\app\\api\\email-logs\\route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:y,workUnitAsyncStorage:z,serverHooks:A}=x;function B(){return(0,g.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:z})}async function C(a,b,c){var d;let e="/api/email-logs/route";"/index"===e&&(e="/");let g=await x.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:y,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!y){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||x.isDev||y||(G="/index"===(G=D)?"/":G);let H=!0===x.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>x.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>x.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await x.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await x.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),y&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await x.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,3974,2161],()=>b(b.s=88525));module.exports=c})();