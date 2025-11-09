#!/usr/bin/env tsx

import { z } from 'zod';
import fs from 'fs';
import path from 'path';

/**
 * Schema Validator for Place JSON Files
 * Validates individual place files against the Place schema
 * Used in CI/CD to ensure data quality
 */

// Define operating hours schema
const operatingHoursSchema = z.record(
  z.string(),  // Keys are day names (strings)
  z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    close: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    closed: z.boolean().optional(),
  })
);

// Define the complete Place schema
const placeSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
  description: z.string().min(10, 'Description must be at least 10 characters'),

  // Contact Information
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),

  // Media
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  coverImageUrl: z.string().url('Invalid cover image URL').optional().or(z.literal('')),
  photosUrls: z.array(z.string().url('Invalid photo URL')),

  // Business Details
  operatingHours: operatingHoursSchema,
  priceRange: z.enum(['$', '$$', '$$$', '$$$$'], {
    message: 'Price range must be $, $$, $$$, or $$$$',
  }),
  paymentMethods: z.array(z.string()),

  // Categorization & Search
  tags: z.array(z.string()),
  amenities: z.array(z.string()),
  cuisineTypes: z.array(z.string()).min(1, 'At least one cuisine type is required'),
  specialties: z.array(z.string()),

  // Location
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Metadata
  createdAt: z.string().datetime('Invalid createdAt timestamp'),
  updatedAt: z.string().datetime('Invalid updatedAt timestamp'),

  // Optional future fields
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  verified: z.boolean().optional(),
});

type ValidationResult = {
  valid: boolean;
  errors?: z.ZodError['errors'];
  filePath: string;
};

/**
 * Validate a single place file
 */
export function validatePlaceFile(filePath: string): ValidationResult {
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Validate against schema
    placeSchema.parse(data);

    return {
      valid: true,
      filePath,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.issues as any,
        filePath,
      };
    }

    if (error instanceof SyntaxError) {
      return {
        valid: false,
        errors: [
          {
            code: 'custom',
            path: [],
            message: `JSON parse error: ${error.message}`,
          },
        ] as any,
        filePath,
      };
    }

    throw error;
  }
}

/**
 * Validate all place files in a directory
 */
export function validateAllPlaces(placesDir: string): ValidationResult[] {
  const files = fs.readdirSync(placesDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(placesDir, file));

  return files.map(validatePlaceFile);
}

/**
 * Format validation errors for human readability
 */
function formatValidationError(result: ValidationResult): string {
  const lines: string[] = [];
  lines.push(`\n❌ ${result.filePath}`);

  if (result.errors) {
    result.errors.forEach(error => {
      const path = error.path.join('.');
      lines.push(`  • ${path || 'root'}: ${error.message}`);
    });
  }

  return lines.join('\n');
}

/**
 * Main CLI execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: validate-place <file-or-directory>');
    console.error('');
    console.error('Examples:');
    console.error('  validate-place apps/web/src/data/places/rodics-diner.json');
    console.error('  validate-place apps/web/src/data/places');
    process.exit(1);
  }

  const target = args[0];
  const targetPath = path.resolve(process.cwd(), target);

  // Check if target exists
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Path does not exist: ${targetPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(targetPath);
  let results: ValidationResult[];

  if (stat.isDirectory()) {
    console.info(`📁 Validating all places in: ${targetPath}\n`);
    results = validateAllPlaces(targetPath);
  } else if (stat.isFile()) {
    console.info(`📄 Validating file: ${targetPath}\n`);
    results = [validatePlaceFile(targetPath)];
  } else {
    console.error('❌ Target must be a file or directory');
    process.exit(1);
  }

  // Separate valid and invalid results
  const validResults = results.filter(r => r.valid);
  const invalidResults = results.filter(r => !r.valid);

  // Print invalid results
  if (invalidResults.length > 0) {
    console.error('❌ Validation Failed\n');
    invalidResults.forEach(result => {
      console.error(formatValidationError(result));
    });
    console.error('');
  }

  // Print summary
  console.info('📊 Summary:');
  console.info(`  ✅ Valid: ${validResults.length}`);
  console.info(`  ❌ Invalid: ${invalidResults.length}`);
  console.info(`  📝 Total: ${results.length}`);

  // Exit with error code if any validation failed
  if (invalidResults.length > 0) {
    process.exit(1);
  }

  console.info('\n✨ All validations passed!');
}

// Run if executed directly
if (require.main === module) {
  main();
}
