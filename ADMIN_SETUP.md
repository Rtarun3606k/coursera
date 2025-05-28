# Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here

# Admin Emails (Optional - can also be configured in auth.js)
ADMIN_EMAILS=r.tarunnayaka25042005@gmail.com,admin2@example.com
```

## How to get Google OAuth credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create a new OAuth 2.0 client ID
5. Set the authorized redirect URIs to: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local` file

## Generate NEXTAUTH_SECRET:

You can generate a random secret using:

```bash
openssl rand -base64 32
```

## Admin Configuration:

To make a user an admin, add their email to the `ADMIN_EMAILS` array in `/app/auth.js`:

```javascript
const ADMIN_EMAILS = [
  "r.tarunnayaka25042005@gmail.com", // Your email
  "admin2@example.com", // Add more admin emails here
];
```

## Features Included:

✅ **Google OAuth Authentication**
✅ **Role-based Access Control (Admin/User)**
✅ **Protected Admin Routes**
✅ **Admin Dashboard with Analytics**
✅ **User Management Interface**
✅ **Theme Switching (Light/Dark/System)**
✅ **Responsive Navigation with Mobile Menu**
✅ **Server-side Route Protection (Middleware)**
✅ **Client-side Route Protection (AdminGuard)**
✅ **Professional UI with Shadcn Components**
