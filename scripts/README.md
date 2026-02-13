# Scripts

This directory is for utility scripts.
Currently it only contains the data import script for migrating from Supabase to Convex, but it can be expanded in the future for other maintenance tasks.

## importData.ts

This script reads the exported CSV files from the `exported-csv-data-from-supabase` directory and inserts the data into Convex using the Convex HTTP client.
This enables contributors to setup a Convex project and import the data without needing access to the original Supabase database, and also serves as a reference for how to interact with Convex from a Node.js environment.

The script can be run with:

```bash
bun run scripts/importData.ts
```
