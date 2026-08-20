import { useMemo, useState } from 'react'
import { useI18n } from '@/i18n'
import { PageHeader } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Menu } from '@/components/ui/Menu'
import { useToast } from '@/components/ui/Toast'
import { DEALS, STAGE_ORDER, type Deal, type StageId } from '@/data/mock'

/**
 * Figma: CRM / Deals Pipeline (light + dark frames).
 *
 * The board scrolls horizontally as a flex row, so RTL needs no special case —
 * the columns reverse with the document direction and the scrollbar starts at
 * the correct edge.
 *
 * The mock implies drag-and-drop. Dragging alone is not operable by keyboard or
 * screen reader, so the authoritative interaction here is a per-card
 * "Move to <stage>" menu; a pointer drag layer can be added on top of the same
 * `move()` call, never instead of it.
 */
export function DealsPage() {
  const { t, fmt } = useI18n()
  const toast = useToast()
  const [deals, setDeals] = useState<Deal[]>(DEALS)

  const byStage = useMemo(() => {
    const map = new Map<StageId, Deal[]>(STAGE_ORDER.map((stage) => [stage, []]))
    for (const deal of deals) map.get(deal.stage)?.push(deal)
    return map
  }, [deals])

  const move = (deal: Deal, stage: StageId) => {
    setDeals((prev) => prev.map((d) => (d.id === deal.id ? { ...d, stage } : d)))
    toast.push({
      tone: 'success',
      title: `${deal.title} → ${t(`crm.stage.${stage}`)}`,
    })
  }

  return (
    <>
      <PageHeader
        title={t('crm.pipeline')}
        subtitle={t('crm.pipelineHint')}
        actions={<Button iconStart="plus">{t('crm.addDeal')}</Button>}
      />

      <div className="nx-scroll -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
        {STAGE_ORDER.map((stage) => {
          const items = byStage.get(stage) ?? []
          const total = items.reduce((sum, deal) => sum + deal.amount, 0)
          return (
            <section
              key={stage}
              aria-label={t(`crm.stage.${stage}`)}
              className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-surface"
            >
              <header className="border-b border-border px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-body-sm font-semibold text-fg">
                    {t(`crm.stage.${stage}`)}
                  </h2>
                  <span className="num rounded-full bg-surface-2 px-2 py-0.5 text-caption text-fg-muted">
                    {fmt.number(items.length)}
                  </span>
                </div>
                <p className="num mt-0.5 text-caption text-fg-subtle">
                  {fmt.money(total, 'USD')}
                </p>
              </header>

              <ul className="flex-1 space-y-2 p-3">
                {items.map((deal) => (
                  <li
                    key={deal.id}
                    className="group rounded-md border border-border bg-surface p-3 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p dir="auto" className="truncate text-body-sm font-medium text-fg">
                          {deal.title}
                        </p>
                        {/* Without dir="auto", "Acme Inc." renders as ".Acme Inc"
                            in RTL — the trailing period is bidi-neutral and
                            snaps to the paragraph's leading edge. */}
                        <p dir="auto" className="truncate text-caption text-fg-subtle">
                          {deal.company}
                        </p>
                      </div>
                      <Menu
                        label={t('common.actions')}
                        items={STAGE_ORDER.filter((s) => s !== deal.stage).map((s) => ({
                          id: s,
                          label: t('crm.moveTo', { stage: t(`crm.stage.${s}`) }),
                          icon: 'chevronEnd',
                          onSelect: () => move(deal, s),
                        }))}
                      />
                    </div>
                    <p className="num mt-2 text-body-sm font-semibold text-fg">
                      {fmt.money(deal.amount, deal.currency)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="p-3 pt-0">
                <Button variant="ghost" size="sm" iconStart="plus" block className="justify-start">
                  {t('crm.addDeal')}
                </Button>
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
