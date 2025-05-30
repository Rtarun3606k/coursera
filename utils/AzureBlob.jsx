// Enhanced Azure Blob Storage utility with universal container support
import { BlobServiceClient } from "@azure/storage-blob";

// Container configurations for different use cases with enhanced metadata
export const CONTAINER_CONFIGS = {
  providers: {
    name: "provider-images",
    description: "Provider organization logos and banners",
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ],
    publicAccess: "blob",
    metadata: { category: "provider", purpose: "profile-images" },
  },
  courses: {
    name: "course-images",
    description: "Course thumbnails and banners",
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    publicAccess: "blob",
    metadata: { category: "course", purpose: "thumbnails-banners" },
  },
  users: {
    name: "user-avatars",
    description: "User profile pictures",
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    publicAccess: "blob",
    metadata: { category: "user", purpose: "profile-avatars" },
  },
  lessons: {
    name: "lesson-content",
    description: "Lesson videos, PDFs, and educational materials",
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      "video/mp4",
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ],
    publicAccess: "blob",
    metadata: { category: "lesson", purpose: "educational-content" },
  },
  general: {
    name: "general-uploads",
    description: "General file uploads",
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "video/mp4",
    ],
    publicAccess: "blob",
    metadata: { category: "general", purpose: "mixed-content" },
  },
};

// Enhanced file validation function with detailed error messages
export function validateFile(file, containerType = "general") {
  const config = CONTAINER_CONFIGS[containerType];
  if (!config) {
    throw new Error(
      `Invalid container type: ${containerType}. Available types: ${Object.keys(
        CONTAINER_CONFIGS
      ).join(", ")}`
    );
  }

  const errors = [];

  // Check if file exists and has content
  if (!file || !file.size) {
    errors.push("Invalid file: File is empty or corrupted");
    return { isValid: false, errors };
  }

  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    errors.push(
      `File size ${fileSizeMB}MB exceeds ${maxSizeMB}MB limit for ${containerType}`
    );
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    errors.push(
      `File type "${
        file.type
      }" not allowed for ${containerType}. Allowed types: ${config.allowedTypes.join(
        ", "
      )}`
    );
  }

  // Check file name
  if (!file.name || file.name.trim() === "") {
    errors.push("File name is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
    config,
  };
}

// Generate hierarchical and optimized file name with better organization
export function generateOptimizedFileName(
  originalName,
  containerType,
  userId = null,
  entityId = null
) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop().toLowerCase();

  // Clean the original name
  const baseName = originalName
    .split(".")[0]
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase()
    .substring(0, 20);

  // Build hierarchical path for better organization
  const datePath = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const userPrefix = userId ? `user-${userId}/` : "";
  const entityPrefix = entityId ? `entity-${entityId}/` : "";

  return `${containerType}/${datePath}/${userPrefix}${entityPrefix}${baseName}-${timestamp}-${randomString}.${extension}`;
}

// Get blob service client with proper error handling and retry logic
function getBlobServiceClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error(
      "Azure Storage connection string not found in environment variables. Please check AZURE_STORAGE_CONNECTION_STRING."
    );
  }
  return BlobServiceClient.fromConnectionString(connectionString);
}

// Ensure container exists with proper configuration and error handling
async function ensureContainer(containerName, config) {
  try {
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Check if container exists, create if not
    const exists = await containerClient.exists();
    if (!exists) {
      console.log(`Creating container: ${containerName}`);
      await containerClient.create({
        access: config.publicAccess,
        metadata: config.metadata,
      });
      console.log(`Successfully created container: ${containerName}`);
    }

    return containerClient;
  } catch (error) {
    console.error(`Error ensuring container ${containerName}:`, error);
    throw new Error(
      `Failed to ensure container ${containerName}: ${error.message}`
    );
  }
}

export async function uploadToAzure(
  file,
  fileName,
  containerType = "general",
  options = {}
) {
  try {
    // Enhanced debugging
    console.log("Starting Azure upload process...");
    console.log("File details:", {
      name: fileName,
      size: file.size,
      type: file.type,
      containerType,
    });

    // Validate file before upload
    const validation = validateFile(file, containerType);
    if (!validation.isValid) {
      throw new Error(
        `File validation failed: ${validation.errors.join(", ")}`
      );
    }

    const config = validation.config;
    const containerName = options.customContainer || config.name;

    // Ensure container exists
    const containerClient = await ensureContainer(containerName, config);

    // Generate optimized blob name
    const optimizedName =
      options.customFileName ||
      generateOptimizedFileName(
        fileName,
        containerType,
        options.userId,
        options.entityId
      );

    const blockBlobClient = containerClient.getBlockBlobClient(optimizedName);

    // Convert File to buffer with enhanced error handling
    let buffer;
    let contentType;

    try {
      if (file instanceof Buffer) {
        buffer = file;
        contentType = "application/octet-stream";
      } else {
        buffer = Buffer.from(await file.arrayBuffer());
        contentType = file.type || "application/octet-stream";

        // Enhanced content type detection
        if (!file.type && fileName) {
          const extension = fileName.split(".").pop().toLowerCase();
          const mimeTypes = {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            gif: "image/gif",
            webp: "image/webp",
            pdf: "application/pdf",
            mp4: "video/mp4",
          };
          contentType = mimeTypes[extension] || contentType;
        }
      }
    } catch (bufferError) {
      console.error("Error creating buffer from file:", bufferError);
      throw new Error(`Failed to process file: ${bufferError.message}`);
    }

    // Upload with comprehensive metadata and caching headers
    console.log("Uploading blob to Azure...");
    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: "max-age=86400", // 1 day cache
        blobContentDisposition: `inline; filename="${fileName}"`,
      },
      metadata: {
        originalFilename: fileName,
        containerType: containerType,
        uploadDate: new Date().toISOString(),
        fileSize: file.size.toString(),
        userId: options.userId || "unknown",
        entityId: options.entityId || "none",
        ...config.metadata,
      },
    };

    // Upload with retry logic for transient failures
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        await blockBlobClient.upload(buffer, buffer.length, uploadOptions);
        break;
      } catch (uploadError) {
        retryCount++;
        if (retryCount > maxRetries) {
          throw uploadError;
        }
        console.log(`Upload attempt ${retryCount} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
      }
    }

    console.log(
      "File successfully uploaded to Azure Blob Storage:",
      blockBlobClient.url
    );

    return {
      success: true,
      url: blockBlobClient.url,
      name: optimizedName,
      containerName: containerName,
      metadata: {
        size: file.size,
        type: contentType,
        uploadDate: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Azure upload error:", error);
    return {
      success: false,
      error: error.message,
      details: error.stack,
    };
  }
}

// Use same container name for consistency as in uploadToAzure
export async function deleteFromAzure(blobName) {
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    // Use same container name as upload function
    const containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || "portfolio";

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.delete();
    console.log("Successfully deleted blob:", blobName);

    return { success: true };
  } catch (error) {
    console.error("Azure delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper function to extract blob name from URL (helpful for deletions)
export function getBlobNameFromUrl(url) {
  if (!url) return null;
  const urlParts = url.split("/");
  return urlParts[urlParts.length - 1];
}
