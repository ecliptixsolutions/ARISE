import { createFileRoute } from "@tanstack/react-router";
import { RepairRequestsPage } from "./repairs";

export const Route = createFileRoute("/_authenticated/admin/repair-requests")({
  component: RepairRequestsPage,
});
