import test from 'node:test'
import assert from 'node:assert/strict'
import {authenticateActiveAccount} from '../supabase/functions/_shared/active-account.js'
function fake({passwordRequired=false,bannedUntil=null,invalid=false,missing=false}={}){
 let lookups=0
 const db={auth:{getUser:async()=>({data:{user:invalid?null:{id:'account'}},error:invalid?new Error('Invalid token'):null}),admin:{getUserById:async()=>{lookups++;return {data:{user:{id:'account',banned_until:bannedUntil}}}}}},from:()=>({select:()=>({eq:()=>({single:async()=>({data:missing?null:{must_change_password:passwordRequired}})})})})}
 return {db,lookups:()=>lookups}
}
test('service adapters authenticate an active account',async()=>{const {db}=fake();assert.equal((await authenticateActiveAccount(db,'token')).id,'account')})
test('service adapters reject a banned account despite a valid access token',async()=>{const {db}=fake({bannedUntil:new Date(Date.now()+86400000).toISOString()});assert.equal(await authenticateActiveAccount(db,'token'),null)})
test('service adapters enforce the administrator-assigned password change',async()=>{const {db}=fake({passwordRequired:true});assert.equal(await authenticateActiveAccount(db,'token'),null)})
test('service adapters fail closed when the profile is unavailable',async()=>{const {db}=fake({missing:true});assert.equal(await authenticateActiveAccount(db,'token'),null)})
test('invalid tokens cannot reach privileged account lookups',async()=>{const {db,lookups}=fake({invalid:true});assert.equal(await authenticateActiveAccount(db,'token'),null);assert.equal(lookups(),0)})
