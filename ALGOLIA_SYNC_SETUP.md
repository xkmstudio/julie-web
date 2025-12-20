# Algolia Sync Setup Guide

This guide explains how to set up automatic syncing of Sanity articles and products to Algolia for search functionality using webhooks and API routes.

## Overview

The sync system works in two ways:
1. **Webhook-based sync**: Automatically syncs articles/products when they're created/updated/deleted in Sanity via webhooks
2. **Manual bulk sync**: Scripts to sync all articles/products at once (useful for initial setup)

## Environment Variables

Add these to your `.env.local` file:

```env
# Algolia Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_only_key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=articles
# IMPORTANT: Make sure this is set to 'articles' (not 'Sanity' or anything else)
NEXT_PUBLIC_ALGOLIA_PRODUCTS_INDEX_NAME=products
# Optional: Index name for products (defaults to 'products' if not set)
ALGOLIA_ADMIN_API_KEY=your_admin_api_key

# Sanity Configuration (should already exist)
SANITY_PROJECT_ID=your_project_id
SANITY_PROJECT_DATASET=your_dataset
SANITY_API_TOKEN=your_api_token_with_read_write_permissions

# Optional: Webhook security
WEBHOOK_SECRET=your_webhook_secret
```

## Initial Setup

### 1. Create Algolia Indexes

#### Articles Index

1. Go to your Algolia dashboard
2. Create a new index named `articles` (or your preferred name)
3. Configure searchable attributes:
   - `title` (searchable, ranked)
   - `subtitle` (searchable)
   - `_content` (searchable)
   - `_excerpt` (searchable)
   - `_summary` (searchable)
   - `tags.title` (searchable, facet)
   - `authors.title` (searchable)

#### Products Index

1. Create another index named `products` (or your preferred name)
2. Configure searchable attributes:
   - `title` (searchable, ranked)
   - `subtitle` (searchable)
   - `productType` (searchable, facet)
   - `description` (searchable)
   - `options.name` (searchable, facet)
   - `options.values` (searchable, facet)

### 2. Run Initial Sync

#### Articles

Sync all existing articles to Algolia using the sync script:

```bash
# From the studio directory
cd studio
npx sanity exec scripts/algolia-initial-sync.ts --with-user-token
```

#### Products

Sync all existing products to Algolia:

```bash
cd studio
npx sanity exec scripts/algolia-product-sync.ts --with-user-token
```

Or add to `studio/package.json`:

```json
{
  "scripts": {
    "sync:algolia": "sanity exec scripts/algolia-initial-sync.ts --with-user-token",
    "sync:algolia:products": "sanity exec scripts/algolia-product-sync.ts --with-user-token"
  }
}
```

Then run: `yarn sync:algolia` or `yarn sync:algolia:products` (from the studio directory)

## Setting Up Sanity Webhooks

### Articles Webhook

1. Go to your Sanity project dashboard: https://www.sanity.io/manage
2. Navigate to **API** → **Webhooks**
3. Click **Create webhook**
4. Configure:
   - **Name**: "Algolia Article Sync"
   - **URL**: `https://your-domain.com/api/algolia/sync-article`
   - **Dataset**: `production` (or your dataset)
   - **Trigger on**: `Create`, `Update`, `Delete`
   - **Filter**: `_type == "article"`
   - **Projection**: Leave empty (we fetch full data server-side)
   - **HTTP method**: `POST`
   - **API version**: `v2021-03-25`
   - **Secret** (optional): Set `WEBHOOK_SECRET` in your env

5. Save the webhook

### Products Webhook

Create another webhook for products:

1. Click **Create webhook** again
2. Configure:
   - **Name**: "Algolia Product Sync"
   - **URL**: `https://your-domain.com/api/algolia/sync-product`
   - **Dataset**: `production` (or your dataset)
   - **Trigger on**: `Create`, `Update`, `Delete`
   - **Filter**: `_type == "product"`
   - **Projection**: Leave empty
   - **HTTP method**: `POST`
   - **API version**: `v2021-03-25`
   - **Secret** (optional): Same as articles webhook

3. Save the webhook

### Option 2: Local Development with ngrok

