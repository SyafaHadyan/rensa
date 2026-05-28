import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/axios-client";
import VerifiedClient from "./VerifiedClient";

export const metadata: Metadata = {
	title: "Email Verification",
	description: "Verify your email address for your Rensa account.",
	robots: {
		index: false,
		follow: false,
	},
};

async function checkTokenValidity(token?: string) {
	const secret = process.env.NEXTAUTH_SECRET;
	if (!(token && secret)) {
		return false;
	}
	await api.post("/auth/verify-email", { token });
	return true;
}

export default async function VerifiedPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>;
}) {
	const { token } = await searchParams;
	const isValid = await checkTokenValidity(token);

	if (!isValid) {
		notFound();
	}

	return <VerifiedClient />;
}
