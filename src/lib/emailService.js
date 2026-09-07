// src/lib/emailService.js
import nodemailer from 'nodemailer';

/**
 * 1. SMTP Transporter Setup
 */
export const getEmailTransporter = () => {
  const host = process.env.SMTP_HOST || 'velora.octenium.net';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || 'contact@boostraagency.org';
  const pass = process.env.SMTP_PASS;

  console.log('--- 🔍 [SMTP CONFIG CHECK] ---');
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`User: ${user}`);
  console.log(`Password configured: ${pass ? '✅ Yes' : '❌ NO PASSWORD FOUND!'}`);
  console.log('------------------------------');

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: { user: user, pass: pass },
    tls: { rejectUnauthorized: false },
    debug: true,
    logger: true,
    connectionTimeout: 15000,
  });
};

// Robust Font Stack: IBM Plex for Apple Mail/Web, Tahoma as a beautiful fallback for Gmail.
const FONT_STACK = "'IBM Plex Sans Arabic', Tahoma, Arial, sans-serif";

/*
 * Pure HTML Table Logo: Bypasses all image blockers. 
 * - dir="ltr" stops the RTL email direction from mirroring the logo backwards.
 * - box-shadow hack strictly prevents Gmail Dark Mode from turning the white blocks black.
 * - border-collapse: separate ensures the rounded corners don't spawn weird squares.
 */
