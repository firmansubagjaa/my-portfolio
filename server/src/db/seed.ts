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
				title: "AI-Powered Dashboard",
				slug: "ai-powered-dashboard",
				summary:
					"Real-time analytics dashboard with AI-driven insights",
				content: `## Context & Problem Statement
Modern SaaS applications require real-time data visualization with intelligent anomaly detection. Traditional dashboards suffer from high API latency and stale data during peak traffic. The requirement: a dashboard that ingests streaming metrics, applies ML-based anomaly scoring, and updates visualization sub-100ms.

## Technical Architecture & Implementation
Built with React 18 + TypeScript for type safety and strict React hooks patterns. Backend runs Node.js + Express with PostgreSQL for time-series data and Redis for caching hot metrics. WebSocket connection established per user session maintains persistent stream to backend event bus.

Data pipeline: Metrics ingested via HTTP batching endpoint → stored in PostgreSQL with TimescaleDB extension → aggregated via Redis streams → published to WebSocket subscribers. AI model (Isolation Forest via Scikit-learn sidecar) runs async on 5-minute windows to detect anomalies without blocking realtime feeds.

## Engineering Implementation Details
\`\`\`ts
// React hook pattern for WebSocket subscription with cleanup
function useMetricsStream(chartId: string) {
  const [data, setData] = useState<Metric[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(\`wss://api.example.com/stream/\${chartId}\`);
    
    ws.onmessage = (e) => {
      const metric = JSON.parse(e.data) as Metric;
      setData(prev => [...prev.slice(-99), metric]); // Keep last 100
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [chartId]);

  return data;
}
\`\`\`

Query optimization critical: added composite index on (metric_id, timestamp) in PostgreSQL to enable range scans < 10ms. Redis keyspace set to 1-hour expiry for warm cache; cache miss triggers lazy query to TimescaleDB.

## Performance Metrics & Impact
- Sub-100ms API latency (p99): Achieved through connection pooling (PgBouncer) and Redis caching
- 1000+ concurrent WebSocket users: Load balanced across 3 Node.js instances with sticky sessions
- Lighthouse score 98: Code splitting, tree-shaking, and lazy-loaded chart library (Recharts)
- Anomaly detection accuracy 96%: F1-score on synthetic anomaly dataset

Real-world result: Customer on 10M event/day reduced investigation time from 4h to 12min via alerts.

## Architectural Trade-offs & Lessons
Chose WebSocket over Server-Sent Events for bidirectional handshakes (client can pause/resume subscription). Trade-off: WebSocket connection pooling less mature in Node ecosystem than SSE. Mitigated with explicit connection lifecycle tracking.

TimescaleDB chosen over vanilla PostgreSQL for time-series: native hypertable compression reduces storage 90%, but requires careful planning of chunk intervals (chose 1-day chunks for 100M event scale).`,
				category: "fullstack" as const,
				tech_stack: [
					"React",
					"TypeScript",
					"Node.js",
					"PostgreSQL",
					"WebSocket",
					"Redis",
				],
				is_featured: true,
				status: "published" as const,
				thumbnail_url:
					"https://placeholder.example.com/thumbnail-ai-dashboard-16-10.png",
				repo_url: "https://placeholder.example.com/repo",
				demo_url: "#",
			},
			{
				title: "Sentiment Analysis Engine",
				slug: "sentiment-analysis-engine",
				summary:
					"Production ML API for text sentiment analysis with sub-100ms latency",
				content: `## Problem & Motivation
Customer support teams process 500K+ messages daily across channels (email, Slack, Twitter). Manual sentiment classification introduces 3-4 hour human latency and inconsistent labeling. Requirement: automated, sub-100ms API that classifies sentiment (positive/negative/neutral) with F1-score > 0.90 at 500+ req/sec throughput.

## Technical Stack & Architecture
Python + FastAPI for async request handling with automatic OpenAPI docs. Model deployment: Fine-tuned DistilBERT transformer (110M params, distilled from BERT for 40% size reduction). Hosting: Docker container on Kubernetes with horizontal pod autoscaling (HPA) at CPU 70%.

Request flow: FastAPI endpoint receives text → tokenizer (BERT tokenizer, max 512 tokens) → inference via ONNX Runtime (2-3x faster than PyTorch, critical for latency SLO) → confidence score passed to softmax → JSON response with label + confidence.

## Production Implementation
\`\`\`python
# FastAPI route with async inference
@app.post("/v1/analyze")
async def analyze_sentiment(req: SentimentRequest) -> SentimentResponse:
    """Classify text sentiment with confidence score."""
    
    # Truncate to 512 tokens (BERT limit)
    tokens = tokenizer.encode(req.text, max_length=512, truncation=True)
    
    # Async inference using thread pool to avoid GIL blocking
    logits = await asyncio.get_event_loop().run_in_executor(
        None, 
        model.predict, 
        np.array([tokens])
    )
    
    probs = softmax(logits[0])
    label = LABELS[np.argmax(probs)]
    confidence = float(np.max(probs))
    
    return SentimentResponse(
        label=label,
        confidence=confidence,
        latency_ms=time_ms
    )
\`\`\`

Cache strategy: Redis stores embeddings for duplicate texts (10% hit rate on production traffic). Kubernetes resource limits: 2 CPU, 4GB RAM per pod; ONNX model cached in memory at startup.

## Metrics & Real-World Performance
- 99.8% uptime: Achieved via health check endpoint, circuit breaker pattern on downstream logging
- 500+ req/sec throughput: Measured on 8-pod deployment (p99 latency 85ms)
- F1-score 0.94 (weighted): Validation on 50K manually-labeled support messages
- Cost: 40% reduction vs vendor sentiment API (AWS Comprehend) due to self-hosting

Deployed for 2 customers processing 100M messages/month. Sentiment distribution discovery (40% negative) drove 3-person team to improve response templates.

## Design Decisions & Trade-offs
DistilBERT chosen over full BERT: 2x inference speed at 3% accuracy loss. Considered GPT-based APIs but latency > 500ms and cost unbounded. ONNX Runtime required for sub-100ms: PyTorch eager execution too slow.

Tokenizer truncation at 512 chars: handles 99.2% of real messages (median 80 tokens). Longer messages require secondary fallback classifier (heuristic rules, <5ms fallback latency).`,
				category: "ai_ml" as const,
				tech_stack: [
					"Python",
					"FastAPI",
					"Transformers",
					"Redis",
					"Docker",
				],
				is_featured: true,
				status: "published" as const,
				thumbnail_url:
					"https://placeholder.example.com/thumbnail-sentiment-16-10.png",
				repo_url: "https://placeholder.example.com/repo",
				demo_url: "#",
			},
			{
				title: "Real-time Notification System",
				slug: "realtime-notification-system",
				summary:
					"Scalable WebSocket-based notification service with delivery guarantees",
				content: `## Problem & Requirements
E-commerce platform needs to notify users of order updates, inventory changes, and live chat messages. Previous polling approach: 5-second interval → 95% wasted requests. Requirement: true push notifications with 50ms max latency, 100K concurrent connections, and 99.99% delivery guarantee (at-least-once semantics).

## Architecture & Technology Choice
Built with Bun runtime (JavaScript/TypeScript) for its native WebSocket support and ~3x faster startup vs Node.js. Single notification service (Bun) scales to 100K connections on standard hardware via epoll event loop.

Connection model: Client connects via WebSocket → authenticated via JWT bearer token → subscribed to topics (channels/user_id/order_status). Backend maintains in-memory topic tree (Router<Channel>). Message publish triggers fanout to all subscribers in that channel.

## Implementation & Reliability Patterns
\`\`\`ts
// WebSocket handler with connection lifecycle
async function handleConnection(socket: ServerWebSocket) {
  const userId = await authenticateToken(socket.data.token);
  const channels = new Set<string>();

  socket.subscribe(\`user:\${userId}\`);
  channels.add(\`user:\${userId}\`);

  socket.onMessage(async (msg: Buffer) => {
    const { action, channel } = JSON.parse(msg.toString());
    
    if (action === "subscribe") {
      socket.subscribe(channel);
      channels.add(channel);
    }
  });

  socket.onClose(() => {
    // Cleanup: unsubscribe from all channels on disconnect
    channels.forEach(ch => socket.unsubscribe(ch));
  });
}

// Publish with retry logic for failed connections
async function publishNotification(channel: string, payload: unknown) {
  const subscribers = getSubscribers(channel);
  const failed = [];

  for (const socket of subscribers) {
    try {
      socket.send(JSON.stringify(payload));
    } catch {
      failed.push(socket.id);
    }
  }

  // Persist to queue for retry (via Redis Bull)
  if (failed.length > 0) {
    await retryQueue.add(
      { channel, payload, socketIds: failed },
      { attempts: 3, backoff: 'exponential' }
    );
  }
}
\`\`\`

Delivery guarantee: Every message logged to PostgreSQL table (notifications) before publish. Consumers (clients) acknowledge receipt; unacknowledged messages persisted and retried via Redis Bull queue with exponential backoff (1s, 5s, 30s).

## Performance & Reliability Metrics
- <50ms message latency (p99): Measured on Bun cluster with 100K concurrent connections
- 100K concurrent WebSocket connections: Single Bun instance on 16GB RAM, 8-core CPU
- 99.99% delivery guarantee: Achieved via message journaling + retry queue
- Zero connection drops under load: Graceful backpressure handling in Bun

Production: Platform handles 500M notifications/day (Black Friday peak 50K/sec fanout).

## Architectural Trade-offs
Chose Bun over Node.js: native WebSocket, faster startup (15ms vs 500ms), simpler synchronous code. Trade-off: Bun ecosystem smaller, some NPM packages incompatible (mitigated with vendor rewrites).

In-memory subscriber map vs Redis: Reduces latency by 10ms (Redis PUBLISH < 1ms publish, but > 30ms fanout latency per client). Trade-off: single instance failure loses subscribers. Mitigated with RTO = 30s (connection re-subscribe on reconnect).

Synchronous message logging (pre-publish) chosen over async: Ensures delivery durability even on crash. Cost: 5-10ms latency increase, but acceptable for 99.99% SLO.`,
				category: "backend" as const,
				tech_stack: [
					"Bun",
					"WebSocket",
					"PostgreSQL",
					"Docker",
					"Redis",
				],
				is_featured: true,
				status: "published" as const,
				thumbnail_url:
					"https://placeholder.example.com/thumbnail-notifications-16-10.png",
				repo_url: "https://placeholder.example.com/repo",
				demo_url: "#",
			},
			{
				title: "ETL Data Pipeline",
				slug: "etl-data-pipeline",
				summary:
					"Distributed data pipeline for processing 10M+ events daily",
				content: `## Problem & Context
Data warehouse receives raw event logs from 50+ microservices (clickstream, transaction, user events). Previous batch job: 12-hour latency, 3 failures/week due to schema drift. Requirement: sub-hour processing of 10M events, 99.5% data accuracy, and graceful failure handling.

## Technical Stack & Design
Python + Apache Spark for distributed processing across 5-node cluster. Jobs orchestrated via Airflow DAGs. Data source: Kafka topics (raw events) → S3 staging (Parquet format) → Spark SQL transformation → Snowflake DW.

Pipeline stages: (1) Schema validation & deduplication via event ID, (2) Data enrichment (join with user/product dimension tables), (3) Aggregation for OLAP queries (hourly rollups), (4) Integrity checks (row count vs source topic, null validation).

## Implementation & Orchestration
\`\`\`python
# PySpark job for hourly ETL
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_unixtime, md5, concat_ws

spark = SparkSession.builder \\
    .appName("etl-pipeline") \\
    .config("spark.sql.shuffle.partitions", "200") \\
    .getOrCreate()

# Read raw events from S3
events_df = spark.read.parquet(f"s3://raw-events/{hour}/")

# Dedup on event_id
deduped = events_df.dropDuplicates(["event_id"])

# Enrich with dimension tables
enriched = deduped \\
    .join(users_dim, "user_id", "left") \\
    .join(products_dim, "product_id", "left")

# Apply transformations
transformed = enriched \\
    .withColumn("event_date", from_unixtime(col("timestamp"), "yyyy-MM-dd")) \\
    .withColumn("country", col("user_country"))

# Write to Snowflake (via JDBC)
transformed.write \\
    .format("snowflake") \\
    .mode("append") \\
    .option("dbtable", "raw_events_processed") \\
    .save()

print(f"✓ Processed {deduped.count()} events in {time_ms}ms")
\`\`\`

Monitoring: Airflow tracks execution time, row counts before/after each stage. Data quality checks: null ratio < 2%, dedup reduction < 5%, join success > 99%. Failures trigger PagerDuty alert; manual intervention for schema drift (new columns logged to quarantine table).

## Performance & Reliability
- Sub-hour processing: 10M events processed in 35-45 minutes on 5-node cluster (each node: 8 CPU, 32GB RAM)
- 99.5% data accuracy: Validated against shadow queries on Snowflake
- Failure recovery: Checkpoint mechanism allows restart from last successful stage (no reprocessing)

Real impact: Enabled real-time dashboards (previously batch-only), reduced investigation time for data discrepancies from 2 hours to 10 minutes.

## Design Trade-offs
Spark chosen over custom Go service: development speed (2 weeks vs 6 weeks), SQL-native transformations reduce bugs. Trade-off: cold start 45s, but amortized by hourly cadence.

S3 staging chosen over Kafka direct: intermediate format decouples Spark job from Kafka schema evolution. Cost: 1-2 minutes overhead, but enables independent scaling of Kafka and batch layers.

Deduplication at Spark layer (not source): allows idempotent replay of messages. Trade-off: duplicate detection every hour (full table scan) vs stream-level dedup. Acceptable given hourly granularity.`,
				category: "backend" as const,
				tech_stack: [
					"Python",
					"Apache Spark",
					"PostgreSQL",
					"Docker",
				],
				is_featured: false,
				status: "published" as const,
				thumbnail_url:
					"https://placeholder.example.com/thumbnail-etl-16-10.png",
				repo_url: "https://placeholder.example.com/repo",
				demo_url: "#",
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
