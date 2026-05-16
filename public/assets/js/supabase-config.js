(function () {
  const CONFIG = window.SALE_CONFIG || {};

  if (!CONFIG.supabaseUrl || !CONFIG.supabaseAnonKey) {
    console.warn("Supabase URL or anon key is missing in SALE_CONFIG.");
    window.saleSupabaseClient = null;
    return;
  }

  if (!window.supabase || !window.supabase.createClient) {
    console.error("Supabase JS library was not loaded.");
    window.saleSupabaseClient = null;
    return;
  }

  window.saleSupabaseClient = window.supabase.createClient(
    CONFIG.supabaseUrl,
    CONFIG.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
})();
