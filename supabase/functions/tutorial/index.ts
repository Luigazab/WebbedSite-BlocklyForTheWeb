import { createClient } from 'npm:@supabase/supabase-js@2.94.0'
import { canonicalTutorialFiles, validateTutorialStep, validateTutorialReference, validateTestCases } from '../_shared/tutorial-runtime.generated.js'
import { createTutorialHandler } from './handler.js'
import { authenticateActiveAccount } from '../_shared/active-account.js'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } })
async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await db.rpc(name, args)
  if (error) throw new Error(error.message)
  return data
}
Deno.serve(createTutorialHandler({
  authenticate: (token: string) => authenticateActiveAccount(db, token),
  loadDefinition: (userId: string, lessonId: string, stepId: string, preview: boolean) => rpc('get_tutorial_validation_definition', { p_user: userId, p_lesson: lessonId, p_step: stepId, p_preview: preview }),
  saveSubmission: (userId: string, body: Record<string, unknown>) => rpc('save_validated_tutorial_submission', {
    p_user: userId, p_lesson: body.lessonId, p_step: body.stepId, p_files: body.files,
    p_finish: body.finish, p_revision: body.revision,
    p_active_seconds: body.activeSeconds ?? null, p_device_factor: body.deviceFactor ?? null,
  }),
  saveDefinition: (userId: string, definition: unknown, publish: boolean) => rpc('save_tutorial_definition', { p_user: userId, p_definition: definition, p_publish: publish }),
  canonicalize: canonicalTutorialFiles,
  validateStep: validateTutorialStep,
  validateReference: validateTutorialReference,
  validateTests: validateTestCases,
}))
