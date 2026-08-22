import { createClient } from '@supabase/supabase-js';
import env from '../../config/env.js';

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'paperdex',
    },
  }
);

export default supabase;