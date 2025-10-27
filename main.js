// ===== Firebase Imports =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, updatePassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// ===== Firebase Config =====
const firebaseConfig = {
 
   apiKey: "AIzaSyDvGetVMvaQf9JklTQHCD73wy3fqaKOzVM",
  authDomain: "uplib-8de86.firebaseapp.com",
  projectId: "uplib-8de86",
  appId: "1:68560125445:web:f0ec30ad51c1757db1e66c",
  measurementId: "G-S55BCCZ28F"

};


const ADMIN_EMAIL = "mkmokka12@gmail.com";       // change to your admin email
const ADMIN_PASSWORD = "Admin123!";           // change to your admin password

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const analytics = getAnalytics(app);

// ======= Registration (Send Email Link) =======
async function registerWithEmail() {
  const email = document.getElementById("regEmail").value;
  const actionCodeSettings = {
    url: window.location.origin + '/finish.html',
    handleCodeInApp: true
  };
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    alert("Check your email to set your password!");
    logEvent(analytics, 'sign_up', { method: 'email_link' });
  } catch (err) {
    alert(err.message);
  }
}

// ======= Login with Email + Password =======
async function loginWithPassword() {
  const email = document.getElementById("logEmail").value;
  const password = document.getElementById("logPass").value;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    alert("Admin login successful!");
    window.location.href = "admin.html"; 
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
    window.location.href = "userprofile.html";
  } catch (err) {
    alert(err.message);
  }
}

// ======= Magic Link Handling =======
if (window.location.pathname.includes('finish.html')) {
  window.onload = async () => {
    const url = window.location.href;
    if (isSignInWithEmailLink(auth, url)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) email = prompt("Enter your email to confirm");
      try {
        const result = await signInWithEmailLink(auth, email, url);
        window.localStorage.removeItem('emailForSignIn');

        const passwordInput = document.getElementById("passwordInput");
        const submitBtn = document.getElementById("setPasswordBtn");
        const statusMsg = document.getElementById("statusMessage");

        submitBtn.onclick = async () => {
          const password = passwordInput.value;
          
          // ✅ Strong password condition:
          const strong = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!strong.test(password)) {
            alert("Password must be at least 8 characters, include a capital letter, a number, and a symbol.");
            return;
          }

          await updatePassword(result.user, password);

          // ✅ Show complete message
          statusMsg.innerText = "Complete!";
          passwordInput.style.display = "none";
          submitBtn.style.display = "none";
        };
      } catch (err) { alert(err.message); }
    }
  };
}

window.registerWithEmail = registerWithEmail;
window.loginWithPassword = loginWithPassword;