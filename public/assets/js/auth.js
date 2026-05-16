(function () {
  const client = () => window.saleSupabaseClient;

  function loginUrl() {
    return "login.html";
  }

  function dashboardUrl() {
    return "dashboard.html";
  }

  function safeRedirect(url) {
    window.location.href = url;
  }

  async function getSession() {
    const supabase = client();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Session error:", error.message);
      return null;
    }

    return data.session || null;
  }

  async function getUser() {
    const supabase = client();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("User error:", error.message);
      return null;
    }

    return data.user || null;
  }

  async function getAccessToken() {
    const session = await getSession();
    return session ? session.access_token : "";
  }

  async function authHeaders() {
    const token = await getAccessToken();

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`
    };
  }

  async function requireAuth() {
    const session = await getSession();

    if (!session) {
      safeRedirect(loginUrl());
      return null;
    }

    return session;
  }

  async function redirectIfLoggedIn() {
    const session = await getSession();

    if (session) {
      safeRedirect(dashboardUrl());
      return true;
    }

    return false;
  }

  async function signIn(email, password) {
    const supabase = client();

    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async function signUp(email, password) {
    const supabase = client();

    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async function signOut() {
    const supabase = client();

    if (supabase) {
      await supabase.auth.signOut();
    }

    safeRedirect(loginUrl());
  }

  window.SaleAuth = {
    getSession,
    getUser,
    getAccessToken,
    authHeaders,
    requireAuth,
    redirectIfLoggedIn,
    signIn,
    signUp,
    signOut
  };
})();
