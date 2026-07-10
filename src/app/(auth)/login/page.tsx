import LoginForm from "./ui/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">
              CG
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-lg leading-tight">
              Creative Genome
            </span>
            <span className="text-sm text-muted-foreground leading-tight">
              Analyze what works
            </span>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
