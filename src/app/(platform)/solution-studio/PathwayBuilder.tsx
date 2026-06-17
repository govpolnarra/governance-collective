'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type Option = { id: string; label: string }

interface Props {
  mode: 'create' | 'edit'
  pathway?: any
  districts: Option[]
  actionLabs: Option[]
  solutions: Option[]
  experts: Option[]
}

export default function PathwayBuilder({ mode, pathway, districts, actionLabs, solutions, experts }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(mode === 'edit')
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function save(form: HTMLFormElement, submitForReview: boolean) {
    setSaving(submitForReview ? 'review' : 'draft')
    setError(null)
    const formData = new FormData(form)
    const payload = {
      ...Object.fromEntries(formData.entries()),
      solution_ids: formData.getAll('solution_ids'),
      expert_ids: formData.getAll('expert_ids'),
    }
    const endpoint = mode === 'edit' ? `/api/solution-pathways/${pathway.id}` : '/api/solution-pathways'
    const response = await fetch(endpoint, {
      method: mode === 'edit' ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, submit_for_review: submitForReview }),
    })
    const result = await response.json()
    setSaving(null)
    if (!response.ok) {
      setError(result.error || 'Could not save pathway')
      return
    }
    router.push(`/solution-studio/${result.id}`)
    router.refresh()
  }

  async function submit(event: FormEvent<HTMLFormElement>, submitForReview: boolean) {
    event.preventDefault()
    await save(event.currentTarget, submitForReview)
  }

  if (!open) return <button className="btn-primary" type="button" onClick={() => setOpen(true)}>New pathway</button>

  return (
    <form
      onSubmit={(event) => submit(event, false)}
      className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 mb-6"
    >
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid md:grid-cols-2 gap-4">
        <Field name="title" label="Pathway title" defaultValue={pathway?.title} required />
        <div>
          <label className="label">Visibility</label>
          <select name="visibility" className="input w-full" defaultValue={pathway?.visibility || 'trusted'}>
            {['trusted', 'internal', 'registered', 'public'].map((visibility) => <option key={visibility} value={visibility}>{visibility}</option>)}
          </select>
        </div>
        <Select name="district_id" label="District" options={districts} defaultValue={pathway?.district_id} />
        <Select name="action_lab_id" label="Action Lab" options={actionLabs} defaultValue={pathway?.action_lab_id} />
      </div>

      <TextArea name="problem_statement" label="Problem" defaultValue={pathway?.problem_statement} required />
      <TextArea name="root_cause" label="Root cause" defaultValue={pathway?.root_cause || pathway?.root_cause_summary} />
      <TextArea name="actors" label="Actors" defaultValue={pathway?.actors || pathway?.actor_changes} />
      <TextArea name="government_levers" label="Government levers" defaultValue={(pathway?.government_levers || []).join('\n')} />
      <TextArea name="possible_solutions" label="Possible solutions" defaultValue={pathway?.possible_solutions || pathway?.sequence} />
      <div className="grid md:grid-cols-2 gap-4">
        <MultiSelect name="solution_ids" label="Linked solutions" options={solutions} defaultValues={pathway?.solution_ids || []} />
        <MultiSelect name="expert_ids" label="Linked experts" options={experts} defaultValues={pathway?.expert_ids || []} />
      </div>
      <TextArea name="risks" label="Risks" defaultValue={pathway?.risks} />
      <TextArea name="adoption_conditions" label="Adoption conditions" defaultValue={pathway?.adoption_conditions} />
      <TextArea name="architecture_summary" label="Pathway summary" defaultValue={pathway?.architecture_summary} />
      <TextArea name="measurement_plan" label="Measurement plan" defaultValue={pathway?.measurement_plan} />

      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary" type="submit" disabled={!!saving}>{saving === 'draft' ? 'Saving...' : 'Save draft'}</button>
        <button className="btn-primary" type="button" disabled={!!saving} onClick={(event) => event.currentTarget.form && save(event.currentTarget.form, true)}>
          {saving === 'review' ? 'Submitting...' : 'Submit for curator review'}
        </button>
        {mode === 'create' ? <button className="btn-secondary" type="button" onClick={() => setOpen(false)}>Cancel</button> : null}
      </div>
    </form>
  )
}

function Field({ name, label, defaultValue, required = false }: { name: string; label: string; defaultValue?: string | null; required?: boolean }) {
  return (
    <div>
      <label className="label">{label}{required ? <span className="text-red-500"> *</span> : null}</label>
      <input name={name} required={required} defaultValue={defaultValue || ''} className="input w-full" />
    </div>
  )
}

function TextArea({ name, label, defaultValue, required = false }: { name: string; label: string; defaultValue?: string | null; required?: boolean }) {
  return (
    <div>
      <label className="label">{label}{required ? <span className="text-red-500"> *</span> : null}</label>
      <textarea name={name} required={required} rows={3} defaultValue={defaultValue || ''} className="textarea w-full" />
    </div>
  )
}

function Select({ name, label, options, defaultValue }: { name: string; label: string; options: Option[]; defaultValue?: string | null }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select name={name} className="input w-full" defaultValue={defaultValue || ''}>
        <option value="">Not linked</option>
        {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
    </div>
  )
}

function MultiSelect({ name, label, options, defaultValues }: { name: string; label: string; options: Option[]; defaultValues: string[] }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select name={name} multiple className="input w-full min-h-32" defaultValue={defaultValues}>
        {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
      <p className="text-xs text-slate-400 mt-1">Hold Command or Ctrl to select more than one.</p>
    </div>
  )
}
