'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export interface TelegramUser {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
	language_code?: string;
}

interface TelegramContextValue {
	user: TelegramUser | null;
	webApp: typeof WebApp | null;
}

const TelegramContext = createContext<TelegramContextValue>({ user: null, webApp: null });

export function TelegramProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<TelegramUser | null>(null);
	const [webApp, setWebApp] = useState<typeof WebApp | null>(null);

	useEffect(() => {
		// Only execute on the client side
		if (typeof window !== 'undefined') {
			import('@twa-dev/sdk').then((twa) => {
				const app = twa.default;
				app.ready();
				setWebApp(app);

				// Extract initDataUnsafe
				if (app.initDataUnsafe?.user) {
					setUser(app.initDataUnsafe.user as TelegramUser);
				}
			});
		}
	}, []);

	return (
		<TelegramContext.Provider value={{ user, webApp }}>
			{children}
		</TelegramContext.Provider>
	);
}

export function useTelegram() {
	return useContext(TelegramContext);
}
