"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoginButton from "@/app/Components/LoginButton";
import ProviderStaticSection from "@/app/Components/ProviderStaticSection";
import ProviderCard from "@/app/Components/ProviderCard";
import { useProviderData } from "@/hooks/useProviderData";

export default function BecomeProviderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({ success: false });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    type: "UNIVERSITY",
    email: "",
    phone: "",
    address: "",
    country: "",
    logo: null,
  });

  // Use the optimized provider data hook
  const {
    providerData,
    loading: fetchingProvider,
    error: fetchError,
    refetch: refetchProviderData,
    updateProviderData,
  } = useProviderData(session?.user?.email);

  // Set fetch error in the errors state for UI consistency
  if (fetchError && !errors.fetch) {
    setErrors((prev) => ({ ...prev, fetch: fetchError }));
  }

  // Show loading while session is being determined
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (status === "unauthenticated" || !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoginButton />
      </div>
    );
  }

  const providerTypes = [
    { value: "UNIVERSITY", label: "University / Academic Institution" },
    { value: "COMPANY", label: "Company / Corporate Training" },
    { value: "INDIVIDUAL", label: "Individual Instructor" },
    { value: "BOOTCAMP", label: "Bootcamp / Training Center" },
    { value: "CERTIFICATION_BODY", label: "Certification Body" },
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      setFormData((prev) => ({ ...prev, logo: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Organization name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website =
        "Please enter a valid URL (including http:// or https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      router.push("/login");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "logo" && formData.logo) {
          submitData.append("logo", formData.logo);
        } else if (key !== "logo" && formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Use relative URL
      const response = await fetch("/api/provider/apply", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        // Show success message
        setSuccess({
          submit:
            "Provider application submitted successfully! We will review your application and get back to you within 2-3 business days.",
          success: true,
        });

        // Update provider data using the hook's cache update function
        updateProviderData(result.provider);

        // Clear form
        setFormData({
          name: "",
          description: "",
          website: "",
          type: "UNIVERSITY",
          email: "",
          phone: "",
          address: "",
          country: "",
          logo: null,
        });
      } else {
        setErrors({ submit: result.error || "Failed to submit application" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ProviderStaticSection />

        {/* Show loading state while fetching provider data */}
        {fetchingProvider && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Checking existing application...
            </p>
          </div>
        )}

        {/* Show fetch error if any */}
        {errors.fetch && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{errors.fetch}</p>
          </div>
        )}

        {/* Registration Form or Provider Card */}
        {!fetchingProvider && (
          <>
            {providerData ? (
              <>
                <div className="mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
                      Application Status
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      {providerData.isVerified
                        ? "Your provider application has been approved! You can now create courses."
                        : "Your provider application is under review. We'll notify you once it's approved."}
                    </p>
                  </div>
                </div>
                <div className="w-full">
                  <ProviderCard
                    provider={providerData}
                    variant="default"
                    showActions={false}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Provider Registration
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Organization Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="Enter your organization name"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Organization Type *
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        >
                          {providerTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        placeholder="Describe your organization, mission, and the types of courses you plan to offer..."
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contact Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="contact@yourorganization.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    {/* Website and Location */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Website URL
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="https://www.yourorganization.com"
                        />
                        {errors.website && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.website}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="United States"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        placeholder="123 Education St, Learning City, State 12345"
                      />
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Organization Logo
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          name="logo"
                          accept="image/*"
                          onChange={handleInputChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-12 h-12 text-gray-400 mb-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 48 48"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400">
                              Click to upload logo
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        </label>
                        {formData.logo && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            Selected: {formData.logo.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-600 dark:text-red-400">
                          {errors.submit}
                        </p>
                      </div>
                    )}

                    {/* Success Message */}
                    {success.success === true && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <p className="text-green-600 dark:text-green-400">
                          {success.submit}
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex items-center justify-between pt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        * Required fields
                      </p>
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {loading && (
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        )}
                        {loading ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </>
        )}

        {/* Additional Information */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            What happens next?
          </h3>
          <div className="space-y-3 text-blue-800 dark:text-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                1
              </div>
              <p>We'll review your application within 2-3 business days</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                2
              </div>
              <p>
                Our team will contact you via email for any additional
                information needed
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                3
              </div>
              <p>
                Once approved, you'll receive access to our course creation
                platform and guidelines
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                4
              </div>
              <p>
                Start creating and publishing your courses to reach millions of
                learners
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
