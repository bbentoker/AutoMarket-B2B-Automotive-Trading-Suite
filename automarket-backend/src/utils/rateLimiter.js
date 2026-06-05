/**
 * Rate Limiter for email sending
 * Limits emails to 100 per hour with automatic queuing
 */

class EmailRateLimiter {
  constructor() {
    this.emailsSentThisHour = 0;
    this.currentHourStart = Date.now();
    this.emailQueue = [];
    this.isProcessing = false;
    this.MAX_EMAILS_PER_HOUR = 100;
    this.HOUR_IN_MS = 60 * 60 * 1000; // 1 hour in milliseconds
  }

  /**
   * Check if we can send an email now
   * @returns {boolean} - true if we can send, false if rate limited
   */
  canSendEmail() {
    this.resetCounterIfNewHour();
    return this.emailsSentThisHour < this.MAX_EMAILS_PER_HOUR;
  }

  /**
   * Reset the counter if we've moved to a new hour
   */
  resetCounterIfNewHour() {
    const now = Date.now();
    if (now - this.currentHourStart >= this.HOUR_IN_MS) {
      this.emailsSentThisHour = 0;
      this.currentHourStart = now;
      console.log(`🔄 Rate limiter reset for new hour. Queue size: ${this.emailQueue.length}`);
    }
  }

  /**
   * Increment the email counter
   */
  incrementCounter() {
    this.emailsSentThisHour++;
    console.log(`📧 Email sent. Count this hour: ${this.emailsSentThisHour}/${this.MAX_EMAILS_PER_HOUR}`);
  }

  /**
   * Get time until next hour starts
   * @returns {number} - milliseconds until next hour
   */
  getTimeUntilNextHour() {
    const now = Date.now();
    const timeElapsed = now - this.currentHourStart;
    return Math.max(0, this.HOUR_IN_MS - timeElapsed);
  }

  /**
   * Add an email task to the queue
   * @param {Function} emailFunction - async function that sends the email
   * @param {Object} context - context data for the email
   * @returns {Promise} - resolves when email is sent
   */
  queueEmail(emailFunction, context) {
    return new Promise((resolve, reject) => {
      this.emailQueue.push({
        emailFunction,
        context,
        resolve,
        reject,
        queuedAt: Date.now()
      });

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the email queue with rate limiting
   */
  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log(`🚀 Starting email queue processing. Queue size: ${this.emailQueue.length}`);

    while (this.emailQueue.length > 0) {
      this.resetCounterIfNewHour();

      if (this.canSendEmail()) {
        // Send email immediately
        const emailTask = this.emailQueue.shift();
        try {
          const result = await emailTask.emailFunction(emailTask.context);
          this.incrementCounter();
          emailTask.resolve(result);
        } catch (error) {
          console.error('❌ Error sending queued email:', error);
          emailTask.reject(error);
        }
      } else {
        // Wait until next hour
        const waitTime = this.getTimeUntilNextHour();
        console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000 / 60)} minutes until next hour. Queue size: ${this.emailQueue.length}`);
        
        // Wait until next hour, then continue processing
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.isProcessing = false;
    console.log('✅ Email queue processing completed');
  }

  /**
   * Get current status of the rate limiter
   * @returns {Object} - status information
   */
  getStatus() {
    this.resetCounterIfNewHour();
    return {
      emailsSentThisHour: this.emailsSentThisHour,
      maxEmailsPerHour: this.MAX_EMAILS_PER_HOUR,
      queueSize: this.emailQueue.length,
      canSendNow: this.canSendEmail(),
      timeUntilNextHour: this.getTimeUntilNextHour(),
      isProcessing: this.isProcessing
    };
  }

  /**
   * Get estimated processing time for current queue
   * @returns {Object} - time estimates
   */
  getQueueEstimates() {
    const status = this.getStatus();
    const remainingThisHour = status.maxEmailsPerHour - status.emailsSentThisHour;
    const queueSize = status.queueSize;
    
    if (queueSize <= remainingThisHour) {
      return {
        estimatedCompletionTime: new Date(Date.now() + (queueSize * 1000)), // Assuming 1 second per email
        hoursRequired: 1
      };
    } else {
      const additionalHours = Math.ceil((queueSize - remainingThisHour) / status.maxEmailsPerHour);
      const totalTime = status.timeUntilNextHour + (additionalHours * this.HOUR_IN_MS);
      return {
        estimatedCompletionTime: new Date(Date.now() + totalTime),
        hoursRequired: additionalHours + 1
      };
    }
  }
}

// Create a singleton instance
const emailRateLimiter = new EmailRateLimiter();

module.exports = emailRateLimiter;


