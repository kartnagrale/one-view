package com.neml.agrianalytix.mapping;

import com.neml.agrianalytix.config.AgriAnalytixProperties;
import com.neml.agrianalytix.config.DataSourceRegistry;
import com.neml.agrianalytix.domain.ProjectSource;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class MarketMappingRepository {
    private final DataSourceRegistry registry;
    private final AgriAnalytixProperties properties;
    private final List<MarketMapping> fallback = new CopyOnWriteArrayList<>();
    private final AtomicLong fallbackIds = new AtomicLong(1);
    private String table;

    public MarketMappingRepository(DataSourceRegistry registry, AgriAnalytixProperties properties) {
        this.registry = registry;
        this.properties = properties;
        this.table = quote(properties.getMappingSchema()) + ".market_mapping";
    }

    @PostConstruct
    public void init() {
        if (!properties.isMappingAutoInit() || registry.template(ProjectSource.MASTER).isEmpty()) return;
        var jdbc = registry.template(ProjectSource.MASTER).orElseThrow();
        String schema = quote(properties.getMappingSchema());
        try {
            jdbc.getJdbcTemplate().execute("CREATE SCHEMA IF NOT EXISTS " + schema);
            jdbc.getJdbcTemplate().execute("""
                    CREATE TABLE IF NOT EXISTS %s (
                      id BIGSERIAL PRIMARY KEY,
                      source VARCHAR(20) NOT NULL,
                      global_client VARCHAR(120) NOT NULL,
                      market_code VARCHAR(80) NOT NULL,
                      commodity_code VARCHAR(120),
                      commodity_display_name VARCHAR(180),
                      contract_code VARCHAR(160),
                      state_name VARCHAR(120),
                      location_name VARCHAR(180),
                      warehouse VARCHAR(180),
                      active BOOLEAN NOT NULL DEFAULT TRUE,
                      notes VARCHAR(500),
                      updated_by VARCHAR(120) NOT NULL,
                      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
                    )
                    """.formatted(table));
            jdbc.getJdbcTemplate().execute("CREATE INDEX IF NOT EXISTS idx_agri_mapping_lookup ON " + table + " (source, market_code, commodity_code, contract_code, active)");
        } catch (Exception ignored) {
            // Some production users may have SELECT-only rights. In that case the DBA can run
            // docs/mapping-schema.sql and the application will start working without code changes.
        }
    }

    public List<MarketMapping> findAll() {
        var t = registry.template(ProjectSource.MASTER);
        if (t.isEmpty()) return List.copyOf(fallback);
        try {
            return t.get().query("SELECT * FROM " + table + " ORDER BY global_client, market_code, commodity_code NULLS FIRST",
                    new MapSqlParameterSource(), (rs, n) -> map(rs));
        } catch (Exception ex) {
            return List.copyOf(fallback);
        }
    }

    public MarketMapping save(Long id, MarketMappingRequest req, String updatedBy) {
        var t = registry.template(ProjectSource.MASTER);
        if (t.isEmpty()) return saveFallback(id, req, updatedBy);
        try {
            var p = new MapSqlParameterSource()
                    .addValue("source", req.source().name()).addValue("globalClient", trim(req.globalClient()))
                    .addValue("marketCode", trim(req.marketCode())).addValue("commodityCode", nullable(req.commodityCode()))
                    .addValue("commodityDisplayName", nullable(req.commodityDisplayName())).addValue("contractCode", nullable(req.contractCode()))
                    .addValue("state", nullable(req.state())).addValue("location", nullable(req.location()))
                    .addValue("warehouse", nullable(req.warehouse())).addValue("active", req.active())
                    .addValue("notes", nullable(req.notes())).addValue("updatedBy", updatedBy);
            if (id == null) {
                return t.get().queryForObject("""
                        INSERT INTO %s(source, global_client, market_code, commodity_code, commodity_display_name, contract_code,
                            state_name, location_name, warehouse, active, notes, updated_by, updated_at)
                        VALUES(:source,:globalClient,:marketCode,:commodityCode,:commodityDisplayName,:contractCode,
                            :state,:location,:warehouse,:active,:notes,:updatedBy,now())
                        RETURNING *
                        """.formatted(table), p, (rs,n) -> map(rs));
            }
            p.addValue("id", id);
            return t.get().queryForObject("""
                    UPDATE %s SET source=:source, global_client=:globalClient, market_code=:marketCode,
                        commodity_code=:commodityCode, commodity_display_name=:commodityDisplayName, contract_code=:contractCode,
                        state_name=:state, location_name=:location, warehouse=:warehouse, active=:active, notes=:notes,
                        updated_by=:updatedBy, updated_at=now()
                    WHERE id=:id RETURNING *
                    """.formatted(table), p, (rs,n) -> map(rs));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to persist MarketWatch mapping. Ensure the AGRI mapping schema exists and this user has CRUD rights on it.", ex);
        }
    }

    public void delete(long id) {
        var t = registry.template(ProjectSource.MASTER);
        if (t.isPresent()) {
            try {
                t.get().update("DELETE FROM " + table + " WHERE id=:id", new MapSqlParameterSource("id", id));
                return;
            } catch (Exception ex) {
                throw new IllegalStateException("Unable to delete MarketWatch mapping.", ex);
            }
        }
        fallback.removeIf(m -> m.id() == id);
    }

    private MarketMapping saveFallback(Long id, MarketMappingRequest req, String updatedBy) {
        long actualId = id == null ? fallbackIds.getAndIncrement() : id;
        var m = new MarketMapping(actualId, req.source(), trim(req.globalClient()), trim(req.marketCode()), nullable(req.commodityCode()),
                nullable(req.commodityDisplayName()), nullable(req.contractCode()), nullable(req.state()), nullable(req.location()),
                nullable(req.warehouse()), req.active(), nullable(req.notes()), updatedBy, java.time.Instant.now());
        fallback.removeIf(x -> x.id() == actualId);
        fallback.add(m);
        return m;
    }

    private MarketMapping map(ResultSet rs) throws SQLException {
        return new MarketMapping(rs.getLong("id"), ProjectSource.valueOf(rs.getString("source")), rs.getString("global_client"),
                rs.getString("market_code"), rs.getString("commodity_code"), rs.getString("commodity_display_name"),
                rs.getString("contract_code"), rs.getString("state_name"), rs.getString("location_name"), rs.getString("warehouse"),
                rs.getBoolean("active"), rs.getString("notes"), rs.getString("updated_by"), rs.getTimestamp("updated_at").toInstant());
    }

    private String quote(String identifier) {
        if (identifier == null || !identifier.matches("[A-Za-z0-9_-]+")) throw new IllegalArgumentException("Invalid SQL identifier");
        return '"' + identifier + '"';
    }
    private String trim(String s) { return s == null ? "" : s.trim(); }
    private String nullable(String s) { return s == null || s.isBlank() ? null : s.trim(); }
}
