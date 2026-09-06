# Convex Auth with Admin Approval - Implementation Guide

## Overview

The application now uses **Convex Auth** (built into Convex, no external service) with an **admin approval workflow**. Users can sign up with email/password, but need admin approval before they can access protected features.

## Authentication Flow

### 1. User Sign-Up & Sign-In

- Users can sign up with email and password using the `SignInForm` component
- Sign-in happens immediately after signup (no email verification)
- Authentication is handled entirely by Convex Auth with the Password provider

### 2. Approval System

- **New users** are created with `approved: false` (or undefined)
- **Authenticated but unapproved** users can see the homepage but cannot:
  - Access `/stats` or `/judge-it` pages
  - Execute any mutations (create/update/delete data)
- **Approved users** have full access to all features

### 3. Admin Approval Process

#### Via Convex Dashboard (Easiest Method)

1. Go to https://dashboard.convex.dev/deployment/<your-deployment-name>
2. Click on the **Data** tab in the left sidebar
3. Select the **users** table
4. Find the user you want to approve (check their email)
5. Click on the user row to open the document editor
6. Click **"Edit"** button
7. Add a new field:
   - Field name: `approved`
   - Type: `Boolean`
   - Value: `true` (check the box)
8. Click **"Save"**
9. The user will immediately gain access (their page will update automatically)

## Technical Implementation

### Key Files

1. **`convex/auth.ts`** - Convex Auth configuration with Password provider
2. **`convex/authHelpers.ts`** - Authorization helpers:
   - `requireApprovedUser(ctx)` - Throws error if user not approved
   - `isApprovedUser(ctx)` - Returns boolean for approval status

3. **`convex/admin.ts`** - Admin queries and mutations:
   - `getCurrentUserStatus` - Query current user's approval status
   - `listUsers` - List all users with approval info
   - `approveUser` - Approve a user
   - `disapproveUser` - Revoke approval

4. **`convex/mutations.ts`** - All 17 mutations check approval:

   ```typescript
   export const createPlayer = mutation({
     handler: async (ctx, args) => {
       await requireApprovedUser(ctx);  // ← Approval check
       // ... rest of mutation
     },
   });
   ```

5. **`src/app/components/RequireApproval.tsx`** - Route protection component:
   - Wraps protected pages
   - Shows "Pending Approval" message for unapproved users
   - Redirects unauthenticated users to homepage

6. **`src/app/components/SignInForm.tsx`** - Email/password auth form:
   - Toggle between sign-up and sign-in modes
   - Uses `useAuthActions()` from Convex Auth

7. **`src/ConvexClientProvider.tsx`** - Uses `ConvexAuthProvider`:
   - Replaced old `ConvexProvider` with `ConvexAuthProvider`
   - Provides authentication context to all components

8. **`src/AuthContext.tsx`** - Auth state wrapper:
   - Uses `useConvexAuth()` to get auth status
   - Provides `user`, `loading`, `isAuthenticated` to app

### Protected Routes

Both `/stats` and `/judge-it` pages are wrapped with `RequireApproval`:

```typescript
function StatsWithApproval() {
  return (
    <RequireApproval>
      <Stats />
    </RequireApproval>
  );
}

export default StatsWithApproval;
```

## Configuration

### For Admins

1. Log into Convex Dashboard
2. Navigate to `users` table
3. Find unapproved users (`approved: false` or `undefined`)
4. Set `approved: true` for users to grant access
5. Users immediately gain access (no page refresh needed on their end due to reactive queries)

## Security Notes

1. **Authentication vs Authorization**:
   - Authentication: User is logged in (handled by Convex Auth)
   - Authorization: User is approved to access features (custom approval system)

2. **Defense in Depth**:
   - Route protection at component level (`RequireApproval`)
   - Mutation protection at database level (`requireApprovedUser`)
   - Even if someone bypasses UI checks, mutations will fail

3. **Admin Identification**:
   - Current implementation: Any authenticated user can call admin functions
   - For production: Add admin role check in `convex/admin.ts`
   - Recommended: Add `isAdmin: boolean` field to users table
   - Check admin status in all admin mutations/queries

## Next Steps (Future Enhancements)

### 1. Admin Role System

Add `isAdmin` field to users table and protect admin functions:

```typescript
async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getCurrentUserId(ctx);
  const user = await ctx.db.get(userId);
  
  if (!user || !(user as any).isAdmin) {
    throw new Error("Admin access required");
  }
}
```

### 2. Admin UI Dashboard

Create `/admin` page with:
- List of pending users
- Approve/disapprove buttons
- User management interface

### 3. Approval Workflow

- Add approval notes/reasons
- Track who approved which user
- Add approval timestamps

### 4. User Roles

Extend beyond simple approval to role-based access:

- Admin: Full access
- Judge: Can create/update data
- Viewer: Read-only access

## Troubleshooting

### User can't sign in

- Check if NEXT_PUBLIC_CONVEX_URL is set correctly
- Verify Convex deployment is active
- Check browser console for errors

### User stuck on "Pending Approval"

- Verify user exists in Convex `users` table
- Check if `approved` field is set to `true` (not just truthy)
- User may need to refresh page after approval

### Mutations fail with "pending approval" error

- User is authenticated but not approved
- Admin needs to set `approved: true` in users table
- Check that user record actually exists

## Support

For issues or questions:

1. Check Convex Auth docs: https://labs.convex.dev/auth
2. Check Convex dashboard for user data
3. Review browser console for client errors
4. Check Convex logs for server errors
