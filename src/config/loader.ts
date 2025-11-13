import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { Config, ConfigSchema, defaultConfig } from './schema.js';

export class ConfigLoader {
  private config: Config;

  constructor(configPath?: string) {
    this.config = this.loadConfig(configPath);
  }

  private loadConfig(configPath?: string): Config {
    // Start with default configuration
    let config: Partial<Config> = { ...defaultConfig };

    // Try to load from file
    const paths = configPath
      ? [configPath]
      : [
          join(process.cwd(), 'config.yml'),
          join(process.cwd(), 'config.yaml'),
          join(process.env.HOME || '~', '.dimems', 'config.yml'),
        ];

    for (const path of paths) {
      if (existsSync(path)) {
        try {
          const fileContent = readFileSync(path, 'utf-8');
          const fileConfig = yaml.load(fileContent) as Partial<Config>;
          config = this.deepMerge(config, fileConfig);
          break;
        } catch (error) {
          // Config loading failed, try next path
        }
      }
    }

    // Apply environment variable overrides
    config = this.applyEnvironmentOverrides(config);

    // Validate and parse with Zod
    try {
      return ConfigSchema.parse(config);
    } catch (error) {
      throw new Error('Invalid configuration');
    }
  }

  private applyEnvironmentOverrides(config: Partial<Config>): Partial<Config> {
    const env = process.env;

    // Vault path override
    if (env.DIMEMS_VAULT_PATH) {
      if (!config.vault) {
        config.vault = { ...defaultConfig.vault };
      }
      config.vault.path = env.DIMEMS_VAULT_PATH;
    }

    // Logging level override
    if (env.DIMEMS_LOG_LEVEL) {
      config.logging = config.logging || { ...defaultConfig.logging };
      config.logging.level = env.DIMEMS_LOG_LEVEL as Config['logging']['level'];
    }

    // Embedding device override
    if (env.DIMEMS_EMBEDDING_DEVICE) {
      config.embedding = config.embedding || { ...defaultConfig.embedding };
      config.embedding.device = env.DIMEMS_EMBEDDING_DEVICE as 'cpu' | 'cuda';
    }

    return config;
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }

    return output;
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  public getConfig(): Config {
    return this.config;
  }

  public get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }
}

// Singleton instance
let configInstance: ConfigLoader | null = null;

export function initializeConfig(configPath?: string): ConfigLoader {
  configInstance = new ConfigLoader(configPath);
  return configInstance;
}

export function getConfig(): ConfigLoader {
  if (!configInstance) {
    throw new Error('Configuration not initialized. Call initializeConfig() first.');
  }
  return configInstance;
}
