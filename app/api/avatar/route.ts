import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

export const dynamic = 'force-dynamic';

let bot: Telegraf;

export async function GET(req: NextRequest) {
	try {
		if (!bot) {
			bot = new Telegraf(process.env.BOT_TOKEN || 'dummy:token');
		}

		const tg_id = req.nextUrl.searchParams.get('id');
		if (!tg_id) {
			return new NextResponse(null, { status: 400 });
		}

		const photos = await bot.telegram.getUserProfilePhotos(Number(tg_id), 0, 1);
		
		if (photos.total_count > 0) {
			const fileId = photos.photos[0][0].file_id;
			const fileLink = await bot.telegram.getFileLink(fileId);
			
			const imageRes = await fetch(fileLink.href);
			const buffer = await imageRes.arrayBuffer();

			return new NextResponse(buffer, {
				headers: {
					'Content-Type': 'image/jpeg',
					'Cache-Control': 'public, max-age=86400'
				}
			});
		}

		// Fallback to a blank image or 404
		return new NextResponse(null, { status: 404 });
	} catch (error) {
		console.error('Avatar fetch error:', error);
		return new NextResponse(null, { status: 500 });
	}
}
