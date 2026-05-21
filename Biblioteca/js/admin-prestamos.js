// ============================================
// admin-prestamos.js — Gestión de todos los préstamos del sistema
// Lista, busca y permite marcar como devuelto
// ============================================

let allLoans = [];

// ---- CARGAR PRÉSTAMOS ----
async function loadLoans() {
  const tbody = document.getElementById("loansTable") || document.querySelector("table tbody");
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">Cargando...</td></tr>`;

  try {
    const res = await apiFetch("/loans");

    if (!res.ok) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#c62828;">Error al cargar préstamos</td></tr>`;
      return;
    }

    const data = await res.json();
    allLoans = Array.isArray(data) ? data : (data.loans || data.data || []);
    renderLoans(allLoans);

  } catch (err) {
    console.error("Error cargando préstamos:", err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#c62828;">Error de conexión</td></tr>`;
  }
}

// ---- RENDERIZAR TABLA ----
function renderLoans(loans) {
  const tbody = document.getElementById("loansTable") || document.querySelector("table tbody");
  tbody.innerHTML = "";

  if (!loans.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#666;">No hay préstamos registrados</td></tr>`;
    return;
  }

  loans.forEach((loan) => {
    const idCorto = (loan.id || loan._id || "").toString().slice(-6);
    const userName = loan.user?.name || loan.userId?.name || "—";
    const libros = (loan.loanitem || [])
      .map(item => (item.book?.title || item.bookId?.title || "Libro"))
      .join(", ") || "—";
    const fechaPrestamo = loan.loanDate ? new Date(loan.loanDate).toLocaleDateString("es-MX") : "—";
    const fechaDevolucion = loan.returnDate
      ? new Date(loan.returnDate).toLocaleDateString("es-MX")
      : (loan.dueDate ? "Vence: " + new Date(loan.dueDate).toLocaleDateString("es-MX") : "—");

    // Badge de estado
    const statusColors = {
      ACTIVE: "#2e7d32",
      RETURNED: "#666",
      OVERDUE: "#c62828",
    };
    const statusText = {
      ACTIVE: "Activo",
      RETURNED: "Devuelto",
      OVERDUE: "Vencido",
    };
    const statusBadge = `<span style="background:${statusColors[loan.status] || "#999"}; color:white; padding:3px 10px; border-radius:12px; font-size:12px;">${statusText[loan.status] || loan.status}</span>`;

    // Botón de acción según estado
    const accion = loan.status === "ACTIVE" || loan.status === "OVERDUE"
      ? `<button class="btn-primary" style="padding:5px 12px; font-size:13px;" onclick="marcarDevuelto('${loan.id || loan._id}')">Marcar devuelto</button>`
      : `<span style="color:#999;">—</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-family:monospace; font-size:12px;">#${idCorto}</td>
      <td>${escapeHtml(userName)}</td>
      <td>${escapeHtml(libros)}</td>
      <td>${fechaPrestamo}</td>
      <td>${fechaDevolucion}</td>
      <td>${statusBadge}</td>
      <td>${accion}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- MARCAR COMO DEVUELTO ----
async function marcarDevuelto(id) {
  if (!confirm("¿Marcar este préstamo como devuelto?")) return;

  try {
    const res = await apiFetch(`/loans/${id}/return`, {
      method: "PUT",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert("Error: " + (err.error || res.statusText));
      return;
    }

    alert("✅ Préstamo marcado como devuelto. Stock actualizado.");
    loadLoans();

  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  }
}

// ---- BÚSQUEDA ----
function applySearch() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!q) {
    renderLoans(allLoans);
    return;
  }

  const filtered = allLoans.filter((loan) => {
    const userName = (loan.user?.name || loan.userId?.name || "").toLowerCase();
    const hasBook = (loan.loanitem || []).some((item) => {
      const title = (item.book?.title || item.bookId?.title || "").toLowerCase();
      return title.includes(q);
    });
    return userName.includes(q) || hasBook;
  });

  renderLoans(filtered);
}

// ---- HELPER ----
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---- EVENTOS ----
document.addEventListener("DOMContentLoaded", () => {
  loadLoans();

  const searchBtn = document.querySelector(".search-container .btn-primary, .search-container button");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn) searchBtn.addEventListener("click", applySearch);
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") applySearch();
    });
  }
});
