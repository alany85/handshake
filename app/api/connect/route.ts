import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { Telegraf } from 'telegraf';

export const dynamic = 'force-dynamic';

let bot: Telegraf;

export async function POST(req: NextRequest) {
	try {
		if (!bot) {
			bot = new Telegraf(process.env.BOT_TOKEN || 'dummy:token');
		}
		const formData = await req.formData();

		const scanner_tg_id = formData.get('scanner_tg_id') as string;
		const scanned_tg_id = formData.get('scanned_tg_id') as string;
		const message = formData.get('message') as string;
		const photo = formData.get('photo') as File | null;

		if (!scanner_tg_id || !scanned_tg_id || !photo) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// 1. Upload photo to Supabase
		const bytes = await photo.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Generate unique filename
		const fileExt = photo.name.split('.').pop() || 'jpg';
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
		const filePath = `connections/${fileName}`;

		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('photos')
			.upload(filePath, buffer, {
				contentType: photo.type || 'image/jpeg',
				cacheControl: '3600',
				upsert: false
			});

		if (uploadError) {
			console.error('Supabase upload error:', uploadError);
			return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
		}

		// Get public URL
		const { data: { publicUrl } } = supabase.storage
			.from('photos')
			.getPublicUrl(filePath);

		// 2. Insert into database
		const { data: dbData, error: dbError } = await supabase
			.from('connections')
			.insert([
				{
					scanner_tg_id,
					scanned_tg_id,
					message,
					image_url: publicUrl,
				}
			])
			.select()
			.single();

		if (dbError) {
			console.error('Database insert error:', dbError);
			return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 });
		}

		// 3. Send Telegram Messages to both users
		const caption = `🤝 New Connection!\n\nMessage: "${message}"\n\nNice meeting you!`;

		// Use Promise.allSettled to ensure failure on one doesn't crash the other,
		// though ideally we notify both.
		const results = await Promise.allSettled([
			bot.telegram.sendPhoto(scanner_tg_id, publicUrl, { caption }),
			bot.telegram.sendPhoto(scanned_tg_id, publicUrl, { caption })
		]);

		// Log if there's any telegram sending issue (usually user blocked bot, or not started)
		results.forEach((res, index) => {
			if (res.status === 'rejected') {
				console.error(`Failed to send TG message to ${index === 0 ? 'scanner' : 'scanned'}:`, res.reason);
			}
		});

		return NextResponse.json({ success: true, connection: dbData }, { status: 200 });

	} catch (error: any) {
		console.error('API Error:', error);
		return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
	}
}
