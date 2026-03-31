import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789')

export async function sendWelcomeEmail(email: string, name?: string | null) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
    console.log('Mock sending welcome email to', email)
    return { success: true, mock: true }
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@kazira.io'
    
    const data = await resend.emails.send({
      from: `Kazira Intelligence <${fromEmail}>`,
      to: [email],
      subject: 'Welcome to Kazira Clinical Intelligence!',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #1e40af;">Welcome to Kazira, ${name || 'there'}!</h2>
          <p>We're thrilled to have you on board. Kazira is designed to give you the revenue intelligence your private dental clinic needs to thrive.</p>
          <p>Here are a few things you can do to get started:</p>
          <ul>
            <li>Connect your practice management software</li>
            <li>Review your initial dashboard metrics</li>
            <li>Invite your team members</li>
          </ul>
          <p>If you have any questions, just reply to this email. We're here to help!</p>
          <br/>
          <p>Best regards,</p>
          <p>The Kazira Team</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 12px; color: #6b7280;">
            Kazira Clinical Intelligence<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #1e40af;">Unsubscribe</a>
          </p>
        </div>
      `,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

export async function sendWeeklyReportEmail(toEmail: string, clinicName: string, reportText: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
    console.log('Mock sending email to', toEmail)
    console.log('Subject:', `Weekly Revenue Report - ${clinicName}`)
    return { success: true, mock: true }
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'reports@kazira.io'
    
    // Convert markdown to simple HTML for email
    const htmlContent = reportText
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/- (.*?)(<br \/>|$)/g, '<li>$1</li>')

    const data = await resend.emails.send({
      from: `Kazira Intelligence <${fromEmail}>`,
      to: [toEmail],
      subject: `Weekly Revenue Report - ${clinicName}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #1e40af;">Kazira Clinical Intelligence</h2>
          <p>${htmlContent}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated report from Kazira Clinical Intelligence.<br>
            To manage your email preferences, log in to your dashboard.
          </p>
        </div>
      `,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}
