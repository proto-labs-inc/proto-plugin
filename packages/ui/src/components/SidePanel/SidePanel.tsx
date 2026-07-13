'use client'

import { cva } from 'class-variance-authority'
import { Dialog } from 'radix-ui'
import React from 'react'

import { Button } from '../../components/Button/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/shadcn/ui/tooltip'
import { preventDismissOnPrototypePluginChrome } from '../../lib/prevent-prototype-plugin-chrome-dismiss'
import { cn } from '../../lib/utils'

export type SidePanelProps = RadixProps & CustomProps

interface RadixProps
  extends
    Dialog.DialogProps,
    Pick<
      Dialog.DialogContentProps,
      | 'onOpenAutoFocus'
      | 'onCloseAutoFocus'
      | 'onEscapeKeyDown'
      | 'onPointerDownOutside'
      | 'onInteractOutside'
      | 'onFocusOutside'
    > {}

interface CustomProps {
  id?: String | undefined
  disabled?: boolean
  className?: String
  children?: React.ReactNode
  header?: string | React.ReactNode
  visible: boolean
  size?: 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge' | 'xxxxlarge'
  loading?: boolean
  align?: 'right' | 'left'
  hideFooter?: boolean
  customFooter?: React.ReactNode
  onCancel?: () => void
  cancelText?: String
  onConfirm?: () => void
  confirmText?: String
  triggerElement?: React.ReactNode
  tooltip?: string
  /** Portal target — pass `#prototype-viewport` in proto-plugin previews so shelves stay inside the product frame. */
  portalContainer?: HTMLElement | null
}

export const sidePanelContentVariants = cva(
  cn('z-50 bg-popover flex flex-col fixed inset-y-0 h-full lg:h-screen border-l shadow-xl'),
  {
    variants: {
      size: {
        medium: `w-screen max-w-md h-full`,
        large: `w-screen max-w-2xl h-full`,
        xlarge: `w-screen max-w-3xl h-full`,
        xxlarge: `w-screen max-w-4xl h-full`,
        xxxlarge: `w-screen max-w-5xl h-full`,
        xxxxlarge: `w-screen max-w-6xl h-full`,
      },
      align: {
        left: `
          left-0
          data-open:animate-panel-slide-left-out
          data-closed:animate-panel-slide-left-in
        `,
        right: `
          right-0
          data-open:animate-panel-slide-right-out
          data-closed:animate-panel-slide-right-in
        `,
      },
    },
  }
)

const SidePanel = ({
  id,
  disabled,
  className,
  children,
  header,
  visible,
  open,
  size = 'medium',
  loading,
  align = 'right',
  hideFooter = false,
  customFooter = undefined,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  triggerElement,
  defaultOpen,
  tooltip,
  portalContainer,
  ...props
}: SidePanelProps) => {
  const isViewportScoped = portalContainer != null
  const footerContent = customFooter ? (
    customFooter
  ) : (
    <div className="flex justify-end gap-2 p-4 bg-overlay border-t">
      <div>
        <Button disabled={loading} variant="default" onClick={() => (onCancel ? onCancel() : null)}>
          {cancelText}
        </Button>
      </div>
      {!!onConfirm && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                type="submit"
                disabled={disabled || loading}
                loading={loading}
                onClick={onConfirm}
              >
                {confirmText}
              </Button>
            </span>
          </TooltipTrigger>
          {tooltip !== undefined && <TooltipContent side="bottom">{tooltip}</TooltipContent>}
        </Tooltip>
      )}
    </div>
  )

  function handleOpenChange(open: boolean) {
    if (visible !== undefined && !open) {
      // controlled component behaviour
      if (onCancel) onCancel()
    } else {
      // un-controlled component behaviour
      // setOpen(open)
    }
  }

  open = open || visible

  const {
    onOpenAutoFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    onFocusOutside,
  } = props

  const handleViewportScopedOutsideEvent = <E extends { preventDefault: () => void; target: EventTarget | null }>(
    event: E,
    userHandler?: (event: E) => void,
  ) => {
    const isToast = (event.target as Element | null)?.closest('#toast')
    if (isToast) event.preventDefault()
    if (isViewportScoped) preventDismissOnPrototypePluginChrome(event)
    userHandler?.(event)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={handleOpenChange}
      defaultOpen={defaultOpen}
      // Viewport-scoped shelves are product UI inside #prototype-viewport — keep review
      // sidebar and proto footer clickable (modal=true sets pointer-events:none on body).
      modal={!isViewportScoped}
    >
      {triggerElement && <Dialog.Trigger asChild>{triggerElement}</Dialog.Trigger>}

      <Dialog.Portal container={portalContainer ?? undefined}>
        <Dialog.Overlay
          className={cn(
            'z-50 inset-0 bg-alternative opacity-75 data-closed:animate-fade-out-overlay-bg data-open:animate-fade-in-overlay-bg',
            isViewportScoped ? 'absolute h-full w-full' : 'fixed h-full w-full left-0 top-0',
          )}
        />
        <Dialog.Content
          className={cn(
            sidePanelContentVariants({ align, size, className }),
            isViewportScoped && 'absolute h-full lg:h-full !w-full',
          )}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
          onEscapeKeyDown={onEscapeKeyDown}
          onPointerDownOutside={(event) => handleViewportScopedOutsideEvent(event, onPointerDownOutside)}
          onInteractOutside={(event) => handleViewportScopedOutsideEvent(event, onInteractOutside)}
          onFocusOutside={(event) => handleViewportScopedOutsideEvent(event, onFocusOutside)}
          {...props}
        >
          {header && (
            <header className="flex items-center space-y-1 py-4 px-4 bg-popover sm:px-6 border-b h-(--header-height)">
              {header}
            </header>
          )}
          <div className="relative flex-1 overflow-y-auto">{children}</div>
          {!hideFooter && footerContent}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function Separator() {
  return <div className="w-full h-px my-2 bg-border"></div>
}

export function Content({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('px-4 sm:px-6', className)}>{children}</div>
}

SidePanel.Content = Content
SidePanel.Separator = Separator
export default SidePanel
