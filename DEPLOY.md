# Deploying RealTimeResume to AWS (domain via Bluehost)

This guide deploys the app as a container to **AWS App Runner** (the simplest
option for a Next.js server), backed by **Amazon RDS for PostgreSQL**, with the
domain you registered at **Bluehost** pointed at it.

> App Runner is recommended for its simplicity. ECS Fargate or Elastic Beanstalk
> (Docker) work with the same image if you need more control — see the bottom.

## Overview

```
Bluehost (DNS)  ──CNAME──▶  App Runner service (HTTPS)  ──▶  RDS PostgreSQL
                                   ▲
                            ECR (Docker image)
```

## 0. One-time code change: switch Prisma to PostgreSQL

SQLite is for local dev only. For production, edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

Commit this on your deploy branch (or keep a `prisma/schema.prod.prisma` and
select it with `--schema`). The model definitions are unchanged.

## 1. Provision PostgreSQL (RDS)

1. RDS → Create database → **PostgreSQL**, e.g. `db.t4g.micro` to start.
2. Set a master username/password; enable storage autoscaling.
3. Networking: place it in a VPC the App Runner service can reach (see step 4's
   VPC connector). Do **not** make it publicly accessible for production.
4. Note the endpoint. Your connection string:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@ENDPOINT:5432/postgres?schema=public&sslmode=require"
   ```

## 2. Store secrets

Put these in **AWS Secrets Manager** (or App Runner env vars for a quick start):

- `DATABASE_URL` — the RDS connection string above.
- `AUTH_SECRET` — a long random string:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `ANTHROPIC_API_KEY` — *(optional)* enables the AI features (resume structuring
  and the paywalled full-AI assistance). Omit it and AI endpoints return a
  graceful "not available" message; everything else works. Get a key at
  <https://console.anthropic.com/>.

## 3. Build and push the image to ECR

```bash
AWS_REGION=us-east-1
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REPO=realtimeresume

aws ecr create-repository --repository-name $REPO --region $AWS_REGION || true
aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com

docker build -t $REPO .
docker tag $REPO:latest $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO:latest
docker push $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO:latest
```

The image runs `prisma db push` on startup to sync the schema, then starts the
Next.js server on port 3000.

## 4. Create the App Runner service

1. App Runner → Create service → Source: **Container registry** → your ECR image.
2. Port: **3000**.
3. Environment variables: `DATABASE_URL`, `AUTH_SECRET` (reference the Secrets
   Manager entries from step 2). `NODE_ENV` is already `production` in the image.
4. **Networking → VPC connector:** attach a connector in the same VPC/subnets as
   RDS, and allow the RDS security group to accept traffic from the connector's
   security group on port 5432. (App Runner reaches RDS over the VPC.)
5. Deploy. App Runner gives you a public HTTPS URL like
   `https://xxxx.us-east-1.awsapprunner.com` — verify the app loads there first.

## 5. Point your Bluehost domain at App Runner

1. App Runner → your service → **Custom domains** → add `app.yourdomain.com`
   (or the apex `yourdomain.com`). App Runner shows DNS records to create:
   - A **certificate validation** CNAME (for ACM).
   - A **target** CNAME pointing your domain to the App Runner domain.
2. In **Bluehost**: cPanel → **Zone Editor** (or Domains → DNS) for your domain.
   Add the records App Runner gave you:
   - Add the ACM validation `CNAME` (name + value exactly as shown).
   - Add a `CNAME` for `app` → the App Runner target domain.
   > Apex/root domains can't be a CNAME at most DNS hosts. Use a subdomain
   > (`app.` or `www.`), or move DNS to **Route 53** (create a hosted zone,
   > update Bluehost's nameservers to the Route 53 NS records) and use an
   > **alias A record** for the apex.
3. Wait for DNS propagation and ACM validation (minutes to ~an hour). App Runner
   marks the domain **Active** and serves HTTPS automatically.

## 6. Post-deploy checks

- Visit your domain → landing page loads.
- Register an account, log an activity, generate a resume and a timesheet.
- Confirm data persists (it's in RDS, not the container).

## CI/CD (optional)

Add a GitHub Actions job that, on push to `main`, builds the image, pushes to
ECR, and calls `aws apprunner start-deployment`. The existing `.github/workflows/ci.yml`
already gates typecheck + tests + build before any deploy.

## Hardening (later)

- Switch the startup command from `prisma db push` to **`prisma migrate deploy`**
  and commit migration files (`prisma migrate dev --name init` after switching to
  PostgreSQL locally) for reviewable, reversible schema changes.
- Run RDS in private subnets only; enable automated backups and Multi-AZ.
- Put the service behind CloudFront/WAF if you need caching or edge rules.

## Alternatives to App Runner

The same Docker image deploys to:
- **ECS Fargate** behind an Application Load Balancer (ACM cert on the ALB;
  Bluehost CNAME → ALB DNS name).
- **Elastic Beanstalk** (Docker platform) — upload the image or `Dockerrun`.
