package com.neml.agrianalytix.repository;

import com.neml.agrianalytix.config.DataSourceRegistry;
import com.neml.agrianalytix.domain.AuctionFact;
import com.neml.agrianalytix.domain.ParticipantFact;
import com.neml.agrianalytix.domain.ProjectSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

@Repository
public class JdbcAnalyticsRepository implements AnalyticsRepository {
    private final DataSourceRegistry registry;

    public JdbcAnalyticsRepository(DataSourceRegistry registry) { this.registry = registry; }

    /*
     * One physical MARKET database connection is used for both schemas:
     *   auctionv2replica             -> auction/order/trade facts
     *   participant-masterv2_replica -> participant + market mapping master
     *
     * Main dashboard facts are AO rows only. Auction mode is a business rule:
     *   AO + side=S => FORWARD (seller order, buyers bid upward)
     *   AO + side=B => REVERSE (buyer order, sellers bid downward)
     */
    private static final String MASTER_AUCTION_SQL = """
        WITH trade_summary AS (
            SELECT order_id,
                   MAX(CASE WHEN trd_is_approved = 'T' THEN 1 ELSE 0 END) AS approved_flag,
                   COALESCE(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_qty ELSE 0 END), 0) AS approved_qty,
                   COALESCE(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_qty ELSE 0 END), 0) AS trade_qty,
                   COALESCE(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_value ELSE 0 END), 0) AS trade_value,
                   COALESCE(
                       SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_value ELSE 0 END)
                       / NULLIF(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_qty ELSE 0 END), 0), 0
                   ) AS trade_price
            FROM trade_mstr
            GROUP BY order_id
        ),
        bidder_summary AS (
            SELECT ord_auction_ord_no, COUNT(DISTINCT ord_tm_id) AS bidder_count
            FROM fo_orders
            WHERE ord_ord_type = 'AB'
            GROUP BY ord_auction_ord_no
        )
        SELECT
            COALESCE(fo.ord_unique_number, fo.ord_exch_ord_no::text) AS auction_id,
            fo.ord_ord_intrnl_dt::date AS auction_date,
            fo.ord_ord_intrnl_dt AS auction_datetime,
            COALESCE(fo.global_client, '') AS global_client,
            COALESCE(fo.ord_market_code, '') AS market_code,
            COALESCE(fo.ord_comm_code, '') AS commodity,
            COALESCE(fo.ord_contract_code, '') AS contract_code,
            COALESCE(fo.ord_state_name, '') AS state_name,
            COALESCE(fo.ord_paramvalue5, '') AS warehouse,
            COALESCE(fo.ord_location, '') AS location_name,
            COALESCE(fo.ord_scheme_code, '') AS scheme_code,
            COALESCE(fo.ord_paramvalue8, '') AS season,
            COALESCE(fo.ord_ord_side, '') AS order_side,
            COALESCE(fo.ord_market_type, '') AS market_type,
            COALESCE(fo.ord_auction_type, '') AS auction_type,
            CASE
                WHEN fo.ord_ord_type = 'AO' AND fo.ord_ord_side = 'S' THEN 'FORWARD'
                WHEN fo.ord_ord_type = 'AO' AND fo.ord_ord_side = 'B' THEN 'REVERSE'
                ELSE 'UNKNOWN'
            END AS auction_mode,
            COALESCE(NULLIF(TRIM(fo.ord_qty_unit), ''), 'UNKNOWN') AS qty_unit,
            COALESCE(fo.ord_tm_id::text, '') AS organization_id,
            COALESCE(rm.org_nm, '') AS organization_name,
            COALESCE(fo.ord_ord_qty, 0) AS auction_qty,
            COALESCE(fo.ord_ord_price, 0) AS auction_price,
            COALESCE(bs.bidder_count, 0) AS bidder_count,
            COALESCE(ts.approved_qty, 0) AS approved_qty,
            COALESCE(ts.trade_qty, 0) AS trade_qty,
            COALESCE(ts.trade_price, 0) AS trade_price,
            COALESCE(ts.trade_value, 0) AS trade_value,
            COALESCE(ts.approved_flag, 0) AS approved_flag
        FROM fo_orders fo
        INNER JOIN registration_mstr rm ON rm.org_id = fo.ord_tm_id AND COALESCE(rm.is_mock, 'F') <> 'T'
        LEFT JOIN trade_summary ts ON ts.order_id = fo.ord_exch_ord_no
        LEFT JOIN bidder_summary bs ON bs.ord_auction_ord_no = fo.ord_exch_ord_no
        WHERE fo.ord_ord_type = 'AO'
          AND fo.ord_status NOT IN ('UPLOAD','INVALID','PLAN','CNL','CNLS')
          AND fo.ord_ord_intrnl_dt::date >= :fromDate
        ORDER BY fo.ord_ord_intrnl_dt DESC
        """;

