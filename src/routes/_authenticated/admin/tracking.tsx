/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Plus, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/integrations/mysql/client";
import { hasPermission } from "@/lib/admin-access";
import { locationLabel, repairLocations } from "@/lib/repair-workflow";
import {
  createRepairRequest,
  createRepairRequests,
  repairRequestSchema,
  type RepairRequestInput,
} from "@/lib/repair-requests";
import { repairStatusLabels } from "@/lib/site-data";
import { equipmentCategories } from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/admin/tracking")({
  component: Page,
});

type ImportIssue = {
  row: number;
  field: string;
  problem: string;
  correction: string;
};

type ImportValidRow = {
  row: number;
  data: RepairRequestInput;
};

type ImportPreview = {
  fileKey: string;
  totalRows: number;
  valid: ImportValidRow[];
  issues: ImportIssue[];
};

type ImportProgress = {
  message: string;
  percent: number;
  imported: number;
  skipped: number;
  failed: number;
};

const importColumns = [
  "full_name",
  "organisation",
  "mobile",
  "whatsapp",
  "email",
  "city",
  "state",
  "equipment_category",
  "equipment_name",
  "brand",
  "model_no",
  "serial_no",
  "problem_description",
  "urgency",
  "status",
  "current_location",
  "admin_notes",
] as const;

const requiredImportColumns = [
  "full_name",
  "mobile",
  "email",
  "equipment_name",
  "problem_description",
] as const;

const importAliases: Record<string, string[]> = {
  full_name: ["full_name", "name", "customer", "customer_name"],
  organisation: ["organisation", "organization", "company", "hospital"],
  mobile: ["mobile", "mobile_number", "phone", "customer_mobile"],
  whatsapp: ["whatsapp"],
  email: ["email", "customer_email"],
  city: ["city"],
  state: ["state"],
  equipment_category: ["equipment_category", "equipment_type", "category"],
  equipment_name: ["equipment_name", "equipment", "scope", "product"],
  brand: ["brand"],
  model_no: ["model_no", "model", "model_number"],
  serial_no: ["serial_no", "serial", "serial_number"],
  problem_description: ["problem_description", "problem", "issue", "description"],
  urgency: ["urgency", "priority"],
  status: ["status"],
  current_location: ["current_location", "location"],
  admin_notes: ["admin_notes", "notes"],
};

