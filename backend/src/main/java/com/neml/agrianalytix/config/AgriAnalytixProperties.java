package com.neml.agrianalytix.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@ConfigurationProperties(prefix = "agri")
public class AgriAnalytixProperties {
    private boolean demoMode = true;
    private long refreshMs = 900000L;
    private LocalDate historyStart = LocalDate.of(2022, 4, 1);
    private int refreshLookbackDays = 14;
    private String mappingSchema = "agri_analytix";
    private boolean mappingAutoInit = true;
    private Map<String, SourceDb> datasources = new LinkedHashMap<>();
    private Auth auth = new Auth();

    public boolean isDemoMode() { return demoMode; }
    public void setDemoMode(boolean demoMode) { this.demoMode = demoMode; }
    public long getRefreshMs() { return refreshMs; }
    public void setRefreshMs(long refreshMs) { this.refreshMs = refreshMs; }
    public LocalDate getHistoryStart() { return historyStart; }
    public void setHistoryStart(LocalDate historyStart) { this.historyStart = historyStart; }
    public int getRefreshLookbackDays() { return refreshLookbackDays; }
    public void setRefreshLookbackDays(int refreshLookbackDays) { this.refreshLookbackDays = refreshLookbackDays; }
    public String getMappingSchema() { return mappingSchema; }
    public void setMappingSchema(String mappingSchema) { this.mappingSchema = mappingSchema; }
    public boolean isMappingAutoInit() { return mappingAutoInit; }
    public void setMappingAutoInit(boolean mappingAutoInit) { this.mappingAutoInit = mappingAutoInit; }
    public Map<String, SourceDb> getDatasources() { return datasources; }
    public void setDatasources(Map<String, SourceDb> datasources) { this.datasources = datasources; }
    public Auth getAuth() { return auth; }
    public void setAuth(Auth auth) { this.auth = auth; }

    public static class SourceDb {
        private boolean enabled;
        private String jdbcUrl;
        private String username;
        private String password;
        private int maximumPoolSize = 1;
        private boolean readOnly = true;
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getJdbcUrl() { return jdbcUrl; }
        public void setJdbcUrl(String jdbcUrl) { this.jdbcUrl = jdbcUrl; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public int getMaximumPoolSize() { return maximumPoolSize; }
        public void setMaximumPoolSize(int maximumPoolSize) { this.maximumPoolSize = maximumPoolSize; }
        public boolean isReadOnly() { return readOnly; }
        public void setReadOnly(boolean readOnly) { this.readOnly = readOnly; }
    }

    public static class Auth {
        private String internalUser = "analyst";
        private String internalPassword = "demo123";
        private String marketwatchUser = "marketwatch";
        private String marketwatchPassword = "demo123";
        public String getInternalUser() { return internalUser; }
        public void setInternalUser(String internalUser) { this.internalUser = internalUser; }
        public String getInternalPassword() { return internalPassword; }
        public void setInternalPassword(String internalPassword) { this.internalPassword = internalPassword; }
        public String getMarketwatchUser() { return marketwatchUser; }
        public void setMarketwatchUser(String marketwatchUser) { this.marketwatchUser = marketwatchUser; }
        public String getMarketwatchPassword() { return marketwatchPassword; }
        public void setMarketwatchPassword(String marketwatchPassword) { this.marketwatchPassword = marketwatchPassword; }
    }
}
