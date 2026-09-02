/**
 * AI assistant boundary (Milestone N0 — interfaces only).
 *
 * NO MODEL, PROVIDER, SDK, API KEY, OR NETWORK CALL EXISTS. No AI vendor has
 * been selected (see docs/WHATSAPP_AI_ARCHITECTURE.md §18).
 *
 * The design principle throughout: the assistant's safety comes from what it
 * is structurally unable to do, not from what it is instructed not to do. A
 * system prompt saying "never reveal other customers" is worth including and
 * worth nothing on its own — it is the last layer, not the first.
 */
import type { Locale } from '@/i18n/config'
import type { HandoffReason } from '@/lib/messaging/types'

/**
 * The ONLY data the assistant may see about the academy.
 *
 * Note the shape of this interface, which is the actual control: every
 * method is a named, fixed read. None takes a collection name, a query, a
 * filter, or a document id chosen by the caller. There is deliberately no
 * `search(collection, where)`, no `getDocument(id)`, no `callPayload`, and no
 * `executeSQL` — the capability does not exist to be misused, which is a
 * stronger guarantee than a rule against using it.
 *
 * Out of scope permanently: other customers' Applications, Users,
 * internalNotes, assignedTo, drafts or unpublished content, environment
 * values, database credentials, PAYLOAD_SECRET.
 *
 * Implementations must read through the same published-only access path the
 * public site uses, rather than a parallel query that could drift from it
 * and start returning drafts.
 */
export interface ApprovedKnowledgeSource {
  getPublishedCourses(locale: Locale): Promise<ApprovedCourse[]>
  getCourseBySlug(slug: string, locale: Locale): Promise<ApprovedCourse | null>
  getPublishedFaqs(locale: Locale): Promise<ApprovedFaq[]>
  /** Public contact details only — the same ones already on the website. */
  getPublicContact(locale: Locale): Promise<ApprovedContact>
}

/**
 * A course as the assistant may describe it. Anything absent here is a fact
 * the assistant does not have and must not supply — notably price, schedule,
 * dates, accreditation, and outcomes, none of which are approved content
 * today.
 */
export interface ApprovedCourse {
  slug: string
  title: string
  summary?: string
  /** Only fields the business has approved for public statement. */
  details?: string
}

export interface ApprovedFaq {
  question: string
  answer: string
}

export interface ApprovedContact {
  whatsappNumber?: string
  email?: string
  phone?: string
  address?: string
}

/**
 * What the assistant is given for one turn. Assembled entirely server-side.
 *
 * `customerMessage` is UNTRUSTED. It is passed as data in a delimited role,
 * never concatenated into system instructions. An instruction hidden inside
 * it must fail because the capability does not exist, not because the model
 * declined to comply.
 */
export interface AssistantContext {
  conversationId: string
  language: Locale
  /** Prior turns, already trimmed to what is needed. */
  history: ReadonlyArray<{ actor: 'customer' | 'assistant' | 'staff'; text: string }>
  customerMessage: string
  knowledge: ApprovedKnowledgeSource
}

/** Reading of how ready this person is. An observation, not an instruction. */
export type Qualification = 'unknown' | 'exploring' | 'interested' | 'ready'

/**
 * What the assistant returns.
 *
 * Deliberately DIFFERENT from the shape sketched in the milestone brief: it
 * has NO `nextAction` field. An action field invites the model to name an
 * operation and the application to perform it, which quietly turns generated
 * prose into an instruction channel. Instead the assistant reports
 * OBSERVATIONS, and application code decides what they mean — a
 * `wantsConsultation` signal may *propose* a status change, and
 * `canTransition` (src/lib/leads/transitions.ts) independently decides
 * whether that transition is even legal.
 *
 * Validated by ./decisionSchema.ts before any use. It is never trusted as
 * returned.
 */
export interface AssistantDecision {
  /** The text to send back. Sent to the conversation's own number — the
   * destination is never model-controlled. */
  reply: string
  /** Detected language of the customer's message; may differ from the
   * conversation's language so far, and that is expected. */
  detectedLanguage: Locale
  signals: {
    /** Must resolve to a PUBLISHED course; dropped by the validator if not. */
    courseSlug?: string
    wantsConsultation?: boolean
    wantsHuman?: boolean
    qualification?: Qualification
  }
  /** Non-null means stop automation and bring in a person. */
  handoff: { reason: HandoffReason } | null
  /** `low` triggers handoff rather than a best guess. */
  confidence: 'high' | 'low'
}

/**
 * The assistant itself. One method, because one turn in, one decision out is
 * the entire contract — anything wider would be a place for side effects to
 * hide.
 *
 * Implementations must not write to the database, send messages, or call
 * anything beyond the model and the approved knowledge source.
 */
export interface Assistant {
  respond(context: AssistantContext): Promise<AssistantDecision>
}
