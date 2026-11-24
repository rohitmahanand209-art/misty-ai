import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Sign up",
  description: "Create a free Misty AI account and start making AI videos.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
