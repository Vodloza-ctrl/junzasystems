const CONFIG = window.SALE_CONFIG || {};

const $ = (s, r = document) => r.querySelector(s);
const api = (p) => `${String(CONFIG.apiBase || "").replace(/\/$/, "")}${p}`;

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function money(n) {
  return `$${Number(n || 0).toFixed(2).replace(".00", "")}`;
}

function getTenantSlug() {
  const queryTenant = qs("tenant");
  if (queryTenant) return queryTenant;

  const host = location.hostname;

  if (
    host.includes("github.io") ||
    host.includes("pages.dev") ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return CONFIG.demoTenant || "nats-hair-lab";
  }

  return host.split(".")[0] || CONFIG.demoTenant || "nats-hair-lab";
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.status === "error") {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function getCTA(tenant, item) {
  const mode = tenant.business_type;

  if (Number(item.requires_booking) === 1 || mode === "booking") {
    return "Book Now";
  }

  if (mode === "menu") return "Order Now";
  if (mode === "catalogue") return "Request Quote";

  return "Add to Cart";
}

function openPaymentModal(message) {
  let modal = document.querySelector("#payment-modal");

  if (!modal) {
    modal = document.createElement("div");

    modal.id = "payment-modal";

    modal.innerHTML = `
      <div class="payment-overlay">
        <div class="payment-box">
          <div class="spinner"></div>
          <h3 id="payment-title">Processing Payment</h3>
          <p id="payment-message"></p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  $("#payment-message").textContent = message;
}

function updatePaymentModal(title, message) {
  $("#payment-title").textContent = title;
  $("#payment-message").textContent = message;
}

function closePaymentModal() {
  const modal = $("#payment-modal");
  if (modal) modal.remove();
}

async function collectCustomer() {
  const customer_name = prompt("Your name?");
  if (!customer_name) throw new Error("Customer name required");

  const customer_phone = prompt("Your EcoCash number? Example: 0771111111");
  if (!customer_phone) throw new Error("Phone number required");

  const customer_email = prompt("Your email?");
  if (!customer_email) throw new Error("Email required");

  return {
    customer_name,
    customer_phone,
    customer_email
  };
}

async function pollPayment(transactionId) {

  const maxAttempts = 24;
  let attempt = 0;

  const interval = setInterval(async () => {

    attempt++;

    try {

      const result = await fetchJSON(
        api(`/api/payments/check/${transactionId}`)
      );

      const status = result.transaction?.status || result.payment_status;

      if (status === "paid") {

        clearInterval(interval);

        updatePaymentModal(
          "Payment Received",
          "Your payment was received successfully. Your order/booking is now being processed."
        );

        setTimeout(() => {
          closePaymentModal();
        }, 3500);

        return;
      }

      if (status === "failed") {

        clearInterval(interval);

        updatePaymentModal(
          "Payment Failed",
          "Payment failed or was cancelled."
        );

        return;
      }

      updatePaymentModal(
        "Awaiting Payment",
        "Check your phone and enter your PIN to complete payment."
      );

      if (attempt >= maxAttempts) {

        clearInterval(interval);

        updatePaymentModal(
          "Payment Timeout",
          "We could not confirm payment yet. Please try again."
        );
      }

    } catch (error) {

      clearInterval(interval);

      updatePaymentModal(
        "Payment Error",
        error.message
      );
    }

  }, 5000);
}

async function startPaymentFlow({
  tenant,
  item,
  bookingId = null,
  orderId = null,
  amount,
  customer
}) {

  const payment = await fetchJSON(
    api("/api/payments/create"),
    {
      method: "POST",
      body: JSON.stringify({
        tenant_id: tenant.tenant_id,
        booking_id: bookingId,
        order_id: orderId,
        amount,
        currency: item.currency || "USD",
        customer_name: customer.customer_name,
        customer_email: customer.customer_email,
        customer_phone: customer.customer_phone
      })
    }
  );

  if (!payment.transaction_id) {
    throw new Error("Payment transaction failed");
  }

  updatePaymentModal(
    "Payment Prompt Sent",
    "Check your phone and enter your PIN to complete payment."
  );

  pollPayment(payment.transaction_id);
}

async function createBooking(tenant, item, button = null) {

  try {

    if (button) {
      button.disabled = true;
    }

    const customer = await collectCustomer();

    openPaymentModal(
      "Creating booking..."
    );

    const booking = await fetchJSON(
      api("/api/bookings"),
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: tenant.tenant_id,
          item_id: item.item_id,
          total_amount: item.price || 0,
          deposit_amount: tenant.default_deposit_amount || 0,
          notes: `Website booking request for ${item.name}`
        })
      }
    );

    await startPaymentFlow({
      tenant,
      item,
      bookingId: booking.booking_id,
      amount: tenant.default_deposit_amount || item.price || 0,
      customer
    });

  } catch (error) {

    closePaymentModal();

    alert(`Booking failed: ${error.message}`);

  } finally {

    if (button) {
      button.disabled = false;
    }
  }
}

async function createOrder(tenant, item, button = null) {

  try {

    if (button) {
      button.disabled = true;
    }

    const customer = await collectCustomer();

    openPaymentModal(
      "Creating order..."
    );

    const order = await fetchJSON(
      api("/api/orders"),
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: tenant.tenant_id,
          item_summary: item.name,
          total_amount: item.price || 0,
          currency: item.currency || "USD"
        })
      }
    );

    await startPaymentFlow({
      tenant,
      item,
      orderId: order.order_id,
      amount: item.price || 0,
      customer
    });

  } catch (error) {

    closePaymentModal();

    alert(`Order failed: ${error.message}`);

  } finally {

    if (button) {
      button.disabled = false;
    }
  }
}

function renderStore(mount, tenant, items) {

  const mode = tenant.business_type || "store";

  const categories = [
    ...new Set(items.map((i) => i.category || "General"))
  ];

  document.title = `${tenant.business_name} | Sale Company`;

  mount.innerHTML = `
    <div class="store-hero">
      ${
        tenant.hero_url
          ? `<img src="${tenant.hero_url}" alt="${tenant.business_name}">`
          : ""
      }
    </div>

    <div class="avatar">
      ${
        tenant.logo_url
          ? `<img src="${tenant.logo_url}" alt="${tenant.business_name}" style="width:100%;height:100%;object-fit:cover;border-radius:20px">`
          : String(tenant.business_name || "SC").slice(0, 2).toUpperCase()
      }
    </div>

    <div class="store-pad">

      <p class="eyebrow">${mode} mode</p>

      <h2 style="margin:0">
        ${tenant.business_name}
      </h2>

      <p class="muted">
        ${
          tenant.tagline ||
          tenant.about ||
          "A Sale Company powered business."
        }
      </p>

      <div class="chips">
        <span class="chip active">All</span>

        ${
          categories
            .map((x) => `<span class="chip">${x}</span>`)
            .join("")
        }
      </div>

      <div class="items">

        ${
          items.map((item) => {

            const cta = getCTA(tenant, item);

            return `
              <article class="item">

                <div class="item-img">
                  ${
                    item.image_url
                      ? `<img src="${item.image_url}" alt="${item.name}">`
                      : ""
                  }
                </div>

                <div class="item-body">

                  <strong>${item.name}</strong>

                  <p class="muted">
                    ${item.description || ""}
                  </p>

                  <div class="price">
                    ${money(item.price)}
                  </div>

                  <button
                    class="btn gold sale-action"
                    style="margin-top:12px;width:100%"
                    data-item-id="${item.item_id}"
                  >
                    ${cta}
                  </button>

                </div>

              </article>
            `;

          }).join("")
        }

      </div>

      <div class="notice" style="margin-top:18px">
        Payments, bookings and fulfilment are confirmed automatically after payment verification.
      </div>

    </div>
  `;

  document.querySelectorAll(".sale-action").forEach((button) => {

    button.addEventListener("click", () => {

      const item = items.find(
        (i) => i.item_id === button.dataset.itemId
      );

      if (!item) return;

      if (
        Number(item.requires_booking) === 1 ||
        tenant.business_type === "booking"
      ) {

        createBooking(
          tenant,
          item,
          button
        );

      } else {

        createOrder(
          tenant,
          item,
          button
        );
      }
    });
  });
}

async function loadStore() {

  const mount = $("#store-app");

  if (!mount) return;

  const slug = getTenantSlug();

  try {

    const data = await fetchJSON(
      api(`/api/storefront/${slug}`)
    );

    renderStore(
      mount,
      data.tenant,
      data.items || []
    );

  } catch (error) {

    console.warn(
      "Using fallback store:",
      error.message
    );
  }
}

loadStore();
