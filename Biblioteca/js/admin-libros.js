// ============================================
// admin-libros.js — Gestión de libros (CRUD)
// Lista, busca, edita y elimina libros
// ============================================

let allBooks = [];

// ---- CARGAR LIBROS ----
async function loadBooks() {
  const tbody = document.getElementById("booksTable") || document.querySelector("table tbody");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Cargando...</td></tr>`;

  try {
    const res = await apiFetch("/books");

    if (!res.ok) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#c62828;">Error al cargar libros</td></tr>`;
      return;
    }

    const data = await res.json();
    allBooks = Array.isArray(data) ? data : (data.books || data.data || []);
    renderBooks(allBooks);

  } catch (err) {
    console.error("Error cargando libros:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#c62828;">Error de conexión</td></tr>`;
  }
}

// ---- RENDERIZAR TABLA ----
function renderBooks(books) {
  const tbody = document.getElementById("booksTable") || document.querySelector("table tbody");
  tbody.innerHTML = "";

  if (!books.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#666;">No hay libros registrados</td></tr>`;
    return;
  }

  books.forEach((book) => {
    const id = book.id || book._id;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(book.title)}</td>
      <td>${escapeHtml(book.author)}</td>
      <td>${escapeHtml(book.genre || "—")}</td>
      <td>${escapeHtml(book.isbn || "—")}</td>
      <td>${book.stock}</td>
      <td>
        <button class="btn-autorizar" style="background:#1976d2;" onclick="editarLibro('${id}')">Editar</button>
        <button class="btn-rechazar" onclick="eliminarLibro('${id}')">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- EDITAR LIBRO ----
async function editarLibro(id) {
  const libro = allBooks.find(b => (b.id || b._id) === id);
  if (!libro) return;

  const nuevoTitulo = prompt("Título:", libro.title);
  if (nuevoTitulo === null) return;

  const nuevoAutor = prompt("Autor:", libro.author);
  if (nuevoAutor === null) return;

  const nuevoGenero = prompt("Género:", libro.genre || "");
  if (nuevoGenero === null) return;

  const nuevoStock = prompt("Stock (copias disponibles):", libro.stock);
  if (nuevoStock === null) return;

  const stockNum = parseInt(nuevoStock);
  if (isNaN(stockNum) || stockNum < 0) {
    alert("Stock inválido");
    return;
  }

  try {
    const res = await apiFetch(`/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: nuevoTitulo.trim(),
        author: nuevoAutor.trim(),
        genre: nuevoGenero.trim() || null,
        stock: stockNum,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert("Error: " + (err.error || res.statusText));
      return;
    }

    alert("✅ Libro actualizado");
    loadBooks();

  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  }
}

// ---- ELIMINAR LIBRO ----
async function eliminarLibro(id) {
  const libro = allBooks.find(b => (b.id || b._id) === id);
  if (!libro) return;

  if (!confirm(`¿Eliminar el libro "${libro.title}"?\n\nEsta acción no se puede deshacer.`)) return;

  try {
    const res = await apiFetch(`/books/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert("Error: " + (err.error || res.statusText));
      return;
    }

    alert("✅ Libro eliminado");
    loadBooks();

  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  }
}

// ---- BÚSQUEDA ----
function applySearch() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!q) {
    renderBooks(allBooks);
    return;
  }

  const filtered = allBooks.filter((book) =>
    book.title.toLowerCase().includes(q) ||
    book.author.toLowerCase().includes(q) ||
    (book.genre || "").toLowerCase().includes(q) ||
    (book.isbn || "").toLowerCase().includes(q)
  );

  renderBooks(filtered);
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
  loadBooks();

  const searchBtn = document.querySelector(".search-container .btn-primary, .search-container button");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn) searchBtn.addEventListener("click", applySearch);
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") applySearch();
    });
  }
});
