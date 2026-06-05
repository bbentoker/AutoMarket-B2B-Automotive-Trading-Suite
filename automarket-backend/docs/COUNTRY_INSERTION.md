# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# Country Insertion Tool

## Overview

The Country Insertion Tool reads country data from `src/sql/countries.json` and inserts it into the database using the Country model. It handles duplicates gracefully, validates data, and provides detailed logging.

## Features

- ✅ **Bulk Insert**: Processes all countries from JSON file
- ✅ **Duplicate Handling**: Updates existing countries if names differ, skips identical ones
- ✅ **Data Validation**: Validates country names and codes before insertion
- ✅ **Error Handling**: Continues processing even if some countries fail
- ✅ **Progress Logging**: Shows detailed progress and results
- ✅ **Statistics**: Shows before/after database state
- ✅ **Interactive Confirmation**: Asks for confirmation when database has existing data
- ✅ **Command Line Options**: Multiple modes of operation

## Usage

### Basic Usage

```bash
# Windows
insert-countries.bat

# Unix/Linux/Mac
./insert-countries.sh

# Direct Node.js
node insert-countries.js
```

### Command Line Options

```bash
# Show help
node insert-countries.js --help

# Show current statistics only
node insert-countries.js --stats

# Validate JSON file without inserting
node insert-countries.js --validate
```

## Requirements

### Environment Variables

The script requires database connection variables in your `.env` file:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password
```

### File Structure

The script expects the following file to exist:
- `src/sql/countries.json` - JSON file containing country data

### JSON Format

The countries.json file should contain an array of country objects:

```json
[
  {
    "name": "Afghanistan",
    "code": "AF"
  },
  {
    "name": "Albania", 
    "code": "AL"
  }
]
```

## Country Model Structure

The script works with the Country model which has the following structure:

```javascript
{
  id: INTEGER (auto-increment, primary key),
  name: STRING(100) (required),
  code: STRING(2) (required, unique),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

## Validation Rules

### Country Name
- Must be present and non-empty
- Must be a string
- Trimmed of whitespace

### Country Code
- Must be present and non-empty
- Must be exactly 2 characters
- Converted to uppercase
- Must be unique in database

## Operation Modes

### 1. Insert Mode (Default)
- Inserts new countries that don't exist
- Updates existing countries if names differ
- Skips countries that are identical
- Shows confirmation prompt if database has existing data

### 2. Statistics Mode (`--stats`)
- Shows current country count in database
- Displays sample countries
- Does not modify database

### 3. Validation Mode (`--validate`)
- Validates JSON file format and data
- Shows count of valid/invalid countries
- Does not connect to database
- Does not modify anything

## Example Output

```
🌍 Country Insertion Tool
=========================

🔗 Testing database connection...
✅ Database connection successful
🔄 Syncing database models...
✅ Database models synced

📊 Current database state:
   Total countries in database: 0

📄 Loaded 249 countries from JSON file

🚀 Starting country insertion process...

✅ Inserted: AF - Afghanistan
✅ Inserted: AL - Albania
✅ Inserted: DZ - Algeria
...

📊 Final results:
==================
✅ Inserted: 249 countries
📝 Updated:  0 countries
✓ Skipped:   0 countries (already exist)
❌ Errors:   0 countries

📈 Total countries in database: 249

🎉 Country insertion completed successfully!
🔌 Database connection closed
```

## Error Handling

The script handles various error scenarios:

### Database Errors
- Connection failures
- Model sync issues
- Constraint violations (duplicate codes)

### Data Validation Errors
- Missing or invalid country names
- Missing or invalid country codes
- Invalid JSON format

### File System Errors
- Missing countries.json file
- File read permissions
- Invalid JSON syntax

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your `.env` file has correct database credentials
   - Ensure database server is running
   - Verify network connectivity

2. **Countries JSON Not Found**
   - Ensure `src/sql/countries.json` exists
   - Check file permissions
   - Verify you're running from the correct directory

3. **Duplicate Code Errors**
   - The script handles duplicates automatically
   - If you see errors, check for invalid country codes in JSON
   - Ensure country codes are exactly 2 characters

4. **Validation Errors**
   - Run with `--validate` flag to check JSON file
   - Fix any invalid entries in countries.json
   - Ensure all countries have both name and code

### Performance Notes

- The script processes countries sequentially to avoid database conflicts
- Large datasets (200+ countries) typically take 10-30 seconds
- Progress is logged in real-time for monitoring

## Integration

This script can be integrated into deployment pipelines:

```bash
# In deployment script
echo "Setting up countries..."
node insert-countries.js --stats
if [ $? -eq 0 ]; then
    echo "Countries already set up"
else
    node insert-countries.js
fi
```

## Related Files

- `src/models/Country.js` - Country model definition
- `src/controllers/countryController.js` - Country API endpoints
- `src/sql/countries.json` - Source data file
- `src/sql/create_countries.sql` - SQL table creation script
