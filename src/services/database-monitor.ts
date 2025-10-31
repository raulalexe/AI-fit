import { databasePool } from './database-pool';
import { cacheService } from './redis';

// Database performance monitoring service
export class DatabaseMonitor {
  private pool = databasePool;
  private cache = cacheService;
  private metrics: {
    queryCount: number;
    averageQueryTime: number;
    errorCount: number;
    cacheHitRate: number;
    connectionPoolStats: any;
  } = {
    queryCount: 0,
    averageQueryTime: 0,
    errorCount: 0,
    cacheHitRate: 0,
    connectionPoolStats: {},
  };

  // Track query performance
  async trackQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.queryCount++;

    try {
      const result = await queryFn();
      const queryTime = Date.now() - startTime;
      
      // Update average query time
      this.metrics.averageQueryTime = 
        (this.metrics.averageQueryTime * (this.metrics.queryCount - 1) + queryTime) / 
        this.metrics.queryCount;

      console.log(`Query ${queryName} completed in ${queryTime}ms`);
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      console.error(`Query ${queryName} failed:`, error);
      throw error;
    }
  }

  // Track cache performance
  async trackCacheOperation<T>(
    operation: 'get' | 'set' | 'del',
    key: string,
    operationFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const result = await operationFn();
    const operationTime = Date.now() - startTime;

    console.log(`Cache ${operation} for key ${key} completed in ${operationTime}ms`);
    return result;
  }

  // Get current metrics
  getMetrics() {
    return {
      ...this.metrics,
      connectionPoolStats: this.pool.getPoolStats(),
      timestamp: new Date().toISOString(),
    };
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      queryCount: 0,
      averageQueryTime: 0,
      errorCount: 0,
      cacheHitRate: 0,
      connectionPoolStats: {},
    };
  }

  // Health check
  async healthCheck(): Promise<{
    database: boolean;
    cache: boolean;
    overall: boolean;
  }> {
    const databaseHealth = await this.pool.healthCheck();
    const cacheHealth = await this.cache.ping();

    return {
      database: databaseHealth,
      cache: cacheHealth,
      overall: databaseHealth && cacheHealth,
    };
  }

  // Performance recommendations
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.pool.getPoolStats();

    // Connection pool recommendations
    if (stats.busyConnections / stats.maxConnections > 0.8) {
      recommendations.push('Consider increasing max connections in the pool');
    }

    if (stats.availableConnections === 0 && stats.busyConnections < stats.maxConnections) {
      recommendations.push('Consider increasing min connections in the pool');
    }

    // Query performance recommendations
    if (this.metrics.averageQueryTime > 1000) {
      recommendations.push('Average query time is high, consider optimizing queries');
    }

    if (this.metrics.errorCount / this.metrics.queryCount > 0.1) {
      recommendations.push('High error rate detected, check database connectivity');
    }

    // Cache recommendations
    if (this.metrics.cacheHitRate < 0.7) {
      recommendations.push('Low cache hit rate, consider adjusting cache TTL or keys');
    }

    return recommendations;
  }

  // Generate performance report
  async generateReport(): Promise<{
    summary: any;
    recommendations: string[];
    health: any;
  }> {
    const metrics = this.getMetrics();
    const health = await this.healthCheck();
    const recommendations = this.getPerformanceRecommendations();

    return {
      summary: {
        totalQueries: metrics.queryCount,
        averageQueryTime: `${metrics.averageQueryTime.toFixed(2)}ms`,
        errorRate: `${((metrics.errorCount / metrics.queryCount) * 100).toFixed(2)}%`,
        cacheHitRate: `${(metrics.cacheHitRate * 100).toFixed(2)}%`,
        connectionPoolUtilization: `${((metrics.connectionPoolStats.busyConnections / metrics.connectionPoolStats.maxConnections) * 100).toFixed(2)}%`,
      },
      recommendations,
      health,
    };
  }
}

// Export singleton instance
export const databaseMonitor = new DatabaseMonitor();
export default databaseMonitor;