const HTML_LOGO = `
<table width="64" height="64" cellpadding="0" cellspacing="0" border="0" style="background-color: #0044FF; box-shadow: inset 0 0 0 50px #0044FF; border-radius: 16px; border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; margin: 0 auto;">
  <tr>
    <td align="center" valign="middle">
      <table dir="ltr" width="40" height="30" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; direction: ltr;">
        <tr>
          <td width="10" height="10" style="background-color: #FFFFFF; box-shadow: inset 0 0 0 20px #FFFFFF; border-top-left-radius: 4px; line-height:10px; font-size:10px;">&nbsp;</td>
          <td width="20" height="10" style="line-height:10px; font-size:10px;">&nbsp;</td>
          <td width="10" height="10" style="line-height:10px; font-size:10px;">&nbsp;</td>
        </tr>
        <tr>
          <td width="10" height="10" style="line-height:10px; font-size:10px;">&nbsp;</td>
          <td width="20" height="10" style="background-color: #FFFFFF; box-shadow: inset 0 0 0 20px #FFFFFF; line-height:10px; font-size:10px;">&nbsp;</td>
          <td width="10" height="10" style="line-height:10px; font-size:10px;">&nbsp;</td>
        </tr>
        <tr>
          <td width="10" height="10" style="line-height:10px; font-size:10px;">&nbsp;</td>
          <td width="20" height="10" style="line-height:10px; font-size:10px;">&nbsp;</td>
          <td width="10" height="10" style="background-color: #FFFFFF; box-shadow: inset 0 0 0 20px #FFFFFF; border-bottom-right-radius: 4px; line-height:10px; font-size:10px;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;

/**
 * 2. General / Marketing Email Template (Enterprise Minimal)
 */
export const generateBoostraEmailHtml = ({ recipientName, title, bodyContent, ctaText, ctaUrl, trackingId }) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://boostraagency.org';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || appUrl;
  const trackingPixel = trackingId ? `<img src="${apiBaseUrl}/api/track/open?id=${trackingId}" width="1" height="1" style="display:none !important; border:none;" alt="" />` : '';

  const ctaButton = (ctaText && ctaUrl) ? `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 36px; margin-bottom: 12px; border-collapse: separate;">
      <tr>
        <td align="center">
          <table border="0" cellspacing="0" cellpadding="0" style="border-collapse: separate;">
            <tr>
              <td align="center" bgcolor="#0044FF" style="background-color: #0044FF; border-radius: 100px;">
                <a href="${ctaUrl}" target="_blank" style="font-family: ${FONT_STACK}; font-size: 16px; font-weight: 700; color: #FFFFFF; text-decoration: none; padding: 14px 34px; display: inline-block; border-radius: 100px;">
                  ${ctaText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  ` : '';

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar" xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>${title}</title>
      
      <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
        
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #F4F4F5; direction: rtl; }
        
        /* Edge-to-edge mobile fix */
        @media screen and (max-width: 600px) {
          .wrapper-pad { padding: 0 !important; }
          .bg-card { border: none !important; border-radius: 0 !important; max-width: 100% !important; }
          .content-pad { padding: 36px 20px !important; }
        }

        /* Strict Enterprise Dark Mode */
        :root { color-scheme: light dark; supported-color-schemes: light dark; }
        @media (prefers-color-scheme: dark) {
          body, .bg-body { background-color: #000000 !important; }
          .bg-card { background-color: #111111 !important; border-color: #222222 !important; }
          .text-main { color: #FFFFFF !important; }
          .text-muted { color: #A1A1AA !important; }
          .border-subtle { border-color: #222222 !important; }
        }
      </style>
    </head>
    <body class="bg-body" style="margin: 0; padding: 0; background-color: #F4F4F5; direction: rtl;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" class="bg-body" style="background-color: #F4F4F5; width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" class="wrapper-pad" style="padding: 40px 10px;">
            
            <table class="bg-card" border="0" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 16px; overflow: hidden; border-collapse: separate;">
              
              <!-- HEADER (CENTERED) -->
              <tr>
                <td class="content-pad" align="center" style="padding: 40px 40px 10px 40px;">
                  <div style="margin-bottom: 24px;">${HTML_LOGO}</div>
                  <h1 class="text-main" style="font-family: ${FONT_STACK}; font-size: 22px; font-weight: 700; color: #000000; margin: 0; line-height: 1.4; text-align: center;">
                    ${title}
                  </h1>
                </td>
              </tr>

              <!-- BODY CONTENT (RIGHT-ALIGNED FOR READING) -->
              <tr>
                <td class="content-pad text-main" align="right" dir="rtl" style="padding: 10px 40px 40px 40px; font-family: ${FONT_STACK}; font-size: 16px; color: #27272A; line-height: 1.8;">
                  ${recipientName ? `<p style="font-family: ${FONT_STACK}; margin: 0 0 16px 0; font-weight: 600;">مرحباً ${recipientName}،</p>` : ''}
                  
                  <div style="font-family: ${FONT_STACK};">
                    ${bodyContent.replace(/\n/g, '<br/>')}
                  </div>
                  
                  ${ctaButton}
                </td>
              </tr>

              <!-- FOOTER (CENTERED) -->
              <tr>
                <td class="content-pad border-subtle" align="center" style="padding: 28px 40px; border-top: 1px solid #E4E4E7; background-color: transparent;">
                  <p class="text-main" style="font-family: ${FONT_STACK}; font-size: 13px; font-weight: bold; color: #000000; margin: 0 0 6px 0;">Boostra Agency</p>
                  <p class="text-muted" style="font-family: ${FONT_STACK}; font-size: 12px; color: #71717A; margin: 0 0 14px 0;">إدارة وتحجيم الحملات الإعلانية الممولة</p>
                  <p class="text-muted" style="font-family: ${FONT_STACK}; font-size: 11px; color: #A1A1AA; margin: 0;">الجزائر العاصمة، الجزائر 🇩🇿 | <a href="${appUrl}" style="color: #0044FF; text-decoration: none;">boostraagency.org</a></p>
                </td>
              </tr>
              
            </table>
            
          </td>
        </tr>
      </table>
      ${trackingPixel}
    </body>
    </html>
  `;
};

/**
 * 3. Store Order Delivery Template (Enterprise Minimal)
 */
