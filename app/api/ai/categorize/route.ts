import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const { description, title } = await request.json()

  if (!description && !title) {
    return NextResponse.json({ error: 'Mungon përshkrimi' }, { status: 400 })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      system: `You are a civic issue classifier for Kosovo. Based on the report description, return ONLY a JSON object with the best matching category. Categories: rruge_deme (road damage/potholes), ndricim (broken street lights), mbeturina (garbage/illegal dumping), trotuare (blocked pavements/sidewalks), uji_kanalizimi (water/sewage problems), ndertim_ilegal (illegal construction), parkimi (illegal parking blocking roads/pavements), pemve_parqe (trees/parks damage), tjeter (other). Return: {"category": "category_key", "confidence": "high|medium|low"}`,
      messages: [
        {
          role: 'user',
          content: `Title: ${title || ''}. Description: ${description || ''}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[^}]+\}/)
    if (!jsonMatch) throw new Error('Invalid response')

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: 'AI kategorizimi dështoi' }, { status: 500 })
  }
}
