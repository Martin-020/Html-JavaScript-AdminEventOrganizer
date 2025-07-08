let dataEvent = [];
let editIndex = null;
let currentPage = 1;
const itemsPerPage = 10;

const tabelEvent = document.getElementById("tabelEvent");
const formEvent = document.getElementById("formEvent");
const searchInput = document.getElementById("searchInput");
const filterToday = document.getElementById("filterToday");
const pagination = document.getElementById("pagination");
const calendarBody = document.getElementById("calendarBody");
const calendarMonth = document.getElementById("calendarMonth");
const modalDetail = new bootstrap.Modal(document.getElementById("modalDetail"));

formEvent.addEventListener("submit", function (e) {
  e.preventDefault();
  const judul = document.getElementById("judul").value;
  const tanggal = document.getElementById("tanggal").value;
  const lokasi = document.getElementById("lokasi").value;
  dataEvent.push({ judul, tanggal, lokasi });
  formEvent.reset();
  renderTabel();
  renderKalender();
});

function renderTabel() {
  const keyword = searchInput.value.toLowerCase();
  const today = new Date().toISOString().split("T")[0];
  const filtered = dataEvent.filter(ev => {
    const matchKeyword = ev.judul.toLowerCase().includes(keyword) || ev.lokasi.toLowerCase().includes(keyword);
    const matchTanggal = !filterToday.checked || ev.tanggal >= today;
    return matchKeyword && matchTanggal;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(start, start + itemsPerPage);

  tabelEvent.innerHTML = currentData.map((ev, i) => `
    <tr>
      <td>${start + i + 1}</td>
      <td>${ev.judul}</td>
      <td>${ev.tanggal}</td>
      <td>${ev.lokasi}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editEvent(${start + i})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="hapusEvent(${start + i})">Hapus</button>
      </td>
    </tr>
  `).join("");

  renderPagination(totalPages);
}

function renderPagination(total) {
  pagination.innerHTML = "";
  const prev = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><button class="page-link" onclick="gantiHalaman(${currentPage - 1})">&laquo;</button></li>`;
  const next = `<li class="page-item ${currentPage === total ? 'disabled' : ''}"><button class="page-link" onclick="gantiHalaman(${currentPage + 1})">&raquo;</button></li>`;

  let pages = "";
  for (let i = 1; i <= total; i++) {
    pages += `<li class="page-item ${i === currentPage ? 'active' : ''}"><button class="page-link" onclick="gantiHalaman(${i})">${i}</button></li>`;
  }

  pagination.innerHTML = prev + pages + next;
}

function gantiHalaman(hal) {
  currentPage = hal;
  renderTabel();
}

function hapusEvent(index) {
  if (confirm("Yakin ingin menghapus event ini?")) {
    dataEvent.splice(index, 1);
    renderTabel();
    renderKalender();
  }
}

function editEvent(index) {
  editIndex = index;
  const ev = dataEvent[index];
  document.getElementById("editJudul").value = ev.judul;
  document.getElementById("editTanggal").value = ev.tanggal;
  document.getElementById("editLokasi").value = ev.lokasi;
  new bootstrap.Modal(document.getElementById("modalEdit")).show();
}

function simpanEdit() {
  const judul = document.getElementById("editJudul").value;
  const tanggal = document.getElementById("editTanggal").value;
  const lokasi = document.getElementById("editLokasi").value;
  dataEvent[editIndex] = { judul, tanggal, lokasi };
  bootstrap.Modal.getInstance(document.getElementById("modalEdit")).hide();
  renderTabel();
  renderKalender();
}

function eksporCSV() {
  const rows = ["Judul,Tanggal,Lokasi", ...dataEvent.map(ev => `${ev.judul},${ev.tanggal},${ev.lokasi}`)];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "event.csv";
  a.click();  URL.revokeObjectURL(url);
}

document.getElementById("btnExport").addEventListener("click", eksporCSV);
searchInput.addEventListener("input", () => { currentPage = 1; renderTabel(); });
filterToday.addEventListener("change", () => { currentPage = 1; renderTabel(); });


function renderKalender() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();

  calendarMonth.textContent = now.toLocaleString("id-ID", { month: "long", year: "numeric" });
  calendarBody.innerHTML = "";
  let row = document.createElement("tr");

  for (let i = 0; i < startDay; i++) {
    row.innerHTML += `<td></td>`;
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const events = dataEvent.filter(ev => ev.tanggal === dateStr);
    const hasEvent = events.length > 0;
    const cell = document.createElement("td");
    cell.innerHTML = d + (hasEvent ? "<span class='badge bg-success ms-1'>&bull;</span>" : "");
    if (hasEvent) {
      cell.classList.add("text-primary", "cursor-pointer");
      cell.onclick = () => showDetailModal(dateStr, events);
    }
    row.appendChild(cell);
    if ((startDay + d) % 7 === 0) {
      calendarBody.appendChild(row);
      row = document.createElement("tr");
    }
  }
  if (row.children.length > 0) calendarBody.appendChild(row);
}

function showDetailModal(date, events) {
  document.getElementById("detailTanggal").textContent = date;
  document.getElementById("detailEvent").innerHTML = events.map(ev => `<li>${ev.judul} - ${ev.lokasi}</li>`).join("");
  modalDetail.show();
}

document.addEventListener("DOMContentLoaded", () => {
  renderKalender();
});

let currentDate = new Date();

function renderCalendar(events = []) {
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const calendarBody = document.getElementById("calendarBody");
  const calendarMonth = document.getElementById("calendarMonth");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  calendarMonth.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarBody.innerHTML = "";
  let date = 1;

  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");

      if (i === 0 && j < (firstDay === 0 ? 6 : firstDay - 1)) {
        cell.textContent = "";
      } else if (date > daysInMonth) {
        break;
      } else {
        cell.textContent = date;
        const thisDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

        const matched = events.filter(e => e.date === thisDate);
        if (matched.length > 0) {
          cell.classList.add("bg-warning", "text-dark", "fw-bold", "calendar-event");
          cell.style.cursor = "pointer";
          cell.addEventListener("click", () => showEventDetail(thisDate, matched));
        }
        date++;
      }
      row.appendChild(cell);
    }
    calendarBody.appendChild(row);
    if (date > daysInMonth) break;
  }
}

function showEventDetail(date, events) {
  document.getElementById("detailTanggal").textContent = date;
  const list = document.getElementById("detailEvent");
  list.innerHTML = "";
  events.forEach((e) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `<strong>${e.title}</strong><br>Kategori: ${e.category}<br>Jam: ${e.time}`;
    list.appendChild(li);
  });
  new bootstrap.Modal(document.getElementById("modalDetail")).show();
}

if (document.getElementById("prevMonth")) {
  document.getElementById("prevMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(allEvents);
  });
}

if (document.getElementById("nextMonth")) {
  document.getElementById("nextMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(allEvents);
  });
}

let allEvents = [];
function updateCalendar(events) {
  allEvents = events;
  renderCalendar(allEvents);
}