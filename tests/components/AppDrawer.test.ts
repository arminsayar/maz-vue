import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AppDrawer from '~/components/ui/AppDrawer.vue'

/**
 * The drawer is the accessible surface behind the mobile hamburger: it must not
 * render while closed, must expose correct dialog semantics, must be dismissible
 * by Escape, backdrop and the close button, and must manage scroll lock and
 * focus so a keyboard user can never tab out into the page behind it.
 *
 * It teleports to <body>, so assertions query the document rather than the
 * wrapper's own tree.
 */
const panel = (): HTMLElement | null =>
  document.querySelector<HTMLElement>('.drawer__panel')

const backdrop = (): HTMLElement | null =>
  document.querySelector<HTMLElement>('.drawer__backdrop')

function mountDrawer(open: boolean) {
  return mount(AppDrawer, {
    props: { open, title: 'منو' },
    attachTo: document.body
  })
}

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('AppDrawer', () => {
  it('renders nothing while closed', () => {
    const wrapper = mountDrawer(false)

    expect(document.querySelector('.drawer')).toBeNull()
    wrapper.unmount()
  })

  it('teleports an accessible modal dialog to the body when open', async () => {
    const wrapper = mountDrawer(true)
    await flushPromises()

    expect(panel()?.getAttribute('role')).toBe('dialog')
    expect(panel()?.getAttribute('aria-modal')).toBe('true')
    expect(panel()?.getAttribute('aria-labelledby')).toBe('drawer-title')
    expect(document.getElementById('drawer-title')?.textContent).toBe('منو')
    expect(document.querySelector('.drawer')?.parentElement).toBe(document.body)

    wrapper.unmount()
  })

  it('names the close button from the closeLabel prop', async () => {
    const wrapper = mount(AppDrawer, {
      props: { open: true, title: 'منو', closeLabel: 'بستن منو' },
      attachTo: document.body
    })
    await flushPromises()

    expect(
      document.querySelector('.drawer__close')?.getAttribute('aria-label')
    ).toBe('بستن منو')

    wrapper.unmount()
  })

  it('renders the default and footer slots', async () => {
    const wrapper = mount(AppDrawer, {
      props: { open: true, title: 'منو' },
      slots: {
        default: '<p class="slot-body">Body content</p>',
        footer: '<button class="slot-footer">Apply</button>'
      },
      attachTo: document.body
    })
    await flushPromises()

    expect(document.querySelector('.drawer__body .slot-body')?.textContent).toBe(
      'Body content'
    )
    expect(
      document.querySelector('.drawer__footer .slot-footer')?.textContent
    ).toBe('Apply')

    wrapper.unmount()
  })

  it('omits the footer bar entirely when no footer slot is passed', async () => {
    const wrapper = mountDrawer(true)
    await flushPromises()

    expect(document.querySelector('.drawer__footer')).toBeNull()

    wrapper.unmount()
  })

  it('locks body scroll while open and restores it on close', async () => {
    const wrapper = mountDrawer(true)
    await flushPromises()
    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ open: false })
    expect(document.body.style.overflow).toBe('')

    wrapper.unmount()
  })

  it('moves focus into the panel on open and restores it on close', async () => {
    const opener = document.createElement('button')
    document.body.append(opener)
    opener.focus()

    const wrapper = mountDrawer(true)
    await flushPromises()

    expect(document.activeElement?.getAttribute('aria-label')).toBe('بستن')

    await wrapper.setProps({ open: false })
    expect(document.activeElement).toBe(opener)

    wrapper.unmount()
  })

  it('emits close on Escape', async () => {
    const wrapper = mountDrawer(true)
    await flushPromises()

    panel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('emits close on backdrop click and on the close button', async () => {
    const wrapper = mountDrawer(true)
    await flushPromises()

    backdrop()?.dispatchEvent(new MouseEvent('click'))
    document
      .querySelector<HTMLButtonElement>('.drawer__close')
      ?.dispatchEvent(new MouseEvent('click'))

    expect(wrapper.emitted('close')).toHaveLength(2)
    wrapper.unmount()
  })

  it('traps Tab focus inside the panel', async () => {
    const wrapper = mount(AppDrawer, {
      props: { open: true, title: 'منو' },
      slots: { default: '<button class="inner">Inner action</button>' },
      attachTo: document.body
    })
    await flushPromises()

    const close = document.querySelector<HTMLElement>('.drawer__close')
    const inner = document.querySelector<HTMLElement>('.inner')
    expect(close).not.toBeNull()
    expect(inner).not.toBeNull()

    // Forward from the last element wraps to the first.
    inner?.focus()
    panel()?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    )
    expect(document.activeElement).toBe(close)

    // Backwards from the first element wraps to the last.
    close?.focus()
    panel()?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
    )
    expect(document.activeElement).toBe(inner)

    wrapper.unmount()
  })
})