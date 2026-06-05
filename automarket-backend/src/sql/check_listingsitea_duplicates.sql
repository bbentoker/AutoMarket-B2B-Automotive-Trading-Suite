-- ===============================================
-- CHECK AND HANDLE LISTING_SITE_A_ID DUPLICATES
-- ===============================================

-- This script helps identify and optionally clean up duplicate listingsitea_id values
-- Run this before applying the performance indexes

-- 1. Check for duplicate listingsitea_id values
SELECT 
    listingsitea_id, 
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as record_ids
FROM listingsitea_adverts 
WHERE listingsitea_id IS NOT NULL
GROUP BY listingsitea_id 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. Get total count of duplicates
SELECT 
    'Total duplicate listingsitea_ids' as description,
    COUNT(*) as count
FROM (
    SELECT listingsitea_id 
    FROM listingsitea_adverts 
    WHERE listingsitea_id IS NOT NULL
    GROUP BY listingsitea_id 
    HAVING COUNT(*) > 1
) duplicates;

-- 3. Get total records affected by duplicates
SELECT 
    'Total records with duplicate listingsitea_ids' as description,
    COUNT(*) as count
FROM listingsitea_adverts 
WHERE listingsitea_id IN (
    SELECT listingsitea_id 
    FROM listingsitea_adverts 
    WHERE listingsitea_id IS NOT NULL
    GROUP BY listingsitea_id 
    HAVING COUNT(*) > 1
);

-- ===============================================
-- OPTIONAL: CLEANUP DUPLICATES (UNCOMMENT TO USE)
-- ===============================================

-- Option 1: Keep the most recent record for each listingsitea_id
-- WARNING: This will delete data! Make sure to backup first!

/*
DELETE FROM listingsitea_adverts 
WHERE id NOT IN (
    SELECT DISTINCT ON (listingsitea_id) id
    FROM listingsitea_adverts 
    WHERE listingsitea_id IS NOT NULL
    ORDER BY listingsitea_id, created_at DESC, id DESC
);
*/

-- Option 2: Keep the oldest record for each listingsitea_id
-- WARNING: This will delete data! Make sure to backup first!

/*
DELETE FROM listingsitea_adverts 
WHERE id NOT IN (
    SELECT DISTINCT ON (listingsitea_id) id
    FROM listingsitea_adverts 
    WHERE listingsitea_id IS NOT NULL
    ORDER BY listingsitea_id, created_at ASC, id ASC
);
*/

-- Option 3: Mark duplicates as inactive instead of deleting
-- This is safer as it preserves data

/*
UPDATE listingsitea_adverts 
SET is_active = false
WHERE id NOT IN (
    SELECT DISTINCT ON (listingsitea_id) id
    FROM listingsitea_adverts 
    WHERE listingsitea_id IS NOT NULL
    ORDER BY listingsitea_id, created_at DESC, id DESC
) AND listingsitea_id IN (
    SELECT listingsitea_id 
    FROM listingsitea_adverts 
    WHERE listingsitea_id IS NOT NULL
    GROUP BY listingsitea_id 
    HAVING COUNT(*) > 1
);
*/

-- After cleanup, you can create the unique index:
/*
CREATE UNIQUE INDEX idx_listingsitea_adverts_listingsitea_id_unique ON listingsitea_adverts(listingsitea_id)
WHERE listingsitea_id IS NOT NULL;
*/

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================

-- Verify no duplicates remain (should return 0 rows)
/*
SELECT listingsitea_id, COUNT(*) 
FROM listingsitea_adverts 
WHERE listingsitea_id IS NOT NULL
GROUP BY listingsitea_id 
HAVING COUNT(*) > 1;
*/
