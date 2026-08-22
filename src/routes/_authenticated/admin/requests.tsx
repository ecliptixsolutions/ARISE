import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/requests")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/enquiries" });
  },
});
