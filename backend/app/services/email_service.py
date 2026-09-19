import os
import smtplib
import logging
import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger("hireflow.email")


class EmailService:
    @staticmethod
    def is_configured() -> bool:
        """Check if SMTP credentials, Brevo API key, or Resend Email API key are provided."""
        has_smtp = bool(
            settings.SMTP_HOST
            and settings.SMTP_USERNAME
            and settings.SMTP_PASSWORD
            and settings.SMTP_USERNAME.strip()
            and settings.SMTP_PASSWORD.strip()
        )
        has_brevo = bool(getattr(settings, "BREVO_API_KEY", None) and settings.BREVO_API_KEY.strip())
        has_email_api = bool(settings.EMAIL_API_KEY and settings.EMAIL_API_KEY.strip())
        return has_smtp or has_brevo or has_email_api

    @classmethod
    def send_candidate_evaluation_report(
        cls,
        recipient_email: str,
        candidate_name: str,
        job_role: str,
        pdf_bytes: bytes,
        filename: Optional[str] = None,
        custom_message: Optional[str] = None,
        subject: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Send an evaluation report PDF to the candidate with an enterprise HTML template.
        Supports Brevo HTTP API (port 443), Resend API, and standard live SMTP.
        """
        if not recipient_email or "@" not in recipient_email:
            raise ValueError(f"Invalid recipient email address: '{recipient_email}'")

        if not filename:
            clean_name = candidate_name.replace(" ", "_")
            filename = f"HireFlow_Evaluation_Report_{clean_name}.pdf"

        if not subject:
            subject = f"Evaluation Report - {candidate_name} | {job_role}"

        from_header = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"

        default_note = (
            f"Thank you for participating in our technical screening and interview process for the "
            f"<strong>{job_role}</strong> role. Please find attached your comprehensive evaluation report "
            f"summarizing the evidence, requirements validation, and recruiter synthesis."
        )
        recruiter_note_html = (
            f"<p style='background-color: #F8FAFC; border-left: 4px solid #0284C7; padding: 12px 16px; margin: 16px 0; color: #334155; font-style: italic;'>"
            f"\"{custom_message.strip()}\"</p>"
            if custom_message and custom_message.strip()
            else ""
        )

        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; margin: 0; padding: 24px; color: #0F172A;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #0284C7; padding: 24px 32px; color: #FFFFFF;">
      <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #BAE6FD;">HireFlow Recruitment</p>
      <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Candidate Evaluation Report</h1>
    </div>
    
    <div style="padding: 32px;">
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0; color: #1E293B;">
        Dear <strong>{candidate_name}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        {default_note}
      </p>

      {recruiter_note_html}

      <div style="margin: 24px 0; padding: 16px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 13px; font-weight: 600; color: #0F172A;">Attachment:</span>
          <span style="font-size: 12px; font-weight: 500; color: #0284C7; background-color: #E0F2FE; padding: 2px 8px; border-radius: 4px;">PDF Document</span>
        </div>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; font-family: monospace;">
          {filename} ({len(pdf_bytes) // 1024} KB)
        </p>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #64748B;">
        If you have any questions or require additional details regarding this evaluation, please reach out to your designated recruitment coordinator.
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #1E293B; margin-bottom: 0;">
        Warm regards,<br>
        <strong>{settings.EMAIL_FROM_NAME}</strong>
      </p>
    </div>

    <div style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 16px 32px; font-size: 11px; color: #94A3B8; text-align: center;">
      This evaluation report is strictly confidential. &bull; Generated by HireFlow Evidence-Based Recruitment Platform
    </div>
  </div>
</body>
</html>"""

        plain_text = (
            f"Dear {candidate_name},\n\n"
            f"Thank you for participating in our technical screening and interview process for the {job_role} role. "
            f"Please find attached your comprehensive evaluation report.\n\n"
            + (f"Recruiter Note:\n{custom_message.strip()}\n\n" if custom_message else "")
            + f"Attachment: {filename}\n\n"
            f"Warm regards,\n"
            f"{settings.EMAIL_FROM_NAME}"
        )

        sent_timestamp = datetime.datetime.utcnow().isoformat()
        import json
        import base64
        import urllib.request
        import urllib.error

        # -------------------------------------------------------------------------
        # Provider 1: Brevo (Sendinblue) HTTP API (HTTPS port 443 - works on Render Free Tier!)
        # Free 300 emails/day to ANY recipient without domain verification required.
        # -------------------------------------------------------------------------
        brevo_key = getattr(settings, "BREVO_API_KEY", "") or ""
        if not brevo_key and settings.EMAIL_API_KEY and settings.EMAIL_API_KEY.startswith("xkeysib-"):
            brevo_key = settings.EMAIL_API_KEY

        if brevo_key and brevo_key.strip():
            try:
                logger.info("Dispatching email via Brevo REST API (HTTPS port 443)...")
                pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")
                sender_email = settings.EMAIL_FROM or "dataforge187@gmail.com"
                brevo_payload = {
                    "sender": {"name": settings.EMAIL_FROM_NAME, "email": sender_email},
                    "to": [{"email": recipient_email, "name": candidate_name}],
                    "subject": subject,
                    "htmlContent": html_body,
                    "attachment": [
                        {
                            "name": filename,
                            "content": pdf_b64,
                        }
                    ],
                }
                req = urllib.request.Request(
                    "https://api.brevo.com/v3/smtp/email",
                    data=json.dumps(brevo_payload).encode("utf-8"),
                    headers={
                        "accept": "application/json",
                        "api-key": brevo_key.strip(),
                        "content-type": "application/json",
                        "user-agent": "HireFlow/1.0",
                    },
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=15) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    logger.info(f"Brevo API email successfully delivered to {recipient_email}: {resp_data}")
                    return {
                        "success": True,
                        "mode": "live_api",
                        "recipient": recipient_email,
                        "sent_at": sent_timestamp,
                        "message": f"Evaluation report email sent to {recipient_email} via Brevo API.",
                    }
            except urllib.error.HTTPError as e:
                err_text = e.read().decode("utf-8")
                try:
                    err_json = json.loads(err_text)
                    err_msg = err_json.get("message", err_text)
                except Exception:
                    err_msg = err_text
                logger.error(f"Brevo API error ({e.code}): {err_msg}")
                return {
                    "success": False,
                    "mode": "live_api",
                    "recipient": recipient_email,
                    "error": f"Brevo API Error: {err_msg}",
                }
            except Exception as e:
                logger.error(f"Failed to dispatch via Brevo API: {e}")
                return {
                    "success": False,
                    "mode": "live_api",
                    "recipient": recipient_email,
                    "error": f"Brevo API Delivery Failed: {str(e)}",
                }

        # -------------------------------------------------------------------------
        # Provider 2: Resend API (HTTPS port 443)
        # -------------------------------------------------------------------------
        if settings.EMAIL_API_KEY and settings.EMAIL_API_KEY.strip() and settings.EMAIL_API_KEY.startswith("re_"):
            try:
                logger.info("Dispatching email via Resend Email API...")
                pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")
                api_payload = {
                    "from": f"{settings.EMAIL_FROM_NAME} <onboarding@resend.dev>",
                    "to": [recipient_email],
                    "subject": subject,
                    "html": html_body,
                    "attachments": [
                        {
                            "filename": filename,
                            "content": pdf_b64,
                        }
                    ],
                }
                req = urllib.request.Request(
                    "https://api.resend.com/emails",
                    data=json.dumps(api_payload).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {settings.EMAIL_API_KEY.strip()}",
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 HireFlow/1.0",
                    },
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=15) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    logger.info(f"Resend API email successfully delivered: {resp_data}")
                    return {
                        "success": True,
                        "mode": "live_api",
                        "recipient": recipient_email,
                        "sent_at": sent_timestamp,
                        "message": f"Evaluation report email sent to {recipient_email} via Resend.",
                    }
            except urllib.error.HTTPError as e:
                err_text = e.read().decode("utf-8")
                try:
                    err_json = json.loads(err_text)
                    err_msg = err_json.get("message", err_text)
                except Exception:
                    err_msg = err_text
                logger.error(f"Resend API error ({e.code}): {err_msg}")
                # If Resend failed because of sandbox domain restriction, and SMTP is configured, fall through to SMTP
                if not (settings.SMTP_HOST and settings.SMTP_USERNAME and settings.SMTP_PASSWORD):
                    return {
                        "success": False,
                        "mode": "live_api",
                        "recipient": recipient_email,
                        "error": f"Resend API Error: {err_msg}",
                    }
            except Exception as e:
                logger.error(f"Failed to send email via Resend API: {str(e)}")
                if not (settings.SMTP_HOST and settings.SMTP_USERNAME and settings.SMTP_PASSWORD):
                    return {
                        "success": False,
                        "mode": "live_api",
                        "recipient": recipient_email,
                        "error": f"Email API Delivery Failed: {str(e)}",
                    }

        # -------------------------------------------------------------------------
        # Provider 3: Live SMTP (Gmail / Custom SMTP)
        # -------------------------------------------------------------------------
        has_smtp_credentials = bool(
            settings.SMTP_HOST
            and settings.SMTP_USERNAME
            and settings.SMTP_PASSWORD
            and settings.SMTP_USERNAME.strip()
            and settings.SMTP_PASSWORD.strip()
        )

        if has_smtp_credentials:
            # Construct standard MIME message
            msg = MIMEMultipart("mixed")
            msg["Subject"] = subject
            msg["From"] = from_header
            msg["To"] = recipient_email
            msg["Date"] = datetime.datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S +0000")

            msg_body = MIMEMultipart("alternative")
            msg_body.attach(MIMEText(plain_text, "plain", "utf-8"))
            msg_body.attach(MIMEText(html_body, "html", "utf-8"))
            msg.attach(msg_body)

            pdf_attachment = MIMEApplication(pdf_bytes, _subtype="pdf")
            pdf_attachment.add_header("Content-Disposition", "attachment", filename=filename)
            msg.attach(pdf_attachment)

            try:
                logger.info(f"Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}...")
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12) as server:
                    if settings.SMTP_USE_TLS:
                        server.starttls()
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                    server.send_message(msg)

                logger.info(f"Successfully delivered evaluation report email to {recipient_email}")
                return {
                    "success": True,
                    "mode": "live_smtp",
                    "recipient": recipient_email,
                    "sent_at": sent_timestamp,
                    "message": f"Evaluation report email sent successfully to {recipient_email}.",
                }
            except (smtplib.SMTPException, OSError, TimeoutError) as e:
                err_str = str(e)
                logger.error(f"SMTP failed to deliver to {recipient_email}: {err_str}")
                
                # Check for cloud firewall blocking (Render free tier blocks ports 25, 465, 587)
                if any(k in err_str.lower() for k in ["timed out", "110", "101", "timeout", "unreachable", "refused"]):
                    diagnostic = (
                        f"Cloud SMTP Blocked ({settings.SMTP_HOST}:{settings.SMTP_PORT} - {err_str}). "
                        f"Render Free Tier blocks outbound SMTP ports 587/465 to prevent spam. "
                        f"To send live emails from Render, add a free BREVO_API_KEY in Render's Environment tab (sends via HTTPS port 443), "
                        f"or run the backend locally on your computer where port 587 is unblocked."
                    )
                else:
                    diagnostic = f"SMTP Delivery Failed: {err_str}"

                return {
                    "success": False,
                    "mode": "live_smtp",
                    "recipient": recipient_email,
                    "error": diagnostic,
                }
            except Exception as e:
                logger.error(f"Unexpected error during SMTP send: {str(e)}")
                return {
                    "success": False,
                    "mode": "live_smtp",
                    "recipient": recipient_email,
                    "error": f"SMTP Delivery Error: {str(e)}",
                }

        # -------------------------------------------------------------------------
        # Fallback: Credentials not configured
        # -------------------------------------------------------------------------
        logger.warning(
            f"[EMAIL NOT CONFIGURED] No SMTP or API credentials configured. "
            f"Simulating report generation for {recipient_email}."
        )
        return {
            "success": True,
            "mode": "simulated",
            "recipient": recipient_email,
            "sent_at": sent_timestamp,
            "message": (
                f"Simulation Mode: Evaluation report generated for {recipient_email}. "
                f"To send real emails, add your credentials to backend/.env or Render Environment."
            ),
        }


email_service = EmailService()
