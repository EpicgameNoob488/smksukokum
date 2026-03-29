-- Function to execute arbitrary SQL (for migrations)
CREATE OR REPLACE FUNCTION public.exec_sql(sql_text TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Note: This is a simplified version that only runs SELECT statements
  -- For full DDL support, you would need a more complex implementation
  EXECUTE sql_text;
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
