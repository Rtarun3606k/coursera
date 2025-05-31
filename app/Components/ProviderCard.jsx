import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  BookOpen,
  Star,
  Shield,
  Calendar,
  ExternalLink,
} from "lucide-react";

const ProviderCard = ({
  provider,
  variant = "default",
  showActions = true,
}) => {
  const {
    id,
    name,
    description,
    logo,
    website,
    type,
    email,
    phone,
    address,
    country,
    isVerified,
    isActive,
    totalCourses = 0,
    totalStudents = 0,
    averageRating = 0,
    createdAt,
  } = provider;

  // Format the provider type for display
  const formatProviderType = (type) => {
    return (
      type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Organization"
    );
  };

  // Format the creation date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  // Get provider type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "UNIVERSITY":
        return "🎓";
      case "COMPANY":
        return "🏢";
      case "INDIVIDUAL":
        return "👤";
      case "BOOTCAMP":
        return "⚡";
      case "CERTIFICATION_BODY":
        return "📜";
      default:
        return "🏛️";
    }
  };

  // Render star rating
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400/50 text-yellow-400"
          />
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div
      className={`
      bg-white dark:bg-gray-800 
      rounded-xl shadow-lg hover:shadow-xl 
      transition-all duration-300 
      border border-gray-200 dark:border-gray-700
      overflow-hidden
      ${variant === "compact" ? "max-w-sm" : "max-w-md"}
      group hover:scale-[1.02]
    `}
    >
      {/* Header with Logo and Basic Info */}
      <div className="relative p-6 pb-4">
        {/* Status Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isVerified && (
            <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
              <Shield className="w-3 h-3" />
              Verified
            </div>
          )}
          {!isActive && (
            <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs font-medium">
              Inactive
            </div>
          )}
        </div>

        {/* Logo and Title */}
        <div className="flex items-start gap-4">
          <div className="relative">
            {logo ? (
              <Image
                src={logo}
                alt={`${name} logo`}
                width={64}
                height={64}
                className="rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`${
                logo ? "hidden" : "flex"
              } w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg items-center justify-center text-white text-2xl font-bold`}
            >
              {name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {name}
              </h3>
              <span className="text-lg">{getTypeIcon(type)}</span>
            </div>

            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
              {formatProviderType(type)}
            </p>

            {/* Rating and Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex">{renderRating(averageRating)}</div>
                  <span className="font-medium">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{totalCourses} courses</span>
              </div>

              {totalStudents > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{totalStudents.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {description && variant !== "compact" && (
        <div className="px-6 pb-4">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>
      )}

      {/* Contact Information */}
      <div className="px-6 pb-4 space-y-2">
        {email && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <a
              href={`mailto:${email}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
            >
              {email}
            </a>
          </div>
        )}

        {website && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Globe className="w-4 h-4 flex-shrink-0" />
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 truncate"
            >
              Visit Website
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <a
              href={`tel:${phone}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {phone}
            </a>
          </div>
        )}

        {(address || country) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {[address, country].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {createdAt && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Member since {formatDate(createdAt)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Link
              href={`/providers/${id}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
            >
              View Profile
            </Link>

            {totalCourses > 0 && (
              <Link
                href={`/providers/${id}/courses`}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
              >
                View Courses
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Grid component for displaying multiple provider cards
export const ProviderGrid = ({
  providers,
  variant = "default",
  showActions = true,
}) => {
  if (!providers || providers.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No providers found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          There are no providers to display at the moment.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
      grid gap-6
      ${
        variant === "compact"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      }
    `}
    >
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          variant={variant}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default ProviderCard;
