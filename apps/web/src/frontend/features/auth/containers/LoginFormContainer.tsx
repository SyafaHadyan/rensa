"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useLoading } from "@/frontend/features/common/hooks/use-loading";
import { sanitizeInput } from "@/lib/validation";
import LoginFormView, {
	type LoginFormState,
} from "../components/LoginFormView";

const initialLoginState: LoginFormState = {
	email: "",
	password: "",
};

const normalizeRedirectPath = (url: string | undefined): string => {
	if (!url) {
		return "/explore";
	}

	try {
		const parsed = new URL(url, window.location.origin);
		const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
		return path || "/explore";
	} catch {
		return "/explore";
	}
};

const LoginFormContainer = () => {
	const [form, setForm] = useState<LoginFormState>(initialLoginState);
	const [error, setError] = useState("");
	const { setLoading } = useLoading();
	const searchParams = useSearchParams();
	const infoMessage = sanitizeInput(searchParams.get("message") || "");
	const displayMessage = error ? "" : infoMessage;

	const validateForm = () => {
		if (!form.email.trim()) {
			return "Email is required";
		}
		if (!form.password.trim()) {
			return "Password is required";
		}
		if (!form.email.includes("@")) {
			return "Invalid email format";
		}
	};

	const handleChange = (field: keyof LoginFormState, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const errorMessage = validateForm();
		if (errorMessage) {
			setError(errorMessage);
			return;
		}

		setLoading(true);
		const result = await signIn("credentials", {
			email: form.email,
			password: form.password,
			redirect: false,
			callbackUrl: "/explore",
		});
		if (result?.error) {
			setError(result.error);
		} else {
			window.location.href = normalizeRedirectPath(result?.url);
		}
		setLoading(false);
	};

	return (
		<LoginFormView
			error={error}
			message={displayMessage}
			onChange={handleChange}
			onSubmit={handleSubmit}
			values={form}
		/>
	);
};

export default LoginFormContainer;
