// File: /server/src/db/seed.ts
import { z } from "zod";
import { db, sqlClient } from "./index";
import { users, projects } from "./schema";

const seedValidation = z.object({
	username: z.string().min(3, "Username minimal 3 karakter"),
	password: z.string().min(12, "Password minimal 12 karakter"),
});

async function seed() {
	try {
		const validation = seedValidation.safeParse({
			username: process.env.SEED_ADMIN_USERNAME,
			password: process.env.SEED_ADMIN_PASSWORD,
		});

		if (!validation.success) {
			console.error("Seed validation error:");
			const { fieldErrors } = z.flattenError(validation.error);
			Object.entries(fieldErrors).forEach(([field, messages]) => {
				if (messages) {
					console.error(`  - ${field}: ${messages.join(", ")}`);
				}
			});
			process.exit(1);
		}

		const { username, password } = validation.data;
		const passwordHash = await Bun.password.hash(password);

		console.log("🌱 Seeding database...");

		// Upsert admin user
		console.log("  ✓ Creating admin user...");
		await db
			.insert(users)
			.values({
				username,
				password_hash: passwordHash,
			})
			.onConflictDoUpdate({
				target: users.username,
				set: { password_hash: passwordHash },
			});

		// Insert example projects
		console.log("  ✓ Creating example projects...");
		const exampleProjects = [
			{
				title: "AI Chat Platform",
				slug: "ai-chat-platform",
				summary:
					"Real-time chat application powered by GPT-4 dengan streaming responses dan multi-turn conversations.",
				content: `## Context & Core Problem
Dibangun untuk mendemonstrasikan integrasi API real-time dengan LLM. Masalah: latency tinggi dan streaming yang tidak smooth tanpa server-sent events.

## Technical Architecture & Trade-offs
Menggunakan React + WebSocket backend dengan Node.js. Dipilih WebSocket atas HTTP polling untuk real-time capability. Trade-off: kompleksitas state management meningkat.

## Engineering Highlights
\`\`\`ts
async function* streamChatResponse(prompt: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });
  for await (const chunk of response) {
    yield chunk.choices[0]?.delta?.content ?? '';
  }
}
\`\`\`

## Impact & Benchmarks
Mencapai first-token latency 200ms, throughput 50 concurrent connections, Lighthouse 92 performance score.

## Lessons Learned
Server-sent events lebih cocok daripada WebSocket untuk streaming unidirectional. Token counting sangat penting untuk mengelola context window.`,
				category: "ai_ml" as const,
				tech_stack: [
					"TypeScript",
					"React",
					"Node.js",
					"OpenAI API",
					"WebSocket",
				],
				is_featured: true,
				status: "published" as const,
				repo_url: "https://github.com/firmansubagjaa/ai-chat",
				demo_url: "https://ai-chat-demo.vercel.app",
			},
			{
				title: "E-Commerce Microservices",
				slug: "ecommerce-microservices",
				summary:
					"Scalable e-commerce backend dengan microservices architecture, event-driven design, dan container orchestration.",
				content: `## Context & Core Problem
Aplikasi monolith e-commerce mengalami bottleneck saat traffic peak. Kebutuhan: sistem yang dapat scale horizontal per service.

## Technical Architecture & Trade-offs
Dipecah menjadi 5 microservices: users, products, orders, payments, inventory. Digunakan Kubernetes untuk orchestration. Trade-off: debugging distributed system lebih kompleks, perlu observability tools.

## Engineering Highlights
\`\`\`ts
async function processPayment(orderId: string) {
  const order = await orderService.get(orderId);
  const result = await paymentGateway.charge(order.total);
  await eventBus.publish('payment.completed', { orderId, result });
}
\`\`\`

## Impact & Benchmarks
Reduced deployment time 60%, response time improved 40%, dapat scale 10x lebih banyak traffic.

## Lessons Learned
Event-driven architecture mengurangi coupling significantly. Tracing dan monitoring harus ada dari awal, bukan tambahan.`,
				category: "backend" as const,
				tech_stack: [
					"Go",
					"Kubernetes",
					"PostgreSQL",
					"RabbitMQ",
					"Prometheus",
				],
				is_featured: false,
				status: "published" as const,
				repo_url: "https://github.com/firmansubagjaa/ecommerce-microservices",
			},
		];

		for (const project of exampleProjects) {
			await db.insert(projects).values(project).onConflictDoNothing({
				target: projects.slug,
			});
		}

		console.log("✅ Seed completed successfully!");
	} catch (error) {
		console.error(
			"❌ Seed failed:",
			error instanceof Error ? error.message : String(error),
		);
		process.exit(1);
	} finally {
		await sqlClient.end();
	}
}

seed();
