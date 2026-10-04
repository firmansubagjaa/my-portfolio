CREATE TYPE "public"."project_category" AS ENUM('fullstack', 'ai_ml', 'frontend', 'backend', 'experiment');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"thumbnail_url" text,
	"gallery_urls" text[] DEFAULT '{}' NOT NULL,
	"tech_stack" text[] DEFAULT '{}' NOT NULL,
	"category" "project_category" NOT NULL,
	"repo_url" text,
	"demo_url" text,
	"notebook_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_unique" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_category_idx" ON "projects" USING btree ("category");--> statement-breakpoint
CREATE INDEX "projects_featured_idx" ON "projects" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");