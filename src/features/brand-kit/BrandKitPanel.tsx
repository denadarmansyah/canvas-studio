import React, { useState } from 'react'
import { Check, Palette, Plus, Trash2, Type, Upload } from 'lucide-react'
import type { BrandKit } from '../../types/platform'
import { FONT_FAMILIES } from '../../data/presets'
import { BrandLogo } from '../../components/branding/BrandAssets'

export function BrandKitPanel({
  brandKit,
  onChange,
  onShowToast,
}: {
  brandKit: BrandKit
  onChange: (next: BrandKit) => void
  onShowToast: (msg: string) => void
}) {
  const [newColor, setNewColor] = useState('#5267FF')

  const updateColor = (group: 'primaryColors' | 'secondaryColors' | 'customColors', idx: number, val: string) => {
    const arr = [...brandKit[group]]
    arr[idx] = val
    onChange({ ...brandKit, [group]: arr })
  }

  const addCustomColor = () => {
    if (brandKit.customColors.includes(newColor)) return
    onChange({ ...brandKit, customColors: [...brandKit.customColors, newColor] })
    onShowToast(`Added ${newColor} to Brand Kit`)
  }

  const removeCustomColor = (idx: number) => {
    onChange({
      ...brandKit,
      customColors: brandKit.customColors.filter((_, i) => i !== idx),
    })
  }

  const handleLogoUpload = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onChange({ ...brandKit, logoSvg: String(reader.result) })
      onShowToast('Brand logo updated')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="brandkit-page">
      <div className="brandkit-header">
        <div>
          <div className="modal-eyebrow">SHARED DESIGN SYSTEM</div>
          <h2>Brand Kit & Guidelines</h2>
          <p>Define reusable brand colors, logos, and typography across Website Builder and Graphic Studio.</p>
        </div>
        <div className="brandkit-badge">
          <Check size={14} /> Active across all projects
        </div>
      </div>

      <div className="brandkit-grid">
        {/* Identity & Logo */}
        <section className="brandkit-card">
          <div className="brandkit-card-head">
            <Palette size={17} />
            <strong>Brand Identity & Logo</strong>
          </div>
          <label className="field stacked">
            <span>Brand name</span>
            <input
              value={brandKit.brandName}
              onChange={(e) => onChange({ ...brandKit, brandName: e.target.value })}
            />
          </label>
          <label className="field stacked">
            <span>Brand tagline</span>
            <input
              value={brandKit.tagline}
              onChange={(e) => onChange({ ...brandKit, tagline: e.target.value })}
            />
          </label>

          <div className="brand-logo-preview">
            {brandKit.logoSvg ? (
              <img src={brandKit.logoSvg} alt="Custom Brand Logo" style={{ maxHeight: 54, maxWidth: '100%' }} />
            ) : (
              <BrandLogo variant="full" height={46} />
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              className="secondary-button"
              style={{ flex: 1 }}
              onClick={() => document.getElementById('brand-logo-upload')?.click()}
            >
              <Upload size={14} /> Upload Custom Logo
            </button>
            {brandKit.logoSvg && (
              <button
                className="secondary-button"
                onClick={() => onChange({ ...brandKit, logoSvg: undefined })}
              >
                Reset to Studio Logo
              </button>
            )}
            <input
              id="brand-logo-upload"
              type="file"
              accept="image/*,.svg"
              hidden
              onChange={(e) => handleLogoUpload(e.target.files?.[0])}
            />
          </div>
        </section>

        {/* Color Palettes */}
        <section className="brandkit-card">
          <div className="brandkit-card-head">
            <Palette size={17} />
            <strong>Color System</strong>
          </div>

          <div className="permission-label" style={{ marginTop: 4 }}>PRIMARY COLORS</div>
          <div className="swatch-edit-row">
            {brandKit.primaryColors.map((col, idx) => (
              <label key={idx} className="swatch-chip-editor">
                <input
                  type="color"
                  value={col}
                  onChange={(e) => updateColor('primaryColors', idx, e.target.value)}
                />
                <span>{col.toUpperCase()}</span>
              </label>
            ))}
          </div>

          <div className="permission-label">SECONDARY COLORS</div>
          <div className="swatch-edit-row">
            {brandKit.secondaryColors.map((col, idx) => (
              <label key={idx} className="swatch-chip-editor">
                <input
                  type="color"
                  value={col}
                  onChange={(e) => updateColor('secondaryColors', idx, e.target.value)}
                />
                <span>{col.toUpperCase()}</span>
              </label>
            ))}
          </div>

          <div className="permission-label">CUSTOM PALETTE</div>
          <div className="swatch-edit-row">
            {brandKit.customColors.map((col, idx) => (
              <div key={idx} className="swatch-chip-editor">
                <input
                  type="color"
                  value={col}
                  onChange={(e) => updateColor('customColors', idx, e.target.value)}
                />
                <span>{col.toUpperCase()}</span>
                <button onClick={() => removeCustomColor(idx)} title="Remove color">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
            <button className="secondary-button" onClick={addCustomColor}>
              <Plus size={14} /> Add Brand Color
            </button>
          </div>
        </section>

        {/* Typography & Guidelines */}
        <section className="brandkit-card">
          <div className="brandkit-card-head">
            <Type size={17} />
            <strong>Typography & Guidelines</strong>
          </div>

          <label className="field stacked">
            <span>Heading font</span>
            <select
              value={brandKit.headingFont}
              onChange={(e) => onChange({ ...brandKit, headingFont: e.target.value })}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>

          <label className="field stacked">
            <span>Body font</span>
            <select
              value={brandKit.bodyFont}
              onChange={(e) => onChange({ ...brandKit, bodyFont: e.target.value })}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>

          <label className="field stacked">
            <span>Brand Usage Guidelines</span>
            <textarea
              rows={4}
              value={brandKit.guidelines}
              onChange={(e) => onChange({ ...brandKit, guidelines: e.target.value })}
            />
          </label>
        </section>
      </div>
    </div>
  )
}
