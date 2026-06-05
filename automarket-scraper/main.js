// SECURITY-SANITIZED: Production URLs, credentials, and scraping targets
// were replaced with fictional AutoMarket placeholders for public showcase.
const fs = require('fs');
// Debug Logging for Environment Issues
console.log('--- STARTUP ENVIRONMENT DEBUG ---');
console.log('1. Current Working Directory:', process.cwd());
console.log('2. .env file exists:', fs.existsSync('.env'));
console.log('3. Pre-dotenv NODE_ENV:', process.env.NODE_ENV);
console.log('4. Pre-dotenv API_URL:', process.env.API_URL);

require('dotenv').config();

console.log('5. Post-dotenv NODE_ENV:', process.env.NODE_ENV);
console.log('6. Post-dotenv API_URL:', process.env.API_URL);
console.log('--- END ENVIRONMENT DEBUG ---');
const express = require('express');
const cron = require('node-cron');
const { main: scraperMain } = require('./src/scraper/main');
const { main: checkerMain } = require('./src/checker/main');
const logger = require('./src/utils/logger');
const memoryMonitor = require('./src/utils/memoryMonitor');

// Express app setup
const app = express();
const PORT = process.env.PORT || 3001;

// Track job status
const jobStatus = {
    scraper: { running: false, lastRun: null, lastResult: null },
    checker: { running: false, lastRun: null, lastResult: null }
};

// Get environment variables with defaults
const SCRAPER_ON = process.env.SCRAPER_ON !== 'false';
const CHECKER_ON = process.env.CHECKER_ON !== 'false';

logger.info(`🔧 Configuration: SCRAPER_ON=${SCRAPER_ON}, CHECKER_ON=${CHECKER_ON}`);

// Start memory monitoring
memoryMonitor.startMonitoring();