export const generateBoostraStoreOrderEmailHtml = ({
  recipientName,
  recipientEmail,
  productTitle,
  productDesc,
  productFeatures = [],
  resourceLink,
  productImage = '',
  orderId = '',
  orderDate = '',
  trackingId = ''
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://boostraagency.org';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || appUrl;
  const formattedDate = orderDate || new Date().toLocaleString('ar-DZ', { timeZone: 'Africa/Algiers' });
  const referenceId = orderId || `BST-${Math.floor(100000 + Math.random() * 900000)}`;

  const trackingPixel = trackingId ? `<img src="${apiBaseUrl}/api/track/open?id=${trackingId}" width="1" height="1" style="display:none !important; border:none;" alt="" />` : '';

  const featuresHtml = (productFeatures && productFeatures.length > 0)
    ? `
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td class="text-main" align="right" dir="rtl" style="font-family: ${FONT_STACK}; font-size: 14px; font-weight: bold; color: #000000; padding-bottom: 12px;">العناصر المشمولة:</td>
        </tr>
        ${productFeatures.map(feat => `
          <tr>
            <td class="text-muted" align="right" dir="rtl" style="font-family: ${FONT_STACK}; font-size: 14px; color: #3F3F46; padding-bottom: 10px;">
              <span style="color: #0044FF; font-weight: bold; margin-left: 8px;">✓</span> ${feat}
            </td>
          </tr>
        `).join('')}
      </table>
    ` : '';

  const imageHtml = productImage 
    ? `
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; border-collapse: separate;">
        <tr>
          <td align="center">
            <img src="${productImage}" alt="${productTitle}" width="480" style="width: 100%; max-width: 480px; height: auto; border-radius: 16px; border: 1px solid #E4E4E7; display: block;" />
          </td>
        </tr>
      </table>
    ` : '';

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar" xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>منتجك الرقمي جاهز</title>
      
      <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
        
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #F4F4F5; direction: rtl; }
        
        /* Edge-to-edge mobile fix */
        @media screen and (max-width: 600px) {
          .wrapper-pad { padding: 0 !important; }
          .bg-card { border: none !important; border-radius: 0 !important; max-width: 100% !important; }
          .content-pad { padding: 36px 20px !important; }
        }

        /* Strict Enterprise Dark Mode */
        :root { color-scheme: light dark; supported-color-schemes: light dark; }
        @media (prefers-color-scheme: dark) {
          body, .bg-body { background-color: #000000 !important; }
          .bg-card { background-color: #111111 !important; border-color: #222222 !important; }
          .bg-box { background-color: #18181B !important; border-color: #27272A !important; }
          .text-main { color: #FFFFFF !important; }
          .text-muted { color: #A1A1AA !important; }
          .border-subtle { border-color: #222222 !important; }
        }
      </style>
    </head>
    <body class="bg-body" style="margin: 0; padding: 0; background-color: #F4F4F5; direction: rtl;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" class="bg-body" style="background-color: #F4F4F5; width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" class="wrapper-pad" style="padding: 40px 10px;">
            
            <table class="bg-card" border="0" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 16px; overflow: hidden; border-collapse: separate;">
              
              <!-- HEADER (CENTERED) -->
              <tr>
                <td class="content-pad" align="center" style="padding: 40px 40px 24px 40px;">
                  <div style="margin-bottom: 24px;">${HTML_LOGO}</div>
                  <h1 class="text-main" style="font-family: ${FONT_STACK}; font-size: 22px; font-weight: 700; color: #000000; margin: 0; line-height: 1.4; text-align: center;">
                    منتجك الرقمي جاهز
                  </h1>
                </td>
              </tr>

              <!-- ORDER DATA BOX (PILL AESTHETIC - SEPARATE COLLAPSE TO FIX SQUARES) -->
              <tr>
                <td class="content-pad" align="center" style="padding: 0 40px 32px 40px;">
                  <table class="bg-box" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 28px; border-collapse: separate;">
                    <tr>
                      <td align="center" dir="rtl" style="padding: 24px 32px; font-family: ${FONT_STACK}; font-size: 14px; line-height: 2;">
                        <span class="text-muted" style="color: #71717A;">المستلم:</span> <strong class="text-main" style="color: #000000;">${recipientName || 'زبوننا العزيز'}</strong> <span class="text-muted" style="font-size: 12px; color: #A1A1AA;">(${recipientEmail})</span><br/>
                        <span class="text-muted" style="color: #71717A;">الرقم المرجعي:</span> <strong style="font-family: monospace; color: #0044FF; font-size: 15px;">${referenceId}</strong><br/>
                        <span class="text-muted" style="color: #71717A;">التاريخ:</span> <strong class="text-main" style="color: #000000;">${formattedDate}</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- PRODUCT DETAILS -->
              <tr>
                <td class="content-pad" align="right" dir="rtl" style="padding: 0 40px 32px 40px;">
                  ${imageHtml}
                  <h2 class="text-main" style="font-family: ${FONT_STACK}; font-size: 18px; font-weight: 700; color: #000000; margin: 0 0 10px 0; line-height: 1.4;">
                    ${productTitle}
                  </h2>
                  <p class="text-muted" style="font-family: ${FONT_STACK}; font-size: 15px; color: #3F3F46; margin: 0; line-height: 1.7;">
                    ${productDesc}
                  </p>
                  ${featuresHtml}
                </td>
              </tr>

              <!-- ACTION BUTTON (CENTERED) -->
              <tr>
                <td class="content-pad" align="center" style="padding: 0 40px 40px 40px;">
                  ${resourceLink ? `
                    <table border="0" cellspacing="0" cellpadding="0" style="border-collapse: separate;">
                      <tr>
                        <td align="center" bgcolor="#0044FF" style="background-color: #0044FF; border-radius: 100px;">
                          <a href="${resourceLink}" target="_blank" style="font-family: ${FONT_STACK}; font-size: 16px; font-weight: 700; color: #FFFFFF; text-decoration: none; padding: 16px 36px; display: inline-block; border-radius: 100px;">
                            تحميل المنتج الرقمي
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p class="text-muted" style="font-family: ${FONT_STACK}; font-size: 11px; color: #A1A1AA; margin: 16px 0 0 0; line-height: 1.6; text-align: center;">
                      * يرجى حفظ الملف في حسابك على Google Drive للوصول إليه دائماً.
                    </p>
                  ` : `
                    <table class="bg-box" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 100px; width: 100%; border-collapse: separate;">
                      <tr>
                        <td align="center" style="padding: 16px 24px;">
                          <span class="text-main" style="font-family: ${FONT_STACK}; font-size: 15px; font-weight: 700; color: #000000;">
                            تم تسجيل طلبك! سيتواصل معك فريقنا قريباً لإتمام التسليم.
                          </span>
                        </td>
                      </tr>
                    </table>
                  `}
                </td>
              </tr>

              <!-- FOOTER (CENTERED) -->
              <tr>
                <td class="content-pad border-subtle" align="center" style="padding: 28px 40px; border-top: 1px solid #E4E4E7; background-color: transparent;">
                  <p class="text-main" style="font-family: ${FONT_STACK}; font-size: 13px; font-weight: bold; color: #000000; margin: 0 0 6px 0;">Boostra Agency</p>
                  <p class="text-muted" style="font-family: ${FONT_STACK}; font-size: 12px; color: #71717A; margin: 0 0 14px 0;">إدارة الحملات الإعلانية الممولة</p>
                  <p class="text-muted" style="font-family: ${FONT_STACK}; font-size: 11px; color: #A1A1AA; margin: 0;">الجزائر العاصمة، الجزائر 🇩🇿 | <a href="${appUrl}" style="color: #0044FF; text-decoration: none;">boostraagency.org</a></p>
                </td>
              </tr>
              
            </table>
            
          </td>
        </tr>
      </table>
      ${trackingPixel}
    </body>
    </html>
  `;
};