'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Upload, X, Sparkles, ChevronRight, ChevronLeft, Check, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORIES, MUNICIPALITIES, CategoryKey } from '@/lib/constants'

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), { ssr: false })

const STEPS = ['Vendndodhja', 'Detajet', 'Rishikimi']

export function NewReportForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Step 1
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [address, setAddress] = useState('')
  const [municipality, setMunicipality] = useState('Prishtinë')

  // Step 2
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<CategoryKey | ''>('')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [aiSuggested, setAiSuggested] = useState<CategoryKey | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const handleLocationSelect = useCallback(async (newLat: number, newLng: number) => {
    setLat(newLat)
    setLng(newLng)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json`)
      const data = await res.json()
      setAddress(data.display_name?.split(',').slice(0, 3).join(',') || '')
    } catch {
      setAddress(`${newLat.toFixed(5)}, ${newLng.toFixed(5)}`)
    }
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Fotoja duhet të jetë nën 10MB'); return }
    setPhotoFile(file)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }

  const handleAiCategorize = async () => {
    if (!description && !title) { toast.error('Shkruaj titullin ose përshkrimin fillimisht'); return }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })
      const { category: suggested } = await res.json()
      if (suggested && CATEGORIES[suggested as CategoryKey]) {
        setCategory(suggested as CategoryKey)
        setAiSuggested(suggested as CategoryKey)
        toast.success(`AI sugjeroi: ${CATEGORIES[suggested as CategoryKey].label}`)
      }
    } catch {
      toast.error('AI kategorizimi dështoi')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      let photoUrl: string | undefined
      let photoPath: string | undefined

      if (photoFile) {
        const fd = new FormData()
        fd.append('file', photoFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) throw new Error('Ngarkimi i fotos dështoi')
        const uploadData = await uploadRes.json()
        photoUrl = uploadData.url
        photoPath = uploadData.path
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          latitude: lat,
          longitude: lng,
          address_text: address,
          municipality,
          photo_url: photoUrl,
          photo_path: photoPath,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Dështoi dërgimi')
      }

      const report = await res.json()
      toast.success('Raporti u dërgua me sukses!')
      router.push(`/raport/${report.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Ndodhi një gabim')
    } finally {
      setSubmitting(false)
    }
  }

  const canProceedStep0 = lat !== null && lng !== null
  const canProceedStep1 = title.length >= 5 && category !== '' && description.length >= 20

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Progress */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < step ? 'bg-[#1D9E75] text-white' : i === step ? 'bg-[#1D9E75] text-white ring-4 ring-[#1D9E75]/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-[#1D9E75]' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Location */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#1D9E75]" />
                Kliko në hartë për të shënuar vendndodhjen e problemit
              </p>
              <LocationPicker onLocationSelect={handleLocationSelect} height="350px" />
              {lat && lng && (
                <p className="text-xs text-[#1D9E75] mt-2 font-medium">
                  ✓ Vendndodhja u zgjodh: {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Adresa</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Adresa do të mbushet automatikisht..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Komuna</Label>
              <Select value={municipality} onValueChange={setMunicipality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUNICIPALITIES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Titulli *</Label>
                <span className="text-xs text-gray-400">{title.length}/100</span>
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                placeholder="p.sh. Gropë e madhe në rrugë"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Kategoria *</Label>
                {aiSuggested && (
                  <span className="text-xs text-[#1D9E75] font-medium">
                    ✨ AI sugjeroi: {CATEGORIES[aiSuggested].label}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key as CategoryKey)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-xs font-medium transition-all ${category === key ? 'border-current' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
                    style={category === key ? { borderColor: cat.color, backgroundColor: cat.color + '15', color: cat.color } : {}}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="text-center leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Përshkrimi *</Label>
                <span className="text-xs text-gray-400">{description.length}/500</span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Përshkruaj problemin në detaje... (min. 20 karaktere)"
                className="min-h-[100px]"
              />
              {description.length > 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAiCategorize}
                  disabled={aiLoading}
                  className="text-xs gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#1D9E75]" />
                  {aiLoading ? 'Duke analizuar...' : 'AI auto-detekto kategorinë'}
                </Button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Foto (opsionale)</Label>
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-[#1D9E75] hover:bg-[#1D9E75]/5 transition-colors">
                  <Upload className="h-8 w-8 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400">Kliko ose tërhiq foton këtu</span>
                  <span className="text-xs text-gray-300 mt-1">JPEG, PNG, WEBP — max 10MB</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-900 dark:text-white">Rishiko raportin tënd</h3>
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            )}
            <div className="space-y-3 text-sm">
              <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-500 w-24 flex-shrink-0">Titulli</span>
                <span className="text-gray-900 dark:text-white">{title}</span>
              </div>
              <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-500 w-24 flex-shrink-0">Kategoria</span>
                <span>{category && CATEGORIES[category] ? `${CATEGORIES[category].emoji} ${CATEGORIES[category].label}` : '-'}</span>
              </div>
              <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-500 w-24 flex-shrink-0">Komuna</span>
                <span>{municipality}</span>
              </div>
              <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-500 w-24 flex-shrink-0">Adresa</span>
                <span className="text-gray-900 dark:text-white">{address || 'E paspecifikuar'}</span>
              </div>
              <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-500 w-24 flex-shrink-0">Koordinatat</span>
                <span>{lat?.toFixed(5)}, {lng?.toFixed(5)}</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-500 block mb-1">Përshkrimi</span>
                <span className="text-gray-900 dark:text-white">{description}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Kthehu
            </Button>
          ) : <div />}

          {step < 2 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
              className="bg-[#1D9E75] hover:bg-[#17836B] gap-1"
            >
              Vazhdo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#1D9E75] hover:bg-[#17836B]"
            >
              {submitting ? 'Duke dërguar...' : 'Dërgo Raportin'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
