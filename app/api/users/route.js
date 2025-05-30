import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/auth";

// Initialize Prisma client with connection retry
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ["error", "warn"],
  errorFormat: "pretty",
});

// Connection test utility
async function testConnection() {
  try {
    await prisma.$connect();
    await prisma.$executeRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
}

// GET - Fetch all users
export async function GET(request) {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          message:
            "Unable to connect to MongoDB Atlas. Please check your connection.",
          troubleshooting: [
            "Verify your IP is whitelisted in MongoDB Atlas",
            "Check if your cluster is running (not paused)",
            "Verify your network connection",
            "Check DATABASE_URL in environment variables",
          ],
        },
        { status: 503 }
      );
    }

    // Optional: Check authentication
    const session = await auth();

    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100); // Max 100 users per request
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    // Fetch users with pagination and filtering
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          bio: true,
          expertise: true,
          totalStudents: true,
          totalCourses: true,
          averageRating: true,
          createdAt: true,
          updatedAt: true,
          // Include related data counts
          _count: {
            select: {
              enrollments: true,
              reviews: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      // Get total count for pagination
      prisma.user.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        authenticated: !!session,
        userRole: session?.user?.role || "guest",
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    // Handle specific MongoDB errors
    if (error.message.includes("Server selection timeout")) {
      return NextResponse.json(
        {
          error: "Database connection timeout",
          message: "MongoDB Atlas is unreachable. Please try again later.",
          code: "MONGODB_TIMEOUT",
        },
        { status: 503 }
      );
    }

    if (error.message.includes("Authentication failed")) {
      return NextResponse.json(
        {
          error: "Database authentication failed",
          message: "Invalid MongoDB credentials.",
          code: "MONGODB_AUTH_ERROR",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while fetching users.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  } finally {
    // Close Prisma connection
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
  }
}

// POST - Create a new user
export async function POST(request) {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    // Check authentication and authorization
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, role = "user", bio, expertise } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        bio,
        expertise: expertise || [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        expertise: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Health check endpoint
export async function HEAD() {
  try {
    const isConnected = await testConnection();
    return new Response(null, {
      status: isConnected ? 200 : 503,
      headers: {
        "X-Database-Status": isConnected ? "connected" : "disconnected",
      },
    });
  } catch (error) {
    return new Response(null, { status: 503 });
  }
}
