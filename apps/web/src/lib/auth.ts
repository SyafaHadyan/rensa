import { DrizzleAdapter } from "@auth/drizzle-adapter";
import db from "@rensa/db";
import {
	authAccounts,
	authSessions,
	authUsers,
	authVerificationTokens,
} from "@rensa/db/schema";
import bcrypt from "bcryptjs";
import type {
	DefaultSession,
	DefaultUser,
	NextAuthOptions,
	Session,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { userService } from "../backend/services/users/service";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
		user: {
			id: string;
			provider?: string;
			role?: string;
		} & DefaultSession["user"];
	}

	interface User extends DefaultUser {
		accessToken?: string;
		id: string;
		role?: string;
	}
}

export const authOptions: NextAuthOptions = {
	adapter: DrizzleAdapter(db, {
		accountsTable: authAccounts,
		sessionsTable: authSessions,
		usersTable: authUsers,
		verificationTokensTable: authVerificationTokens,
	}),
	providers: [
		CredentialsProvider({
			name: "Credentials",
			id: "credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},

			async authorize(credentials) {
				if (!(credentials?.email && credentials?.password)) {
					throw new Error("Email and password are required");
				}

				const user = await userService.getByEmail(credentials.email);
				if (!user) {
					throw new Error("Invalid email or password");
				}
				// Temporarily disable email verification enforcement.
				if (!user.verified) {
					throw new Error(
						"Email not verified. We’ve sent a verification email to your email address."
					);
				}
				const isValid = await bcrypt.compare(
					credentials.password,
					user.password
				);
				if (!isValid) {
					throw new Error("Invalid email or password");
				}

				return {
					id: user.userId,
					name: user.username,
					email: user.email,
					role: user.role,
				};
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60, // rotate token only once every 24 hours
	},
	callbacks: {
		async jwt({ token, account, user }) {
			if (account) {
				token.accessToken = account.access_token;
				token.provider = account.provider;
			}
			if (user?.accessToken) {
				token.accessToken = user.accessToken;
			}
			if (user) {
				token.id = user.id;
				token.name = user.name;
				token.email = user.email;
				token.role = user.role;
			}
			if (token.email) {
				const appUser = await userService.getByEmail(token.email);
				if (appUser) {
					token.id = appUser.userId;
					token.name = appUser.username;
					token.role = appUser.role;
				}
			}
			return token;
		},
		session({ session, token }) {
			if (token) {
				session.user = {
					...(session.user as Session["user"]),
					id: token.id as string,
					name: token.name,
					email: token.email,
					provider: token.provider as string | undefined,
					role: token.role as string | undefined,
				};
				session.accessToken = token.accessToken as string;
			}
			return session;
		},
	},
	pages: {
		signIn: "/login",
		signOut: "/logout",
		error: "/not-found",
	},
	debug: process.env.NODE_ENV === "development",
};