    private static final String SUGAR_AUCTION_SQL = """
        WITH trade_summary AS (
            SELECT order_id,
                   MAX(CASE WHEN trd_is_approved = 'T' THEN 1 ELSE 0 END) AS approved_flag,
                   COALESCE(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_qty ELSE 0 END), 0) AS approved_qty,
                   COALESCE(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_qty ELSE 0 END), 0) AS trade_qty,
                   COALESCE(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_value ELSE 0 END), 0) AS trade_value,
                   COALESCE(
                       SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_value ELSE 0 END)
                       / NULLIF(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_qty ELSE 0 END), 0), 0
                   ) AS trade_price
            FROM trade_mstr GROUP BY order_id
        ), bidder_summary AS (
            SELECT ord_auction_ord_no, COUNT(DISTINCT ord_tm_id) AS bidder_count
            FROM fo_orders WHERE ord_ord_type = 'AB' GROUP BY ord_auction_ord_no
        )
        SELECT
            COALESCE(fo.ord_unique_number, fo.ord_exch_ord_no::text) AS auction_id,
            fo.ord_ord_intrnl_dt::date AS auction_date,
            fo.ord_ord_intrnl_dt AS auction_datetime,
            '' AS global_client,
            COALESCE(fo.ord_market_code, '') AS market_code,
            COALESCE(fo.ord_comm_code, '') AS commodity,
            COALESCE(fo.ord_contract_code, '') AS contract_code,
            '' AS state_name,
            COALESCE(fo.ord_paramvalue5, '') AS warehouse,
            COALESCE(fo.ord_location, '') AS location_name,
            '' AS scheme_code,
            COALESCE(fo.ord_paramvalue8, '') AS season,
            COALESCE(fo.ord_ord_side, '') AS order_side,
            COALESCE(fo.ord_market_type, '') AS market_type,
            COALESCE(fo.ord_auction_type, '') AS auction_type,
            CASE
                WHEN fo.ord_ord_type = 'AO' AND fo.ord_ord_side = 'S' THEN 'FORWARD'
                WHEN fo.ord_ord_type = 'AO' AND fo.ord_ord_side = 'B' THEN 'REVERSE'
                ELSE 'UNKNOWN'
            END AS auction_mode,
            COALESCE(NULLIF(TRIM(fo.ord_qty_unit), ''), 'UNKNOWN') AS qty_unit,
            COALESCE(fo.ord_tm_id::text, '') AS organization_id,
            COALESCE(rm.org_nm, '') AS organization_name,
            COALESCE(fo.ord_ord_qty, 0) AS auction_qty,
            COALESCE(fo.ord_ord_price, 0) AS auction_price,
            COALESCE(bs.bidder_count, 0) AS bidder_count,
            COALESCE(ts.approved_qty, 0) AS approved_qty,
            COALESCE(ts.trade_qty, 0) AS trade_qty,
            COALESCE(ts.trade_price, 0) AS trade_price,
            COALESCE(ts.trade_value, 0) AS trade_value,
            COALESCE(ts.approved_flag, 0) AS approved_flag
        FROM fo_orders fo
        INNER JOIN registration_mstr rm ON rm.org_id = fo.ord_tm_id AND COALESCE(rm.is_mock, 'F') <> 'T'
        LEFT JOIN trade_summary ts ON ts.order_id = fo.ord_exch_ord_no
        LEFT JOIN bidder_summary bs ON bs.ord_auction_ord_no = fo.ord_exch_ord_no
        WHERE fo.ord_ord_type = 'AO'
          AND fo.ord_status NOT IN ('UPLOAD','INVALID','PLAN','CNL','CNLS')
          AND fo.ord_ord_intrnl_dt::date >= :fromDate
        ORDER BY fo.ord_ord_intrnl_dt DESC
        """;

