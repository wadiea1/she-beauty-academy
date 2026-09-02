import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ar', 'he', 'en');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'advisor');
  CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_courses_pricing_type" AS ENUM('exact', 'startingFrom', 'range', 'onRequest', 'hidden');
  CREATE TYPE "public"."enum_courses_currency" AS ENUM('ILS', 'USD');
  CREATE TYPE "public"."enum_courses_enrollment_state" AS ENUM('unspecified', 'open', 'closed', 'comingSoon', 'full');
  CREATE TYPE "public"."enum_courses_certification_type" AS ENUM('none', 'professionalDiploma');
  CREATE TYPE "public"."enum_faqs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_applications_status" AS ENUM('new', 'automatic_followup', 'engaged', 'qualified', 'consultation_booked', 'visited', 'enrolled', 'no_answer', 'follow_up', 'not_now', 'not_interested', 'invalid', 'spam');
  CREATE TYPE "public"."enum_applications_source" AS ENUM('homepage', 'course_page');
  CREATE TYPE "public"."enum_applications_preferred_language" AS ENUM('ar', 'he', 'en');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_published_locale" AS ENUM('ar', 'he', 'en');
  CREATE TYPE "public"."enum_navigation_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__navigation_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__navigation_v_published_locale" AS ENUM('ar', 'he', 'en');
  CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_published_locale" AS ENUM('ar', 'he', 'en');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'advisor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "courses_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "courses_curriculum" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "courses_curriculum_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "courses_outcomes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "courses_outcomes_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_courses_status" DEFAULT 'draft' NOT NULL,
  	"order" numeric DEFAULT 0,
  	"slug" varchar NOT NULL,
  	"hero_image_id" integer,
  	"pricing_type" "enum_courses_pricing_type" DEFAULT 'onRequest' NOT NULL,
  	"price" numeric,
  	"price_range_min" numeric,
  	"price_range_max" numeric,
  	"currency" "enum_courses_currency" DEFAULT 'ILS',
  	"enrollment_state" "enum_courses_enrollment_state" DEFAULT 'unspecified' NOT NULL,
  	"certification_type" "enum_courses_certification_type" DEFAULT 'none',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "courses_locales" (
  	"title" varchar NOT NULL,
  	"short_description" varchar NOT NULL,
  	"description" varchar,
  	"audience" varchar,
  	"cta_label" varchar,
  	"duration" varchar,
  	"schedule_info" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_faqs_status" DEFAULT 'draft' NOT NULL,
  	"order" numeric DEFAULT 0,
  	"related_course_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_testimonials_status" DEFAULT 'draft' NOT NULL,
  	"consent_obtained" boolean DEFAULT false NOT NULL,
  	"consent_note" varchar,
  	"related_course_id" integer,
  	"author_name" varchar NOT NULL,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials_locales" (
  	"author_role" varchar,
  	"quote" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_applications_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer,
  	"consultation_at" timestamp(3) with time zone,
  	"source" "enum_applications_source",
  	"internal_notes" varchar,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"preferred_language" "enum_applications_preferred_language" DEFAULT 'ar' NOT NULL,
  	"interested_course_id" integer,
  	"message" varchar,
  	"privacy_consent_at" timestamp(3) with time zone NOT NULL,
  	"privacy_policy_version" varchar,
  	"marketing_consent" boolean DEFAULT false,
  	"marketing_consent_at" timestamp(3) with time zone,
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"courses_id" integer,
  	"faqs_id" integer,
  	"testimonials_id" integer,
  	"applications_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"whatsapp_number" varchar,
  	"instagram_handle" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"default_seo_og_image_id" integer,
  	"_status" "enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"address" varchar,
  	"default_seo_meta_title" varchar,
  	"default_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_whatsapp_number" varchar,
  	"version_instagram_handle" varchar,
  	"version_email" varchar,
  	"version_phone" varchar,
  	"version_default_seo_og_image_id" integer,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__site_settings_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_site_settings_v_locales" (
  	"version_address" varchar,
  	"version_default_seo_meta_title" varchar,
  	"version_default_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"path" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_items_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_status" "enum_navigation_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_navigation_v_version_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_items_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_navigation_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__navigation_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__navigation_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "homepage_why_s_h_e_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_why_s_h_e_pillars_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_inside_academy_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "homepage_inside_academy_images_locales" (
  	"placeholder_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_what_you_leave_with_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_what_you_leave_with_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_instructor_bio" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_instructor_bio_locales" (
  	"paragraph" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"instructor_photo_id" integer,
  	"_status" "enum_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_locales" (
  	"hero_eyebrow" varchar,
  	"hero_heading" varchar,
  	"hero_lead" varchar,
  	"manifesto_eyebrow" varchar,
  	"manifesto_heading" varchar,
  	"manifesto_body" varchar,
  	"why_s_h_e_eyebrow" varchar,
  	"why_s_h_e_heading" varchar,
  	"courses_intro_eyebrow" varchar,
  	"courses_intro_heading" varchar,
  	"courses_intro_intro" varchar,
  	"inside_academy_eyebrow" varchar,
  	"inside_academy_heading" varchar,
  	"inside_academy_body" varchar,
  	"what_you_leave_with_eyebrow" varchar,
  	"what_you_leave_with_heading" varchar,
  	"instructor_eyebrow" varchar,
  	"instructor_heading" varchar,
  	"instructor_role" varchar,
  	"instructor_photo_alt" varchar,
  	"faq_intro_eyebrow" varchar,
  	"faq_intro_heading" varchar,
  	"apply_eyebrow" varchar,
  	"apply_heading" varchar,
  	"apply_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_why_s_h_e_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_why_s_h_e_pillars_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_inside_academy_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_inside_academy_images_locales" (
  	"placeholder_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_what_you_leave_with_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_what_you_leave_with_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_instructor_bio" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_instructor_bio_locales" (
  	"paragraph" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_image_id" integer,
  	"version_instructor_photo_id" integer,
  	"version__status" "enum__homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__homepage_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_homepage_v_locales" (
  	"version_hero_eyebrow" varchar,
  	"version_hero_heading" varchar,
  	"version_hero_lead" varchar,
  	"version_manifesto_eyebrow" varchar,
  	"version_manifesto_heading" varchar,
  	"version_manifesto_body" varchar,
  	"version_why_s_h_e_eyebrow" varchar,
  	"version_why_s_h_e_heading" varchar,
  	"version_courses_intro_eyebrow" varchar,
  	"version_courses_intro_heading" varchar,
  	"version_courses_intro_intro" varchar,
  	"version_inside_academy_eyebrow" varchar,
  	"version_inside_academy_heading" varchar,
  	"version_inside_academy_body" varchar,
  	"version_what_you_leave_with_eyebrow" varchar,
  	"version_what_you_leave_with_heading" varchar,
  	"version_instructor_eyebrow" varchar,
  	"version_instructor_heading" varchar,
  	"version_instructor_role" varchar,
  	"version_instructor_photo_alt" varchar,
  	"version_faq_intro_eyebrow" varchar,
  	"version_faq_intro_heading" varchar,
  	"version_apply_eyebrow" varchar,
  	"version_apply_heading" varchar,
  	"version_apply_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_gallery" ADD CONSTRAINT "courses_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_gallery" ADD CONSTRAINT "courses_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_curriculum" ADD CONSTRAINT "courses_curriculum_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_curriculum_locales" ADD CONSTRAINT "courses_curriculum_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_curriculum"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_outcomes" ADD CONSTRAINT "courses_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_outcomes_locales" ADD CONSTRAINT "courses_outcomes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_outcomes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_locales" ADD CONSTRAINT "courses_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_related_course_id_courses_id_fk" FOREIGN KEY ("related_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_related_course_id_courses_id_fk" FOREIGN KEY ("related_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "applications" ADD CONSTRAINT "applications_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "applications" ADD CONSTRAINT "applications_interested_course_id_courses_id_fk" FOREIGN KEY ("interested_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_seo_og_image_id_media_id_fk" FOREIGN KEY ("default_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_default_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_default_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_locales" ADD CONSTRAINT "_site_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_locales" ADD CONSTRAINT "navigation_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_items" ADD CONSTRAINT "_navigation_v_version_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_items_locales" ADD CONSTRAINT "_navigation_v_version_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_why_s_h_e_pillars" ADD CONSTRAINT "homepage_why_s_h_e_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_why_s_h_e_pillars_locales" ADD CONSTRAINT "homepage_why_s_h_e_pillars_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_why_s_h_e_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_inside_academy_images" ADD CONSTRAINT "homepage_inside_academy_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_inside_academy_images" ADD CONSTRAINT "homepage_inside_academy_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_inside_academy_images_locales" ADD CONSTRAINT "homepage_inside_academy_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_inside_academy_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_what_you_leave_with_points" ADD CONSTRAINT "homepage_what_you_leave_with_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_what_you_leave_with_points_locales" ADD CONSTRAINT "homepage_what_you_leave_with_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_what_you_leave_with_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_instructor_bio" ADD CONSTRAINT "homepage_instructor_bio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_instructor_bio_locales" ADD CONSTRAINT "homepage_instructor_bio_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_instructor_bio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_instructor_photo_id_media_id_fk" FOREIGN KEY ("instructor_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_locales" ADD CONSTRAINT "homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_why_s_h_e_pillars" ADD CONSTRAINT "_homepage_v_version_why_s_h_e_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_why_s_h_e_pillars_locales" ADD CONSTRAINT "_homepage_v_version_why_s_h_e_pillars_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_why_s_h_e_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_inside_academy_images" ADD CONSTRAINT "_homepage_v_version_inside_academy_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_inside_academy_images" ADD CONSTRAINT "_homepage_v_version_inside_academy_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_inside_academy_images_locales" ADD CONSTRAINT "_homepage_v_version_inside_academy_images_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_inside_academy_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_what_you_leave_with_points" ADD CONSTRAINT "_homepage_v_version_what_you_leave_with_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_what_you_leave_with_points_locales" ADD CONSTRAINT "_homepage_v_version_what_you_leave_with_points_locales_pa_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_what_you_leave_with_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_instructor_bio" ADD CONSTRAINT "_homepage_v_version_instructor_bio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_instructor_bio_locales" ADD CONSTRAINT "_homepage_v_version_instructor_bio_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_instructor_bio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_instructor_photo_id_media_id_fk" FOREIGN KEY ("version_instructor_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_locales" ADD CONSTRAINT "_homepage_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "courses_gallery_order_idx" ON "courses_gallery" USING btree ("_order");
  CREATE INDEX "courses_gallery_parent_id_idx" ON "courses_gallery" USING btree ("_parent_id");
  CREATE INDEX "courses_gallery_image_idx" ON "courses_gallery" USING btree ("image_id");
  CREATE INDEX "courses_curriculum_order_idx" ON "courses_curriculum" USING btree ("_order");
  CREATE INDEX "courses_curriculum_parent_id_idx" ON "courses_curriculum" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "courses_curriculum_locales_locale_parent_id_unique" ON "courses_curriculum_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "courses_outcomes_order_idx" ON "courses_outcomes" USING btree ("_order");
  CREATE INDEX "courses_outcomes_parent_id_idx" ON "courses_outcomes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "courses_outcomes_locales_locale_parent_id_unique" ON "courses_outcomes_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE INDEX "courses_hero_image_idx" ON "courses" USING btree ("hero_image_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE UNIQUE INDEX "courses_locales_locale_parent_id_unique" ON "courses_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_related_course_idx" ON "faqs" USING btree ("related_course_id");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_related_course_idx" ON "testimonials" USING btree ("related_course_id");
  CREATE INDEX "testimonials_photo_idx" ON "testimonials" USING btree ("photo_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "applications_assigned_to_idx" ON "applications" USING btree ("assigned_to_id");
  CREATE INDEX "applications_interested_course_idx" ON "applications" USING btree ("interested_course_id");
  CREATE INDEX "applications_updated_at_idx" ON "applications" USING btree ("updated_at");
  CREATE INDEX "applications_created_at_idx" ON "applications" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("applications_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_default_seo_default_seo_og_image_idx" ON "site_settings" USING btree ("default_seo_og_image_id");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_version_default_seo_version_default_seo_idx" ON "_site_settings_v" USING btree ("version_default_seo_og_image_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_snapshot_idx" ON "_site_settings_v" USING btree ("snapshot");
  CREATE INDEX "_site_settings_v_published_locale_idx" ON "_site_settings_v" USING btree ("published_locale");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_site_settings_v_locales_locale_parent_id_unique" ON "_site_settings_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_items_locales_locale_parent_id_unique" ON "navigation_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation__status_idx" ON "navigation" USING btree ("_status");
  CREATE INDEX "_navigation_v_version_items_order_idx" ON "_navigation_v_version_items" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_items_parent_id_idx" ON "_navigation_v_version_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_navigation_v_version_items_locales_locale_parent_id_unique" ON "_navigation_v_version_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_version_version__status_idx" ON "_navigation_v" USING btree ("version__status");
  CREATE INDEX "_navigation_v_created_at_idx" ON "_navigation_v" USING btree ("created_at");
  CREATE INDEX "_navigation_v_updated_at_idx" ON "_navigation_v" USING btree ("updated_at");
  CREATE INDEX "_navigation_v_snapshot_idx" ON "_navigation_v" USING btree ("snapshot");
  CREATE INDEX "_navigation_v_published_locale_idx" ON "_navigation_v" USING btree ("published_locale");
  CREATE INDEX "_navigation_v_latest_idx" ON "_navigation_v" USING btree ("latest");
  CREATE INDEX "homepage_why_s_h_e_pillars_order_idx" ON "homepage_why_s_h_e_pillars" USING btree ("_order");
  CREATE INDEX "homepage_why_s_h_e_pillars_parent_id_idx" ON "homepage_why_s_h_e_pillars" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_why_s_h_e_pillars_locales_locale_parent_id_unique" ON "homepage_why_s_h_e_pillars_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_inside_academy_images_order_idx" ON "homepage_inside_academy_images" USING btree ("_order");
  CREATE INDEX "homepage_inside_academy_images_parent_id_idx" ON "homepage_inside_academy_images" USING btree ("_parent_id");
  CREATE INDEX "homepage_inside_academy_images_image_idx" ON "homepage_inside_academy_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "homepage_inside_academy_images_locales_locale_parent_id_uniq" ON "homepage_inside_academy_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_what_you_leave_with_points_order_idx" ON "homepage_what_you_leave_with_points" USING btree ("_order");
  CREATE INDEX "homepage_what_you_leave_with_points_parent_id_idx" ON "homepage_what_you_leave_with_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_what_you_leave_with_points_locales_locale_parent_id" ON "homepage_what_you_leave_with_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_instructor_bio_order_idx" ON "homepage_instructor_bio" USING btree ("_order");
  CREATE INDEX "homepage_instructor_bio_parent_id_idx" ON "homepage_instructor_bio" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_instructor_bio_locales_locale_parent_id_unique" ON "homepage_instructor_bio_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_hero_hero_image_idx" ON "homepage" USING btree ("hero_image_id");
  CREATE INDEX "homepage_instructor_instructor_photo_idx" ON "homepage" USING btree ("instructor_photo_id");
  CREATE INDEX "homepage__status_idx" ON "homepage" USING btree ("_status");
  CREATE UNIQUE INDEX "homepage_locales_locale_parent_id_unique" ON "homepage_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_why_s_h_e_pillars_order_idx" ON "_homepage_v_version_why_s_h_e_pillars" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_why_s_h_e_pillars_parent_id_idx" ON "_homepage_v_version_why_s_h_e_pillars" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_why_s_h_e_pillars_locales_locale_parent_" ON "_homepage_v_version_why_s_h_e_pillars_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_inside_academy_images_order_idx" ON "_homepage_v_version_inside_academy_images" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_inside_academy_images_parent_id_idx" ON "_homepage_v_version_inside_academy_images" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_inside_academy_images_image_idx" ON "_homepage_v_version_inside_academy_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "_homepage_v_version_inside_academy_images_locales_locale_par" ON "_homepage_v_version_inside_academy_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_what_you_leave_with_points_order_idx" ON "_homepage_v_version_what_you_leave_with_points" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_what_you_leave_with_points_parent_id_idx" ON "_homepage_v_version_what_you_leave_with_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_what_you_leave_with_points_locales_local" ON "_homepage_v_version_what_you_leave_with_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_instructor_bio_order_idx" ON "_homepage_v_version_instructor_bio" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_instructor_bio_parent_id_idx" ON "_homepage_v_version_instructor_bio" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_instructor_bio_locales_locale_parent_id_" ON "_homepage_v_version_instructor_bio_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_hero_version_hero_image_idx" ON "_homepage_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_homepage_v_version_instructor_version_instructor_photo_idx" ON "_homepage_v" USING btree ("version_instructor_photo_id");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_snapshot_idx" ON "_homepage_v" USING btree ("snapshot");
  CREATE INDEX "_homepage_v_published_locale_idx" ON "_homepage_v" USING btree ("published_locale");
  CREATE INDEX "_homepage_v_latest_idx" ON "_homepage_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_homepage_v_locales_locale_parent_id_unique" ON "_homepage_v_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "courses_gallery" CASCADE;
  DROP TABLE "courses_curriculum" CASCADE;
  DROP TABLE "courses_curriculum_locales" CASCADE;
  DROP TABLE "courses_outcomes" CASCADE;
  DROP TABLE "courses_outcomes_locales" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "courses_locales" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "faqs_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "applications" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_site_settings_v_locales" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation_items_locales" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "_navigation_v_version_items" CASCADE;
  DROP TABLE "_navigation_v_version_items_locales" CASCADE;
  DROP TABLE "_navigation_v" CASCADE;
  DROP TABLE "homepage_why_s_h_e_pillars" CASCADE;
  DROP TABLE "homepage_why_s_h_e_pillars_locales" CASCADE;
  DROP TABLE "homepage_inside_academy_images" CASCADE;
  DROP TABLE "homepage_inside_academy_images_locales" CASCADE;
  DROP TABLE "homepage_what_you_leave_with_points" CASCADE;
  DROP TABLE "homepage_what_you_leave_with_points_locales" CASCADE;
  DROP TABLE "homepage_instructor_bio" CASCADE;
  DROP TABLE "homepage_instructor_bio_locales" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_locales" CASCADE;
  DROP TABLE "_homepage_v_version_why_s_h_e_pillars" CASCADE;
  DROP TABLE "_homepage_v_version_why_s_h_e_pillars_locales" CASCADE;
  DROP TABLE "_homepage_v_version_inside_academy_images" CASCADE;
  DROP TABLE "_homepage_v_version_inside_academy_images_locales" CASCADE;
  DROP TABLE "_homepage_v_version_what_you_leave_with_points" CASCADE;
  DROP TABLE "_homepage_v_version_what_you_leave_with_points_locales" CASCADE;
  DROP TABLE "_homepage_v_version_instructor_bio" CASCADE;
  DROP TABLE "_homepage_v_version_instructor_bio_locales" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_courses_status";
  DROP TYPE "public"."enum_courses_pricing_type";
  DROP TYPE "public"."enum_courses_currency";
  DROP TYPE "public"."enum_courses_enrollment_state";
  DROP TYPE "public"."enum_courses_certification_type";
  DROP TYPE "public"."enum_faqs_status";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum_applications_status";
  DROP TYPE "public"."enum_applications_source";
  DROP TYPE "public"."enum_applications_preferred_language";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_status";
  DROP TYPE "public"."enum__site_settings_v_published_locale";
  DROP TYPE "public"."enum_navigation_status";
  DROP TYPE "public"."enum__navigation_v_version_status";
  DROP TYPE "public"."enum__navigation_v_published_locale";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum__homepage_v_version_status";
  DROP TYPE "public"."enum__homepage_v_published_locale";`)
}
