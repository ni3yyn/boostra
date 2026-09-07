// app/api/admin/send-email/route.js
import { NextResponse } from 'next/server';
import { getEmailTransporter, generateBoostraEmailHtml } from '@/lib/emailService';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req) {
  console.log('\n================== 🚀 [EMAIL API TRIGGERED] ==================');
  try {
    const payload = await req.json();
    const { recipients, subject, body, ctaText, ctaUrl } = payload;

    console.log(`[EMAIL API] 📩 Recipients count: ${recipients?.length || 0}`);
    console.log(`[EMAIL API] 📝 Subject: "${subject}"`);

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      console.error('[EMAIL API] ❌ Validation Error: No recipients provided');
      return NextResponse.json({ error: 'لم يتم تحديد أي مستلم صالح' }, { status: 400 });
    }

    if (!subject || !body) {
      console.error('[EMAIL API] ❌ Validation Error: Missing subject or body');
      return NextResponse.json({ error: 'العنوان ومحتوى الرسالة مطلوبان' }, { status: 400 });
    }

    const transporter = getEmailTransporter();

    // 1. فحص الاتصال بالـ SMTP
    console.log('[EMAIL API] ⏳ Verifying connection to Octenium SMTP server...');
    await transporter.verify();
    console.log('[EMAIL API] ✅ SMTP Handshake & Login Verified Successfully!');

    let sentCount = 0;
    let failedCount = 0;
    const errorsList = [];

    // 2. إرسال الرسائل تباعاً
    for (const r of recipients) {
  if (!r.email) continue;

  try {
    // 1. استخراج بيانات الزبون مع وضع قيم افتراضية راقية إن كانت فارغة
    const clientName = r.name && r.name.trim() ? r.name.trim() : 'زبوننا العزيز';
    const clientPack = r.pack && r.pack.trim() ? r.pack.trim() : 'باقة الميديا باينغ';

    // 2. استبدال المتغيرات {{name}} و {{pack}} في العنوان والمحتوى
    const parsedSubject = subject
      .replace(/{{name}}/g, clientName)
      .replace(/{{pack}}/g, clientPack);

    const parsedBody = body
      .replace(/{{name}}/g, clientName)
      .replace(/{{pack}}/g, clientPack);

    // 3. بناء قالب HTML بالبيانات الشخصية المستبدلة
    const html = generateBoostraEmailHtml({
      recipientName: clientName,
      title: parsedSubject,
      bodyContent: parsedBody,
      ctaText: ctaText || '',
      ctaUrl: ctaUrl || '',
      trackingId: r.id || null,
    });

    await transporter.sendMail({
      from: `"Boostra Agency" <${process.env.SMTP_USER || 'contact@boostraagency.org'}>`,
      to: r.email,
      subject: parsedSubject, // <-- عنوان مخصص باسم الزبون
      html: html,
    });

    sentCount++;

    if (r.id && db && doc && updateDoc) {
      try {
        await updateDoc(doc(db, 'leads', r.id), {
          lastEmailSentAt: serverTimestamp(),
          lastEmailSubject: parsedSubject,
        });
      } catch (dbErr) {}
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  } catch (sendErr) {
    console.error(`[EMAIL API] ❌ Failed to send to ${r.email}:`, sendErr.message);
    failedCount++;
  }
}

    console.log(`[EMAIL API] 🏁 Finished! Sent: ${sentCount} | Failed: ${failedCount}`);
    console.log('==============================================================\n');

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      errorsList,
      message: `تم إرسال ${sentCount} إيميل بنجاح!`,
    });

  } catch (error) {
    console.error('\n[EMAIL API FATAL ERROR] 💥 Stack:', error);
    console.log('==============================================================\n');

    return NextResponse.json({ 
      error: error.message || 'فشل الاتصال بخادم البريد',
      code: error.code || 'UNKNOWN',
      command: error.command || 'UNKNOWN',
      response: error.response || 'No SMTP response'
    }, { status: 500 });
  }
}