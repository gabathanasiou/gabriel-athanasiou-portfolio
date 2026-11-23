import React, { useEffect, useMemo, useState } from 'react';
import type { Brand, HomeConfig } from '../types';
import { BrandWall } from '../components/BrandWall';
import type { BrandWallLayout } from '../components/BrandWall';
import { THEME } from '../theme';

type Mode = 'directing' | 'postproduction';

interface Payload {
  brands: Brand[];
  config: HomeConfig;
}

interface WallState {
  enabled: boolean;
  label: string;
  layout: BrandWallLayout;
  colourOnHover: boolean;
  logoHeight: number;
  spacing: number;
  brandIds: string[];
}

const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'directing', label: 'Directing' },
  { id: 'postproduction', label: 'Lemon Post' }
];

const LIVE_URL = (mode: Mode) => {
  const ref = mode === 'postproduction' ? 'data-live' : 'data';
  return `https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@${ref}/${mode}/portfolio-data.json`;
};

const LAYOUT_LABEL: Record<BrandWallLayout, string> = {
  inline: 'Inline',
  grid: 'Grid',
  marquee: 'Marquee'
};

const round = (value: number) => Math.round(value * 100) / 100;

function wallFromConfig(config: HomeConfig): WallState {
  return {
    enabled: config.brandWall?.enabled ?? true,
    label: config.brandWall?.label || '',
    layout: config.brandWall?.layout || 'inline',
    colourOnHover: config.brandWall?.colourOnHover ?? false,
    logoHeight: config.brandWall?.logoHeight ?? THEME.brandWall.logoHeight,
    spacing: config.brandWall?.spacing ?? 1,
    brandIds: config.brandWall?.brandIds ?? []
  };
}

function previewVars(dark: boolean): React.CSSProperties {
  return {
    '--color-bg-main': dark ? '#050505' : '#ffffff',
    '--color-text-main': dark ? '#ffffff' : '#1a1a1a',
    '--color-text-muted': dark ? '#a1a1aa' : '#666666',
    '--color-line': dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
    '--brand-logo-filter': dark ? 'brightness(0) invert(1)' : 'brightness(0)',
    '--font-sans': '"Inter", system-ui, sans-serif',
    '--font-serif': '"Playfair Display", Georgia, serif',
    colorScheme: dark ? 'dark' : 'light'
  } as React.CSSProperties;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{title}</h2>
    {children}
  </section>
);

