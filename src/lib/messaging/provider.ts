import type { Locale } from '@/i18n/config'
import type { DeliveryStatus, MessageChannel, OutboundMessageRequest } from './types'

/**
 * The provider boundary (Milestone N0 — interface only).
 *
 * NO IMPLEMENTATION EXISTS AND NONE SHOULD BE WRITTEN until a WhatsApp
 * provider is actually chosen and credentialed. A stub that pretends to send
 * is worse than an empty directory: it makes every call site look exercised
 * when nothing has ever been delivered to anyone, and that illusion survives
 * right up until production.
 *
 * Future implementations must use an OFFICIAL WhatsApp Business API — Meta's
 * Cloud API directly, or a licensed Business Solution Provider. Browser
 * automation, WhatsApp Web scraping, reverse-engineered clients, cookie
 * replay, and phone emulators are permanently out of scope: they break
 * without warning, get business numbers banned, and put real customer
 * conversations on an unsupported footing.
 *
 * The adapter's job is translation in both directions. Everything inward of
 * this interface speaks the vocabulary in ./types.ts; nothing inward should
 * ever see a provider-shaped payload.
 */

/** An inbound message from a customer, already translated out of the
 * provider's shape. */
export interface NormalizedInboundMessage {
  kind: 'message'
  channel: MessageChannel
  /** Provider's message id — the idempotency key (architecture doc §14). */
  providerMessageId: string
  /** The sender, in E.164. Used to locate the conversation — never to create
   * a destination for a reply, which always comes from our own records. */
  fromE164: string
  text: string
  /** Provider timestamp; used for replay-window checks. */
  occurredAt: string
}

/** A delivery receipt for something we sent. */
export interface NormalizedDeliveryReceipt {
  kind: 'delivery'
  channel: MessageChannel
  providerMessageId: string
  status: DeliveryStatus
  /** Normalized failure category — never a raw provider error blob, which
   * tends to contain the recipient's number. */
  failureCode?: string
  occurredAt: string
}

export type NormalizedInboundEvent = NormalizedInboundMessage | NormalizedDeliveryReceipt

export interface SendResult {
  /** Provider's id for the message we just sent, when it returns one. */
  providerMessageId?: string
  /** Provider's initial status — usually `queued` or `sent`. */
  status: DeliveryStatus
}

/**
 * A business-initiated message. Most providers require a pre-approved
 * template outside an open customer-initiated window.
 *
 * `templateKey` is OURS; the provider's template id stays external
 * configuration resolved at send time. No template names are invented in
 * this codebase — real template content has to be written by the business,
 * translated properly into all three languages, and submitted for provider
 * approval, which is a legal and marketing task rather than an engineering
 * one.
 */
export interface TemplateSendRequest {
  conversationId: string
  templateKey: string
  locale: Locale
  variables?: Record<string, string>
}

export interface MessagingProvider {
  readonly channel: MessageChannel

  /** Free-form text. Valid only inside an open messaging window. */
  sendMessage(request: OutboundMessageRequest): Promise<SendResult>

  /** Approved template, for business-initiated messages. */
  sendTemplate(request: TemplateSendRequest): Promise<SendResult>

  /**
   * Verify the provider's signature over the RAW request body, in constant
   * time, BEFORE any parsing.
   *
   * Order matters and is not stylistic: an unverified body is an attacker's
   * input, and parsing it first means untrusted data has already been
   * interpreted before anyone checked whether it came from the provider.
   */
  verifyWebhook(rawBody: string, headers: Headers): boolean

  /**
   * Translate a verified provider payload into our own events. Must validate
   * shape rather than trusting it — a verified signature proves the sender,
   * not that the payload matches last year's documented schema.
   */
  parseWebhook(rawBody: string): NormalizedInboundEvent[]

  /** Map a provider status string onto our five values (./types.ts). */
  normalizeDeliveryStatus(providerStatus: string): DeliveryStatus
}
