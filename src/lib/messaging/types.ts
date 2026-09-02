/**
 * Domain vocabulary for the future lead-follow-up messaging system
 * (Milestone N0 — architecture only; see docs/WHATSAPP_AI_ARCHITECTURE.md).
 *
 * NOTHING IS CONNECTED. These are types and pure functions. No provider,
 * credential, webhook, worker, or network call exists anywhere in this
 * directory, and none should be added until a provider is chosen.
 *
 * These types are deliberately OURS, not any provider's. Everything inward
 * of `MessagingProvider` (./provider.ts) speaks this vocabulary; the adapter
 * translates at the boundary. The core application must never handle a
 * Meta-shaped object, so that swapping providers is an adapter change rather
 * than an application rewrite.
 *
 * No Payload collection exists for these yet, on purpose — they land in N1
 * with the code that fills them. See the architecture doc §4 for why adding
 * the tables early would be the more expensive choice under formal migration
 * discipline.
 */
import type { Locale } from '@/i18n/config'

/** The only channel in scope. The field exists so that adding a second one
 * later is a new value rather than a change in what existing rows mean. */
export type MessageChannel = 'whatsapp'

export type MessageDirection = 'inbound' | 'outbound'

/**
 * Who composed the message — distinct from `direction` because staff and
 * automation both produce outbound messages, and telling them apart is what
 * lets a human take over a conversation without the audit trail becoming
 * ambiguous about who said what.
 */
export type MessageActor = 'customer' | 'automation' | 'staff'

/**
 * Provider-side delivery lifecycle. Deliberately separate from
 * `Application.status` (the business lifecycle) — a lead can be `engaged`
 * while a message to them is `failed`, and both facts need to be
 * representable at once. Merging rules live in ./deliveryStatus.ts.
 */
export type DeliveryStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed'

/** Why a conversation is no longer being handled by automation. */
export type ConversationState = 'active' | 'paused' | 'handed_off' | 'closed'

/**
 * Triggers that must stop automation and bring in a person. Kept as a closed
 * set rather than free text so that "why did this get handed off?" is a
 * queryable question and the AI cannot invent a new category.
 */
export type HandoffReason =
  | 'customer_requested_human'
  | 'pricing_or_discount'
  | 'certification_or_legal'
  | 'complaint'
  | 'outside_approved_knowledge'
  | 'low_confidence'
  | 'repeated_misunderstanding'
  | 'safety_sensitive'
  | 'enrollment_commitment'
  | 'validation_failed'

/**
 * One conversation thread with one lead on one channel.
 *
 * Unique on (application, channel): concurrent inbound events must not be
 * able to open two threads for the same person.
 */
export interface Conversation {
  id: string
  /** The Application (lead) this belongs to. */
  applicationId: string
  channel: MessageChannel
  state: ConversationState
  /**
   * Current conversation language. Seeded from the lead's
   * `preferredLanguage` but NOT locked to it — people switch languages
   * mid-conversation, and someone who submitted the form in Arabic may
   * reasonably continue in English.
   */
  language: Locale
  /** Staff kill switch. When false, automation must not send anything. */
  automationEnabled: boolean
  automationPausedAt?: string
  automationPausedReason?: HandoffReason
  handoffReason?: HandoffReason
  /** Drives follow-up timing and provider messaging-window rules. */
  lastInboundAt?: string
  lastOutboundAt?: string
}

/**
 * One message in a conversation.
 *
 * `body` is typed as optional on purpose: whether conversation content is
 * stored at all is an unresolved retention decision (architecture doc §16),
 * and the type should not imply an answer the business has not given.
 */
export interface Message {
  id: string
  conversationId: string
  direction: MessageDirection
  actor: MessageActor
  channel: MessageChannel
  deliveryStatus: DeliveryStatus
  /** The provider's own id — the idempotency key for inbound events. */
  providerMessageId?: string
  /** For template sends; the provider's template id stays external config. */
  templateKey?: string
  templateVariables?: Record<string, string>
  body?: string
  /** Normalized, non-PII failure category — never a raw provider blob. */
  failureCode?: string
  /** Provider's timestamp for the event, distinct from row creation time. */
  occurredAt: string
}

/**
 * A message the application wants sent. Note what is absent: there is no
 * recipient field. The destination is always derived from the conversation
 * server-side, never supplied by a caller and never by an AI response —
 * see the architecture doc §10.
 */
export interface OutboundMessageRequest {
  conversationId: string
  actor: Extract<MessageActor, 'automation' | 'staff'>
  language: Locale
  /** Free-form text. Valid only inside an open messaging window. */
  body?: string
  /** Approved template, for business-initiated messages outside that window. */
  templateKey?: string
  templateVariables?: Record<string, string>
}