    private static final String NCDFI_AUCTION_SQL = """
        WITH trade_summary AS (
            SELECT order_id,
                   MAX(CASE WHEN trd_is_approved = 'T' THEN 1 ELSE 0 END) AS approved_flag,
                   COALESCE(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_qty ELSE 0 END), 0) AS approved_qty,
                   COALESCE(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_qty ELSE 0 END), 0) AS trade_qty,
                   COALESCE(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_value ELSE 0 END), 0) AS trade_value,
                   COALESCE(
                       SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_value ELSE 0 END)
                       / NULLIF(SUM(CASE WHEN trd_is_approved = 'T' THEN last_fill_qty ELSE 0 END), 0), 0
                   ) AS trade_price
            FROM trade_mstr GROUP BY order_id
        ), bidder_summary AS (
            SELECT ord_auction_ord_no, COUNT(DISTINCT ord_tm_id) AS bidder_count
            FROM fo_orders WHERE ord_ord_type = 'AB' GROUP BY ord_auction_ord_no
        )
        SELECT
            COALESCE(fo.ord_unique_number, fo.ord_exch_ord_no::text) AS auction_id,
            fo.ord_ord_intrnl_dt::date AS auction_date,
            fo.ord_ord_intrnl_dt AS auction_datetime,
            '' AS global_client,
            COALESCE(fo.ord_market_code, '') AS market_code,
            COALESCE(fo.ord_comm_code, '') AS commodity,
            COALESCE(fo.ord_contract_code, '') AS contract_code,
            '' AS state_name,
            COALESCE(fo.ord_paramvalue5, '') AS warehouse,
            COALESCE(fo.ord_location, '') AS location_name,
            '' AS scheme_code,
            COALESCE(fo.ord_paramvalue8, '') AS season,
            COALESCE(fo.ord_ord_side, '') AS order_side,
            COALESCE(fo.ord_market_type, '') AS market_type,
            COALESCE(fo.ord_auction_type, '') AS auction_type,
            CASE
                WHEN fo.ord_ord_type = 'AO' AND fo.ord_ord_side = 'S' THEN 'FORWARD'
                WHEN fo.ord_ord_type = 'AO' AND fo.ord_ord_side = 'B' THEN 'REVERSE'
                ELSE 'UNKNOWN'
            END AS auction_mode,
            COALESCE(NULLIF(TRIM(fo.ord_qty_unit), ''), 'UNKNOWN') AS qty_unit,
            COALESCE(fo.ord_tm_id::text, '') AS organization_id,
            COALESCE(rm.org_nm, '') AS organization_name,
            COALESCE(fo.ord_ord_qty, 0) AS auction_qty,
            COALESCE(fo.ord_ord_price, 0) AS auction_price,
            COALESCE(bs.bidder_count, 0) AS bidder_count,
            COALESCE(ts.approved_qty, 0) AS approved_qty,
            COALESCE(ts.trade_qty, 0) AS trade_qty,
            COALESCE(ts.trade_price, 0) AS trade_price,
            COALESCE(ts.trade_value, 0) AS trade_value,
            COALESCE(ts.approved_flag, 0) AS approved_flag
        FROM fo_orders fo
        INNER JOIN registration_mstr rm ON rm.org_id = fo.ord_tm_id AND COALESCE(rm.is_mock, 'F') <> 'T'
        LEFT JOIN trade_summary ts ON ts.order_id = fo.ord_exch_ord_no
        LEFT JOIN bidder_summary bs ON bs.ord_auction_ord_no = fo.ord_exch_ord_no
        WHERE fo.ord_ord_type = 'AO'
          AND fo.ord_status NOT IN ('UPLOAD','INVALID','PLAN','CNL','CNLS')
          AND fo.ord_ord_intrnl_dt::date >= :fromDate
        ORDER BY fo.ord_ord_intrnl_dt DESC
        """;

