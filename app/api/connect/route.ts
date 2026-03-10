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
		let raw_scanned_tg_id = formData.get('scanned_tg_id') as string;

		let scanned_id_for_db = raw_scanned_tg_id;
		let scanned_username = '';

		// 1. qrData 包含 | (例如 "123456789|alanvanderboo")
		if (raw_scanned_tg_id.includes('|')) {
			const parts = raw_scanned_tg_id.split('|');
			scanned_id_for_db = parts[0];
			scanned_username = parts[1] || '';
		}
		// 2. 扫的是 Bot 生成的带参数链接 (https://t.me/Bot?start=123456)
		else if (raw_scanned_tg_id.includes('start=')) {
			scanned_id_for_db = raw_scanned_tg_id.split('start=')[1].split('&')[0];
		}
		// 3. 扫的是个人资料链接 (https://t.me/alanvanderboo)
		else if (raw_scanned_tg_id.includes('t.me/')) {
			scanned_username = raw_scanned_tg_id.split('t.me/')[1].split('/')[0].split('?')[0];
			scanned_id_for_db = `@${scanned_username}`;
		} 
		// 4. 用户名 (@alanvanderboo)
		else if (raw_scanned_tg_id.startsWith('@')) {
			scanned_username = raw_scanned_tg_id.substring(1);
			scanned_id_for_db = raw_scanned_tg_id;
		}

		const message = formData.get('message') as string;
		const photo = formData.get('photo') as File | null;

		if (!scanner_tg_id || !scanned_id_for_db || !photo) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// --- Fetch real profiles from Telegram ---
		let scannerName = "Someone";
		let scannerUsername = "";
		try {
			const scannerChat = await bot.telegram.getChat(scanner_tg_id) as any;
			scannerName = [scannerChat.first_name, scannerChat.last_name].filter(Boolean).join(' ') || "Someone";
			scannerUsername = scannerChat.username || '';
		} catch (e) {
			console.log('Could not fetch scanner profile', e);
		}

		let scannedName = "the person you scanned";
		try {
			const scannedChat = await bot.telegram.getChat(scanned_id_for_db) as any;
			scannedName = [scannedChat.first_name, scannedChat.last_name].filter(Boolean).join(' ') || scannedName;
			scanned_username = scannedChat.username || scanned_username;
		} catch (e) {
			console.log('Could not fetch scanned profile', e);
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
					scanner_tg_id: scanner_tg_id,
					scanned_tg_id: scanned_id_for_db,
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
		const preFilledText = encodeURIComponent(`Hey! Nice to meet you at the event! 🚀\n\nMessage: "${message}"\n\nHere is our photo.`);

		// 构建给 Scanner 的消息 Keyboard
		let scannerMarkup = undefined;
		if (scanned_username) {
			scannerMarkup = {
				inline_keyboard: [[
					{ 
						text: `💬 Chat with ${scannedName}`, 
						url: `https://t.me/${scanned_username}?text=${preFilledText}` 
					}
				]]
			};
		}

		// 构建给 Scanned 的消息 Keyboard
		let scannedMarkup = undefined;
		if (scannerUsername) {
			scannedMarkup = {
				inline_keyboard: [[
					{
						text: `💬 Chat with ${scannerName}`,
						url: `https://t.me/${scannerUsername}?text=${preFilledText}`
					}
				]]
			};
		}

		// Use Promise.allSettled to ensure failure on one doesn't crash the other
		const results = await Promise.allSettled([
			// 1. 给 Scanner (扫码的人 - 你) 发送
			bot.telegram.sendPhoto(scanner_tg_id, publicUrl, {
				caption: `✅ You connected with ${scannedName}!\n\nMessage: "${message}"`,
				reply_markup: scannerMarkup
			}),
			// 2. 给 Scanned (被扫的人 - 对方) 发送
			bot.telegram.sendPhoto(scanned_id_for_db, publicUrl, {
				caption: `📸 New connection! ${scannerName} just scanned you.\n\nMessage: "${message}"`,
				reply_markup: scannedMarkup
			})
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
