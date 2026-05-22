// ============================================
// admin-autorizar.js — Autorizar/Rechazar solicitudes
// CORREGIDO: apiFetch devuelve JSON directo
// ============================================

let allRequests = [];

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTbody() {
  return document.getElementById("solicitudesTable");
}

async function loadRequests() {
  const tbody = getTbody();
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Cargando...</td></tr>`;

  try {
    const data = await apiFetch("/loans/requests?status=PENDING");

    if (Array.isArray(data)) {
      allRequests = data;
    } else if (data && Array.isArray(data.requests)) {
      allRequests = data.requests;
    } else if (data && Array.isArray(data.data)) {
      allRequests = data.data;
    } else {
      allRequests = [];
    }

    renderRequests(allRequests);
  } catch (err) {
    console.error("Error cargando solicitudes:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#c62828;">Error: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderRequests(requests) {
  const tbody = getTbody();
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!requests || requests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#666;">No hay solicitudes pendientes</td></tr>`;
    return;
  }

  requests.forEach((req) => {
    const items = req.items || [];
    const userName = req.user?.name || req.userId?.name || req.userName || "—";
    const id = req.id || req._id;

    if (items.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(userName)}</td>
        <td colspan="3" style="color:#999;">Sin libros en la solicitud</td>
        <td colspan="2"></td>
      `;
      tbody.appendChild(tr);
      return;
    }

    items.forEach((item, idx) => {
      const book = item.book || item.bookId || {};
      const fecha = req.createdAt ? new Date(req.createdAt).toLocaleDateString("es-MX") : "—";
      const tr = document.createElement("tr");

      const botones = idx === 0
        ? `
          <td><button style="background:#2e7d32; color:white; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:13px;" onclick="autorizar('${id}')">Aprobar</button></td>
          <td><button style="background:#c62828; color:white; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:13px;" onclick="rechazar('${id}')">Rechazar</button></td>
        `
        : `<td></td><td></td>`;

      tr.innerHTML = `
        <td>${escapeHtml(userName)}</td>
        <td>${escapeHtml(book.title || "—")}</td>
        <td>${escapeHtml(book.author || "—")}</td>
        <td>${fecha}</td>
        ${botones}
      `;
      tbody.appendChild(tr);
    });
  });
}

async function autorizar(id) {
  if (!confirm("¿Aprobar esta solicitud de préstamo?")) return;

  try {
    await apiFetch(`/loans/requests/${id}/approve`, { method: "PUT" });
    alert("✅ Solicitud aprobada. Se generó el préstamo.");
    loadRequests();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function rechazar(id) {
  const motivo = prompt("Motivo del rechazo (opcional):");
  if (motivo === null) return;

  try {
    await apiFetch(`/loans/requests/${id}/reject`, {
      method: "PUT",
      body: { rejectionReason: motivo || "Sin motivo especificado" },
    });
    alert("❌ Solicitud rechazada.");
    loadRequests();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

function applySearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  const q = input.value.trim().toLowerCase();

  if (!q) {
    renderRequests(allRequests);
    return;
  }

  const filtered = allRequests.filter((req) => {
    const userName = (req.user?.name || req.userId?.name || req.userName || "").toLowerCase();
    const hasBook = (req.items || []).some((item) => {
      const book = item.book || item.bookId || {};
      return (book.title || "").toLowerCase().includes(q) ||
             (book.author || "").toLowerCase().includes(q);
    });
    return userName.includes(q) || hasBook;
  });

  renderRequests(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  loadRequests();

  const searchBtn = document.querySelector(".search-container .btn-primary, .search-container button");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn) searchBtn.addEventListener("click", applySearch);
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") applySearch();
    });
  }
});