For local testing, use [ngrok](https://ngrok.com/) to expose your local server:

```bash
# Terminal 1: Start your dev server
npm run dev

# Terminal 2: Expose local server
ngrok http 3000

# Use the ngrok URL in your Sanity webhook configuration
```

## How It Works

### Webhook-Based Sync (Automatic)

When an article is created, updated, or deleted in Sanity:
1. Sanity sends a webhook to `/api/algolia/sync-article`
2. The API route fetches the full article data from Sanity
3. Transforms the data to match Algolia's format (including image URLs)
4. Syncs to Algolia using the Algolia API
5. Handles deletions by removing documents from the index
6. Skips draft articles

### Initial Sync Script

The initial sync script (`studio/scripts/algolia-initial-sync.ts`):
- Fetches all existing articles from Sanity
- Transforms them to Algolia format (including image URLs)
- Clears the existing index
- Uploads all articles in bulk

## API Endpoints

### Articles

#### `POST /api/algolia/sync-article`
Syncs a single article (called by webhook)
- **Body**: Sanity document data from webhook
- **Returns**: Success message

#### `PUT /api/algolia/sync-article`
Syncs all articles (bulk operation)
- **Body**: None
- **Returns**: Count of synced articles

#### `DELETE /api/algolia/sync-article`
Removes an article from Algolia index
- **Body**: `{ articleId: "article_id" }`
- **Returns**: Success message

#### `GET /api/algolia/sync-article`
Returns API information (for testing)

### Products

#### `POST /api/algolia/sync-product`
Syncs a single product (called by webhook)
- **Body**: Sanity document data from webhook
- **Returns**: Success message

#### `PUT /api/algolia/sync-product`
Syncs all products (bulk operation)
- **Body**: None
- **Returns**: Count of synced products

#### `DELETE /api/algolia/sync-product`
Removes a product from Algolia index
- **Body**: `{ productId: "product_id" }`
- **Returns**: Success message

#### `GET /api/algolia/sync-product`
Returns API information (for testing)

## Testing

### Test the API endpoint:

```bash
# Test GET
curl http://localhost:3000/api/algolia/sync-article

# Test bulk sync (PUT)
curl -X PUT http://localhost:3000/api/algolia/sync-article

# Test delete (DELETE)
curl -X DELETE http://localhost:3000/api/algolia/sync-article \
  -H "Content-Type: application/json" \
  -d '{"articleId": "article_id_here"}'
```

### Verify Sync in Algolia

1. Go to your Algolia dashboard
2. Navigate to your index
3. Check that articles appear after publishing/updating in Sanity
4. Use the search interface to verify results

## Data Structure

### Articles

Articles are synced with this structure:

```javascript
{
  objectID: "article_id",
  slug: "article-slug",
  title: "Article Title",
  subtitle: "Subtitle",
  date: "2024-01-01",
  useGradient: false,
  tags: [{ title: "Tag", slug: "tag-slug" }],
  authors: [{ title: "Author", slug: "author-slug", role: "Role" }],
  image: {
    alt: "Image alt text",
    asset: "image-asset-ref",
    url: "https://cdn.sanity.io/...", // Full image URL
    id: "asset-id",
    type: "image/jpeg",
    aspectRatio: 1.5,
    lqip: "data:image/jpeg;base64,...",
    width: 1200,
    height: 800
  },
  gradient: { /* same structure as image */ },
  _content: "extracted text from content",
  _excerpt: "extracted text from excerpt",
  _summary: "extracted text from summary"
}
```

### Products

Products are synced with this structure:

```javascript
{
  objectID: "product_id",
  slug: "product-slug",
  productID: "product-id",
  title: "Product Title",
  subtitle: "Product Subtitle",
  productType: "Product Type",
  productTitle: "Product Title",
  price: 99.99,
  comparePrice: 129.99,
  inStock: true,
  lowStock: false,
  preOrder: false,
  limitedEdition: false,
  soldOut: false,
  heroImage: {
    url: "https://cdn.sanity.io/...",
    alt: "Image alt text",
    lqip: "data:image/jpeg;base64,...",
    width: 1200,
    height: 800,
    aspectRatio: 1.5
  },
  thumbnail: {
    url: "https://cdn.sanity.io/...",
    alt: "Thumbnail alt text",
    lqip: "data:image/jpeg;base64,...",
    width: 600,
    height: 600,
    aspectRatio: 1.0
  },
  description: "Product description text",
  options: [
    { name: "Size", position: 1, values: ["S", "M", "L"] },
    { name: "Color", position: 2, values: ["Red", "Blue"] }
  ]
}
```

## Troubleshooting

### Articles not syncing
1. Check webhook is active in Sanity dashboard
2. Verify environment variables are set correctly
3. Check server logs for errors
4. Test the API endpoint directly
5. Verify your production URL is accessible (webhooks need a public URL)

### Search not working
1. Verify `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` is set (not admin key)
2. **IMPORTANT**: Check that `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` is set to `articles` (not 'Sanity' or anything else) in BOTH:
   - Root `.env.local` (for frontend)
   - `studio/.env.local` or root `.env.local` (for sync scripts)
3. Ensure articles are in the index (check Algolia dashboard - make sure you're looking at the 'articles' index)
4. Verify searchable attributes are configured in Algolia dashboard

### Images not showing in search results
1. Re-run the initial sync script to update articles with image URLs
2. Check that `@sanity/asset-utils` is installed in your project
3. Verify image URLs are being built correctly in the sync script

### Permission errors
- Make sure `SANITY_API_TOKEN` has read permissions
- Make sure `ALGOLIA_ADMIN_API_KEY` has write permissions

## Maintenance

### Re-sync all articles
Run the initial sync script whenever you need to rebuild the index:

```bash
cd studio
npx sanity exec scripts/algolia-initial-sync.ts --with-user-token
```

### Re-sync all products
Run the product sync script whenever you need to rebuild the products index:

```bash
cd studio
npx sanity exec scripts/algolia-product-sync.ts --with-user-token
```

### Monitor sync status
- **Algolia dashboard**: Check number of records, last update time, search analytics
- **Sanity Studio**: Publish/update an article and check Algolia dashboard to verify sync
- **Server logs**: Check your Next.js server logs for webhook errors

## Security Notes

- Never commit `.env.local` to version control
- Use `ALGOLIA_ADMIN_API_KEY` only server-side (not in `NEXT_PUBLIC_*`)
- Consider adding webhook secret validation for production
- Rate limit your webhook endpoint if needed
