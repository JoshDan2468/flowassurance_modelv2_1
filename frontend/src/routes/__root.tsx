import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/layouts/app-sidebar";
import { TopNav } from "@/layouts/top-nav";
import { Toaster } from "@/components/ui/sonner";
import { publicRoutes } from "@/routes/-routes";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FAIP — Flow Assurance Intelligence Platform" },
      {
        name: "description",
        content:
          "Predictive flow assurance for subsea pipelines: hydrates, wax, asphaltenes, slugging, corrosion and restart safety.",
      },
      { name: "author", content: "FAIP" },
      { property: "og:title", content: "FAIP — Flow Assurance Intelligence Platform" },
      {
        property: "og:description",
        content:
          "Predictive flow assurance for subsea pipelines: hydrates, wax, asphaltenes, slugging, corrosion and restart safety.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "FAIP — Flow Assurance Intelligence Platform" },
      {
        name: "twitter:description",
        content:
          "Predictive flow assurance for subsea pipelines: hydrates, wax, asphaltenes, slugging, corrosion and restart safety.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/70cae153-e40c-4040-9920-bc9590086cb6/id-preview-69bea24e--4d4964b4-40f3-4473-aece-add34153c49c.lovable.app-1780133765498.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/70cae153-e40c-4040-9920-bc9590086cb6/id-preview-69bea24e--4d4964b4-40f3-4473-aece-add34153c49c.lovable.app-1780133765498.png",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isPublicRoute = (publicRoutes as readonly string[]).includes(currentPath);

  return (
    <QueryClientProvider client={queryClient}>
      {isPublicRoute ? (
        <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          {/* Public pages render here: home, login, register, and password reset. */}
          <Outlet />
        </main>
      ) : (
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <SidebarInset className="flex min-w-0 flex-1 flex-col bg-transparent">
              <TopNav />
              <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {/* Dashboard pages render here after the user signs in. */}
                <Outlet />
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      )}
      <Toaster position="top-right" richColors theme="dark" />
    </QueryClientProvider>
  );
}
