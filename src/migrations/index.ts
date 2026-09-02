import * as migration_20260902_155531_baseline_schema from './20260902_155531_baseline_schema';

export const migrations = [
  {
    up: migration_20260902_155531_baseline_schema.up,
    down: migration_20260902_155531_baseline_schema.down,
    name: '20260902_155531_baseline_schema'
  },
];
