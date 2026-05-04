#!/usr/bin/env bash
set -euo pipefail

STACK_NAME="SoundStudyStack"
REGION="us-east-1"
WEB_DIR="$(cd "$(dirname "$0")/web" && pwd)"

echo "=== Building web ==="
cd "$WEB_DIR"
npm run build

echo "=== Fetching stack resources ==="
BUCKET=$(aws cloudformation describe-stack-resources \
  --stack-name "$STACK_NAME" --region "$REGION" \
  --query "StackResources[?ResourceType=='AWS::S3::Bucket'].PhysicalResourceId" \
  --output text)
DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
  --output text)

echo "  Bucket:       $BUCKET"
echo "  Distribution: $DIST_ID"

echo "=== Syncing to S3 ==="
aws s3 sync "$WEB_DIR/dist" "s3://$BUCKET" --delete --region "$REGION"

echo "=== Invalidating CloudFront cache ==="
aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' --output text

echo "=== Done: https://sound-study.homisoftware.net ==="
