"use strict";exports.id=1929,exports.ids=[1929],exports.modules={81929:(a,b,c)=>{c.d(b,{$m:()=>l,Dm:()=>r,Hv:()=>n,QV:()=>j,V9:()=>s,W4:()=>u,ZM:()=>h,g_:()=>t,getAdminsWithNotificationsEnabled:()=>A,getClientEmail:()=>B,lZ:()=>k,sendAdminBatchDocumentUploadNotification:()=>w,sendAdminBatchFolderCreatedNotification:()=>x,sendClientBatchDocumentUploadNotification:()=>y,sendClientBatchFolderCreatedNotification:()=>z,tI:()=>m,vu:()=>p,xy:()=>q});var d=c(55409),e=c(88026);let f=process.env.AZURE_COMMUNICATION_CONNECTION_STRING||"",g=f?new d.Q(f):null;async function h(a){let{to:b,subject:c,html:d,text:f}=a,h="logging"in a?a.logging:void 0;console.log("\uD83D\uDCE7 sendEmail called with:",{to:b,subject:c.substring(0,50)}),console.log("\uD83D\uDCE7 ACS Config:",{connectionString:process.env.AZURE_COMMUNICATION_CONNECTION_STRING?"✅ Set":"❌ Missing",sender:process.env.AZURE_EMAIL_SENDER});let i=null;if(h)try{i=await (0,e.B1)({recipientEmail:b,recipientName:h.recipientName,recipientRole:h.recipientRole,relatedEntityType:h.relatedEntityType,relatedEntityId:h.relatedEntityId,relatedEntityName:h.relatedEntityName,emailType:h.emailType||"general",emailSubject:c,emailBodyPreview:d.substring(0,2e3),status:"Pending",metadata:h.metadata})}catch(a){console.error("⚠️ Failed to log email (non-blocking):",a)}if(!g)return console.error("❌ Email client not initialized - missing AZURE_COMMUNICATION_CONNECTION_STRING"),i&&await (0,e.I9)(i,"Failed","Email client not configured"),{success:!1,error:"Email client not configured"};let j=process.env.AZURE_EMAIL_SENDER;if(!j)return console.error("❌ Missing AZURE_EMAIL_SENDER environment variable"),i&&await (0,e.I9)(i,"Failed","Email sender not configured"),{success:!1,error:"Email sender not configured"};let k={senderAddress:j,content:{subject:c,html:d,plainText:f||d.replace(/<[^>]*>/g,"")},recipients:{to:[{address:b}]}};for(let a=1;a<=5;a++)try{console.log(`📧 ACS Attempt ${a}/5 to send email to ${b}`);let c=await g.beginSend(k),d=await c.pollUntilDone();if("Succeeded"===d.status)return console.log("✅ Email sent successfully via ACS:",d.id),i&&await (0,e.I9)(i,"Sent","Email sent successfully",d.id),{success:!0,messageId:d.id};return console.error("❌ ACS send failed with status:",d.status,d.error),i&&await (0,e.I9)(i,"Failed",d.error?.message||"Unknown error"),{success:!1,error:d.error}}catch(b){if((b?.statusCode===429||b?.code==="TooManyRequests")&&a<5){let b=5e3*Math.pow(2,a-1);console.warn(`⚠️ ACS rate limited (429). Waiting ${b/1e3}s before retry (attempt ${a}/5)...`),await new Promise(a=>setTimeout(a,b));continue}return console.error(`❌ ACS email failed (attempt ${a}/5):`,b?.message||b),i&&await (0,e.I9)(i,"Failed",b?.message||"Send error"),{success:!1,error:b}}return i&&await (0,e.I9)(i,"Failed","Max retries exceeded"),{success:!1,error:"Max retries exceeded"}}async function i({recipientEmail:a,recipientName:b,role:c,password:d,additionalInfo:e}){let f=function(a){switch(a){case"CLIENT":return{title:"Client",dashboardPath:"/client",icon:"\uD83D\uDC64",color:"#6366f1"};case"CPA":return{title:"Preparer",dashboardPath:"/cpa",icon:"\uD83D\uDCCA",color:"#10b981"};case"SERVICE_CENTER":return{title:"Service Center",dashboardPath:"/service-center",icon:"\uD83C\uDFE2",color:"#f59e0b"};default:return{title:"User",dashboardPath:"/",icon:"\uD83D\uDC64",color:"#6366f1"}}}(c),g="https://legacy.hubonesystems.net/login",i=new Date().getFullYear(),j=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),k=`🎉 Welcome to Legacy ClientHub - Your ${f.title} Account is Ready!`,l=`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Legacy ClientHub</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f4f8;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
              
              <!-- Header - Legacy Accounting Services Branding (Outlook Compatible) -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; padding: 35px 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <!-- Company Name - Clean Text Branding -->
                        <div style="margin-bottom: 8px;">
                          <span style="font-size: 26px; color: #d4a574; font-weight: 700; letter-spacing: 2px; font-family: Georgia, 'Times New Roman', serif;">LEGACY</span>
                        </div>
                        <div style="margin-bottom: 20px;">
                          <span style="font-size: 11px; color: #e8d5c4; letter-spacing: 3px; text-transform: uppercase;">ACCOUNTING SERVICES</span>
                        </div>
                        <!-- ClientHub Badge -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 20px;">
                          <tr>
                            <td bgcolor="#7a3344" style="background-color: #7a3344; padding: 6px 14px; border-radius: 15px;">
                              <span style="font-size: 11px; color: #ffffff; font-weight: 500; letter-spacing: 1px;">ClientHub Portal</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center;">
                        <h1 style="color: #ffffff; margin: 0 0 8px; font-size: 24px; font-weight: 600;">Welcome, ${b}!</h1>
                        <p style="color: #d4a574; margin: 8px 0 0; font-size: 15px; font-weight: 500;">Your Account has been created</p>
                        <p style="color: #cccccc; margin: 8px 0 0; font-size: 12px;">${j}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td bgcolor="#ffffff" style="background-color: #ffffff; padding: 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td>
                        <p style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 500;">Hello ${b},</p>
                        <p style="margin: 0 0 25px; font-size: 15px; color: #475569; line-height: 1.6;">
                          Congratulations! Your <strong style="color: ${f.color};">${f.title}</strong> account has been successfully created on Legacy ClientHub. 
                          You can now access the platform using the credentials below.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Credentials Box -->
                    <tr>
                      <td style="padding: 0 0 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-left: 4px solid ${f.color};">
                          <tr>
                            <td bgcolor="#f8fafc" style="background-color: #f8fafc; border-radius: 12px; padding: 0;">
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <td style="padding: 24px;">
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                  <td style="padding-bottom: 15px;">
                                    <span style="display: inline-block; background: ${f.color}; color: white; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">🔐 Your Login Credentials</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Email:</td>
                                        <td style="font-size: 15px; color: #1e293b; font-weight: 600;">${a}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 0;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Password:</td>
                                        <td style="font-size: 15px; color: #1e293b; font-weight: 600; font-family: 'Courier New', monospace; background: #e2e8f0; padding: 4px 8px; border-radius: 4px; display: inline-block;">${d}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    ${e?.clientName||e?.code||e?.centerCode||e?.cpaCode?`
                    <!-- Additional Info Box -->
                    <tr>
                      <td style="padding: 0 0 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
                          <tr>
                            <td style="padding: 20px 24px;">
                              <p style="margin: 0 0 10px; font-size: 14px; color: #92400e; font-weight: 600;">📋 Account Details</p>
                              ${e?.clientName?`<p style="margin: 0 0 5px; font-size: 14px; color: #78350f;"><strong>Client Name:</strong> ${e.clientName}</p>`:""}
                              ${e?.code?`<p style="margin: 0 0 5px; font-size: 14px; color: #78350f;"><strong>Client Code:</strong> ${e.code}</p>`:""}
                              ${e?.cpaCode?`<p style="margin: 0 0 5px; font-size: 14px; color: #78350f;"><strong>Preparer Code:</strong> ${e.cpaCode}</p>`:""}
                              ${e?.centerCode?`<p style="margin: 0; font-size: 14px; color: #78350f;"><strong>Center Code:</strong> ${e.centerCode}</p>`:""}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    `:""}
                    
                    <!-- CTA Button -->
                    <tr>
                      <td style="text-align: center; padding: 10px 0 30px;">
                        <a href="${g}" 
                           style="display: inline-block; background-color: ${f.color}; background: linear-gradient(135deg, ${f.color} 0%, #8b5cf6 100%); color: white; font-size: 16px; font-weight: 600; padding: 16px 40px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                          Login to Your Account →
                        </a>
                      </td>
                    </tr>

                    <!-- Steps to Login -->
                    <tr>
                      <td style="padding: 0 0 25px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f0fdf4; border-radius: 12px; border: 1px solid #86efac;">
                          <tr>
                            <td style="padding: 24px;">
                              <p style="margin: 0 0 15px; font-size: 16px; color: #166534; font-weight: 600;">📋 Steps to Login</p>
                              <ol style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 1.8;">
                                <li>Open your web browser and go to <a href="${g}" style="color: #059669; font-weight: 600;">${g}</a></li>
                                <li>Enter your email: <strong>${a}</strong></li>
                                <li>Enter your password: <strong style="font-family: 'Courier New', monospace;">${d}</strong></li>
                                <li>Click the <strong>"Sign In"</strong> button</li>
                                <li>You will be redirected to your ${f.title} dashboard</li>
                              </ol>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Password Reset Instructions -->
                    <tr>
                      <td style="padding: 0 0 20px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #eff6ff; border-radius: 12px; border: 1px solid #93c5fd;">
                          <tr>
                            <td style="padding: 24px;">
                              <p style="margin: 0 0 15px; font-size: 16px; color: #1e40af; font-weight: 600;">🔒 How to Reset Your Password</p>
                              <p style="margin: 0 0 12px; font-size: 14px; color: #1e40af; line-height: 1.6;">
                                For security reasons, we recommend changing your password after your first login. Here's how:
                              </p>
                              <ol style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                                <li>Log in to your account using the credentials above</li>
                                <li>Click on the <strong>"Settings"</strong> tab in the navigation menu</li>
                                <li>Navigate to the <strong>"Security"</strong> or <strong>"Password"</strong> section</li>
                                <li>Enter your current password</li>
                                <li>Enter and confirm your new password</li>
                                <li>Click <strong>"Update Password"</strong> to save your changes</li>
                              </ol>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Security Notice -->
                    <tr>
                      <td style="padding: 20px 0 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
                          <tr>
                            <td style="padding: 16px;">
                              <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
                                ⚠️ <strong>Security Notice:</strong> Keep your login credentials safe and do not share them with anyone. If you suspect unauthorized access to your account, please change your password immediately.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer - Legacy Accounting Services Branding (Outlook Compatible) -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; padding: 30px 40px; border-radius: 0 0 16px 16px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #d4a574; font-weight: 600;">Legacy Accounting Services</p>
                        <p style="margin: 0 0 10px; font-size: 12px; color: #cccccc;">ClientHub Portal</p>
                        <p style="margin: 0 0 15px; font-size: 12px; color: #999999;">Need help? Contact our support team.</p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="border-top: 1px solid #7a3344; padding-top: 15px; text-align: center;">
                              <p style="margin: 0; font-size: 11px; color: #999999;">\xa9 ${i} Legacy Accounting Services – All Rights Reserved.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;return h({to:a,subject:k,html:l,logging:{recipientName:b,recipientRole:c,relatedEntityType:{CLIENT:"client",CPA:"cpa",SERVICE_CENTER:"service_center"}[c],relatedEntityName:e?.clientName||b,emailType:{CLIENT:"welcome_client",CPA:"welcome_cpa",SERVICE_CENTER:"welcome_service_center"}[c]||"general",metadata:{...e,welcomeEmailType:!0}}})}async function j(a,b,c,d){return i({recipientEmail:a,recipientName:b,role:"CLIENT",password:"ClientHub@2025",additionalInfo:{clientName:c,code:d}})}async function k(a,b,c){return i({recipientEmail:a,recipientName:b,role:"CPA",password:"Preparer@12345",additionalInfo:{cpaCode:c}})}async function l(a,b,c){return i({recipientEmail:a,recipientName:b,role:"SERVICE_CENTER",password:"ServiceCenter@2025",additionalInfo:{centerCode:c}})}async function m({recipientEmail:a,recipientName:b,updateType:c,details:d}){let e={profile_updated:{icon:"✏️",color:"#8b5cf6",label:"Profile Update"},task_assigned:{icon:"\uD83D\uDCCB",color:"#3b82f6",label:"New Task"},document_uploaded:{icon:"\uD83D\uDCC4",color:"#10b981",label:"New Document"},stage_changed:{icon:"\uD83D\uDE80",color:"#f59e0b",label:"Stage Update"},message_received:{icon:"\uD83D\uDCAC",color:"#6366f1",label:"New Message"}},f=e[c]||e.profile_updated,g=new Date().getFullYear(),i=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit",hour12:!0});return h({to:a,subject:`${f.icon} ${f.label}: ${d.title} - Legacy ClientHub`,html:`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${f.label} Notification</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f4f8;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
              
              <!-- Header - Legacy Accounting Services Branding (Outlook Compatible) -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; padding: 30px 40px 25px; border-radius: 16px 16px 0 0; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <!-- Company Name - Clean Text Branding -->
                        <div style="margin-bottom: 5px;">
                          <span style="font-size: 22px; color: #d4a574; font-weight: 700; letter-spacing: 2px; font-family: Georgia, 'Times New Roman', serif;">LEGACY</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                          <span style="font-size: 10px; color: #e8d5c4; letter-spacing: 2px;">ACCOUNTING SERVICES</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center;">
                        <h1 style="color: #ffffff; margin: 0 0 5px; font-size: 20px; font-weight: 600;">${f.label}</h1>
                        <p style="color: #cccccc; margin: 0; font-size: 12px;">${i}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td bgcolor="#ffffff" style="background-color: #ffffff; padding: 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td>
                        <p style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 500;">Hello ${b},</p>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 0 0 25px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-left: 4px solid ${f.color};">
                          <tr>
                            <td bgcolor="#f8fafc" style="background-color: #f8fafc; border-radius: 12px; padding: 24px;">
                              <h3 style="margin: 0 0 12px; font-size: 18px; color: #1e293b;">${d.title}</h3>
                              <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">${d.description}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    ${d.actionUrl?`
                    <tr>
                      <td style="text-align: center; padding: 10px 0 20px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                          <tr>
                            <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; border-radius: 10px; padding: 14px 36px;">
                              <a href="${d.actionUrl}" style="color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">
                                ${d.actionLabel||"View Details"} →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    `:""}
                  </table>
                </td>
              </tr>
              
              <!-- Footer - Legacy Accounting Services Branding (Outlook Compatible) -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; padding: 30px 40px; border-radius: 0 0 16px 16px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #d4a574; font-weight: 600;">Legacy Accounting Services</p>
                        <p style="margin: 0 0 15px; font-size: 12px; color: #999999;">Client Portal - Automated Notification</p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="border-top: 1px solid #7a3344; padding-top: 15px; text-align: center;">
                              <p style="margin: 0; font-size: 11px; color: #999999;">\xa9 ${g} Legacy Accounting Services – All Rights Reserved.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `})}async function n({recipientEmail:a,recipientName:b,senderName:c,messagePreview:d,clientId:e}){let f=`📬 New Message from ${c} - Legacy ClientHub`,g=new Date().getFullYear(),i=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),j=new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0}),k=`${i} at ${j}`;return h({to:a,subject:f,html:`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Message Notification</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f4f8;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
              
              <!-- Header - Legacy Accounting Services Branding (Outlook Compatible) -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; padding: 30px 40px 25px; border-radius: 16px 16px 0 0; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <!-- Company Name - Clean Text Branding -->
                        <div style="margin-bottom: 5px;">
                          <span style="font-size: 22px; color: #d4a574; font-weight: 700; letter-spacing: 2px; font-family: Georgia, 'Times New Roman', serif;">LEGACY</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                          <span style="font-size: 10px; color: #e8d5c4; letter-spacing: 2px;">ACCOUNTING SERVICES</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center;">
                        <h1 style="color: #ffffff; margin: 0 0 5px; font-size: 20px; font-weight: 600;">New Message Received</h1>
                        <p style="color: #cccccc; margin: 0; font-size: 12px;">${k}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td bgcolor="#ffffff" style="background-color: #ffffff; padding: 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td>
                        <p style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 500;">Hello ${b},</p>
                        <p style="margin: 0 0 25px; font-size: 15px; color: #475569; line-height: 1.6;">You have received a new message from <strong style="color: #5a1f2d;">${c}</strong>:</p>
                      </td>
                    </tr>
                    
                    <!-- Message Box -->
                    <tr>
                      <td style="padding: 0 0 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-left: 4px solid #5a1f2d;">
                          <tr>
                            <td bgcolor="#f8fafc" style="background-color: #f8fafc; border-radius: 12px; padding: 24px;">
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                      <tr>
                                        <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; padding: 4px 10px; border-radius: 20px;">
                                          <span style="font-size: 11px; color: #ffffff; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Message Preview</span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="font-size: 15px; color: #334155; line-height: 1.7;">
                                    "${d.length>250?d.substring(0,250)+"...":d}"
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                      <td style="text-align: center; padding: 10px 0 20px;">
                        <p style="margin: 0 0 20px; font-size: 14px; color: #64748b;">Log in to your account to view the full message and reply.</p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                          <tr>
                            <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; border-radius: 10px; padding: 14px 36px;">
                              <a href="https://clienthub-testing-a5f5gnhwctb7ekct.eastus2-01.azurewebsites.net" style="color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">
                                View Message →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer - Legacy Accounting Services Branding (Outlook Compatible) -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; padding: 30px 40px; border-radius: 0 0 16px 16px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #d4a574; font-weight: 600;">Legacy Accounting Services</p>
                        <p style="margin: 0 0 10px; font-size: 12px; color: #cccccc;">Client Portal - Automated Notification</p>
                        <p style="margin: 0 0 15px; font-size: 11px; color: #999999;">Please do not reply directly to this email.</p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="border-top: 1px solid #7a3344; padding-top: 15px; text-align: center;">
                              <p style="margin: 0; font-size: 11px; color: #999999;">\xa9 ${g} Legacy Accounting Services – All Rights Reserved.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `})}function o(a){let b="https://legacy.hubonesystems.net";switch(a){case"CLIENT":return{icon:"\uD83D\uDC64",color:"#6366f1",title:"Client",dashboardUrl:`${b}/client`};case"CPA":return{icon:"\uD83D\uDCCA",color:"#10b981",title:"Preparer",dashboardUrl:`${b}/cpa`};case"SERVICE_CENTER":return{icon:"\uD83C\uDFE2",color:"#f59e0b",title:"Service Center",dashboardUrl:`${b}/servicecenter`};default:return{icon:"\uD83D\uDCCB",color:"#6366f1",title:"User",dashboardUrl:b}}}async function p({recipientEmail:a,recipientName:b,recipientRole:c,taskTitle:d,taskDescription:e,dueDate:f,clientName:g,notificationType:i,updatedFields:j,assignedByName:k}){let l=o(c),m=new Date().getFullYear(),n=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit",hour12:!0}),p="assigned"===i,q=p?"New Task Assigned":"Task Updated",r=p?"#3b82f6":"#f59e0b",s=p?`📋 New Task Assigned: ${d} - Legacy ClientHub`:`✏️ Task Updated: ${d} - Legacy ClientHub`,t=f?new Date(f).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}):"Not specified",u=f&&new Date(f)<new Date;return h({to:a,subject:s,html:`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${q}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f4f8;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
              
              <!-- Header - Legacy Accounting Services Branding -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; background: linear-gradient(135deg, #5a1f2d 0%, #722f3e 50%, #8b3d4d 100%); padding: 30px 40px 25px; border-radius: 16px 16px 0 0; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <!-- Company Name - Clean Text Branding -->
                        <div style="margin-bottom: 5px;">
                          <span style="font-size: 22px; color: #d4a574; font-weight: 700; letter-spacing: 2px; font-family: Georgia, 'Times New Roman', serif;">LEGACY</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                          <span style="font-size: 10px; color: rgba(255,255,255,0.85); letter-spacing: 2px;">ACCOUNTING SERVICES</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center;">
                        <h1 style="color: white; margin: 0 0 5px; font-size: 20px; font-weight: 600;">${q}</h1>
                        <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">${n}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="background-color: #ffffff; padding: 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td>
                        <p style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 500;">Hello ${b},</p>
                        <p style="margin: 0 0 25px; font-size: 15px; color: #475569; line-height: 1.6;">
                          ${p?`A new task has been assigned to you${k?` by <strong>${k}</strong>`:""} for client <strong style="color: ${l.color};">${g}</strong>.`:`A task assigned to you for client <strong style="color: ${l.color};">${g}</strong> has been updated.`}
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Task Details Box -->
                    <tr>
                      <td style="padding: 0 0 25px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border-left: 4px solid ${r};">
                          <tr>
                            <td style="padding: 24px;">
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                  <td style="padding-bottom: 15px;">
                                    <span style="display: inline-block; background: ${r}; color: white; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">📋 Task Details</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Task:</td>
                                        <td style="font-size: 16px; color: #1e293b; font-weight: 600;">${d}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                ${e?`
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Description:</td>
                                        <td style="font-size: 14px; color: #475569;">${e}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                `:""}
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Client:</td>
                                        <td style="font-size: 14px; color: #1e293b; font-weight: 500;">${g}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">${u?"⚠️ OVERDUE":"\uD83D\uDCC5 Due Date"}:</td>
                                        <td style="font-size: 14px; color: ${u?"#dc2626":"#059669"}; font-weight: 600;">${t}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Your Role:</td>
                                        <td>
                                          <span style="display: inline-block; background: ${l.color}; color: white; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px;">
                                            ${l.icon} ${l.title}
                                          </span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    ${!p&&j&&j.length>0?`
                    <!-- What Changed Box -->
                    <tr>
                      <td style="padding: 0 0 25px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
                          <tr>
                            <td style="padding: 20px 24px;">
                              <p style="margin: 0 0 10px; font-size: 14px; color: #92400e; font-weight: 600;">📝 What Changed</p>
                              <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                                ${j.map(a=>`<li>${a}</li>`).join("")}
                              </ul>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    `:""}
                    
                    <!-- CTA Button -->
                    <tr>
                      <td style="text-align: center; padding: 10px 0 25px;">
                        <a href="${l.dashboardUrl}" 
                           style="display: inline-block; background-color: ${r}; background: linear-gradient(135deg, ${r} 0%, #8b5cf6 100%); color: white; font-size: 15px; font-weight: 600; padding: 14px 36px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                          View My Tasks →
                        </a>
                      </td>
                    </tr>

                    <!-- Action Required Notice -->
                    <tr>
                      <td style="padding: 0 0 20px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f0fdf4; border-radius: 12px; border: 1px solid #86efac;">
                          <tr>
                            <td style="padding: 20px 24px;">
                              <p style="margin: 0 0 10px; font-size: 14px; color: #166534; font-weight: 600;">✅ Action Required</p>
                              <p style="margin: 0; font-size: 14px; color: #166534; line-height: 1.6;">
                                Please log in to your Legacy ClientHub account to view the complete task details and take necessary action${f?" before the due date":""}.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer - Legacy Accounting Services Branding -->
              <tr>
                <td style="background-color: #5a1f2d; padding: 30px 40px; border-radius: 0 0 16px 16px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #d4a574; font-weight: 600;">Legacy Accounting Services</p>
                        <p style="margin: 0 0 10px; font-size: 12px; color: rgba(255,255,255,0.7);">Client Portal - Automated Notification</p>
                        <p style="margin: 0 0 15px; font-size: 11px; color: rgba(255,255,255,0.5);">Please do not reply directly to this email.</p>
                        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; margin-top: 10px;">
                          <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.5);">\xa9 ${m} Legacy Accounting Services – All Rights Reserved.</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `})}async function q({recipientEmail:a,recipientName:b,recipientRole:c,stageName:d,subtaskTitle:e,clientName:f,notificationType:g,dueDate:i,assignedByName:j}){let k=o(c),l=new Date().getFullYear(),m=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit",hour12:!0}),n="\uD83D\uDCCB",p="Onboarding Task Assigned",q="#3b82f6";"updated"===g?(n="✏️",p="Onboarding Task Updated",q="#f59e0b"):"completed"===g&&(n="✅",p="Onboarding Task Completed",q="#10b981");let r=`${n} ${p}: ${e} - Legacy Accounting Services`,s=i?new Date(i).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}):null;return h({to:a,subject:r,html:`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${p}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f4f8;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
              
              <!-- Header - Legacy Accounting Services Branding -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; background: linear-gradient(135deg, #5a1f2d 0%, #722f3e 50%, #8b3d4d 100%); padding: 30px 40px 25px; border-radius: 16px 16px 0 0; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <!-- Company Name - Clean Text Branding -->
                        <div style="margin-bottom: 5px;">
                          <span style="font-size: 22px; color: #d4a574; font-weight: 700; letter-spacing: 2px; font-family: Georgia, 'Times New Roman', serif;">LEGACY</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                          <span style="font-size: 10px; color: rgba(255,255,255,0.85); letter-spacing: 2px;">ACCOUNTING SERVICES</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center;">
                        <h1 style="color: white; margin: 0 0 5px; font-size: 20px; font-weight: 600;">${p}</h1>
                        <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">${m}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="background-color: #ffffff; padding: 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td>
                        <p style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 500;">Hello ${b},</p>
                        <p style="margin: 0 0 25px; font-size: 15px; color: #475569; line-height: 1.6;">
                          ${"assigned"===g?`An onboarding task has been assigned to you${j?` by <strong>${j}</strong>`:""} for client <strong style="color: ${k.color};">${f}</strong>.`:"updated"===g?`An onboarding task for client <strong style="color: ${k.color};">${f}</strong> has been updated.`:`An onboarding task for client <strong style="color: ${k.color};">${f}</strong> has been completed.`}
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Task Details Box -->
                    <tr>
                      <td style="padding: 0 0 25px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border-left: 4px solid ${q};">
                          <tr>
                            <td style="padding: 24px;">
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                  <td style="padding-bottom: 15px;">
                                    <span style="display: inline-block; background: ${q}; color: white; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">🚀 Onboarding Details</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Stage:</td>
                                        <td style="font-size: 14px; color: #1e293b; font-weight: 600;">${d}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Task:</td>
                                        <td style="font-size: 16px; color: #1e293b; font-weight: 600;">${e}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Client:</td>
                                        <td style="font-size: 14px; color: #1e293b; font-weight: 500;">${f}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                ${s?`
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">📅 Due Date:</td>
                                        <td style="font-size: 14px; color: #059669; font-weight: 600;">${s}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                `:""}
                                <tr>
                                  <td>
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Your Role:</td>
                                        <td>
                                          <span style="display: inline-block; background: ${k.color}; color: white; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px;">
                                            ${k.icon} ${k.title}
                                          </span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                      <td style="text-align: center; padding: 10px 0 25px;">
                        <a href="${k.dashboardUrl}" 
                           style="display: inline-block; background-color: #5a1f2d; background: linear-gradient(135deg, #5a1f2d 0%, #8b3d4d 100%); color: white; font-size: 15px; font-weight: 600; padding: 14px 36px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px rgba(90, 31, 45, 0.4);">
                          View My Dashboard →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer - Legacy Accounting Services Branding -->
              <tr>
                <td style="background-color: #5a1f2d; padding: 30px 40px; border-radius: 0 0 16px 16px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #d4a574; font-weight: 600;">Legacy Accounting Services</p>
                        <p style="margin: 0 0 15px; font-size: 12px; color: rgba(255,255,255,0.5);">Client Portal - Automated Notification</p>
                        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; margin-top: 10px;">
                          <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.5);">\xa9 ${l} Legacy Accounting Services – All Rights Reserved.</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `})}async function r({recipientEmail:a,recipientName:b,clientName:c,stages:d,loginUrl:e="https://legacy.hubonesystems.net/login"}){console.log(`📧 sendOnboardingOverviewEmail called for ${a}`);let f=new Date().getFullYear(),g=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),i=d.map((a,b)=>{let c=a.status||"Not Started",d=a.subtasks&&a.subtasks.length>0?a.subtasks.map((a,b)=>{let c=a.status||"Not Started",d=a.due_date?new Date(a.due_date).toLocaleDateString("en-US",{month:"short",day:"numeric"}):"";return`
            <tr>
              <td style="padding: 8px 0 8px 24px; border-bottom: 1px solid #e5e7eb;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="width: 20px; font-size: 12px; color: #9ca3af;">${b+1}.</td>
                    <td style="font-size: 14px; color: #374151;">${a.title}</td>
                    <td style="text-align: right; width: 100px; font-size: 12px; color: #9ca3af;">${d}</td>
                    <td style="text-align: right; width: 85px;">
                      <span style="display: inline-block; background-color: ${"Completed"===c?"#ecfdf5":"In Progress"===c?"#fffbeb":"#f3f4f6"}; color: ${"Completed"===c?"#10b981":"In Progress"===c?"#f59e0b":"#6b7280"}; font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 10px;">${c}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `}).join(""):`
        <tr>
          <td style="padding: 12px 24px; color: #9ca3af; font-size: 13px; font-style: italic;">No tasks assigned yet</td>
        </tr>
      `;return`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <tr>
          <td bgcolor="#f8fafc" style="background-color: #f8fafc; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="font-size: 12px; color: #6b7280; font-weight: 500;">STAGE ${b+1}</td>
                <td style="text-align: right;">
                  <span style="display: inline-block; background: ${"Completed"===c?"#ecfdf5":"In Progress"===c?"#fef3c7":"#f3f4f6"}; color: ${"Completed"===c?"#10b981":"In Progress"===c?"#f59e0b":"#6b7280"}; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 10px; text-transform: uppercase;">${c}</span>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 6px; font-size: 16px; color: #1e293b; font-weight: 600;">${a.name}</td>
              </tr>
            </table>
          </td>
        </tr>
        ${d}
      </table>
    `}).join("");return h({to:a,subject:`📋 Your Onboarding Journey Overview - ${c} - Legacy Accounting Services`,html:`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Onboarding Overview</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f4f8;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
              
              <!-- Header - Legacy Accounting Services Branding -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; background: linear-gradient(135deg, #5a1f2d 0%, #722f3e 50%, #8b3d4d 100%); padding: 30px 40px 25px; border-radius: 16px 16px 0 0; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <!-- Company Name - Clean Text Branding -->
                        <div style="margin-bottom: 5px;">
                          <span style="font-size: 22px; color: #d4a574; font-weight: 700; letter-spacing: 2px; font-family: Georgia, 'Times New Roman', serif;">LEGACY</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                          <span style="font-size: 10px; color: rgba(255,255,255,0.85); letter-spacing: 2px;">ACCOUNTING SERVICES</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center;">
                        <h1 style="color: white; margin: 0 0 5px; font-size: 20px; font-weight: 600;">Your Onboarding Overview</h1>
                        <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">${g}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="background-color: #ffffff; padding: 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td>
                        <p style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 500;">Hello ${b},</p>
                        <p style="margin: 0 0 25px; font-size: 15px; color: #475569; line-height: 1.6;">
                          Below is a summary of your onboarding journey for <strong style="color: #5a1f2d;">${c}</strong>. 
                          This shows all the stages and tasks you need to complete for a successful onboarding.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Info Box -->
                    <tr>
                      <td style="padding: 0 0 25px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe;">
                          <tr>
                            <td style="padding: 16px 20px;">
                              <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: 500;">
                                ℹ️ You have <strong>${d.length}</strong> onboarding stage${1!==d.length?"s":""} to complete.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Stages List -->
                    <tr>
                      <td style="padding: 0 0 25px;">
                        ${i}
                      </td>
                    </tr>
                    
                    <!-- Action Required Box -->
                    <tr>
                      <td style="padding: 0 0 20px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f0fdf4; border-radius: 12px; border: 1px solid #86efac;">
                          <tr>
                            <td style="padding: 20px 24px;">
                              <p style="margin: 0 0 10px; font-size: 14px; color: #166534; font-weight: 600;">✅ Ready to start?</p>
                              <p style="margin: 0; font-size: 14px; color: #166534; line-height: 1.6;">
                                Log in to your Legacy ClientHub account to view detailed task instructions, upload documents, and track your progress.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                      <td style="text-align: center; padding: 10px 0 0;">
                        <a href="${e}" 
                           style="display: inline-block; background-color: #5a1f2d; background: linear-gradient(135deg, #5a1f2d 0%, #8b3d4d 100%); color: white; font-size: 15px; font-weight: 600; padding: 14px 36px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px rgba(90, 31, 45, 0.4);">
                          View My Dashboard →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer - Legacy Accounting Services Branding -->
              <tr>
                <td style="background-color: #5a1f2d; padding: 30px 40px; border-radius: 0 0 16px 16px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #d4a574; font-weight: 600;">Legacy Accounting Services</p>
                        <p style="margin: 0 0 10px; font-size: 12px; color: rgba(255,255,255,0.7);">Client Portal - Automated Notification</p>
                        <p style="margin: 0 0 15px; font-size: 11px; color: rgba(255,255,255,0.5);">Please do not reply directly to this email.</p>
                        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; margin-top: 10px;">
                          <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.5);">\xa9 ${f} Legacy Accounting Services – All Rights Reserved.</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `})}async function s({adminEmail:a,adminName:b,taskTitle:c,clientName:d,completedByRole:e,completedByName:f,taskType:g,stageName:i}){console.log(`📧 sendAdminTaskCompletionEmail called for ${a}`);let j=new Date().getFullYear(),k=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit",hour12:!0});return h({to:a,subject:`✅ Task Completed: ${c} - ${d}`,html:`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Task Completed</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f4f8;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
              
              <!-- Header - Legacy Accounting Services Branding -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; background: linear-gradient(135deg, #5a1f2d 0%, #722f3e 50%, #8b3d4d 100%); padding: 30px 40px 25px; border-radius: 16px 16px 0 0; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <!-- Company Name - Clean Text Branding -->
                        <div style="margin-bottom: 5px;">
                          <span style="font-size: 22px; color: #d4a574; font-weight: 700; letter-spacing: 2px; font-family: Georgia, 'Times New Roman', serif;">LEGACY</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                          <span style="font-size: 10px; color: rgba(255,255,255,0.85); letter-spacing: 2px;">ACCOUNTING SERVICES</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center;">
                        <span style="font-size: 50px;">✅</span>
                        <h1 style="color: white; margin: 15px 0 0; font-size: 24px; font-weight: 600;">Task Completed</h1>
                        <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px;">${k}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="background-color: #ffffff; padding: 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td>
                        <p style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 500;">Hello ${b},</p>
                        <p style="margin: 0 0 25px; font-size: 15px; color: #475569; line-height: 1.6;">
                          Great news! A task has been completed. Here are the details:
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Task Details Box -->
                    <tr>
                      <td style="padding: 0 0 25px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ecfdf5; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; border-left: 4px solid #10b981;">
                          <tr>
                            <td style="padding: 24px;">
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                  <td style="padding-bottom: 15px;">
                                    <span style="display: inline-block; background: #10b981; color: white; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">✅ Completed</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 120px; font-size: 14px; color: #64748b; font-weight: 500;">Task:</td>
                                        <td style="font-size: 16px; color: #1e293b; font-weight: 600;">${c}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 120px; font-size: 14px; color: #64748b; font-weight: 500;">Task Type:</td>
                                        <td style="font-size: 14px; color: #1e293b;">${"ONBOARDING"===g?"Onboarding Task":"Assigned Task"}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                ${i?`
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 120px; font-size: 14px; color: #64748b; font-weight: 500;">Stage:</td>
                                        <td style="font-size: 14px; color: #1e293b;">${i}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                `:""}
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 120px; font-size: 14px; color: #64748b; font-weight: 500;">Client:</td>
                                        <td style="font-size: 14px; color: #1e293b; font-weight: 500;">${d}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 0;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 120px; font-size: 14px; color: #64748b; font-weight: 500;">Completed By:</td>
                                        <td style="font-size: 14px; color: #1e293b;">
                                          <strong>${f}</strong> <span style="color: #6b7280;">(${{CLIENT:"Client",CPA:"Preparer",SERVICE_CENTER:"Service Center"}[e]||e})</span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                      <td style="text-align: center; padding: 10px 0 0;">
                        <a href="https://legacy.hubonesystems.net/admin" 
                           style="display: inline-block; background-color: #10b981; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-size: 15px; font-weight: 600; padding: 14px 36px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                          View Dashboard →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer - Legacy Accounting Services Branding -->
              <tr>
                <td style="background-color: #5a1f2d; padding: 30px 40px; border-radius: 0 0 16px 16px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #d4a574; font-weight: 600;">Legacy Accounting Services</p>
                        <p style="margin: 0 0 15px; font-size: 12px; color: rgba(255,255,255,0.5);">Client Portal - Automated Notification</p>
                        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; margin-top: 10px;">
                          <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.5);">\xa9 ${j} Legacy Accounting Services – All Rights Reserved.</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `})}async function t({adminEmail:a,adminName:b,senderName:c,senderRole:d,messagePreview:e,clientName:f}){console.log(`📧 sendAdminMessageNotification called for ${a}`);let g=new Date().getFullYear(),i=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit",hour12:!0}),j={CLIENT:"Client",CPA:"Preparer",SERVICE_CENTER:"Service Center"}[d]||d,k=e.length>200?e.substring(0,200)+"...":e;return h({to:a,subject:`💬 New Message from ${c} (${j})`,html:`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Message</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f4f8;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
              
              <!-- Header - Legacy Accounting Services Branding -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; background: linear-gradient(135deg, #5a1f2d 0%, #722f3e 50%, #8b3d4d 100%); padding: 30px 40px 25px; border-radius: 16px 16px 0 0; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <!-- Company Name - Clean Text Branding -->
                        <div style="margin-bottom: 5px;">
                          <span style="font-size: 22px; color: #d4a574; font-weight: 700; letter-spacing: 2px; font-family: Georgia, 'Times New Roman', serif;">LEGACY</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                          <span style="font-size: 10px; color: rgba(255,255,255,0.85); letter-spacing: 2px;">ACCOUNTING SERVICES</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center;">
                        <h1 style="color: white; margin: 0 0 5px; font-size: 20px; font-weight: 600;">New Message Received</h1>
                        <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">${i}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="background-color: #ffffff; padding: 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td>
                        <p style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 500;">Hello ${b},</p>
                        <p style="margin: 0 0 25px; font-size: 15px; color: #475569; line-height: 1.6;">
                          You have received a new message. Here are the details:
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Message Details Box -->
                    <tr>
                      <td style="padding: 0 0 25px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border-left: 4px solid #3b82f6;">
                          <tr>
                            <td style="padding: 24px;">
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                  <td style="padding-bottom: 15px;">
                                    <span style="display: inline-block; background: #3b82f6; color: white; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">💬 Message</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">From:</td>
                                        <td style="font-size: 16px; color: #1e293b; font-weight: 600;">${c}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Role:</td>
                                        <td style="font-size: 14px; color: #1e293b;">${j}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                ${f?`
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                        <td style="width: 100px; font-size: 14px; color: #64748b; font-weight: 500;">Client:</td>
                                        <td style="font-size: 14px; color: #1e293b;">${f}</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                `:""}
                                <tr>
                                  <td style="padding-top: 12px; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0 0 8px; font-size: 14px; color: #64748b; font-weight: 500;">Message Preview:</p>
                                    <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                      <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">${k}</p>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                      <td style="text-align: center; padding: 10px 0 0;">
                        <a href="https://legacy.hubonesystems.net/admin" 
                           style="display: inline-block; background-color: #3b82f6; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; font-size: 15px; font-weight: 600; padding: 14px 36px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                          Reply Now →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer - Legacy Accounting Services Branding -->
              <tr>
                <td style="background-color: #5a1f2d; padding: 30px 40px; border-radius: 0 0 16px 16px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #d4a574; font-weight: 600;">Legacy Accounting Services</p>
                        <p style="margin: 0 0 15px; font-size: 12px; color: rgba(255,255,255,0.5);">Client Portal - Automated Notification</p>
                        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; margin-top: 10px;">
                          <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.5);">\xa9 ${g} Legacy Accounting Services – All Rights Reserved.</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `})}function u({recipientName:a,headerTitle:b="Notification",headerIcon:c="\uD83D\uDCE7",headerColor:d="#6366f1",bodyContent:e,showActionButton:f=!0,actionButtonUrl:g="https://legacy.hubonesystems.net",actionButtonLabel:h="View in ClientHub"}){let i=new Date().getFullYear(),j=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit",hour12:!0}),k=e.replace(/\n/g,"<br>").replace(/\r/g,"");return`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${b}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f4f8;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
              
              <!-- Header - Legacy Accounting Services Branding -->
              <tr>
                <td bgcolor="#5a1f2d" style="background-color: #5a1f2d; background: linear-gradient(135deg, #5a1f2d 0%, #722f3e 50%, #8b3d4d 100%); padding: 30px 40px 25px; border-radius: 16px 16px 0 0; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <!-- Company Name - Clean Text Branding -->
                        <div style="margin-bottom: 5px;">
                          <span style="font-size: 22px; color: #d4a574; font-weight: 700; letter-spacing: 2px; font-family: Georgia, 'Times New Roman', serif;">LEGACY</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                          <span style="font-size: 10px; color: rgba(255,255,255,0.85); letter-spacing: 2px;">ACCOUNTING SERVICES</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center;">
                        <h1 style="color: white; margin: 0 0 5px; font-size: 20px; font-weight: 600;">${b}</h1>
                        <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">${j}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="background-color: #ffffff; padding: 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    ${a?`
                    <tr>
                      <td>
                        <p style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 500;">Hello ${a},</p>
                      </td>
                    </tr>
                    `:""}
                    
                    <!-- Email Body Content -->
                    <tr>
                      <td style="padding: 0 0 25px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border-left: 4px solid ${d};">
                          <tr>
                            <td style="padding: 24px;">
                              <div style="font-size: 15px; color: #374151; line-height: 1.7;">
                                ${k}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    ${f?`
                    <!-- CTA Button -->
                    <tr>
                      <td style="text-align: center; padding: 10px 0 0;">
                        <a href="${g}" 
                           style="display: inline-block; background-color: ${d}; background: linear-gradient(135deg, ${d} 0%, #8b5cf6 100%); color: white; font-size: 15px; font-weight: 600; padding: 14px 36px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                          ${h} →
                        </a>
                      </td>
                    </tr>
                    `:""}
                  </table>
                </td>
              </tr>
              
              <!-- Footer - Legacy Accounting Services Branding -->
              <tr>
                <td style="background-color: #5a1f2d; padding: 30px 40px; border-radius: 0 0 16px 16px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #d4a574; font-weight: 600;">Legacy Accounting Services</p>
                        <p style="margin: 0 0 15px; font-size: 12px; color: rgba(255,255,255,0.5);">Client Portal - Automated Notification</p>
                        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; margin-top: 10px;">
                          <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.5);">\xa9 ${i} Legacy Accounting Services – All Rights Reserved.</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `}async function v({to:a,subject:b,recipientName:c,bodyContent:d,headerTitle:e,headerIcon:f,headerColor:g,showActionButton:i,actionButtonUrl:j,actionButtonLabel:k}){let l=u({recipientName:c,headerTitle:e,headerIcon:f,headerColor:g,bodyContent:d,showActionButton:i,actionButtonUrl:j,actionButtonLabel:k});return h({to:a,subject:b,html:l})}async function w({adminEmail:a,adminName:b,uploaderName:c,uploaderRole:d,documents:e,clientName:f,clientId:g}){console.log(`📧 sendAdminBatchDocumentUploadNotification called for ${a} (${e.length} documents)`);let h=e.length,i=1===h?"document":"documents",j=e.map((a,b)=>{let c=a.folder?` <span style="color: #64748b;">(in ${a.folder})</span>`:"";return`<li style="margin: 0 0 8px; font-size: 14px; color: #166534;">📄 ${a.name}${c}</li>`}).join(""),k=`
    <p style="margin: 0 0 15px; font-size: 15px; color: #166534; line-height: 1.6;">
      <strong style="color: #10b981;">${c}</strong> (${{CLIENT:"Client",CPA:"Preparer",SERVICE_CENTER:"Service Center"}[d]||d}) has uploaded <strong>${h} ${i}</strong>.
    </p>
    <p style="margin: 0 0 12px; font-size: 14px; color: #166534;"><strong>👤 Client:</strong> ${f}</p>
    <p style="margin: 0 0 12px; font-size: 14px; color: #166534; font-weight: 600;">📂 Uploaded Documents:</p>
    <ul style="margin: 0; padding-left: 20px; list-style: none;">
      ${j}
    </ul>
  `;return v({to:a,subject:`📄 ${h} ${i} uploaded by ${c}`,recipientName:b,bodyContent:k,headerTitle:"Documents Uploaded",headerIcon:"\uD83D\uDCC4",headerColor:"#10b981",showActionButton:!0,actionButtonUrl:`https://legacy.hubonesystems.net/admin/clients/${g}`,actionButtonLabel:"View Client Documents"})}async function x({adminEmail:a,adminName:b,creatorName:c,creatorRole:d,folders:e,clientName:f,clientId:g}){console.log(`📧 sendAdminBatchFolderCreatedNotification called for ${a} (${e.length} folders)`);let h=e.length,i=1===h?"folder":"folders",j=e.map(a=>{let b=a.parentPath?` <span style="color: #64748b;">(in ${a.parentPath})</span>`:"";return`<li style="margin: 0 0 8px; font-size: 14px; color: #92400e;">📁 ${a.name}${b}</li>`}).join(""),k=`
    <p style="margin: 0 0 15px; font-size: 15px; color: #92400e; line-height: 1.6;">
      <strong style="color: #f59e0b;">${c}</strong> (${{CLIENT:"Client",CPA:"Preparer",SERVICE_CENTER:"Service Center"}[d]||d}) has created <strong>${h} ${i}</strong>.
    </p>
    <p style="margin: 0 0 12px; font-size: 14px; color: #92400e;"><strong>👤 Client:</strong> ${f}</p>
    <p style="margin: 0 0 12px; font-size: 14px; color: #92400e; font-weight: 600;">📂 Created Folders:</p>
    <ul style="margin: 0; padding-left: 20px; list-style: none;">
      ${j}
    </ul>
  `;return v({to:a,subject:`📁 ${h} ${i} created by ${c}`,recipientName:b,bodyContent:k,headerTitle:"Folders Created",headerIcon:"\uD83D\uDCC1",headerColor:"#f59e0b",showActionButton:!0,actionButtonUrl:`https://legacy.hubonesystems.net/admin/clients/${g}`,actionButtonLabel:"View Client Documents"})}async function y({clientEmail:a,clientName:b,uploaderName:c,documents:d}){console.log(`📧 sendClientBatchDocumentUploadNotification called for ${a} (${d.length} documents)`);let e=d.length,f=1===e?"document":"documents",g=d.map(a=>{let b=a.folder?` <span style="color: #64748b;">(in ${a.folder})</span>`:"";return`<li style="margin: 0 0 8px; font-size: 14px; color: #166534;">📄 ${a.name}${b}</li>`}).join(""),h=`
    <p style="margin: 0 0 15px; font-size: 15px; color: #166534; line-height: 1.6;">
      <strong style="color: #10b981;">${c}</strong> (Admin) has uploaded <strong>${e} ${f}</strong> to your documents.
    </p>
    <p style="margin: 0 0 12px; font-size: 14px; color: #166534; font-weight: 600;">📂 Uploaded Documents:</p>
    <ul style="margin: 0; padding-left: 20px; list-style: none;">
      ${g}
    </ul>
  `;return v({to:a,subject:`📄 ${e} New ${f} Uploaded`,recipientName:b,bodyContent:h,headerTitle:"New Documents Available",headerIcon:"\uD83D\uDCC4",headerColor:"#10b981",showActionButton:!0,actionButtonUrl:"https://legacy.hubonesystems.net/client/documents",actionButtonLabel:"View My Documents"})}async function z({clientEmail:a,clientName:b,creatorName:c,folders:d}){console.log(`📧 sendClientBatchFolderCreatedNotification called for ${a} (${d.length} folders)`);let e=d.length,f=1===e?"folder":"folders",g=d.map(a=>{let b=a.parentPath?` <span style="color: #64748b;">(in ${a.parentPath})</span>`:"";return`<li style="margin: 0 0 8px; font-size: 14px; color: #92400e;">📁 ${a.name}${b}</li>`}).join(""),h=`
    <p style="margin: 0 0 15px; font-size: 15px; color: #92400e; line-height: 1.6;">
      <strong style="color: #f59e0b;">${c}</strong> (Admin) has created <strong>${e} ${f}</strong> in your documents.
    </p>
    <p style="margin: 0 0 12px; font-size: 14px; color: #92400e; font-weight: 600;">📂 Created Folders:</p>
    <ul style="margin: 0; padding-left: 20px; list-style: none;">
      ${g}
    </ul>
  `;return v({to:a,subject:`📁 ${e} New ${f} Created`,recipientName:b,bodyContent:h,headerTitle:"New Folders Created",headerIcon:"\uD83D\uDCC1",headerColor:"#f59e0b",showActionButton:!0,actionButtonUrl:"https://legacy.hubonesystems.net/client/documents",actionButtonLabel:"View My Documents"})}async function A(){try{let{getDbPool:a}=await Promise.resolve().then(c.bind(c,27143)),b=await a(),d=await b.request().query(`
      SELECT email, full_name as name
      FROM AdminSettings 
      WHERE email IS NOT NULL
    `);if(d.recordset.length>0){let a=d.recordset.map(a=>({email:a.email,name:a.name||"Admin"}));return console.log(`📧 Found ${a.length} admin(s) for notifications:`,a.map(a=>a.email)),a}return console.warn("⚠️ No admins found in AdminSettings"),[]}catch(a){return console.error("❌ Failed to get admins:",a),[]}}async function B(a){try{let{getDbPool:b}=await Promise.resolve().then(c.bind(c,27143)),d=await Promise.resolve().then(c.t.bind(c,22161,23)),e=await b(),f=await e.request().input("clientId",d.Int,Number(a)).query(`
        SELECT TOP 1 primary_contact_email as email, client_name as name
        FROM Clients 
        WHERE client_id = @clientId AND primary_contact_email IS NOT NULL
      `);if(f.recordset.length>0)return console.log(`📧 Found client email for ID ${a}:`,f.recordset[0].email),{email:f.recordset[0].email,name:f.recordset[0].name||"Client"};return console.warn(`⚠️ No client email found for ID ${a}`),null}catch(b){return console.error(`❌ Failed to get client email for ID ${a}:`,b),null}}},88026:(a,b,c)=>{c.d(b,{B1:()=>g,I9:()=>h,M8:()=>j,bz:()=>k,zk:()=>i});var d=c(27143),e=c(22161),f=c.n(e);async function g(a){try{let b=await (0,d.getDbPool)(),c=a.emailBodyPreview?a.emailBodyPreview.substring(0,2e3):null,e=await b.request().input("recipientEmail",f().NVarChar(255),a.recipientEmail).input("recipientName",f().NVarChar(255),a.recipientName||null).input("recipientRole",f().NVarChar(50),a.recipientRole||null).input("relatedEntityType",f().NVarChar(50),a.relatedEntityType||null).input("relatedEntityId",f().Int,a.relatedEntityId||null).input("relatedEntityName",f().NVarChar(255),a.relatedEntityName||null).input("emailType",f().NVarChar(100),a.emailType).input("emailSubject",f().NVarChar(500),a.emailSubject).input("emailBodyPreview",f().NVarChar(f().MAX),c).input("status",f().NVarChar(50),a.status).input("statusMessage",f().NVarChar(f().MAX),a.statusMessage||null).input("acsMessageId",f().NVarChar(255),a.acsMessageId||null).input("metadata",f().NVarChar(f().MAX),a.metadata?JSON.stringify(a.metadata):null).input("sentAt",f().DateTime2,"Sent"===a.status||"Delivered"===a.status?new Date:null).query(`
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
      `);if(0===c.recordset.length)return null;let e=c.recordset[0];return{...e,metadata:e.metadata?JSON.parse(e.metadata):null}}catch(b){return console.error(`❌ Failed to get email log ${a}:`,b),null}}}};