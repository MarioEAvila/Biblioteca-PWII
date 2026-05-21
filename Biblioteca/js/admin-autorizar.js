// ============================================
// admin-autorizar.js — Autorizar/Rechazar solicitudes de préstamo
// Carga las solicitudes con status=PENDING y permite aprobarlas o rechazarlas
// ============================================

let allRequests = [];

// ---- CARGAR SOLICITUDES PENDIENTES ----
async function loadRequests() {
  const tbody = document.getElementById("solicitudesTable");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Cargando...</td></tr>`;

  try {
    const res = await apiFetch("/loans/requests?status=PENDING");

    if (!res.ok) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#c62828;">Error al cargar solicitudes</td></tr>`;
      return;
    }

    const data = await res.json();
    // El backend puede devolver array directo o {requests: [...]}
    allRequests = Array.isArray(data) ? data : (data.requests || data.data || []);
    renderRequests(allRequests);

  } catch (err) {
    console.error("Error cargando solicitudes:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#c62828;">Error de conexión</td></tr>`;
  }
}

// ---- RENDERIZAR TABLA ----
function renderRequests(requests) {
  const tbody = document.getElementById("solicitudesTable");
  tbody.innerHTML = "";

  if (!requests.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#666;">No hay solicitudes pendientes</td></tr>`;
    return;
  }

  requests.forEach((req) => {
    // Cada solicitud puede tener varios libros (items). Hacemos una fila por cada uno.
    const items = req.items || [];
    const userName = req.user?.name || req.userId?.name || "—";

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
      const fecha = new Date(req.createdAt).toLocaleDateString("es-MX");
      const tr = document.createElement("tr");

      // Solo en la primera fila ponemos los botones (para no duplicarlos)
      const botones = idx === 0
        ? `
          <td><button class="btn-autorizar" onclick="autorizar('${req.id || req._id}')">Aprobar</button></td>
          <td><button class="btn-rechazar" onclick="rechazar('${req.id || req._id}')">Rechazar</button></td>
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

// ---- ACCIONES ----
async function autorizar(id) {
  if (!confirm("¿Aprobar esta solicitud de préstamo?")) return;

  try {
    const res = await apiFetch(`/loans/requests/${id}/approve`, {
      method: "PUT",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert("Error al aprobar: " + (err.error || res.statusText));
      return;
    }

    alert("✅ Solicitud aprobada. Se generó el préstamo.");
    loadRequests();

  } catch (err) {
    console.error(err);
    alert("Error de conexión al aprobar");
  }
}

async function rechazar(id) {
  const motivo = prompt("Motivo del rechazo (opcional):");
  if (motivo === null) return; // Canceló

  try {
    const res = await apiFetch(`/loans/requests/${id}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectionReason: motivo || "Sin motivo especificado" }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert("Error al rechazar: " + (err.error || res.statusText));
      return;
    }

    alert("❌ Solicitud rechazada.");
    loadRequests();

  } catch (err) {
    console.error(err);
    alert("Error de conexión al rechazar");
  }
}

// ---- BÚSQUEDA ----
function applySearch() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!q) {
    renderRequests(allRequests);
    return;
  }

  const filtered = allRequests.filter((req) => {
    const userName = (req.user?.name || req.userId?.name || "").toLowerCase();
    const hasBook = (req.items || []).some((item) => {
      const book = item.book || item.bookId || {};
      return (book.title || "").toLowerCase().includes(q) ||
             (book.author || "").toLowerCase().includes(q);
    });
    return userName.includes(q) || hasBook;
  });

  renderRequests(filtered);
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
  loadRequests();

  const searchBtn = document.querySelector(".search-container .btn-primary");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn) searchBtn.addEventListener("click", applySearch);
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") applySearch();
    });
  }
});
