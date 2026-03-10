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
		if (!tg_id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

		const chat = await bot.telegram.getChat(tg_id) as any;
		
		const name = [chat.first_name, chat.last_name].filter(Boolean).join(' ') || `User ${tg_id}`;
		const handle = chat.username || tg_id;
		
		return NextResponse.json({ name, handle, success: true });
	} catch (error: any) {
		console.error('Fetch profile error:', error);
		return NextResponse.json({ error: error.message || 'Error fetching profile' }, { status: 500 });
	}
}
