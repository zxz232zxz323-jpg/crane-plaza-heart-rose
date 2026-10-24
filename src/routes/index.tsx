import { createFileRoute } from "@tanstack/react-router";
import { InvoiceDesk } from "@/components/invoice-desk";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <InvoiceDesk />;
}