    private static final String MASTER_PARTICIPANT_SQL = """
        SELECT
            rm.org_id::text AS org_id,
            COALESCE(rm.org_nm, '') AS org_name,
            COALESCE(rm.registered_state_code, '') AS state_code,
            COALESCE(rm.registered_district, '') AS district,
            COALESCE(rm.communication_person_mobile_no, um.user_mobile, '') AS mobile,
            COALESCE(rm.registered_email_id, um.user_email, '') AS email,
            COALESCE(rm.registered_address, '') AS address,
            COALESCE(rm.gst_number, '') AS gst,
            COALESCE(rm.pan_card, '') AS pan,
            COUNT(DISTINCT tmm.market_code) AS market_count,
            COALESCE(STRING_AGG(DISTINCT tmm.market_code, ','), '') AS market_codes,
            COALESCE(STRING_AGG(DISTINCT mm.global_client, ','), '') AS global_clients,
            EXISTS (
                SELECT 1 FROM auctionv2replica.fo_orders f
                WHERE f.ord_tm_id = rm.org_id AND f.ord_ord_type = 'AB'
            ) AS participated
        FROM "participant-masterv2_replica".registration_mstr rm
        LEFT JOIN "participant-masterv2_replica".user_mstr um ON um.org_id = rm.org_id
        LEFT JOIN "participant-masterv2_replica".tm_market_mapping tmm ON tmm.tm_id = rm.org_id
        LEFT JOIN "participant-masterv2_replica".market_mstr mm ON mm.market_code = tmm.market_code
        WHERE COALESCE(rm.is_mock, 'F') <> 'T'
          AND UPPER(COALESCE(rm.org_nm, '')) NOT LIKE '%MOCK%'
          AND UPPER(COALESCE(rm.org_nm, '')) NOT LIKE '%TEST%'
        GROUP BY rm.org_id, rm.org_nm, rm.registered_state_code, rm.registered_district,
                 rm.communication_person_mobile_no, um.user_mobile, rm.registered_email_id, um.user_email,
                 rm.registered_address, rm.gst_number, rm.pan_card
        """;

    private static final String SUGAR_PARTICIPANT_SQL = """
        SELECT rm.org_id::text AS org_id, COALESCE(rm.org_nm, '') AS org_name,
               COALESCE(rm.ro_state, '') AS state_code, COALESCE(rm.ro_dst, '') AS district,
               COALESCE(rm.cp_mbl, '') AS mobile, COALESCE(rm.cp_eml, '') AS email,
               COALESCE(rm.ro_addrss, '') AS address, '' AS gst, '' AS pan,
               COUNT(DISTINCT tmm.market_code) AS market_count,
               COALESCE(STRING_AGG(DISTINCT tmm.market_code, ','), '') AS market_codes,
               '' AS global_clients,
               EXISTS (SELECT 1 FROM fo_orders f WHERE f.ord_tm_id = rm.org_id AND f.ord_ord_type = 'AB') AS participated
        FROM registration_mstr rm
        LEFT JOIN tm_market_mapping tmm ON tmm.tm_id = rm.org_id
        LEFT JOIN market_mstr mm ON mm.market_code = tmm.market_code
        WHERE COALESCE(rm.is_mock, 'F') <> 'T'
          AND UPPER(COALESCE(rm.org_nm, '')) NOT LIKE '%MOCK%'
          AND UPPER(COALESCE(rm.org_nm, '')) NOT LIKE '%TEST%'
        GROUP BY rm.org_id, rm.org_nm, rm.ro_state, rm.ro_dst, rm.cp_mbl, rm.cp_eml, rm.ro_addrss
        """;

