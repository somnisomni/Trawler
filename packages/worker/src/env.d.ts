namespace NodeJS {
  interface ProcessEnv {
    /** Whether to enable verbose logging */
    TRAWLER_LOGGING_VERBOSE?: string;

    /** Whether to enable pretty logging */
    TRAWLER_LOGGING_PRETTY?: string;

    /** Specific configuration file path */
    TRAWLER_CONFIG_FILE?: string;
  }
}
