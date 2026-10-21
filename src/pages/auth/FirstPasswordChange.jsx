import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { profileService } from "../../services/profile.service";
import { supabase } from "../../supabaseClient";
import { PASSWORD_HELP, MIN_PASSWORD_LENGTH } from "../../lib/passwordPolicy";

export default function FirstPasswordChange() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { profile, setProfile, signOut } = useAuthStore();
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (password !== confirm) return setError("The new passwords must match.");
    if (password === current)
      return setError(
        "Choose a different password from the temporary password.",
      );
    setBusy(true);
    try {
      await profileService.updatePassword(password, current);
      const { error: completionError } = await supabase.rpc(
        "finish_first_password_change",
      );
      if (completionError) throw completionError;
      setProfile({ ...profile, must_change_password: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="text-2xl font-bold">Set your own password</h1>
      <p className="my-4 text-slate-600">
        Replace the temporary password supplied by your administrator before
        using your teacher account.
      </p>
      <form onSubmit={submit} className="space-y-4">
        {[
          ["Temporary password", current, setCurrent, "current-password"],
          ["New password", password, setPassword, "new-password"],
          ["Confirm new password", confirm, setConfirm, "new-password"],
        ].map(([label, value, setter, autocomplete]) => (
          <label key={label}>
            {label} *
            <input
              required
              minLength={
                autocomplete === "new-password" ? MIN_PASSWORD_LENGTH : 1
              }
              autoComplete={autocomplete}
              type="password"
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="mt-1 w-full rounded-lg border p-3"
            />
          </label>
        ))}
        <p className="text-sm text-slate-600">{PASSWORD_HELP}</p>
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        <button disabled={busy} className="btn btn-primary">
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
      <button className="mt-6 underline" onClick={() => signOut()}>
        Sign out
      </button>
    </main>
  );
}