    private static final String NCDFI_PARTICIPANT_SQL = """
        WITH activity AS (
            SELECT ord_tm_id, COUNT(DISTINCT ord_market_code) AS market_count,
                   COALESCE(STRING_AGG(DISTINCT ord_market_code, ','), '') AS market_codes, TRUE AS participated
            FROM fo_orders WHERE ord_ord_type = 'AB' GROUP BY ord_tm_id
        )
        SELECT rm.org_id::text AS org_id, COALESCE(rm.org_nm, '') AS org_name,
               '' AS state_code, COALESCE(rm.ro_cty, '') AS district,
               COALESCE(rm.cp_mbl, '') AS mobile, COALESCE(rm.cp_eml, '') AS email,
               COALESCE(rm.ro_addrss, '') AS address, '' AS gst, '' AS pan,
               COALESCE(a.market_count, 0) AS market_count, COALESCE(a.market_codes, '') AS market_codes,
               '' AS global_clients, COALESCE(a.participated, FALSE) AS participated
        FROM registration_mstr rm
        LEFT JOIN activity a ON a.ord_tm_id = rm.org_id
        WHERE COALESCE(rm.is_mock, 'F') <> 'T'
          AND UPPER(COALESCE(rm.org_nm, '')) NOT LIKE '%MOCK%'
        """;

    @Override
    public List<AuctionFact> fetchAuctions(ProjectSource source, LocalDate from) {
        var jdbc = registry.template(source).orElseThrow(() -> new IllegalStateException(source + " datasource is not configured"));
        String sql = switch (source) {
            case MASTER -> MASTER_AUCTION_SQL;
            case SUGAR -> SUGAR_AUCTION_SQL;
            case NCDFI -> NCDFI_AUCTION_SQL;
            case ALL -> throw new IllegalArgumentException("ALL is not a physical datasource");
        };
        return jdbc.query(sql, new MapSqlParameterSource("fromDate", from), (rs, rowNum) -> mapAuction(source, rs));
    }

    @Override
    public List<ParticipantFact> fetchParticipants(ProjectSource source) {
        var jdbc = registry.template(source).orElseThrow(() -> new IllegalStateException(source + " datasource is not configured"));
        String sql = switch (source) {
            case MASTER -> MASTER_PARTICIPANT_SQL;
            case SUGAR -> SUGAR_PARTICIPANT_SQL;
            case NCDFI -> NCDFI_PARTICIPANT_SQL;
            case ALL -> throw new IllegalArgumentException("ALL is not a physical datasource");
        };
        return jdbc.query(sql, new MapSqlParameterSource(), (rs, rowNum) -> mapParticipant(source, rs));
    }

    private AuctionFact mapAuction(ProjectSource source, ResultSet rs) throws SQLException {
        return new AuctionFact(source, rs.getString("auction_id"), rs.getObject("auction_date", LocalDate.class),
                rs.getTimestamp("auction_datetime") == null ? null : rs.getTimestamp("auction_datetime").toLocalDateTime(),
                rs.getString("global_client"), rs.getString("market_code"), rs.getString("commodity"),
                rs.getString("contract_code"), rs.getString("state_name"), rs.getString("warehouse"),
                rs.getString("location_name"), rs.getString("scheme_code"), rs.getString("season"),
                rs.getString("order_side"), rs.getString("market_type"), rs.getString("auction_type"),
                rs.getString("auction_mode"), rs.getString("qty_unit"), rs.getString("organization_id"),
                rs.getString("organization_name"), decimal(rs, "auction_qty"), decimal(rs, "auction_price"),
                rs.getLong("bidder_count"), decimal(rs, "approved_qty"), decimal(rs, "trade_qty"),
                decimal(rs, "trade_price"), decimal(rs, "trade_value"), rs.getInt("approved_flag") == 1);
    }

    private ParticipantFact mapParticipant(ProjectSource source, ResultSet rs) throws SQLException {
        return new ParticipantFact(source, rs.getString("org_id"), rs.getString("org_name"), rs.getString("state_code"),
                rs.getString("district"), rs.getString("mobile"), rs.getString("email"), rs.getString("address"),
                rs.getString("gst"), rs.getString("pan"), rs.getLong("market_count"), rs.getBoolean("participated"),
                splitSet(rs.getString("market_codes")), splitSet(rs.getString("global_clients")));
    }

    private java.util.Set<String> splitSet(String value) {
        if (value == null || value.isBlank()) return java.util.Set.of();
        return java.util.Arrays.stream(value.split(",")).map(String::trim).filter(v -> !v.isBlank())
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }
    private BigDecimal decimal(ResultSet rs, String column) throws SQLException {
        BigDecimal value = rs.getBigDecimal(column); return value == null ? BigDecimal.ZERO : value;
    }
}
