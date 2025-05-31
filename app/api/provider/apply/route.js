import { uploadToAzure, validateFile } from "@/utils/AzureBlob";
import { PrismaConnection } from "@/utils/PrismaConnection";
import { NextResponse } from "next/server";

async function handelApplication(req) {
  try {
    const data = await req.formData();

    const name = data.get("name");
    const description = data.get("description");
    const logo = data.get("logo");
    const website = data.get("website");
    const type = data.get("type");
    const email = data.get("email");
    const phone = data.get("phone");
    const address = data.get("address");
    const country = data.get("country");

    // Basic validation
    if (!name || !description || !website || !type || !email) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Validate email format first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get database connection
    const db = PrismaConnection;

    // Check for existing provider with same email (AWAIT the query!)
    const existingProvider = await db.provider.findFirst({
      where: {
        email: email,
      },
    });

    // console.log("Existing provider check:", existingProvider);

    if (existingProvider && existingProvider.isVerified === true) {
      return NextResponse.json(
        {
          error: "Provider application with this email already exists",
          message: "Provider application with this email already exists",
        },
        { status: 409 }
      );
    }

    // Handle logo upload
    let logoUrl = null;
    if (logo && logo instanceof File && logo.size > 0) {
      try {
        // Validate file
        validateFile(logo, "providers");

        // Upload to Azure Blob Storage
        const uploadResult = await uploadToAzure(logo, "providers");
        logoUrl = uploadResult.url;

        console.log("Logo uploaded successfully:", logoUrl);
      } catch (fileError) {
        console.error("File upload error:", fileError);
        return NextResponse.json(
          { error: `File upload failed: ${fileError.message}` },
          { status: 400 }
        );
      }
    }

    // Create new provider in database
    const newProvider = await db.provider.create({
      data: {
        name,
        description,
        logo: logoUrl, // Only store the URL, not the file object
        website,
        type,
        email,
        phone,
        address,
        country,
        // Add default values for other required fields
        isVerified: false,
        isActive: true,
        totalCourses: 0,
        totalStudents: 0,
        averageRating: 0,
      },
    });

    // Return success response with sanitized data
    return NextResponse.json(
      {
        success: true,
        provider: {
          id: newProvider.id,
          name: newProvider.name,
          email: newProvider.email,
          type: newProvider.type,
          logo: newProvider.logo,
          status: "pending_review",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error handling application:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A provider with this information already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process application. Please try again." },
      { status: 500 }
    );
  }
}

async function handelApplicationGet(req, {}) {
  try {
    const { searchParams } = new URL(req.url);
    if (!searchParams.has("email")) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const email = searchParams.get("email");

    const providerApplication = await PrismaConnection.provider.findFirst({
      where: {
        email: email,
      },
    });

    if (!providerApplication) {
      return NextResponse.json(
        { error: "No application found for this email" },
        { status: 404 }
      );
    }

    // Return the provider application data
    return NextResponse.json(
      {
        success: true,
        provider: {
          id: providerApplication.id,
          name: providerApplication.name,
          description: providerApplication.description,
          logo: providerApplication.logo,
          website: providerApplication.website,
          type: providerApplication.type,
          email: providerApplication.email,
          phone: providerApplication.phone,
          address: providerApplication.address,
          country: providerApplication.country,
          isVerified: providerApplication.isVerified,
          isActive: providerApplication.isActive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling application GET request:", error);
    return NextResponse.json(
      { error: "Failed to retrieve application data" },
      { status: 500 }
    );
  }
}

export const POST = handelApplication;

export const GET = handelApplicationGet;
