// ============================================
// admin-libros.js — Gestión de libros (CRUD)
// CORREGIDO: apiFetch devuelve directamente el JSON parseado
// ============================================

let allBooks = [];

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTbody() {
  return document.getElementById("booksTable");
}

async function loadBooks() {
  const tbody = getTbody();
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Cargando...</td></tr>`;

  try {
    const data = await apiFetch("/books");

    // apiFetch ya devuelve el JSON parseado
    if (Array.isArray(data)) {
      allBooks = data;
    } else if (data && Array.isArray(data.books)) {
      allBooks = data.books;
    } else if (data && Array.isArray(data.data)) {
      allBooks = data.data;
    } else {
      allBooks = [];
    }

    renderBooks(allBooks);
  } catch (err) {
    console.error("Error cargando libros:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#c62828;">Error: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderBooks(books) {
  const tbody = getTbody();
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!books || books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#666;">No hay libros registrados</td></tr>`;
    return;
  }

  books.forEach((book) => {
    const id = book.id || book._id || "";
    const stock = book.stock !== undefined ? book.stock : (book.copies !== undefined ? book.copies : 0);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(book.title)}</td>
      <td>${escapeHtml(book.author)}</td>
      <td>${escapeHtml(book.genre || "—")}</td>
      <td>${escapeHtml(book.isbn || "—")}</td>
      <td>${stock}</td>
      <td>
        <button style="background:#1976d2; color:white; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:13px; margin-right:4px;" onclick="editarLibro('${id}')">Editar</button>
        <button style="background:#c62828; color:white; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:13px;" onclick="eliminarLibro('${id}')">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function editarLibro(id) {
  const libro = allBooks.find(b => (b.id || b._id) === id);
  if (!libro) { alert("Libro no encontrado"); return; }

  const nuevoTitulo = prompt("Título:", libro.title);
  if (nuevoTitulo === null) return;
  const nuevoAutor = prompt("Autor:", libro.author);
  if (nuevoAutor === null) return;
  const nuevoGenero = prompt("Género:", libro.genre || "");
  if (nuevoGenero === null) return;
  const nuevoStock = prompt("Stock:", libro.stock);
  if (nuevoStock === null) return;

  const stockNum = parseInt(nuevoStock);
  if (isNaN(stockNum) || stockNum < 0) { alert("Stock inválido"); return; }

  try {
    await apiFetch(`/books/${id}`, {
      method: "PUT",
      body: {
        title: nuevoTitulo.trim(),
        author: nuevoAutor.trim(),
        genre: nuevoGenero.trim() || null,
        stock: stockNum,
      },
    });

    alert("✅ Libro actualizado");
    loadBooks();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function eliminarLibro(id) {
  const libro = allBooks.find(b => (b.id || b._id) === id);
  if (!libro) { alert("Libro no encontrado"); return; }
  if (!confirm(`¿Eliminar el libro "${libro.title}"?`)) return;

  try {
    await apiFetch(`/books/${id}`, { method: "DELETE" });
    alert("✅ Libro eliminado");
    loadBooks();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

function applySearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  const q = input.value.trim().toLowerCase();

  if (!q) {
    renderBooks(allBooks);
    return;
  }

  const filtered = allBooks.filter((book) =>
    (book.title || "").toLowerCase().includes(q) ||
    (book.author || "").toLowerCase().includes(q) ||
    (book.genre || "").toLowerCase().includes(q) ||
    (book.isbn || "").toLowerCase().includes(q)
  );

  renderBooks(filtered);
}

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