// ============================================
// admin-prestamos.js — Gestión de préstamos
// CORREGIDO: apiFetch devuelve JSON directo
// ============================================

let allLoans = [];

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTbody() {
  return document.getElementById("loansTable") || document.querySelector("table tbody");
}

async function loadLoans() {
  const tbody = getTbody();
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">Cargando...</td></tr>`;

  try {
    const data = await apiFetch("/loans");

    if (Array.isArray(data)) {
      allLoans = data;
    } else if (data && Array.isArray(data.loans)) {
      allLoans = data.loans;
    } else if (data && Array.isArray(data.data)) {
      allLoans = data.data;
    } else {
      allLoans = [];
    }

    renderLoans(allLoans);
  } catch (err) {
    console.error("Error cargando préstamos:", err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#c62828;">Error: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderLoans(loans) {
  const tbody = getTbody();
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!loans || loans.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#666;">No hay préstamos registrados</td></tr>`;
    return;
  }

  loans.forEach((loan) => {
    const idCorto = String(loan.id || loan._id || "").slice(-6);
    const userName = loan.user?.name || loan.userId?.name || loan.userName || "—";

    const libros = (loan.loanitem || loan.items || [])
      .map(item => item.book?.title || item.bookId?.title || item.title || "Libro")
      .join(", ") || "—";

    const fechaPrestamo = loan.loanDate ? new Date(loan.loanDate).toLocaleDateString("es-MX") : "—";
    const fechaDevolucion = loan.returnDate
      ? new Date(loan.returnDate).toLocaleDateString("es-MX")
      : (loan.dueDate ? "Vence: " + new Date(loan.dueDate).toLocaleDateString("es-MX") : "—");

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
    const statusBadge = `<span style="background:${statusColors[loan.status] || "#999"}; color:white; padding:3px 10px; border-radius:12px; font-size:12px;">${statusText[loan.status] || loan.status || "—"}</span>`;

    const accion = (loan.status === "ACTIVE" || loan.status === "OVERDUE")
      ? `<button style="background:#2e7d32; color:white; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:13px;" onclick="marcarDevuelto('${loan.id || loan._id}')">Marcar devuelto</button>`
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

async function marcarDevuelto(id) {
  if (!confirm("¿Marcar este préstamo como devuelto?")) return;

  try {
    await apiFetch(`/loans/${id}/return`, { method: "PUT" });
    alert("✅ Préstamo marcado como devuelto. Stock actualizado.");
    loadLoans();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

function applySearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  const q = input.value.trim().toLowerCase();

  if (!q) {
    renderLoans(allLoans);
    return;
  }

  const filtered = allLoans.filter((loan) => {
    const userName = (loan.user?.name || loan.userId?.name || loan.userName || "").toLowerCase();
    const hasBook = (loan.loanitem || loan.items || []).some((item) => {
      const title = (item.book?.title || item.bookId?.title || item.title || "").toLowerCase();
      return title.includes(q);
    });
    return userName.includes(q) || hasBook;
  });

  renderLoans(filtered);
}

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