/**
 * Event Logger
 * Logs all events received from the bridge to a file for debugging
 */

import fs from 'fs';
import path from 'path';

class EventLogger {
  private logFile: string;
  private stream: fs.WriteStream | null = null;

  constructor() {
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create log file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    this.logFile = path.join(logsDir, `bridge-events-${timestamp}.log`);
    
    // Create write stream
    this.stream = fs.createWriteStream(this.logFile, { flags: 'a' });
    
    this.log('='.repeat(80));
    this.log('Event Logger Started');
    this.log(`Logging to: ${this.logFile}`);
    this.log('='.repeat(80));
  }

  log(message: string) {
    if (this.stream) {
      const timestamp = new Date().toISOString();
      this.stream.write(`${timestamp} | ${message}\n`);
    }
  }

  logEvent(event: any, source: string = 'bridge') {
    const eventType = event?.type || 'UNKNOWN';
    const eventPreview = JSON.stringify(event).substring(0, 200);
    
    this.log(`📥 [${source}] Event: ${eventType}`);
    this.log(`   Full: ${JSON.stringify(event)}`);
    this.log('');
  }

  logSessionStart(threadId: string, runId: string) {
    this.log('='.repeat(80));
    this.log(`🚀 NEW SESSION`);
    this.log(`   Thread ID: ${threadId}`);
    this.log(`   Run ID: ${runId}`);
    this.log('='.repeat(80));
  }

  logSessionEnd(threadId: string) {
    this.log('='.repeat(80));
    this.log(`✅ SESSION END`);
    this.log(`   Thread ID: ${threadId}`);
    this.log('='.repeat(80));
    this.log('');
  }

  close() {
    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }
  }
}

// Singleton instance
let eventLogger: EventLogger | null = null;

export function getEventLogger(): EventLogger {
  if (!eventLogger) {
    eventLogger = new EventLogger();
  }
  return eventLogger;
}

export function closeEventLogger() {
  if (eventLogger) {
    eventLogger.close();
    eventLogger = null;
  }
}

