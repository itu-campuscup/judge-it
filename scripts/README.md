# Scripts

This directory is for utility scripts.
Currently, it only contains the data import script for copying data initially set in Supabase and into Convex, but it can be expanded in the future for other maintenance tasks.

## importData.ts

This script reads the exported CSV files from the `exported-csv-data-from-supabase` directory and inserts the data into Convex using the Convex HTTP client.

To make the script work a few steps have to be followed:

1. First run `bun dev`
  Ensure you can see the stats.
  If it says pending validation ensure to see [ADMIN_APPROVAL_GUIDE.md](ADMIN_APPROVAL_GUIDE.md) to see how to approve your user in Convex.
  In short open `users` table and set the accounts `approved` field to `true`.
2. On website console run following to get credentials:

   ```js
   const k = Object.keys(localStorage).find(x => x.startsWith("__convexAuthJWT_")); const t = k ? localStorage.getItem(k) : null; console.log(k, t)
   ```

3. Copy the results and run following command in the project root:

   ```bash
   CONVEX_AUTH_TOKEN='<token_copied_from_website_console>' bun run scripts/importData.ts
   ```

Data should now be imported to your Convex database.
You can verify this by checking the Convex dashboard or by running queries in the application.
