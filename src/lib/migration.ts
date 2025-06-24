// Migration script to move localStorage data to Supabase
import { useState } from 'react';
import { supabaseHelpers } from './supabase-client';

export interface LocalStorageEntry {
  id: number;
  text: string;
  date: string | Date;
}

export async function migrateLocalStorageData(userId: string): Promise<{
  success: boolean;
  migratedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    // Get localStorage data
    const savedEntries = localStorage.getItem('entries');
    if (!savedEntries) {
      return { success: true, migratedCount: 0, errors: [] };
    }

    const entries: LocalStorageEntry[] = JSON.parse(savedEntries);
    
    // Migrate each entry
    for (const entry of entries) {
      try {
        // Convert date to proper format
        const entryDate = new Date(entry.date);
        const dateString = entryDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Check if entry already exists for this date
        const existingEntry = await supabaseHelpers.entries.getByDate(userId, dateString);
        
        if (!existingEntry) {
          // Create new entry in Supabase
          await supabaseHelpers.entries.create({
            user_id: userId,
            entry_date: dateString,
            content: entry.text
          });
          
          migratedCount++;
        }
      } catch (error) {
        console.error('Error migrating entry:', error);
        errors.push(`Failed to migrate entry for ${new Date(entry.date).toLocaleDateString()}: ${error}`);
      }
    }

    // Clear localStorage after successful migration
    if (migratedCount > 0) {
      localStorage.removeItem('entries');
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors
    };

  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      migratedCount,
      errors: [`Migration failed: ${error}`]
    };
  }
}

// Function to check if migration is needed
export function shouldMigrateData(): boolean {
  if (typeof window === 'undefined') return false; // Server-side check
  
  const savedEntries = localStorage.getItem('entries');
  return savedEntries !== null;
}

// Function to get migration status
export function getMigrationStatus(): {
  hasLocalData: boolean;
  entryCount: number;
} {
  if (typeof window === 'undefined') {
    return { hasLocalData: false, entryCount: 0 };
  }

  const savedEntries = localStorage.getItem('entries');
  if (!savedEntries) {
    return { hasLocalData: false, entryCount: 0 };
  }

  try {
    const entries = JSON.parse(savedEntries);
    return {
      hasLocalData: true,
      entryCount: entries.length
    };
  } catch {
    return { hasLocalData: false, entryCount: 0 };
  }
}

// React hook for migration
export function useMigration() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    migratedCount: number;
    errors: string[];
  } | null>(null);

  const migrateData = async (userId: string) => {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const result = await migrateLocalStorageData(userId);
      setMigrationResult(result);
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        migratedCount: 0,
        errors: [`Migration failed: ${error}`]
      };
      setMigrationResult(errorResult);
      return errorResult;
    } finally {
      setIsMigrating(false);
    }
  };

  return {
    isMigrating,
    migrationResult,
    migrateData,
    shouldMigrate: shouldMigrateData(),
    migrationStatus: getMigrationStatus()
  };
} 