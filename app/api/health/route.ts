import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - startTime;
    
    // Check Redis connection
    const redisStartTime = Date.now();
    await redis.ping();
    const redisTime = Date.now() - redisStartTime;
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'connected',
          responseTime: `${dbTime}ms`
        },
        redis: {
          status: 'connected',
          responseTime: `${redisTime}ms`
        }
      },
      responseTime: `${totalTime}ms`,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          database: {
            status: 'disconnected'
          },
          redis: {
            status: 'disconnected'
          }
        }
      },
      { status: 503 }
    );
  } finally {
    await prisma.$disconnect();
    redis.disconnect();
  }
}
