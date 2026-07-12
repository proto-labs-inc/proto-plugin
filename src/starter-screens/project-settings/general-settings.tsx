import { BookOpen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, Input } from "ui";

export function GeneralSettings() {
  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-[768px] px-6 xl:px-10 pt-12 pb-32">
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-2xl text-foreground">Project Settings</h1>
          <p className="text-sm text-foreground-light">
            General configuration, domains, ownership, and lifecycle
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg text-foreground">General settings</h2>

          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col gap-4 md:flex-row-reverse md:items-center md:justify-between">
                <div className="w-full md:w-1/2">
                  <Input readOnly value="Default Project" />
                </div>
                <label className="text-sm text-foreground">Project name</label>
              </div>
            </CardContent>
          </Card>

          <Alert variant="default">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 21 20"
              className="w-6 h-6 shrink-0"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.625 9.8252C0.625 4.44043 4.99023 0.0751953 10.375 0.0751953C15.7598 0.0751953 20.125 4.44043 20.125 9.8252C20.125 15.21 15.7598 19.5752 10.375 19.5752C4.99023 19.5752 0.625 15.21 0.625 9.8252ZM9.3584 4.38135C9.45117 4.28857 9.55518 4.20996 9.66699 4.14648C9.88086 4.02539 10.1245 3.96045 10.375 3.96045C10.5845 3.96045 10.7896 4.00586 10.9766 4.09229C11.1294 4.1626 11.2705 4.26025 11.3916 4.38135C11.6611 4.65088 11.8125 5.0166 11.8125 5.39795C11.8125 5.5249 11.7959 5.6499 11.7637 5.77002C11.6987 6.01172 11.5718 6.23438 11.3916 6.41455C11.1221 6.68408 10.7563 6.83545 10.375 6.83545C9.99365 6.83545 9.62793 6.68408 9.3584 6.41455C9.08887 6.14502 8.9375 5.7793 8.9375 5.39795C8.9375 5.29492 8.94873 5.19287 8.97021 5.09375C9.02783 4.82568 9.16162 4.57812 9.3584 4.38135ZM10.375 15.6899C10.0933 15.6899 9.82275 15.5781 9.62354 15.3789C9.42432 15.1797 9.3125 14.9092 9.3125 14.6274V9.31494C9.3125 9.0332 9.42432 8.7627 9.62354 8.56348C9.82275 8.36426 10.0933 8.25244 10.375 8.25244C10.6567 8.25244 10.9272 8.36426 11.1265 8.56348C11.3257 8.7627 11.4375 9.0332 11.4375 9.31494V14.6274C11.4375 14.7944 11.3979 14.9575 11.3242 15.104C11.2739 15.2046 11.2075 15.2979 11.1265 15.3789C10.9272 15.5781 10.6567 15.6899 10.375 15.6899Z"
              />
            </svg>
            <div className="flex w-full flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <AlertTitle>Self-hosted Supabase</AlertTitle>
                <AlertDescription>
                  Project settings are configured via environment variables.
                </AlertDescription>
              </div>
              <Button
                type="button"
                variant="default"
                size="tiny"
                className="shrink-0"
                icon={<BookOpen size={14} />}
              >
                Docs
              </Button>
            </div>
          </Alert>
        </section>
      </div>
    </div>
  );
}
