export const RouterPaths = {
	HOME: '/',
	LOGIN: '/login',
	PROFILE: '/profile',
} as const;

export type TRouterPaths = (typeof RouterPaths)[keyof typeof RouterPaths];
