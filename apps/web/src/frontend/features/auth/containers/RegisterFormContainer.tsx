"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useLoading } from "@/frontend/features/common/hooks/use-loading";
import { api } from "@/lib/axios-client";
import RegisterFormView, {
	type RegisterFormState,
} from "../components/RegisterFormView";

const initialFormState: RegisterFormState = {
	username: "",
	email: "",
	password: "",
	confirmPassword: "",
};

interface RegisterResponse {
	message?: string;
	verificationEmailSent?: boolean;
}

const RegisterFormContainer = () => {
	const [form, setForm] = useState<RegisterFormState>(initialFormState);
	const [error, setError] = useState("");
	const router = useRouter();
	const { setLoading } = useLoading();

	const validateForm = () => {
		if (form.password !== form.confirmPassword) {
			return "Passwords do not match";
		}
		if (!form.email.trim()) {
			return "Email is required";
		}
		if (!form.password.trim()) {
			return "Password is required";
		}
		if (!form.username.trim()) {
			return "Username is required";
		}
		if (!form.email.includes("@")) {
			return "Invalid email format";
		}
	};

	const handleChange = (field: keyof RegisterFormState, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const errorMessage = validateForm();
		if (errorMessage) {
			setError(errorMessage);
			return;
		}

		setLoading(true);
		try {
			const response = await api.post<RegisterResponse>("/auth/register", form);
			await signIn("credentials", {
				email: form.email,
				password: form.password,
				redirect: false,
			});

			const message = encodeURIComponent(
				response.data.verificationEmailSent === false
					? "Account created, but verification email failed to send. Please request a new verification email."
					: "Sent a verification to your email. Please verify to continue."
			);
			router.push(`/login?message=${message}`);
		} catch (errorValue) {
			if (axios.isAxiosError(errorValue)) {
				setError(
					errorValue.response?.data?.message ||
						"Something went wrong. Please try again."
				);
				return;
			}
			setError("Unknown error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<RegisterFormView
			error={error}
			form={form}
			onChange={handleChange}
			onSubmit={handleSubmit}
		/>
	);
};

export default RegisterFormContainer;