function Page() {
  const auth = useRouteContext({ from: "/_authenticated" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("");
  const [locationF, setLocationF] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [lastImportedFileKey, setLastImportedFileKey] = useState("");
  const canRead = hasPermission(auth, "tracking");
  const canImport = hasPermission(auth, "import_csv") || hasPermission(auth, "import_excel");
  const table = auth.isAdmin ? "repair_requests" : "repair_request_public_updates";
  const queryKey = useMemo(() => ["admin-tracking", table], [table]);

  const lastPollRef = useRef<number>(Date.now() - 8000);

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    enabled: canRead,
    queryFn: async () => {
      const { data, error } = await apiGet<any[]>("/api/repair-requests");
      if (error) throw new Error(error.message);
      return (data ?? []).sort(
        (a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ).slice(0, 500);
    },
  });

  // Polling replaces Supabase realtime
  useEffect(() => {
    if (!canRead) return;
    const interval = setInterval(async () => {
      const since = new Date(lastPollRef.current).toISOString();
      lastPollRef.current = Date.now();
      const { data: pollData } = await apiGet<{ changes: any[] }>("/api/poll", {
        since,
        tables: table,
      });
      if (pollData?.changes?.length) {
        void qc.invalidateQueries({ queryKey });
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [canRead, qc, queryKey, table]);

  const filtered = data.filter((r: any) => {
    const haystack = [
      r.request_code,
      r.full_name,
      auth.isAdmin ? r.mobile : "",
      auth.isAdmin ? r.email : "",
      r.equipment_name,
      r.equipment_category,
      r.brand,
      r.model_no,
      r.serial_no,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (
      (!q || haystack.includes(q.toLowerCase())) &&
      (!statusF || r.status === statusF) &&
      (!locationF || locationLabel(r.current_location) === locationF)
    );
  });

  if (!canRead) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        You do not have permission to view tracking.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Tracking</h1>
          {!isLoading && !isError && (
            <p className="text-sm text-muted-foreground">{filtered.length} tracking records</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Add Repair Request
          </button>
          {canImport && (
            <>
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-surface ${
                  importing ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <Upload className="h-4 w-4" /> Import CSV / Excel
                <input
                  type="file"
                  accept=".csv,.tsv,.xlsx,.xls"
                  className="hidden"
                  disabled={importing}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    event.currentTarget.value = "";
                    if (file) {
                      void prepareImport(
                        file,
                        setImporting,
                        setImportErrors,
                        setImportPreview,
                        setImportProgress,
                      );
                    }
                  }}
                />
              </label>
              <a
                href="/templates/repair-request-import-template.xlsx"
                download
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-surface"
              >
                <Download className="h-4 w-4" /> Excel Template
              </a>
            </>
          )}
        </div>
      </div>

      {importProgress && <ImportProgressPanel progress={importProgress} />}

      {importErrors.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {importErrors.slice(0, 8).map((error) => (
            <div key={error}>{error}</div>
          ))}
        </div>
      )}

      {importPreview && (
        <ImportPreviewPanel
          preview={importPreview}
          importing={importing}
          onCancel={() => {
            setImportPreview(null);
            setImportErrors([]);
            setImportProgress(null);
          }}
          onImport={() =>
            confirmImport(
              importPreview,
              lastImportedFileKey,
              setLastImportedFileKey,
              setImporting,
              setImportErrors,
              setImportPreview,
              setImportProgress,
              qc,
              queryKey,
            )
          }
        />
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tracking ID, customer, mobile, equipment..."
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm"
          />
        </div>
        <select
          value={statusF}
          onChange={(e) => setStatusF(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          {Object.entries(repairStatusLabels).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={locationF}
          onChange={(e) => setLocationF(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
        >
          <option value="">All locations</option>
          {repairLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {[
                "Tracking ID",
                "Customer",
                "Equipment",
                "Status",
                "Location",
                "Received",
                "Updated",
              ].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading tracking records...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Unable to load tracking records. Please try again.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              filtered.map((r: any) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-t border-border hover:bg-surface"
                  onClick={() =>
                    navigate({ to: "/admin/repair-requests", search: { open: r.id } as any })
                  }
                >
                  <td className="px-4 py-3 font-mono text-xs">{r.request_code}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.full_name}</div>
                    {auth.isAdmin && (
                      <div className="text-xs text-muted-foreground">{r.mobile || r.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>{r.equipment_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[r.brand, r.model_no].filter(Boolean).join(" / ")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {repairStatusLabels[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium text-navy">
                      {locationLabel(r.current_location)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            {!isLoading && !isError && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No tracking records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {addOpen && (
        <ManualRepairModal
          onClose={() => setAddOpen(false)}
          onCreated={() => qc.invalidateQueries({ queryKey })}
        />
      )}
    </div>
  );
}

async function prepareImport(
  file: File,
  setImporting: (value: boolean) => void,
  setImportErrors: (errors: string[]) => void,
  setImportPreview: (preview: ImportPreview | null) => void,
  setImportProgress: (progress: ImportProgress | null) => void,
) {
  const fileKey = `${file.name}:${file.size}:${file.lastModified}`;
  setImporting(true);
  setImportErrors([]);
  setImportPreview(null);
  setImportProgress({
    message: "Uploading file...",
    percent: 15,
    imported: 0,
    skipped: 0,
    failed: 0,
  });

  try {
    setImportProgress({
      message: "Reading spreadsheet...",
      percent: 55,
      imported: 0,
      skipped: 0,
      failed: 0,
    });
    const sheet = await readRows(file);
    setImportProgress({
      message: "Validating records...",
      percent: 85,
      imported: 0,
      skipped: 0,
      failed: 0,
    });
    const preview = validateImportSheet(sheet, fileKey);
    setImportPreview(preview);
    setImportProgress(null);
    if (!preview.valid.length && preview.issues.length) {
      setImportErrors(["No valid rows found. Review the import preview corrections."]);
    }
  } catch (error) {
    console.error("[Repair request import read failed]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unable to read spreadsheet. Please verify that the file is a valid Excel file.";
    setImportErrors([message]);
    setImportProgress(null);
  } finally {
    setImporting(false);
  }
}

async function confirmImport(
  preview: ImportPreview,
  lastImportedFileKey: string,
  setLastImportedFileKey: (key: string) => void,
  setImporting: (value: boolean) => void,
  setImportErrors: (errors: string[]) => void,
  setImportPreview: (preview: ImportPreview | null) => void,
  setImportProgress: (progress: ImportProgress | null) => void,
  qc: ReturnType<typeof useQueryClient>,
  queryKey: unknown[],
) {
  if (preview.fileKey === lastImportedFileKey) {
    setImportErrors([
      "This file was already imported in this session. Choose a different file to continue.",
    ]);
    return;
  }
  if (!preview.valid.length) {
    setImportErrors(["No valid rows available to import."]);
    return;
  }

  setImporting(true);
  setImportErrors([]);
  setImportProgress({
    message: `Importing ${preview.valid.length} records...`,
    percent: 95,
    imported: 0,
    skipped: countInvalidRows(preview),
    failed: 0,
  });

  try {
    await createRepairRequests(preview.valid.map((row) => row.data));
    setLastImportedFileKey(preview.fileKey);
    setImportPreview(null);
    setImportProgress({
      message: "Import completed successfully.",
      percent: 100,
      imported: preview.valid.length,
      skipped: countInvalidRows(preview),
      failed: 0,
    });
    toast.success("Import completed successfully.");
    qc.invalidateQueries({ queryKey });
  } catch (error) {
    console.error("[Repair request import database failed]", error);
    setImportErrors([`Import failed. ${databaseErrorMessage(error)}`]);
    setImportProgress({
      message: "Import failed.",
      percent: 100,
      imported: 0,
      skipped: countInvalidRows(preview),
      failed: preview.valid.length,
    });
  } finally {
    setImporting(false);
  }
}

function databaseErrorMessage(error: unknown) {
  if (typeof error === "object" && error) {
    const err = error as { message?: string; details?: string; hint?: string };
    return [err.message, err.details, err.hint].filter(Boolean).join(" ") || "Check console logs.";
  }
  return "Check console logs.";
}

async function readRows(file: File) {
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
    throw new Error("Unsupported file format. Please upload CSV, XLS or XLSX.");
  }

  if (/\.(xlsx|xls)$/i.test(file.name)) {
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer());
      const sheetName = workbook.SheetNames.find(
        (name) => normalizeKey(name) === "repair_requests",
      );
      if (!sheetName) throw new Error("Required worksheet missing: Repair Requests");
      const sheet = workbook.Sheets[sheetName];
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });
      return rowsFromMatrix(matrix);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Repair Requests")) throw error;
      throw new Error(
        "Unable to read spreadsheet. Please verify that the file is a valid Excel file.",
      );
    }
  }

  return rowsFromMatrix(parseCsv(await file.text()));
}

function validateImportSheet(
  sheet: { headers: string[]; rows: Record<string, unknown>[] },
  fileKey: string,
) {
  const normalizedHeaders = new Set(sheet.headers.map(normalizeKey).filter(Boolean));
  const issues: ImportIssue[] = [];
  const valid: ImportValidRow[] = [];

  for (const field of requiredImportColumns) {
    if (!importAliases[field].some((alias) => normalizedHeaders.has(normalizeKey(alias)))) {
      issues.push({
        row: 1,
        field,
        problem: `Required column missing: ${field}`,
        correction: `Add the ${field} column to the Repair Requests sheet.`,
      });
    }
  }

  if (issues.length) return { fileKey, totalRows: sheet.rows.length, valid, issues };

  sheet.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const parsed = repairRequestSchema.safeParse({
      full_name: pick(row, "full_name"),
      organisation: pick(row, "organisation"),
      mobile: pick(row, "mobile"),
      whatsapp: pick(row, "whatsapp"),
      email: pick(row, "email"),
      city: pick(row, "city"),
      state: pick(row, "state"),
      equipment_category: pick(row, "equipment_category"),
      equipment_name: pick(row, "equipment_name"),
      brand: pick(row, "brand"),
      model_no: pick(row, "model_no"),
      serial_no: pick(row, "serial_no"),
      problem_description: pick(row, "problem_description"),
      urgency: normalizeUrgency(pick(row, "urgency")) || "normal",
      preferred_contact: "phone",
      pickup_required: false,
      status: normalizeStatus(pick(row, "status")),
      current_location: normalizeLocation(pick(row, "current_location")),
      admin_notes: pick(row, "admin_notes"),
      request_source: "CSV Import",
    });

    if (parsed.success) {
      valid.push({ row: rowNumber, data: parsed.data });
      return;
    }

    parsed.error.issues.forEach((issue) => {
      const field = String(issue.path[0] ?? "row");
      issues.push({
        row: rowNumber,
        field,
        problem: issue.message,
        correction: correctionFor(field),
      });
    });
  });

  return { fileKey, totalRows: sheet.rows.length, valid, issues };
}

function rowsFromMatrix(matrix: unknown[][]) {
  const headerRow = matrix[0] ?? [];
  const headers = headerRow.map((cell) => String(cell ?? "").trim());
  if (!headers.some(Boolean)) throw new Error("Required column missing: full_name");

  const rows = matrix
    .slice(1)
    .filter((row) => row.some((cell) => String(cell ?? "").trim()))
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? "").trim()])),
    );

  return { headers, rows };
}

function parseCsv(text: string) {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map(splitCsvLine);
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values.map((value) => value.trim());
}

function pick(row: Record<string, unknown>, field: string) {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), String(value ?? "").trim()]),
  );
  return importAliases[field].map((key) => normalized[normalizeKey(key)]).find(Boolean) ?? "";
}

function normalizeUrgency(value: string) {
  const lower = value.toLowerCase();
  if (lower === "high") return "urgent";
  return ["low", "normal", "urgent"].includes(lower) ? lower : "";
}

function normalizeStatus(value: string) {
  if (!value) return "request_received";
  const key = normalizeKey(value);
  const match = Object.entries(repairStatusLabels).find(
    ([status, label]) => normalizeKey(status) === key || normalizeKey(label) === key,
  );
  return match?.[0] ?? value;
}

function normalizeLocation(value: string) {
  if (!value) return "Office";
  const match = repairLocations.find((location) => location.toLowerCase() === value.toLowerCase());
  return match ?? value;
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function correctionFor(field: string) {
  if (field === "problem_description") return "Enter at least 10 characters.";
  if (field === "email") return "Enter a valid email address.";
  if (field === "mobile") return "Enter a valid mobile number.";
  if (field === "status") return "Use an existing repair status.";
  if (field === "current_location") return `Use ${repairLocations.join(", ")}.`;
  return "Check the value and try again.";
}

function countInvalidRows(preview: ImportPreview) {
  return new Set(preview.issues.map((issue) => issue.row)).size;
}

function ImportProgressPanel({ progress }: { progress: ImportProgress }) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-navy">{progress.message}</div>
        <div className="font-mono text-xs text-muted-foreground">{progress.percent}%</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      {(progress.imported > 0 || progress.skipped > 0 || progress.failed > 0) && (
        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <div>{progress.imported} records imported</div>
          <div>{progress.skipped} records skipped</div>
          <div>{progress.failed} records failed</div>
        </div>
      )}
    </div>
  );
}

function ImportPreviewPanel({
  preview,
  importing,
  onCancel,
  onImport,
}: {
  preview: ImportPreview;
  importing: boolean;
  onCancel: () => void;
  onImport: () => void;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-navy">Import Preview</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Supported columns: {importColumns.join(", ")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={importing}
            className="rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-surface disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onImport}
            disabled={importing || preview.valid.length === 0}
            className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
          >
            {importing ? "Importing..." : "Import Valid Rows"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <ImportStat label="Total rows" value={preview.totalRows} />
        <ImportStat label="Valid rows" value={preview.valid.length} />
        <ImportStat label="Invalid rows" value={countInvalidRows(preview)} />
        <ImportStat label="Rows to import" value={preview.valid.length} />
      </div>

      {preview.valid.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rows that will be imported
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {preview.valid.slice(0, 12).map((row) => (
              <span
                key={row.row}
                className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
              >
                Row {row.row}: {String((row.data as Record<string, unknown>).full_name)}
              </span>
            ))}
            {preview.valid.length > 12 && (
              <span className="rounded-full bg-surface px-2 py-1 text-xs text-muted-foreground">
                +{preview.valid.length - 12} more
              </span>
            )}
          </div>
        </div>
      )}

      {preview.issues.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Row</th>
                <th className="px-3 py-2">Field</th>
                <th className="px-3 py-2">Problem</th>
                <th className="px-3 py-2">Required correction</th>
              </tr>
            </thead>
            <tbody>
              {preview.issues.slice(0, 50).map((issue, index) => (
                <tr key={`${issue.row}-${issue.field}-${index}`} className="border-t border-border">
                  <td className="px-3 py-2">Row {issue.row}</td>
                  <td className="px-3 py-2 font-mono">{issue.field}</td>
                  <td className="px-3 py-2">{issue.problem}</td>
                  <td className="px-3 py-2">{issue.correction}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {preview.issues.length > 50 && (
            <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
              Showing first 50 issues.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ImportStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold text-navy">{value}</div>
    </div>
  );
}

function ManualRepairModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const raw = Object.fromEntries(form) as Record<string, FormDataEntryValue | boolean>;
    raw.pickup_required = form.get("pickup_required") === "on";
    raw.request_source = "Manual";
    const parsed = repairRequestSchema.safeParse(raw);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setBusy(true);
    try {
      const code = await createRepairRequest(parsed.data);
      toast.success(`Repair request created: ${code}`);
      onCreated();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create repair request";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy/40" onClick={onClose}>
      <form
        onSubmit={submit}
        className="h-full w-full max-w-3xl overflow-y-auto bg-card p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-navy">Add Repair Request</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-surface"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field name="full_name" label="Customer / Company Name" required />
          <Field name="organisation" label="Hospital / Organisation" />
          <Field name="mobile" label="Mobile Number" required />
          <Field name="whatsapp" label="WhatsApp" />
          <Field name="email" label="Email" required type="email" />
          <Field name="city" label="City" />
          <Field name="state" label="State" />
          <Field
            name="equipment_category"
            label="Equipment Type"
            as="select"
            options={["", ...equipmentCategories]}
          />
          <Field name="equipment_name" label="Equipment / Scope Details" required />
          <Field name="brand" label="Brand" />
          <Field name="model_no" label="Model" />
          <Field name="serial_no" label="Serial Number" />
          <Field
            name="urgency"
            label="Priority"
            as="select"
            options={["low", "normal", "urgent"]}
            defaultValue="normal"
          />
          <Field
            name="preferred_contact"
            label="Preferred Contact"
            as="select"
            options={["phone", "whatsapp", "email"]}
            defaultValue="phone"
          />
          <Field
            name="status"
            label="Initial Status"
            as="select"
            options={Object.keys(repairStatusLabels)}
            defaultValue="request_received"
          />
          <Field
            name="current_location"
            label="Current Location"
            as="select"
            options={[...repairLocations]}
            defaultValue="Office"
          />
        </div>
        <div className="mt-4 grid gap-4">
          <Field
            name="problem_description"
            label="Problem / Issue Description"
            required
            as="textarea"
          />
          <Field name="admin_notes" label="Notes" as="textarea" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="pickup_required" className="h-4 w-4" />
            Pickup required
          </label>
          <button
            disabled={busy}
            className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
          >
            {busy ? "Creating..." : "Create Repair Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  required,
  type = "text",
  as,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  as?: "textarea" | "select";
  options?: string[];
  defaultValue?: string;
}) {
  const cls = "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm";
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">
        {label}
        {required && <span className="text-orange"> *</span>}
      </span>
      {as === "textarea" ? (
        <textarea name={name} required={required} rows={3} className={cls} />
      ) : as === "select" ? (
        <select name={name} required={required} defaultValue={defaultValue} className={cls}>
          {options?.map((option) => (
            <option key={option} value={option}>
              {option || "-"}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          required={required}
          type={type}
          defaultValue={defaultValue}
          className={cls}
        />
      )}
    </label>
  );
}
