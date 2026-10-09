import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, Check, ChevronLeft, Loader2, Sparkles } from 'lucide-react'
import ProfilePictureModal from '../../../components/profile/ProfilePictureModal'
import { profileService } from '../../../services/profile.service'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'

const steps = ['Your name', 'Your avatar', 'Your classroom', 'Meet WebbedSite']

function nextStep(profile) {
  if (!profile?.firstname || !profile?.lastname) return 0
  if (!profile?.avatar_url) return 1
  return 2
}

export default function WelcomeOnboarding() {
  const navigate = useNavigate()
  const profile = useAuthStore(state => state.profile)
  const setProfile = useAuthStore(state => state.setProfile)
  const joinClassroom = useClassroomStore(state => state.joinClassroom)
  const [step, setStep] = useState(() => nextStep(profile))
  const [firstName, setFirstName] = useState(profile?.firstname ?? '')
  const [lastName, setLastName] = useState(profile?.lastname ?? '')
  const [code, setCode] = useState('')
  const [wantsCode, setWantsCode] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [classroomName, setClassroomName] = useState('')

  const goBack = () => {
    if (busy || step === 0) return
    setError('')
    setWantsCode(false)
    setStep(current => current - 1)
  }

  const saveName = async event => {
    event.preventDefault()
    const first = firstName.trim()
    const last = lastName.trim()
    if (!first || !last) { setError('Please enter your first and last name.'); return }
    setBusy(true); setError('')
    try {
      const updated = await profileService.updateProfile(profile.id, { firstname: first, lastname: last })
      setProfile(updated)
      setStep(1)
    } catch (err) { setError(err.message || 'Could not save your name.') }
    finally { setBusy(false) }
  }

  const saveAvatar = async selection => {
    setBusy(true); setError('')
    try {
      let updated
      if (selection.file) {
        const avatarUrl = await profileService.uploadAvatar(profile.id, selection.file)
        updated = { ...profile, avatar_url: avatarUrl }
      } else {
        updated = await profileService.updateProfile(profile.id, { avatar_url: selection.url })
      }
      setProfile(updated)
      setStep(2)
    } finally { setBusy(false) }
  }

  const submitCode = async event => {
    event.preventDefault()
    if (code.trim().length !== 6) { setError('Enter the six-character code from your teacher.'); return }
    setBusy(true); setError('')
    try {
      const classroom = await joinClassroom(profile.id, code.trim().toUpperCase())
      setClassroomName(classroom.name)
      setStep(3)
    } catch (err) { setError(err.message || 'Could not join that classroom.') }
    finally { setBusy(false) }
  }

  const finish = async () => {
    setBusy(true); setError('')
    try {
      const updated = await profileService.updateProfile(profile.id, { onboarding_completed_at: new Date().toISOString() })
      setProfile(updated)
      navigate('/student', { replace: true })
    } catch (err) { setError(err.message || 'Could not finish setup.') }
    finally { setBusy(false) }
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ede9fe,#f8fafc_52%,#dbeafe)] px-4 py-8 text-slate-800 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blockly-purple">
            WebbedSite
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Let's get you set up
          </h1>
          <p className="mt-2 text-slate-500">
            A quick chat with Remi before you explore.
          </p>
        </div>
        <div
          className="mb-8 flex justify-center gap-2"
          aria-label={`Step ${step + 1} of ${steps.length}: ${steps[step]}`}
        >
          {steps.map((label, index) => (
            <div
              key={label}
              className={`h-2 w-14 rounded-full sm:w-20 ${index <= step ? "bg-blockly-purple" : "bg-slate-200"}`}
              title={label}
            />
          ))}
        </div>
        <div className="rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-xl shadow-violet-100/70 backdrop-blur-sm sm:p-8">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              disabled={busy}
              className="mb-6 inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-bold text-blockly-purple hover:bg-violet-50 disabled:opacity-50"
              aria-label={`Back to ${steps[step - 1]}`}
            >
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <div className="mb-8 flex items-end gap-3 sm:gap-5">
            <img
              src="/remi.png"
              alt="Remi"
              className="h-28 w-24 shrink-0 object-contain sm:h-36 sm:w-32"
            />
            <div
              className="max-w-lg rounded-3xl rounded-bl-md bg-violet-100 px-5 py-4 text-base font-semibold leading-relaxed text-violet-950 shadow-sm sm:text-lg"
              aria-live="polite"
            >
              {step === 0 && (
                <>
                  Hi! I'm Remi, your WebbedSite guide. First, what are your first and last names?
                </>
              )}
              {step === 1 && (
                <>
                  Nice to meet you, {profile.firstname}! What should your avatar look like?
                </>
              )}
              {step === 2 && (
                <>
                  Do you have a classroom code from your teacher? You can join now or do it later.
                </>
              )}
              {step === 3 && (
                <>
                  You're all set{classroomName ? ` for ${classroomName}` : ""},{" "}
                  {profile.firstname}! Welcome to WebbedSite. Create projects,
                  learn HTML, CSS, and JavaScript, explore guides, and join your
                  class when you're ready.
                </>
              )}
            </div>
          </div>
          <div className="ml-auto max-w-lg rounded-3xl rounded-br-md border-2 border-sky-100 bg-sky-50 p-5 shadow-sm sm:p-6">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-sky-700">
              Your reply
            </p>
            {step === 0 && (
              <form onSubmit={saveName} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    First name
                    <input
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      autoComplete="given-name"
                      maxLength={80}
                      required
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blockly-purple"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Last name
                    <input
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      autoComplete="family-name"
                      maxLength={80}
                      required
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blockly-purple"
                    />
                  </label>
                </div>
                <button
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blockly-purple px-5 py-3 font-bold text-white disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      That's me <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
            {step === 1 && (
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatar_url || "/default-avatar.png"}
                  alt="Your current avatar"
                  className="h-16 w-16 rounded-2xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAvatarOpen(true)}
                  className="flex-1 rounded-xl bg-blockly-purple px-5 py-3 font-bold text-white"
                >
                  Choose my avatar
                </button>
              </div>
            )}
            {step === 2 &&
              (classroomName ? (
                <div className="space-y-3">
                  <p className="font-semibold text-slate-700">
                    You're already in {classroomName}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-full rounded-xl bg-blockly-purple px-5 py-3 font-bold text-white"
                  >
                    Continue <ArrowRight size={18} className="ml-1 inline" />
                  </button>
                </div>
              ) : wantsCode ? (
                <form onSubmit={submitCode} className="space-y-4">
                  <label className="text-sm font-semibold">
                    Classroom code
                    <input
                      value={code}
                      onChange={(event) =>
                        setCode(
                          event.target.value.toUpperCase().replace(/\s/g, ""),
                        )
                      }
                      autoFocus
                      maxLength={6}
                      placeholder="ABC123"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xl font-black tracking-[0.25em] uppercase outline-none focus:border-blockly-purple"
                    />
                  </label>
                  <button
                    disabled={busy}
                    className="w-full rounded-xl bg-blockly-purple px-5 py-3 font-bold text-white disabled:opacity-50"
                  >
                    {busy ? "Joining…" : "Join my classroom"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWantsCode(false);
                      setError("");
                    }}
                    className="w-full text-sm font-semibold text-slate-500 underline"
                  >
                    Back to choices
                  </button>
                </form>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setWantsCode(true)}
                    className="rounded-xl bg-blockly-purple px-5 py-3 font-bold text-white"
                  >
                    I have a code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep(3);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700"
                  >
                    Not right now
                  </button>
                </div>
              ))}
            {step === 3 && (
              <button
                type="button"
                onClick={finish}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blockly-purple px-5 py-3 font-bold text-white disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Let's explore <Sparkles size={18} />
                  </>
                )}
              </button>
            )}
            {error && (
              <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
          </div>
          <p className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Check size={14} /> Step {step + 1} of {steps.length}: {steps[step]}
          </p>
        </div>
      </div>
      <ProfilePictureModal
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        onSelect={saveAvatar}
        saving={busy}
      />
    </div>
  );
}
