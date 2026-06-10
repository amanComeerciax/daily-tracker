import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="animate-fade-in">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border border-border",
            },
          }}
        />
      </div>
    </div>
  );
}
