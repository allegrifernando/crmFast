-- Migration: Materialized views for reporting
-- Created: 2026-07-21

-- 1. Funnel by Stage
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_funnel_by_stage AS
SELECT 
  ps.name AS stage_name,
  ps.order AS stage_order,
  ps.type AS stage_type,
  COUNT(o.id) AS opportunities_count,
  COUNT(o.id) FILTER (WHERE o.is_enrolled = true) AS enrolled_count,
  ROUND(
    CASE 
      WHEN COUNT(o.id) > 0 
      THEN COUNT(o.id) FILTER (WHERE o.is_enrolled = true)::numeric / COUNT(o.id) * 100 
      ELSE 0 
    END, 2
  ) AS conversion_rate_pct
FROM pipeline_stages ps
LEFT JOIN opportunities o ON o.stage_id = ps.id
WHERE ps.is_active = true
GROUP BY ps.id, ps.name, ps.order, ps.type
ORDER BY ps.order;

CREATE UNIQUE INDEX idx_mv_funnel_stage ON mv_funnel_by_stage (stage_name);

-- 2. Conversion by Dimension (Program, Campaign, City)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_conversion_by_dimension AS
SELECT 
  'program' AS dimension_type,
  p.id AS dimension_id,
  p.name AS dimension_name,
  COUNT(o.id) AS leads_count,
  COUNT(o.id) FILTER (WHERE o.is_enrolled = true) AS enrolled_count,
  ROUND(
    CASE 
      WHEN COUNT(o.id) > 0 
      THEN COUNT(o.id) FILTER (WHERE o.is_enrolled = true)::numeric / COUNT(o.id) * 100 
      ELSE 0 
    END, 2
  ) AS conversion_rate_pct
FROM programs p
LEFT JOIN opportunities o ON o.program_id = p.id
GROUP BY p.id, p.name

UNION ALL

SELECT 
  'campaign' AS dimension_type,
  c.id AS dimension_id,
  c.name AS dimension_name,
  COUNT(o.id) AS leads_count,
  COUNT(o.id) FILTER (WHERE o.is_enrolled = true) AS enrolled_count,
  ROUND(
    CASE 
      WHEN COUNT(o.id) > 0 
      THEN COUNT(o.id) FILTER (WHERE o.is_enrolled = true)::numeric / COUNT(o.id) * 100 
      ELSE 0 
    END, 2
  ) AS conversion_rate_pct
FROM campaigns c
LEFT JOIN opportunities o ON o.campaign_id = c.id
GROUP BY c.id, c.name

UNION ALL

SELECT 
  'city' AS dimension_type,
  ct.id AS dimension_id,
  ct.city AS dimension_name,
  COUNT(o.id) AS leads_count,
  COUNT(o.id) FILTER (WHERE o.is_enrolled = true) AS enrolled_count,
  ROUND(
    CASE 
      WHEN COUNT(o.id) > 0 
      THEN COUNT(o.id) FILTER (WHERE o.is_enrolled = true)::numeric / COUNT(o.id) * 100 
      ELSE 0 
    END, 2
  ) AS conversion_rate_pct
FROM (
  SELECT DISTINCT city FROM contacts WHERE city IS NOT NULL
) ct
LEFT JOIN contacts con ON con.city = ct.city
LEFT JOIN opportunities o ON o.contact_id = con.id
GROUP BY ct.city
HAVING ct.city IS NOT NULL;

CREATE INDEX idx_mv_conv_dim ON mv_conversion_by_dimension (dimension_type, dimension_id);

-- 3. Advisor Ranking
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_advisor_ranking AS
SELECT 
  u.id AS advisor_id,
  u.name AS advisor_name,
  u.email AS advisor_email,
  COUNT(o.id) AS total_opportunities,
  COUNT(o.id) FILTER (WHERE o.is_enrolled = true) AS enrolled_count,
  COUNT(o.id) FILTER (WHERE o.stage_id IN (SELECT id FROM pipeline_stages WHERE type = 'TERMINAL_ENROLLED')) AS won_count,
  ROUND(
    CASE 
      WHEN COUNT(o.id) > 0 
      THEN COUNT(o.id) FILTER (WHERE o.is_enrolled = true)::numeric / COUNT(o.id) * 100 
      ELSE 0 
    END, 2
  ) AS conversion_rate_pct,
  ROUND(
    COALESCE(SUM(CASE WHEN o.is_enrolled = true THEN p.price ELSE 0 END), 0) / 100.0, 2
  ) AS total_revenue
FROM users u
LEFT JOIN opportunities o ON o.advisor_id = u.id
LEFT JOIN programs p ON o.program_id = p.id
WHERE u.role_id = (SELECT id FROM roles WHERE name = 'ADVISOR')
GROUP BY u.id, u.name, u.email
ORDER BY enrolled_count DESC, conversion_rate_pct DESC;

CREATE UNIQUE INDEX idx_mv_advisor_rank ON mv_advisor_ranking (advisor_id);

-- 4. Goal Compliance
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_goal_compliance AS
SELECT 
  u.id AS advisor_id,
  u.name AS advisor_name,
  COALESCE(g.target_enrolled, 0) AS goal_enrolled,
  COUNT(o.id) FILTER (WHERE o.is_enrolled = true) AS actual_enrolled,
  ROUND(
    CASE 
      WHEN COALESCE(g.target_enrolled, 0) > 0 
      THEN COUNT(o.id) FILTER (WHERE o.is_enrolled = true)::numeric / g.target_enrolled * 100 
      ELSE 0 
    END, 2
  ) AS compliance_pct
FROM users u
LEFT JOIN opportunities o ON o.advisor_id = u.id
LEFT JOIN LATERAL (
  SELECT target_enrolled FROM advisor_goals ag WHERE ag.advisor_id = u.id ORDER BY ag.created_at DESC LIMIT 1
) g ON true
WHERE u.role_id = (SELECT id FROM roles WHERE name = 'ADVISOR')
GROUP BY u.id, u.name, g.target_enrolled;

CREATE UNIQUE INDEX idx_mv_goal_comp ON mv_goal_compliance (advisor_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_reporting_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_funnel_by_stage;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_conversion_by_dimension;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_advisor_ranking;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_goal_compliance;
END;
$$ LANGUAGE plpgsql;