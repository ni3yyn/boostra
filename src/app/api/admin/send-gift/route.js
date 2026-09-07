// src/app/api/admin/send-gift/route.js
import { NextResponse } from 'next/server';
import { getEmailTransporter, generateBoostraStoreOrderEmailHtml } from '../../../../lib/emailService';
import { getCorsHeaders, withCors } from '../../../../lib/cors';

export async function POST(req) {
  console.log('\n================== 🚀 [STORE GIFT DELIVERY API] ==================');
  try {
    const payload = await req.json();
    const { 
      name, 
      email, 
      productTitle, 
      downloadUrl, 
      resourceLink, 
      productDesc, 
      productFeatures, 
      productImage, 
      priceText 
    } = payload;

    console.log(`[GIFT API] 📩 Recipient: ${email} (${name || 'No Name'})`);
    console.log(`[GIFT API] 📦 Resource Requested: "${productTitle}"`);

    if (!email || !productTitle) {
      console.error('[GIFT API] ❌ Validation Error: Missing email or productTitle');
      return withCors(NextResponse.json({ error: 'البيانات الأساسية للطلب ناقصة' }, { status: 400 }));
    }

    const transporter = getEmailTransporter();

    // اختيار رابط المورد الرقمي (Google Drive)
    const finalAssetLink = resourceLink || downloadUrl || '';

    // توليد قالب البريد الفخم الأبيض الانسيابي الشامل للبيانات وباترن البراند
    const html = generateBoostraStoreOrderEmailHtml({
      recipientName: name || 'زبوننا العزيز',
      recipientEmail: email,
      productTitle: productTitle,
      productDesc: productDesc || 'نشكرك على طلب هذا المورد الرقمي عبر متجر Boostra Agency الرسمي. تم تجهيز رابط الوصول المباشر الخاص بك.',
      productFeatures: productFeatures || [],
      productImage: productImage || '',
      priceText: priceText || 'مورد مجاني',
      resourceLink: finalAssetLink,
      orderDate: new Date().toLocaleString('ar-DZ', { timeZone: 'Africa/Algiers' }),
    });

    // إرسال البريد عبر سيرفر Octenium المعتمد (contact@boostraagency.org)
    const sendResult = await transporter.sendMail({
      from: `"Boostra Agency" <${process.env.SMTP_USER || 'contact@boostraagency.org'}>`,
      to: email,
      subject: `تم تجهيز طلبك: ${productTitle} — Boostra Agency`,
      html: html,
    });

    console.log(`[GIFT API] ✅ Asset Email Delivered to ${email} | MessageId: ${sendResult.messageId}`);
    console.log('==================================================================\n');

    return withCors(NextResponse.json({
      success: true, 
      message: 'تم تسليم المورد للبريد الإلكتروني بنجاح',
      messageId: sendResult.messageId
    }));

  } catch (error) {
    console.error('\n[GIFT API ERROR] 💥 Details:', error);
    console.log('==================================================================\n');

    return withCors(NextResponse.json({
      error: error.message || 'فشل إرسال الإيميل عبر خادم البريد',
      code: error.code || 'UNKNOWN'
    }, { status: 500 }));
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders() });
}