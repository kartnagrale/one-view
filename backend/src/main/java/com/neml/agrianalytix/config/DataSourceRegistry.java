package com.neml.agrianalytix.config;

import com.neml.agrianalytix.domain.ProjectSource;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PreDestroy;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;

@Component
public class DataSourceRegistry {
    private final Map<ProjectSource, HikariDataSource> pools = new EnumMap<>(ProjectSource.class);
    private final Map<ProjectSource, NamedParameterJdbcTemplate> templates = new EnumMap<>(ProjectSource.class);

    public DataSourceRegistry(AgriAnalytixProperties properties) {
        for (ProjectSource source : ProjectSource.values()) {
            if (source == ProjectSource.ALL) continue;
            var cfg = properties.getDatasources().get(source.name());
            if (cfg == null || !cfg.isEnabled()) continue;
            HikariConfig hc = new HikariConfig();
            hc.setJdbcUrl(cfg.getJdbcUrl());
            hc.setUsername(cfg.getUsername());
            hc.setPassword(cfg.getPassword());
            hc.setMaximumPoolSize(cfg.getMaximumPoolSize());
            hc.setMinimumIdle(0);
            hc.setReadOnly(cfg.isReadOnly());
            hc.setConnectionTimeout(10000);
            hc.setPoolName("agri-" + source.name().toLowerCase());
            hc.addDataSourceProperty("ApplicationName", "AGRI-ANALYTIX");
            HikariDataSource ds = new HikariDataSource(hc);
            pools.put(source, ds);
            templates.put(source, new NamedParameterJdbcTemplate(ds));
        }
    }

    public Optional<NamedParameterJdbcTemplate> template(ProjectSource source) { return Optional.ofNullable(templates.get(source)); }
    public boolean isEnabled(ProjectSource source) { return templates.containsKey(source); }

    @PreDestroy
    public void close() { pools.values().forEach(HikariDataSource::close); }
}
