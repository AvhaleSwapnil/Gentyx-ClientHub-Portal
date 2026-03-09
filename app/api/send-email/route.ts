// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import { sendEmail, wrapEmailContent } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { to, subject, body: emailBody, clientName, useTemplate = true } = body;

        if (!to || !subject || !emailBody) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: to, subject, body" },
                { status: 400 }
            );
        }

        // Replace template variables in the body
        let processedBody = emailBody;

        // Replace all common template variables
        if (clientName) {
            processedBody = processedBody.replace(/\{\{clientName\}\}/gi, clientName);
            processedBody = processedBody.replace(/\{\{Client_Name\}\}/gi, clientName);
            processedBody = processedBody.replace(/\{\{contact_name\}\}/gi, clientName);
        }

        // Handle {{email}} placeholder if 'to' is provided
        if (to) {
            processedBody = processedBody.replace(/\{\{email\}\}/gi, to);
        }

        // Replace other common placeholders (extract from body if possible or just use common keys)
        if (body.stageName) {
            processedBody = processedBody.replace(/\{\{stage_name\}\}/gi, body.stageName);
        }
        if (body.taskTitle) {
            processedBody = processedBody.replace(/\{\{taskTitle\}\}/gi, body.taskTitle);
        }

        // Replace other common variables with Gentyx branding
        processedBody = processedBody.replace(/\{\{Company_Name\}\}/gi, "Gentyx Systems Inc.");
        processedBody = processedBody.replace(/\{\{Support_Email\}\}/gi, "support@gentyx.com");
        processedBody = processedBody.replace(/\{\{LC\}\}/gi, "Gentyx Systems Team");

        // Global fallback for any lingering "mySAGE" references in body content
        processedBody = processedBody.replace(/mySAGE/gi, "Gentyx");

        // Wrap the content with professional template if useTemplate is true
        let finalHtml = processedBody;
        if (useTemplate) {
            // Determine header title from subject (extract key phrase)
            let headerTitle = "Notification";
            let headerIcon = "📧";
            let headerColor = "#6366f1";

            // Customize header based on subject content
            const subjectLower = subject.toLowerCase();
            if (subjectLower.includes("reminder")) {
                headerTitle = "Reminder";
                headerIcon = "⏰";
                headerColor = "#f59e0b";
            } else if (subjectLower.includes("review")) {
                headerTitle = "Review Required";
                headerIcon = "📋";
                headerColor = "#3b82f6";
            } else if (subjectLower.includes("welcome")) {
                headerTitle = "Welcome";
                headerIcon = "🎉";
                headerColor = "#10b981";
            } else if (subjectLower.includes("task")) {
                headerTitle = "Task Update";
                headerIcon = "✅";
                headerColor = "#6366f1";
            } else if (subjectLower.includes("document")) {
                headerTitle = "Document Notification";
                headerIcon = "📄";
                headerColor = "#8b5cf6";
            } else if (subjectLower.includes("pending")) {
                headerTitle = "Action Required";
                headerIcon = "🔔";
                headerColor = "#ef4444";
            } else if (subjectLower.includes("complete") || subjectLower.includes("completed")) {
                headerTitle = "Completion Notice";
                headerIcon = "🎯";
                headerColor = "#10b981";
            } else if (subjectLower.includes("update")) {
                headerTitle = "Update";
                headerIcon = "📢";
                headerColor = "#6366f1";
            }

            finalHtml = wrapEmailContent({
                recipientName: clientName || undefined,
                headerTitle,
                headerIcon,
                headerColor,
                bodyContent: processedBody,
                showActionButton: true,
                actionButtonUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://clienthub.gentyx.com",
                actionButtonLabel: "Open ClientHub",
            });
        }

        // Send the email using the central sendEmail utility (Nodemailer/SMTP)
        const result = await sendEmail({
            to,
            subject,
            html: finalHtml,
            text: processedBody.replace(/<[^>]*>/g, ""), // Strip HTML for plain text fallback
            logging: {
                recipientName: clientName || undefined,
                emailType: 'general',
            }
        });

        if (result.success) {
            console.log("✅ Email sent successfully via SMTP:", result.messageId);
            return NextResponse.json({
                success: true,
                messageId: result.messageId,
                message: `Email sent successfully to ${to}`,
            });
        } else {
            console.error("❌ Email send failed:", result.error);
            return NextResponse.json(
                { success: false, error: result.error?.message || "Failed to send email" },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("Send email error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to send email" },
            { status: 500 }
        );
    }
}
