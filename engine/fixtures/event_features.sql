-- SQLite reference: timestamps are UTC seconds, event IDs unique after dedup.
-- prediction_ts is the actual decision cutoff. available_ts is first visibility.
WITH latest AS (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY customer_id ORDER BY event_ts DESC, event_id DESC) AS rn
  FROM events
)
SELECT customer_id, event_id FROM latest WHERE rn = 1 ORDER BY customer_id;

-- Historical reporting includes same-time peers and the lower boundary.
SELECT event_id, SUM(COALESCE(amount, 0)) OVER (
  PARTITION BY customer_id ORDER BY event_ts
  RANGE BETWEEN 604800 PRECEDING AND CURRENT ROW) AS sum_7d
FROM events ORDER BY event_id;

-- Decision feature: [cutoff - 3600, cutoff), availability <= cutoff.
-- Same-event-time peers at cutoff are excluded by the declared policy.
SELECT d.decision_id, COUNT(p.event_id) AS prior_1h,
       COALESCE(SUM(p.amount), 0) AS prior_amount
FROM decisions d LEFT JOIN events p
 ON p.customer_id = d.customer_id
 AND p.event_ts >= d.prediction_ts - 3600
 AND p.event_ts < d.prediction_ts
 AND p.available_ts <= d.prediction_ts
GROUP BY d.decision_id ORDER BY d.decision_id;