// Add process monitoring for system health
process.on('uncaughtException', (error) => {
    logger.error('🛑 Uncaught Exception:', error.message);
    logger.error('Stack trace:', error.stack);
    // Perform emergency cleanup
    performDeepMemoryCleanup('emergency-uncaught-exception').then(() => {
        process.exit(1);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('🛑 Unhandled Rejection at:', promise, 'reason:', reason);
    // Perform emergency cleanup but don't exit
    performDeepMemoryCleanup('emergency-unhandled-rejection');
});

process.on('SIGTERM', async () => {
    logger.info('🛑 SIGTERM received, performing graceful shutdown...');
    await performDeepMemoryCleanup('graceful-shutdown');
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('🛑 SIGINT received, performing graceful shutdown...');
    await performDeepMemoryCleanup('graceful-shutdown');
    process.exit(0);
});

// Comprehensive memory cleanup function
async function performDeepMemoryCleanup(context = 'unknown') {
    logger.info(`🧹 Performing deep memory cleanup after ${context}...`);

    // Multiple aggressive garbage collection passes
    if (global.gc) {
        for (let i = 0; i < 5; i++) {
            global.gc();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Log memory usage after cleanup
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const heapPercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);
    const externalMB = Math.round(memUsage.external / 1024 / 1024);

    logger.info(`💾 Memory after cleanup: RSS: ${rssMB}MB, Heap: ${heapUsedMB}MB/${heapTotalMB}MB (${heapPercent}%), External: ${externalMB}MB`);

    // If memory usage is still high, wait and try again
    if (heapPercent > 50) {
        logger.warn(`⚠️ Memory usage still high (${heapPercent}%), performing additional cleanup...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (global.gc) {
            for (let i = 0; i < 3; i++) {
                global.gc();
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }

    logger.info(`✅ Deep memory cleanup completed for ${context}`);
}

// Function to run the scraper with error handling and memory cleanup
async function runScraper() {
    if (jobStatus.scraper.running) {
        logger.warn('⚠️ Scraper is already running, skipping...');
        return { success: false, message: 'Already running' };
    }

    jobStatus.scraper.running = true;
    logger.info('🌙 Starting daily scraping job at midnight...');
    const startTime = new Date();
    memoryMonitor.logMemoryUsage(true);

    try {
        await scraperMain();
        const endTime = new Date();
        const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes
        logger.info(`✅ Daily scraping job completed successfully in ${duration} minutes`);
        jobStatus.scraper.lastRun = endTime.toISOString();
        jobStatus.scraper.lastResult = 'success';
        return { success: true, duration };

    } catch (error) {
        logger.error('❌ Daily scraping job failed:', error.message);
        logger.error('Stack trace:', error.stack);
        jobStatus.scraper.lastRun = new Date().toISOString();
        jobStatus.scraper.lastResult = `error: ${error.message}`;
        return { success: false, error: error.message };
    } finally {
        jobStatus.scraper.running = false;
        // Always perform deep cleanup after scraper
        await performDeepMemoryCleanup('scraper');
        logger.info('🌙 Daily scraper cleanup completed');
    }
}

// Function to run the checker with error handling and memory cleanup
async function runChecker() {
    if (jobStatus.checker.running) {
        logger.warn('⚠️ Checker is already running, skipping...');
        return { success: false, message: 'Already running' };
    }

    jobStatus.checker.running = true;
    logger.info('🌃 Starting daily checker job at 2 AM...');
    const startTime = new Date();
    memoryMonitor.logMemoryUsage(true);

    try {
        await checkerMain();
        const endTime = new Date();
        const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes
        logger.info(`✅ Daily checker job completed successfully in ${duration} minutes`);
        jobStatus.checker.lastRun = endTime.toISOString();
        jobStatus.checker.lastResult = 'success';
        return { success: true, duration };

    } catch (error) {
        logger.error('❌ Daily checker job failed:', error.message);
        logger.error('Stack trace:', error.stack);
        jobStatus.checker.lastRun = new Date().toISOString();
        jobStatus.checker.lastResult = `error: ${error.message}`;
        return { success: false, error: error.message };
    } finally {
        jobStatus.checker.running = false;
        // Always perform deep cleanup after checker
        await performDeepMemoryCleanup('checker');
        logger.info('🌃 Daily checker cleanup completed');
    }
}

// ============================================
// EXPRESS ROUTES
// ============================================

// Health check endpoint (required for cloud platforms)
app.get('/health', (req, res) => {
    const memUsage = process.memoryUsage();
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
            rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
        },
        jobs: jobStatus,
        config: {
            scraperEnabled: SCRAPER_ON,
            checkerEnabled: CHECKER_ON
        }
    });
});

// Simple root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'ListingSiteA Scraper',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            status: '/status',
            triggerScraper: 'POST /run/scraper',
            triggerChecker: 'POST /run/checker'
        }
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        jobs: jobStatus,
        config: {
            scraperEnabled: SCRAPER_ON,
            checkerEnabled: CHECKER_ON
        },
        nextRuns: getNextScheduledRuns()
    });
});

// Manual trigger endpoints
app.post('/run/scraper', async (req, res) => {
    if (!SCRAPER_ON) {
        return res.status(400).json({ error: 'Scraper is disabled' });
    }

    // Run in background, don't wait
    runScraper().catch(err => logger.error('Manual scraper run failed:', err));

    res.json({
        message: 'Scraper job started',
        status: 'running'
    });
});

app.post('/run/checker', async (req, res) => {
    if (!CHECKER_ON) {
        return res.status(400).json({ error: 'Checker is disabled' });
    }

    // Run in background, don't wait
    runChecker().catch(err => logger.error('Manual checker run failed:', err));

    res.json({
        message: 'Checker job started',
        status: 'running'
    });
});

// Helper function to get next scheduled runs
function getNextScheduledRuns() {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setUTCDate(now.getUTCDate() + 1);
    nextMidnight.setUTCHours(0, 0, 0, 0);

    const next2AM = new Date(now);
    if (now.getUTCHours() >= 2) {
        next2AM.setUTCDate(now.getUTCDate() + 1);
    }
    next2AM.setUTCHours(2, 0, 0, 0);

    return {
        scraper: SCRAPER_ON ? nextMidnight.toISOString() : 'disabled',
        checker: CHECKER_ON ? next2AM.toISOString() : 'disabled'
    };
}

// ============================================
// CRON SCHEDULING
// ============================================

// Schedule the scraper to run daily at midnight (if enabled)
if (SCRAPER_ON) {
    cron.schedule('0 0 * * *', async () => {
        await runScraper();
    }, {
        scheduled: true,
        timezone: "UTC"
    });
    logger.info('⏰ ListingSiteA scraper scheduled to run daily at midnight (00:00 UTC)');
}

// Schedule checker to run daily at 2 AM (if enabled)
if (CHECKER_ON) {
    cron.schedule('0 2 * * *', async () => {
        await runChecker();
    }, {
        scheduled: true,
        timezone: "UTC"
    });
    logger.info('📋 Check listings job scheduled to run daily at 2 AM (02:00 UTC)');
}

// Check if garbage collection is available
if (global.gc) {
    logger.info('🧹 Garbage collection is available - memory cleanup enabled');
} else {
    logger.warn('⚠️ Garbage collection not available. Start Node.js with --expose-gc flag for better memory management');
}

// Log next scheduled runs
const nextRuns = getNextScheduledRuns();
if (SCRAPER_ON) {
    logger.info(`🌙 Next scraper run scheduled for: ${nextRuns.scraper}`);
}
if (CHECKER_ON) {
    logger.info(`🌃 Next checker run scheduled for: ${nextRuns.checker}`);
}

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    logger.info(`🚀 Server started on port ${PORT}`);
    logger.info(`📡 Health check available at http://localhost:${PORT}/health`);
});

// Run jobs once on startup based on environment variables
let startupDelay = 5000; // Start with 5 second delay

if (SCRAPER_ON) {
    logger.info('📝 SCRAPER_ON=true - scheduling initial scraper run...');
    setTimeout(async () => {
        await runScraper();
    }, startupDelay);
    startupDelay += 5000; // Add 5 seconds delay for next job
}

if (CHECKER_ON) {
    logger.info('📝 CHECKER_ON=true - scheduling initial checker run...');
    setTimeout(async () => {
        await runChecker();
    }, startupDelay);
}

// Show what will run
const jobsToRun = [];
if (SCRAPER_ON) jobsToRun.push('Scraper');
if (CHECKER_ON) jobsToRun.push('Checker');

if (jobsToRun.length > 0) {
    logger.info(`🎯 Initial jobs to run: ${jobsToRun.join(', ')}`);
    logger.info('⏳ Jobs will start in 5-10 seconds...');
} else {
    logger.info('ℹ️  No jobs enabled - both SCRAPER_ON and CHECKER_ON are false');
    logger.info('🕐 Waiting for scheduled times (if any jobs were enabled)...');
}