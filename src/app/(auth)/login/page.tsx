import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Log in",
  description: "Log in to your Misty AI studio and continue creating videos.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
