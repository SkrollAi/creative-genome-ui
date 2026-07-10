"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginForm() {
  const setAuthParams = useAuthStore((state) => state.setAuthParams);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/creative_genome/login/send_otp", {
        email: email.trim(),
      });
      if (!data.success) {
        toast.error(data.error, {
          action:
            data.signupUrl || data.connectUrl
              ? {
                  label: "Connect",
                  onClick: () =>
                    window.open(data.signupUrl ?? data.connectUrl, "_blank"),
                }
              : undefined,
        });
        return;
      }
      setOtpSent(true);
      toast.success("OTP sent");
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/creative_genome/login/verify_otp", {
        email: email.trim(),
        otp: otp.trim(),
      });
      if (!data.success) {
        toast.error(data.error, {
          action:
            data.signupUrl || data.connectUrl
              ? {
                  label: "Sign Up",
                  onClick: () =>
                    window.open(data.signupUrl ?? data.connectUrl, "_blank"),
                }
              : undefined,
        });
        return;
      }
      setAuthParams(data.userId);
    } catch {
      toast.error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otpSent) {
      handleVerifyOtp();
    } else {
      handleSendOtp();
    }
  }

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>
          {otpSent
            ? `Enter the code sent to ${email.trim()}`
            : "Enter your email to receive a one-time code"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoFocus
              value={email}
              disabled={otpSent}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {otpSent && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="otp">One-time code</Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                >
                  Change email
                </button>
              </div>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {otpSent ? "Verify code" : "Send code"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
