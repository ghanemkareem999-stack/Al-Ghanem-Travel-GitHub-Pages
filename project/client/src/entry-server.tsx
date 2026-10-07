import { QueryClient, QueryClientProvider, dehydrate } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { renderToString } from "react-dom/server";
import superjson from "superjson";
import { Router } from "wouter";
import App from "./App";
import { getLocaleFromPath } from "@/lib/localePaths";
import { getSsrHead, type SsrHead } from "./ssr/metadata";
import { trpc } from "./lib/trpc";

export type SsrRenderResult = { html: string; dehydratedState: unknown; head: SsrHead };

export async function render(url: string): Promise<SsrRenderResult> {
  const question = url.indexOf("?");
  const ssrPath = question === -1 ? url : url.slice(0, question);
  const ssrSearch = question === -1 ? "" : url.slice(question + 1);
  const initialLocale = getLocaleFromPath(ssrPath);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
  const trpcClient = trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })] });
  const html = renderToString(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Router ssrPath={ssrPath} ssrSearch={ssrSearch}><App initialLocale={initialLocale} /></Router>
      </QueryClientProvider>
    </trpc.Provider>
  );
  return { html, dehydratedState: dehydrate(queryClient), head: getSsrHead(url) };
}
