Authentication audit of [webbedsite.fun](https://webbedsite.fun), performed on 13 October 2026 (Asia/Shanghai).

Remediation update: this document preserves the original pre-fix findings. See the [implementation and verification report](<C:/Users/Luisha Gail/Desktop/WebbedSite/audits/AUTHENTICATION-FIXES-2026-10-13.md>) for the fixes and the owner's selected Supabase Free-plan password-screening limitation.

**Assessment: authentication needs fixes before it can be considered reliable.** The deployed password-reset destination does not render its form. Two live database access rules also expose data outside the login boundary. Basic validation works, but successful signup, email confirmation, successful login, and real-session logout/persistence remain unverified without a disposable account and mailbox.

The inspected checkout was at commit `0d8aae17263e26ebe89fd57927c03f3020765096`. The deployed JavaScript asset was `/assets/index-Bm50-Olt.js`; it points to the same Supabase project as this checkout: `ffnjdqoiaywleodqswnp`. This confirms the backend identity; it does not establish that every deployed source file matches this commit.

The audit used source inspection, production browser checks, read-only Supabase catalog queries, public HTTP requests, and isolated source reproductions. Personal profile values and credentials were not printed. Anonymous data checks used `limit=0`, so their response bodies contained no personal data. No users were created, emails sent, passwords changed, or database records/settings modified. Application source and migrations were left unchanged. Audit artifacts were added under the workspace's `audits` directory.

**Coverage and outcomes**

| Flow | Verified | Remaining verification |
| --- | --- | --- |
| Sign up | Production account-type selection and student form load. Mismatched passwords are rejected. Service rejects an admin signup role. Live signup is enabled and email confirmation is required. Signup-profile trigger is installed; all six existing auth users have profiles. | Create student and teacher accounts in a controlled workflow; receive and consume confirmation emails; test duplicate account, resend cooldown, and expired confirmation links. |
| Login | Production login page loads. A reserved nonexistent address is rejected by the live Auth API with HTTP 400 / `invalid_credentials`. Unauthenticated `/student` navigation returns to `/login`. | Successful student/teacher/admin login and role routing; banned/unconfirmed accounts; backend password/rate-limit policies. |
| Logout | Isolated actual store code clears user/profile after successful sign-out. Storage adapter removes the auth key from both browser stores. SDK defaults to global sign-out. | Real-session revocation, another open tab, offline failure, back-button behavior, and logout on another device. |
| Remember me | Isolated actual adapter code stores remembered sessions in localStorage and unchecked sessions in sessionStorage. Cross-tab preference contamination is reproduced. | Browser restart/restore, real token refresh, simultaneous tabs, and changing users on a shared browser. |
| Forgot password | Production request page loads. Service constructs a reset destination at `https://webbedsite.fun/update-password`. Production destination renders only the layout/header and no password form. | Reset email delivery, redirect allowlist, valid/expired/used links, password update, old-password rejection afterward, and session revocation. |

**Findings ordered by priority**

**1. High / P1 — Classroom-course access bypasses authentication. Confirmed live configuration.**

`public.classroom_courses` has RLS disabled. The anonymous role has schema USAGE and SELECT, INSERT, UPDATE, and DELETE privileges. No custom table triggers enforce an alternative ownership check. A public request to `/rest/v1/classroom_courses?select=*&limit=0` returned HTTP 206 with `Content-Range: */4`. The API therefore exposes the table without a signed-in user. Together, the grants and disabled RLS permit anonymous writes within any applicable database constraints; destructive HTTP requests were intentionally not executed.

Fix: enable RLS and define ownership-based policies for teachers, students, and administrators. Remove unnecessary anonymous privileges. Verify anonymous read/write rejection and cross-classroom isolation in staging. Login page guards do not protect direct API requests. See [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security) and the [live advisor finding](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public).

**2. High / P1 — Account email addresses and private profile fields are publicly queryable. Confirmed live.**

`profiles` has RLS enabled, but the policy `Profiles are viewable by everyone` applies to `public` with `USING (true)`. The anonymous role also has table SELECT access. Its columns include email, first/last name, last login, account role, and onboarding/activity data. The anonymous request `/rest/v1/profiles?select=email&limit=0` returned HTTP 206 with `Content-Range: */6`, confirming access to the email projection without retrieving values. This supports account enumeration and exposes fields beyond a public username/avatar.

Fix: restrict full-profile reads to the owner and appropriately authorized staff. If public profile discovery is required, expose only selected public fields through a carefully permissioned interface. Ensure a public projection cannot also be used to read the underlying private columns. Verify anonymous and unrelated authenticated users cannot read email/name/activity fields.

**3. High / P1 — Forgot-password links lead to a page without the password form. Reproduced on production and from source.**

[The reset route](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/router/index.jsx:36>) passes `<UpdatePassword />` as a child of `<Auth>`. [Auth](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/components/layout/Auth.jsx:22>) renders an `<Outlet />` and ignores that child. The route has no nested child for the outlet. Visiting `/update-password` on production shows the header/background without “Create New Password” or password inputs. Rendering the actual layout with the current route composition reproduces the missing form.

Fix: define the reset page as a nested route under the Auth layout, or explicitly support children in that layout. Then verify a real reset link, its token processing, and expired-link handling. The configured service destination can be inspected in [auth.service.js](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/services/auth.service.js:72>).

**4. Medium / P2 — The app does not synchronize session changes. Reproduced from source.**

[App](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/App.jsx:12>) initializes authentication once. [authStore](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/store/authStore.js:11>) reads the current session and updates only during its explicit actions. Although a service wrapper exists, nothing subscribes to `onAuthStateChange`. A Supabase `SIGNED_OUT` event from another tab or a failed token refresh can leave the app's user/profile state populated. Later sign-in or user-update events can also leave the UI stale.

Fix: install one managed auth-state subscription, clear user/profile on SIGNED_OUT, and update session identity on relevant events. Handle recovery separately. Unsubscribe on cleanup and prevent stale profile requests from overwriting a newer identity. Avoid awaiting Supabase operations directly inside the synchronous event callback; defer profile loading safely. This issue concerns stale application state; it does not by itself prove a backend authorization bypass. See [auth-state events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange) and [the async callback deadlock guidance](https://supabase.com/docs/guides/troubleshooting/why-is-my-supabase-api-call-not-returning-PGzXw0).

**5. Medium / P2 — A profile fetch error makes a successful login appear to fail. Reproduced from source.**

[Store signIn](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/store/authStore.js:26>) creates the Supabase session before requesting the profile. If that request fails, the SDK session remains active while the store stays signed out and the UI reports the fetch error. The initialization catch similarly hides an existing session behind signed-out state.

Fix: distinguish an authentication failure from a profile-loading failure. Show a retryable account-loading error, support profile recovery where appropriate, or deliberately clean up the newly created session if login cannot proceed. Verify a temporary profile API outage and a missing profile separately.

**6. Medium / P2 — Remember-me changes in one tab can alter another tab's session persistence. Reproduced from source.**

[SignIn](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/components/forms/SignIn.jsx:13>) writes the preference into shared localStorage before the login attempt succeeds. [The adapter](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/supabaseClient.js:6>) checks that shared flag on every auth-storage write. An unchecked login attempt in tab B changes the flag to false; a subsequent token write in an already remembered tab A relocates its token into tab A's sessionStorage and removes the shared persistent copy. This can happen even if tab B's login fails.

Fix: bind the persistence mode to the intended login/session and make changes deliberate. Test remembered sessions, failed logins in another tab, token refresh, and multiple accounts. A tab-storage session is tab scoped; basic adapter behavior alone does not prove every browser restart/restore scenario.

**7. Medium / P2 — The custom lock disables Supabase's cross-tab refresh coordination. Mechanism confirmed; production refresh failure untested.**

[Client configuration](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/supabaseClient.js:29>) uses `lock: async (name, acquireTimeout, fn) => fn()`. It invokes work immediately rather than serializing calls with the same lock name. An isolated check confirms two operations overlap. The installed Auth SDK normally selects its navigator lock in supported browsers. Concurrent token refreshes against shared storage can therefore race; the actual refresh-token failure outcome was not exercised with a real account.

Fix: restore the supported SDK lock behavior. If the override addressed a previous hang, identify that cause separately instead of removing mutual exclusion. Verify concurrent tab refreshes and logout while refresh is running.

**8. Medium / P2 — Password-update completion sends users to login while retaining the current session. Source reproduction; currently hidden by finding 3.**

[handlePasswordUpdate](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/hooks/useAuth.js:74>) updates the password and navigates to `/login` without signing out or reconciling session state. [PublicRoute](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/components/layout/PublicRoute.jsx:19>) redirects users with a populated profile to their dashboard. Once the reset form is repaired, a valid recovery session can therefore make the claimed login handoff inconsistent. There is also no explicit recovery-state/invalid-link UI in [UpdatePassword](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/pages/auth/UpdatePassword.jsx:4>).

Fix: define the intended post-reset behavior, explicitly complete recovery, and consistently clear/revoke sessions if re-login is required. Handle invalid, expired, and already-used links before allowing submission. An unauthenticated visitor cannot change an account password merely by loading this page: Supabase updateUser still requires an authenticated session. See [password-reset flow](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail) and [sign-out scope](https://supabase.com/docs/reference/javascript/auth-signout).

**9. Medium / P2 — Administrator account APIs run in the browser, and reset errors can be shown as success. Source-confirmed and failure reproduced.**

[CreateUserModal](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/dashboards/admin/components/CreateUserModal.jsx:28>) calls `supabase.auth.admin.createUser` through the public browser client. [ResetPasswordModal](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/dashboards/admin/components/ResetPasswordModal.jsx:17>) calls `admin.updateUserById` and then sets its success state without checking the returned `error`. The SDK returns ordinary Auth API failures as `{ data, error }`; the catch does not handle that return value. A reproduction returning a 403 still sets `done=true`.

The configured browser key is a publishable key. A profile role of admin does not turn that key/user JWT into a service credential. Consequently these admin endpoints require a server-side implementation. No real admin password operation was attempted.

Fix: move operations to a trusted backend that verifies the requesting user's administrator role. Keep privileged credentials server-side and check returned errors before displaying success. See [createUser requirements](https://supabase.com/docs/reference/javascript/auth-admin-createuser) and [updateUserById requirements](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid).

**10. Medium / P2 — The settings form requests an old password but discards it. Reproduced from source.**

[SecurityTab](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/components/shared/SettingsPage.jsx:230>) passes only newPassword and confirmPassword to its handler. [useProfile](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/hooks/useProfile.js:47>) never receives or checks the old password. [profileService](<C:/Users/Luisha Gail/Desktop/WebbedSite/src/services/profile.service.js:91>) sends only the new password to Supabase. An incorrect old-password input therefore has no effect on the application's verification logic.

Fix: implement a supported reauthentication/current-password check or a secure password-change challenge, then display validation failures accurately. The live project's secure-password-change policy was not available through the inspected public settings endpoint, so this is a confirmed discarded input rather than a claim that every backend challenge can be bypassed.

**11. Medium / P2 — Breached-password protection is disabled. Confirmed by the live security advisor.**

The Supabase advisor reported `auth_leaked_password_protection`. Signup and reset inputs also lack a consistent visible minimum-length rule; the settings handler requires eight characters while the admin-reset form accepts six. The live backend minimum length, complexity rules, and secure-password-change settings were not verified.

Fix: enable breached-password checks if available for the project's plan, choose an appropriate backend-enforced password policy, and mirror it consistently in signup/change/reset screens. See [password strength and breached-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

**Positive controls and remaining hardening**

Live email/password authentication is enabled, anonymous-account sign-in is disabled, and email auto-confirmation is disabled. Registration therefore requires confirmation under the inspected settings. The private signup trigger maps new accounts to student or teacher, and the private profile-role guard blocks ordinary clients from changing roles or inserting an admin profile. Those functions are not executable by anon/authenticated roles. Their deployed definitions were inspected; adversarial account/role mutations were not attempted.

The browser uses a publishable key, which is appropriate for frontend use when database authorization is configured correctly. A publishable key's visibility is not itself a secret leak. The notification login return path has an internal-destination allowlist, and its existing tests pass.

Normal `signOut()` currently uses the SDK's global scope, signing out all devices. Confirm that this matches the product's intended logout behavior; use local scope deliberately if logout should affect only the current session. Already issued access tokens can remain usable until expiry, so sensitive revocation requirements need explicit backend handling. See [Supabase signOut](https://supabase.com/docs/reference/javascript/auth-signout).

The production login response includes `Strict-Transport-Security: max-age=31536000`. It did not include a Content-Security-Policy, X-Frame-Options, Referrer-Policy, or X-Content-Type-Options header in the inspected response. Add an application-compatible CSP/frame restriction and appropriate response headers after testing integrations. This is a hardening gap; no XSS or clickjacking exploit was performed.

Auth inputs use `autoComplete="off"` and visual labels without matching input IDs/htmlFor. Use username/email and current-password/new-password autocomplete hints and associated labels to support password managers, autofill, and assistive technology.

The live advisor also flags a security-definer `course_with_counts` view, four functions with mutable search paths, and several execution-grant notices. Review these in the broader authorization audit. Advisory notices alone are not proof of exploitation: `get_user_role()` uses auth.uid(), and `sync_profiles_from_auth()` is a trigger-returning function. Tables with RLS enabled and no policies default to denying ordinary client rows; those informational notices were not treated as public-data leaks. See [view advisor](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view) and [function search-path advisor](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable).

**Verification artifacts**

`npm test` passed all 39 existing tests. `npm run build` succeeded, with existing Blockly export and bundle-size warnings. The existing suite includes registration and notification return-path coverage but does not catch the reset routing or session/storage findings above.

[authentication-checks.mjs](<C:/Users/Luisha Gail/Desktop/WebbedSite/audits/authentication-checks.mjs>) runs 11 isolated observations against the actual current source. A successful run confirms both working behavior and reproduced defects; it is not a passing security certification. Run it with `node audits/authentication-checks.mjs` from the workspace.

[authentication-live-checks.ps1](<C:/Users/Luisha Gail/Desktop/WebbedSite/audits/authentication-live-checks.ps1>) repeats public settings, count-only exposure, deployment-project, response-header, and one negative-login check. It keeps the frontend key in process memory and prints only safe metadata. It does not send recovery emails or create users. Its network access and script execution are subject to the host's normal permissions.

**Recommended order:** close anonymous classroom-course access and private-profile exposure; repair the reset route and recovery completion; synchronize sessions and restore refresh coordination; stabilize persistence/profile-loading failures; move administrator auth operations server-side; implement password-change verification and align password policy. Complete the pending real-account and mailbox scenarios before declaring the authentication flows fully verified.
