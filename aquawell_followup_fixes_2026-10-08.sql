BEGIN;

-- Admin audit writer: use a SECURITY DEFINER RPC so the audit row can be
-- written through the database trigger while still requiring an admin caller.
CREATE OR REPLACE FUNCTION public.write_admin_audit_log(
  p_id text,
  p_user_name text,
  p_action text,
  p_log_type text,
  p_timestamp text,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.current_staff_role() <> 'admin' THEN
    RAISE EXCEPTION 'Only administrators can write audit logs';
  END IF;

  INSERT INTO public.audit_logs (
    id, user_name, action, log_type, timestamp, created_at, user_id
  ) VALUES (
    p_id,
    COALESCE(p_user_name, 'Administrator'),
    p_action,
    p_log_type,
    p_timestamp,
    pg_catalog.now(),
    p_user_id
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.write_admin_audit_log(text, text, text, text, text, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.write_admin_audit_log(text, text, text, text, text, uuid)
  TO authenticated;

-- Delivery rejection: the normal orders UPDATE policy correctly prevents a
-- delivery rider from changing rider_id to NULL via a direct client update.
-- This RPC performs the complete, authorized transition atomically.
CREATE OR REPLACE FUNCTION public.reject_delivery_order(p_order_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_staff_id integer;
BEGIN
  SELECT s.staff_id
    INTO v_staff_id
  FROM public.staff s
  WHERE s.profile_id = auth.uid()
    AND pg_catalog.lower(s.role) = 'delivery'
  LIMIT 1;

  IF v_staff_id IS NULL THEN
    RAISE EXCEPTION 'Only an assigned delivery rider can reject a delivery';
  END IF;

  UPDATE public.orders
  SET rider_id = NULL,
      status = 'PENDING'
  WHERE id = p_order_id
    AND rider_id = v_staff_id
    AND status = 'PENDING';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This delivery is no longer assigned to you or is not pending';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reject_delivery_order(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reject_delivery_order(text)
  TO authenticated;

COMMIT;
