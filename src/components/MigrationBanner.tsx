import { motion } from 'motion/react';
import { useMigration } from '@/lib/migration';
import { useAuth } from '@/lib/auth-context';

export default function MigrationBanner() {
  const { isMigrating, migrationResult, migrateData, shouldMigrate, migrationStatus } = useMigration();
  const { user } = useAuth();

  if (!shouldMigrate || !user) {
    return null;
  }

  const handleMigrate = async () => {
    await migrateData(user.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            📦 Migrate Your Data
          </h3>
          <p className="text-blue-700 mb-3">
            We found {migrationStatus.entryCount} journal entries stored locally. 
            Would you like to migrate them to your secure cloud storage?
          </p>
          
          {migrationResult && (
            <div className={`p-3 rounded-md mb-3 ${
              migrationResult.success 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {migrationResult.success ? (
                <div>
                  <p className="font-medium">✅ Migration completed!</p>
                  <p className="text-sm">
                    Successfully migrated {migrationResult.migratedCount} entries to your cloud storage.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">❌ Migration failed</p>
                  <p className="text-sm">
                    {migrationResult.errors.length > 0 && migrationResult.errors[0]}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-4">
          {!migrationResult && (
            <button
              onClick={handleMigrate}
              disabled={isMigrating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMigrating ? 'Migrating...' : 'Migrate Now'}
            </button>
          )}
          
          {migrationResult?.success && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Refresh Page
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
} 