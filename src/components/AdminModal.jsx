import { useCallback, useEffect, useState } from "react";
import { Download, LockKeyhole, LogOut, RefreshCw, X } from "lucide-react";
import { hasSupabaseConfig, supabase } from "../lib/supabase";

export default function AdminModal({ open, onClose, t }) {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [guestRows, setGuestRows] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadGuests = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setAdminMessage("");
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setAdminMessage(error.message);
    } else {
      setGuestRows(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!open || !supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data?.session?.user) {
        setAdminUser(data.session.user);
        loadGuests();
      }
    });
    return () => {
      active = false;
    };
  }, [open, loadGuests]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const signInAdmin = async (e) => {
    e.preventDefault();
    setAdminMessage("");
    if (!hasSupabaseConfig || !supabase) {
      setAdminMessage(t.noConfig);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail.trim(),
      password: adminPassword,
    });
    setLoading(false);
    if (error) {
      setAdminMessage(error.message);
    } else {
      setAdminUser(data.user);
      loadGuests();
    }
  };

  const signOutAdmin = async () => {
    await supabase?.auth.signOut();
    setAdminUser(null);
    setGuestRows([]);
    setAdminMessage("");
  };

  const exportCsv = () => {
    const rows = [["Name", "Phone", "Guests", "Attending", "Note", "Created"]];
    guestRows.forEach((g) =>
      rows.push([
        g.name,
        g.phone,
        g.guests,
        g.attending ? "Yes" : "No",
        g.note || "",
        g.created_at || "",
      ])
    );
    const csv = rows
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding-rsvp-guests.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const attendingRows = guestRows.filter((g) => g.attending);
  const notAttendingCount = guestRows.length - attendingRows.length;
  const totalExpectedGuests = attendingRows.reduce(
    (sum, g) => sum + (Number(g.guests) || 0),
    0
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      onClick={onClose}
      className="fixed inset-0 z-[90] bg-ink/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-5xl mx-auto my-8 bg-ivory rounded-3xl p-5 sm:p-8 shadow-2xl border border-champagne/40"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="font-serif text-3xl mt-1">{t.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button"
            aria-label="Close admin panel"
          >
            <X size={18} />
          </button>
        </div>

        {!adminUser ? (
          <form onSubmit={signInAdmin} className="max-w-md mx-auto py-10 space-y-4">
            <LockKeyhole className="mx-auto text-rose" size={32} />
            <label className="field-label">
              {t.emailLabel}
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </label>
            <label className="field-label">
              {t.passwordLabel}
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="gold-button w-full justify-center disabled:opacity-50"
            >
              {t.loginBtn}
            </button>
            {adminMessage && (
              <p className="text-sm text-rose text-center">{adminMessage}</p>
            )}
            <p className="text-xs text-center text-ink/50">{t.setupHint}</p>
          </form>
        ) : (
          <div className="mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="count-box text-center p-4">
                <div className="font-serif text-2xl text-ink">{guestRows.length}</div>
                <div className="text-[11px] text-ink/60 mt-1">{t.totalResponses}</div>
              </div>
              <div className="count-box text-center p-4">
                <div className="font-serif text-2xl text-ink">{attendingRows.length}</div>
                <div className="text-[11px] text-ink/60 mt-1">{t.attendingCount}</div>
              </div>
              <div className="count-box text-center p-4">
                <div className="font-serif text-2xl text-ink">{notAttendingCount}</div>
                <div className="text-[11px] text-ink/60 mt-1">{t.notAttendingCount}</div>
              </div>
              <div className="count-box text-center p-4">
                <div className="font-serif text-2xl text-ink">{totalExpectedGuests}</div>
                <div className="text-[11px] text-ink/60 mt-1">{t.expectedGuests}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
              <p className="font-hindi text-sm text-ink/70">
                {t.totalResponses}: <strong>{guestRows.length}</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadGuests}
                  disabled={loading}
                  className="outline-button"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
                  {t.refresh}
                </button>
                <button type="button" onClick={exportCsv} className="gold-button">
                  <Download size={15} /> {t.exportCsv}
                </button>
                <button type="button" onClick={signOutAdmin} className="outline-button">
                  <LogOut size={15} /> {t.logout}
                </button>
              </div>
            </div>

            {guestRows.length === 0 ? (
              <p className="text-center py-8 text-sm text-ink/55">{t.empty}</p>
            ) : (
              <div className="overflow-x-auto bg-white/60 rounded-2xl border border-champagne/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {t.columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guestRows.map((g) => (
                      <tr key={g.id}>
                        <td className="font-medium">{g.name}</td>
                        <td>{g.phone}</td>
                        <td>{g.guests}</td>
                        <td>{g.attending ? t.yes : t.no}</td>
                        <td>{g.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {adminMessage && (
              <p className="text-sm text-rose mt-3">{adminMessage}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
