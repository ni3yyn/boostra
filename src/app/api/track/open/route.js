// app/api/track/open/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('id');

  if (leadId) {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, {
        emailOpened: true,
        openCount: increment(1),
        lastOpenedAt: serverTimestamp(),
      });
    } catch (err) {}
  }

  // إرجاع صورة شفافة مجهرية 1x1 بكسل
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  return new NextResponse(pixel, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
