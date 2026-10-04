// File: /server/src/types/app-env.ts
export interface AuthUser {
	id: string;
	username: string;
}

export interface AppEnv {
	Variables: {
		user: AuthUser;
	};
}