const SliderRow: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step, suffix, onChange }) => (
  <div>
    <div className="flex items-center justify-between text-xs text-zinc-300">
      <span>{label}</span>
      <span className="font-mono text-zinc-400">
        {Number.isInteger(value) ? value : value.toFixed(2)}
        {suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="mt-2 w-full"
    />
  </div>
);

const inputClass =
  'w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-lime-400';

const buttonClass =
  'rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-100 transition-colors hover:border-lime-400 hover:text-lime-300 disabled:cursor-not-allowed disabled:opacity-40';

export const BrandWallEditor: React.FC = () => {
  const [mode, setMode] = useState<Mode>('postproduction');
  const [payloads, setPayloads] = useState<Partial<Record<Mode, Payload>>>({});
  const [walls, setWalls] = useState<Partial<Record<Mode, WallState>>>({});
  const [scalesByMode, setScalesByMode] = useState<Partial<Record<Mode, Record<string, number>>>>({});
  const [loading, setLoading] = useState<Mode | null>(null);
  const [error, setError] = useState('');
  const [previewDark, setPreviewDark] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [addId, setAddId] = useState('');
  const [notice, setNotice] = useState('');

  const payload = payloads[mode];
  const wall = walls[mode];
  const scaleMap = scalesByMode[mode] ?? {};
  const brands = payload?.brands ?? [];

  const load = async (target: Mode) => {
    setLoading(target);
    setError('');
    try {
      const response = await fetch(`${LIVE_URL(target)}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = (await response.json()) as Payload;
      setPayloads((prev) => ({ ...prev, [target]: data }));
    } catch (err) {
      setError(`Could not load ${target}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading((current) => (current === target ? null : current));
    }
  };

  useEffect(() => {
    if (!payloads[mode] && loading !== mode) void load(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    setPreviewDark(mode === 'directing');
    setSelectedBrandId(null);
  }, [mode]);

  useEffect(() => {
    if (!payload) return;
    if (!walls[mode]) {
      setWalls((prev) => ({ ...prev, [mode]: wallFromConfig(payload.config) }));
    }
    if (!scalesByMode[mode]) {
      setScalesByMode((prev) => ({
        ...prev,
        [mode]: Object.fromEntries(payload.brands.map((brand) => [brand.id, brand.scale ?? 1]))
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, mode]);

  const setWall = (patch: Partial<WallState>) => {
    if (!payload) return;
    setWalls((prev) => ({
      ...prev,
      [mode]: { ...(prev[mode] ?? wallFromConfig(payload.config)), ...patch }
    }));
  };

  const setScale = (id: string, value: number) => {
    setScalesByMode((prev) => ({
      ...prev,
      [mode]: { ...(prev[mode] ?? {}), [id]: round(value) }
    }));
  };

  const wallBrands = useMemo(() => {
    const byId = new Map(brands.map((brand) => [brand.id, brand]));
    return (wall?.brandIds ?? []).flatMap((id) => {
      const brand = byId.get(id);
      if (!brand) return [];
      return [{ ...brand, scale: round(scaleMap[id] ?? brand.scale ?? 1) }];
    });
  }, [brands, wall?.brandIds, scaleMap]);

  const selectedBrand = wallBrands.find((brand) => brand.id === selectedBrandId) ?? null;
  const selectedIndex = selectedBrandId && wall ? wall.brandIds.indexOf(selectedBrandId) : -1;

  const availableBrands = useMemo(
    () => brands.filter((brand) => !(wall?.brandIds ?? []).includes(brand.id)).sort((a, b) => a.name.localeCompare(b.name)),
    [brands, wall?.brandIds]
  );

  const removeBrand = (id: string) => {
    if (!wall) return;
    setWall({ brandIds: wall.brandIds.filter((brandId) => brandId !== id) });
    if (selectedBrandId === id) setSelectedBrandId(null);
  };

  const addBrand = () => {
    if (!wall || !addId) return;
    setWall({ brandIds: [...wall.brandIds, addId] });
    setSelectedBrandId(addId);
    setAddId('');
  };

  const moveBrand = (from: number, to: number) => {
    if (!wall || to < 0 || to >= wall.brandIds.length || from === to) return;
    const next = [...wall.brandIds];
    const [id] = next.splice(from, 1);
    next.splice(to, 0, id);
    setWall({ brandIds: next });
  };

  const reorderBrand = (from: number, to: number, mode: 'swap' | 'before' | 'after') => {
    if (!wall) return;
    const ids = [...wall.brandIds];
    if (from < 0 || from >= ids.length || to < 0 || to >= ids.length || from === to) return;

    if (mode === 'swap') {
      [ids[from], ids[to]] = [ids[to], ids[from]];
    } else {
      const dragged = ids[from];
      const target = ids[to];
      const without = ids.filter((_, index) => index !== from);
      const targetPos = without.indexOf(target);
      if (targetPos < 0) return;
      without.splice(mode === 'before' ? targetPos : targetPos + 1, 0, dragged);
      ids.splice(0, ids.length, ...without);
    }

    setWall({ brandIds: ids });
  };

  const reset = () => {
    if (!payload) return;
    setWalls((prev) => ({ ...prev, [mode]: wallFromConfig(payload.config) }));
    setScalesByMode((prev) => ({
      ...prev,
      [mode]: Object.fromEntries(payload.brands.map((brand) => [brand.id, brand.scale ?? 1]))
    }));
  };

  const plan = useMemo(() => {
    if (!wall) return null;
    const settings: Record<string, unknown> = {
      'Show Brand Wall': wall.enabled,
      'Brand Wall Label': wall.label,
      'Brand Wall Layout': LAYOUT_LABEL[wall.layout],
      'Brands Colour On Hover': wall.colourOnHover,
      'Brand Wall Logo Height': wall.logoHeight,
      'Brand Wall Spacing': wall.spacing,
      'Home Brands': wall.brandIds
    };
    const brandScale = Object.fromEntries(
      wall.brandIds.map((id) => [id, round(scaleMap[id] ?? 1)])
    );
    const brandNames = Object.fromEntries(
      wall.brandIds.map((id) => [id, brands.find((brand) => brand.id === id)?.name ?? id])
    );
    return {
      generatedAt: new Date().toISOString(),
      mode,
      settings,
      brandScale,
      brandNames
    };
  }, [wall, scaleMap, brands, mode]);

  const planJson = plan ? JSON.stringify(plan, null, 2) : '';
  const prompt = plan
    ? `Apply this brand-wall plan to Airtable for the ${mode} portfolio. Update the Settings row and the Brand Scale values exactly as specified, and set Home Brands in this exact order. Preserve all other fields.\n\n\`\`\`json\n${planJson}\n\`\`\``
    : '';

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(`${label} copied`);
      window.setTimeout(() => setNotice(''), 1800);
    } catch {
      setNotice('Copy failed — clipboard permission denied');
    }
  };

  const download = () => {
    if (!plan) return;
    const blob = new Blob([planJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `brand-wall-plan-${mode}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Brand Wall Editor</h1>
          <p className="text-xs text-zinc-400">
            Live JSON · Cloudinary logos · no Airtable writes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                mode === item.id
                  ? 'bg-lime-300 text-zinc-950'
                  : 'border border-zinc-700 text-zinc-300 hover:border-lime-400'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button type="button" className={buttonClass} onClick={() => setPreviewDark((value) => !value)}>
            Preview: {previewDark ? 'Dark' : 'Light'}
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode((value) => !value)}
            className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
              previewMode
                ? 'bg-lime-300 text-zinc-950'
                : 'border border-zinc-700 text-zinc-300 hover:border-lime-400'
            }`}
          >
            {previewMode ? 'Edit' : 'Full preview'}
          </button>
          <button type="button" className={buttonClass} onClick={() => void load(mode)} disabled={loading !== null}>
            {loading === mode ? 'Loading…' : 'Reload live'}
          </button>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row">
        <section className={`min-w-0 flex-1 ${previewMode ? '' : 'p-4 lg:p-6'}`}>
          {error && (
            <div className="mb-4 rounded-md border border-red-800 bg-red-950/60 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <div
            className={previewMode
              ? 'w-full'
              : 'mx-auto w-full max-w-[1280px] overflow-hidden rounded-lg border border-zinc-800 shadow-2xl'}
            style={{
              ...previewVars(previewDark),
              backgroundColor: 'var(--color-bg-main)',
              color: 'var(--color-text-main)'
            }}
          >
            {!wall && (
              <div className="flex min-h-[420px] items-center justify-center text-sm text-zinc-500">
                {loading === mode ? 'Loading live wall…' : 'No wall data yet.'}
              </div>
            )}
            {wall && (
              <BrandWall
                brands={wallBrands}
                label={wall.label || THEME.brandWall.defaultLabel}
                layout={wall.layout}
                colourOnHover={wall.colourOnHover}
                logoHeight={wall.logoHeight}
                spacing={wall.spacing}
                edit={previewMode || wall.layout === 'marquee' ? undefined : {
                  selectedBrandId,
                  onSelect: setSelectedBrandId,
                  onReorder: reorderBrand
                }}
                className="pb-0 md:pb-0"
              />
            )}
          </div>

          {!previewMode && (
            <div className="mx-auto mt-3 flex max-w-[1280px] flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
              <span>
                {payload ? `${brands.length} brands loaded · ${wallBrands.length} on the wall` : 'Fetching live data…'}
              </span>
              <span>
                {wall?.layout === 'marquee'
                  ? 'Marquee preview · switch to Inline or Grid to drag'
                  : 'Click a logo to select · drag to reorder'}
              </span>
            </div>
          )}
        </section>

        {!previewMode && (
          <aside className="we-scroll w-full space-y-6 border-t border-zinc-800 bg-zinc-900/60 p-5 lg:h-[calc(100dvh-73px)] lg:w-[370px] lg:overflow-y-auto lg:border-l lg:border-t-0">
          {wall && payload ? (
            <>
              <Section title="Wall">
                <label className="block space-y-1 text-xs text-zinc-300">
                  <span>Label</span>
                  <input
                    className={inputClass}
                    value={wall.label}
                    onChange={(event) => setWall({ label: event.target.value })}
                  />
                </label>
                <label className="block space-y-1 text-xs text-zinc-300">
                  <span>Layout</span>
                  <select
                    className={inputClass}
                    value={wall.layout}
                    onChange={(event) => setWall({ layout: event.target.value as BrandWallLayout })}
                  >
                    <option value="inline">Inline</option>
                    <option value="grid">Grid</option>
                    <option value="marquee">Marquee</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={wall.enabled}
                    onChange={(event) => setWall({ enabled: event.target.checked })}
                  />
                  Show brand wall
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={wall.colourOnHover}
                    onChange={(event) => setWall({ colourOnHover: event.target.checked })}
                  />
                  Colour on hover
                </label>
              </Section>

              <Section title="Size & spacing">
                <SliderRow
                  label="Base logo height"
                  value={wall.logoHeight}
                  min={14}
                  max={40}
                  step={1}
                  suffix="px"
                  onChange={(value) => setWall({ logoHeight: value })}
                />
                <SliderRow
                  label="Spacing multiplier"
                  value={wall.spacing}
                  min={0.6}
                  max={1.6}
                  step={0.05}
                  suffix="×"
                  onChange={(value) => setWall({ spacing: value })}
                />
              </Section>

              <Section title="Selected logo">
                {selectedBrand ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-zinc-100">{selectedBrand.name}</p>
                        <p className="text-[11px] text-zinc-500">
                          Airtable Scale · drag the logo in the wall to reorder
                        </p>
                      </div>
                      <span className="font-mono text-xs text-zinc-400">
                        {(scaleMap[selectedBrand.id] ?? selectedBrand.scale ?? 1).toFixed(2)}×
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={1.5}
                      step={0.05}
                      value={scaleMap[selectedBrand.id] ?? 1}
                      onChange={(event) => setScale(selectedBrand.id, Number(event.target.value))}
                      className="w-full"
                      aria-label={`${selectedBrand.name} size scale`}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={buttonClass}
                        onClick={() => moveBrand(selectedIndex, selectedIndex - 1)}
                        disabled={selectedIndex <= 0}
                      >
                        ← Earlier
                      </button>
                      <button
                        type="button"
                        className={buttonClass}
                        onClick={() => moveBrand(selectedIndex, selectedIndex + 1)}
                        disabled={selectedIndex < 0 || selectedIndex >= wall.brandIds.length - 1}
                      >
                        Later →
                      </button>
                      <button
                        type="button"
                        className={`${buttonClass} hover:border-red-400 hover:text-red-300`}
                        onClick={() => removeBrand(selectedBrand.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-zinc-500">
                    Click any logo in the wall to edit its size, move it, or remove it.
                    Drag logos directly in the wall to reorder them.
                  </p>
                )}
              </Section>

              <Section title="Add brand">
                <div className="flex gap-2">
                  <select className={inputClass} value={addId} onChange={(event) => setAddId(event.target.value)}>
                    <option value="">Choose a brand…</option>
                    {availableBrands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                  <button type="button" className={buttonClass} onClick={addBrand} disabled={!addId}>Add</button>
                </div>
              </Section>

              <Section title="Export">
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={buttonClass} onClick={() => void copy(planJson, 'JSON plan')}>Copy JSON</button>
                  <button type="button" className={buttonClass} onClick={() => void copy(prompt, 'Prompt')}>Copy prompt</button>
                  <button type="button" className={buttonClass} onClick={download}>Download JSON</button>
                  <button type="button" className={buttonClass} onClick={reset}>Reset</button>
                </div>
                {notice && <p className="text-xs text-lime-300">{notice}</p>}
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  Download the plan, then apply it in the data repo with:
                  <br />
                  <code className="text-zinc-400">npm run apply:wall -- --plan brand-wall-plan-{mode}.json --apply</code>
                </p>
                <details className="rounded-md border border-zinc-800 bg-zinc-950">
                  <summary className="cursor-pointer px-3 py-2 text-xs text-zinc-400">Show plan JSON</summary>
                  <pre className="max-h-72 overflow-auto border-t border-zinc-800 p-3 text-[11px] leading-relaxed text-zinc-500">{planJson}</pre>
                </details>
              </Section>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Loading editor…</p>
          )}
        </aside>
        )}
      </main>
    </div>
  );
};
