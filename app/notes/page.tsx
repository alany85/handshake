'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/components/TelegramProvider';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';

interface Connection {
	id: string;
	scanner_tg_id: string;
	scanned_tg_id: string;
	message: string;
	image_url: string;
	created_at: string;
}

export default function NotesPage() {
	const { user } = useTelegram();
	const [connections, setConnections] = useState<Connection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!user) {
			setLoading(false);
			return;
		}

		const fetchConnections = async () => {
			try {
				const { data, error: dbError } = await supabase
					.from('connections')
					.select('*')
					.or(`scanner_tg_id.eq.${user.id},scanned_tg_id.eq.${user.id}`)
					.order('created_at', { ascending: false });

				if (dbError) throw dbError;

				setConnections(data || []);
			} catch (err: any) {
				console.error('Fetch error:', err);
				setError('Failed to load connections.');
			} finally {
				setLoading(false);
			}
		};

		fetchConnections();
	}, [user]);

	if (loading) {
		return (
			<main className="p-4 flex justify-center items-center min-h-[50vh]">
				<svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			</main>
		);
	}

	if (!user) {
		return (
			<main className="p-4 text-center mt-20 text-gray-500">
				Please open this app inside Telegram to view your connections.
			</main>
		);
	}

	return (
		<main className="max-w-md mx-auto p-4 space-y-6">
			<header className="py-4 border-b border-gray-100">
				<h1 className="text-2xl font-bold text-gray-900">Connections</h1>
				<p className="text-gray-500 text-sm mt-1">Look back at the people you've met.</p>
			</header>

			{error ? (
				<div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
					{error}
				</div>
			) : connections.length === 0 ? (
				<div className="text-center py-10">
					<div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
						<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
					</div>
					<h2 className="text-lg font-medium text-gray-900 mb-1">No connections yet</h2>
					<p className="text-sm text-gray-500">Go to the Connect tab and scan your first QR code!</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4">
					{connections.map((conn) => {
						const isScanner = conn.scanner_tg_id === user.id.toString();
						const otherPersonId = isScanner ? conn.scanned_tg_id : conn.scanner_tg_id;
						const date = new Date(conn.created_at).toLocaleDateString('en-US', {
							month: 'short',
							day: 'numeric',
							year: 'numeric'
						});

						return (
							<div key={conn.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
								<div className="relative h-48 w-full bg-gray-100">
									<Image
										src={conn.image_url}
										alt={"Connection with " + otherPersonId}
										fill
										style={{ objectFit: 'cover' }}
									/>
									<div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded text-xs font-medium">
										{date}
									</div>
								</div>
								<div className="p-4">
									<p className="font-semibold text-gray-900 m-0 leading-tight">ID: {otherPersonId}</p>
									<div className="mt-3 bg-blue-50 text-blue-800 text-sm italic px-4 py-3 rounded-xl border border-blue-100">
										"{conn.message}"
									</div>
									<div className="mt-4 flex items-center text-xs text-gray-500 font-medium">
										<span className={`w-2 h-2 rounded-full mr-2 ${isScanner ? 'bg-green-400' : 'bg-purple-400'}`}></span>
										{isScanner ? 'You scanned them' : 'They scanned you'}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</main>
	);
}
