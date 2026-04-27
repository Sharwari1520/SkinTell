document.addEventListener("DOMContentLoaded", () => {
    // ===================== FLOATING ICONS ANIMATION =====================
    const icons = document.querySelectorAll(".floating-icons .icon");

    function updateIconVisibility() {
        const currentPage = document.querySelector(".show")?.id || "";
        if (currentPage === "aboutUsSection" || currentPage === "contactUsSection" || currentPage === "productPage") {
            icons.forEach(icon => icon.style.display = "none");
        } else {
            icons.forEach(icon => icon.style.display = "block");
        }
    }

    updateIconVisibility();

    icons.forEach(icon => {
        setInterval(() => {
            if (icon.style.display !== "none") {
                let x = Math.random() * 10 - 5;
                let y = Math.random() * 10 - 5;
                icon.style.transform = `translate(${x}px, ${y}px)`;
            }
        }, 2000);
    });

    // ===================== LOGIN ICON SWITCHING =====================
    const landingLogin = document.querySelector(".login-icon");
    const topRightLogin = document.getElementById("profileBtnTop");

    function updateLoginIcon(page) {
        if (page === "landing") {
            landingLogin.style.display = "block";
            if (topRightLogin) topRightLogin.style.display = "none";
        } else {
            landingLogin.style.display = "none";
            if (topRightLogin) topRightLogin.style.display = "block";
        }
    }

    updateLoginIcon("landing");

    // ===================== AUTH MODAL & TABS =====================
    const signupTab = document.getElementById("signupTab");
    const loginTab = document.getElementById("loginTab");
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const authModal = document.getElementById("authModal");

    const signupUsername = document.getElementById("signupUsername");
    const signupEmail = document.getElementById("signupEmail");
    const signupPassword = document.getElementById("signupPassword");
    const loginUsername = document.getElementById("loginUsername");
    const loginPassword = document.getElementById("loginPassword");

    function openAuthModal(tab = "signup") {
        authModal.style.display = "flex";
        signupForm.reset();
        loginForm.reset();
        if (tab === "signup") signupTab.click();
        else loginTab.click();
    }

    document.getElementById("profileBtn").onclick = () => openAuthModal("signup");
    if (topRightLogin) topRightLogin.onclick = () => openAuthModal("signup");

    document.getElementById("closeModal").onclick = () => authModal.style.display = "none";
    window.onclick = (e) => { if (e.target === authModal) authModal.style.display = "none"; };

    signupTab.onclick = () => {
        signupTab.classList.add("active");
        loginTab.classList.remove("active");
        signupForm.classList.add("active");
        loginForm.classList.remove("active");
    };
    loginTab.onclick = () => {
        loginTab.classList.add("active");
        signupTab.classList.remove("active");
        loginForm.classList.add("active");
        signupForm.classList.remove("active");
    };

    // ===================== SHOW/HIDE PASSWORD =====================
    const togglePassword = (inputId, toggleId) => {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        toggle.onclick = () => {
            if (input.type === "password") { input.type = "text"; toggle.textContent = "🙈"; }
            else { input.type = "password"; toggle.textContent = "👁️"; }
        };
    };
    togglePassword("signupPassword", "toggleSignupPassword");
    togglePassword("loginPassword", "toggleLoginPassword");

    // ===================== CAPTCHA =====================
    const captchaText = document.getElementById("captchaText");
    const generateCaptcha = () => {
        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let captcha = "";
        for (let i = 0; i < 5; i++) captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        captchaText.innerText = captcha;
    };
    document.getElementById("refreshCaptcha").onclick = generateCaptcha;
    generateCaptcha();

    // ===================== SIGNUP =====================
const signupPopup = document.getElementById("signupPopup"); 

// Captcha error popup elements
const captchaErrorPopup = document.getElementById("captchaErrorPopup");
const closeCaptchaError = document.getElementById("closeCaptchaError");

// Function to show captcha error popup
function showCaptchaError() {
    captchaErrorPopup.style.display = "flex";
}

// Close button for captcha error popup
closeCaptchaError.onclick = () => {
    captchaErrorPopup.style.display = "none";
};

// Signup form submission
signupForm.onsubmit = async (e) => { 
    e.preventDefault(); 

    const username = signupUsername.value; 
    const email = signupEmail.value; 
    const password = signupPassword.value; 
    const enteredCaptcha = signupCaptchaInput.value.trim(); // User input
    const actualCaptcha = captchaText.innerText.trim();     // Generated captcha

    // ======= CAPTCHA CHECK =======
    if (enteredCaptcha !== actualCaptcha) {
        showCaptchaError();              // Show custom popup
        generateCaptcha();               // Refresh captcha on wrong attempt
        signupCaptchaInput.value = "";   // Clear input
        return;                           // Stop submission
    }

    // ======= PROCEED IF CAPTCHA IS CORRECT =======
    try { 
        const res = await fetch("http://127.0.0.1:5000/auth/signup", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            credentials: "include", 
            body: JSON.stringify({ username, email, password, skin_type: null }) 
        }); 
        const data = await res.json(); 
        
        if (res.ok) { 
            if (signupPopup) { 
                signupPopup.style.display = "flex"; 
                setTimeout(() => signupPopup.style.display = "none", 3000); 
            } 

            loginUsername.value = username; 
            loginPassword.value = password; 
            loginTab.click(); 
            signupForm.reset(); 
            generateCaptcha(); // Refresh captcha after successful signup
        } else {
            console.error(data.error); 
        }
    } catch(err) { 
        console.error(err); 
    } 
};


// ===================== LOGIN =====================
const loginPopup = document.getElementById("loginPopup");
const welcomeUsername = document.getElementById("welcomeUsername");
const wrongLoginModal = document.getElementById('wrongLoginModal');
const closeWrongLogin = document.getElementById('closeWrongLogin');

if (closeWrongLogin && !closeWrongLogin.dataset.listenerAttached) {
    closeWrongLogin.addEventListener('click', () => {
        wrongLoginModal.style.display = 'none';
    });
    closeWrongLogin.dataset.listenerAttached = "true";
}

if (wrongLoginModal && !wrongLoginModal.dataset.listenerAttached) {
    window.addEventListener('click', (e) => {
        if (e.target == wrongLoginModal) {
            wrongLoginModal.style.display = 'none';
        }
    });
    wrongLoginModal.dataset.listenerAttached = "true";
}

loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = loginUsername.value;
    const password = loginPassword.value;

    try {
        const res = await fetch("http://127.0.0.1:5000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            // Show login popup
            if (loginPopup && welcomeUsername) {
                welcomeUsername.textContent = data.user.username || "User"; 
                loginPopup.style.display = "flex"; 
                setTimeout(() => loginPopup.style.display = "none", 3000); 
            }

            authModal.style.display = "none";

            // Clear previous cart for new login
            localStorage.removeItem("cartItems");

            // Store username and email
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("email", data.user.email);

            // Handle skin type & detection flag
            if (data.user.skin_type && data.user.skin_type !== "") {
                localStorage.setItem("skin_type", data.user.skin_type);
                localStorage.setItem("skin_detected", "true"); // Returning user
            } else {
                localStorage.removeItem("skin_detected"); // New user
                localStorage.removeItem("skin_type");
            }

            // Redirect based on whether user has completed skin detection
            const skinDetected = localStorage.getItem("skin_detected");

            if (skinDetected === "true") {
                // Returning user → go to Home page
                showPage("homePage");
                updateLoginIcon("internal");
            } else {
                // New user → go to Skin Detection page
                showPage("page3");
                updateLoginIcon("internal");
            }
        } else {
            // Wrong login popup
            if (wrongLoginModal) {
                wrongLoginModal.style.display = 'flex';
                wrongLoginModal.querySelector('p').textContent = "Incorrect username or password. Please try again.";
                setTimeout(() => { wrongLoginModal.style.display = 'none'; }, 3000);
            }
            console.error(data.error);
        }
    } catch(err) { 
        console.error(err); 
        if (wrongLoginModal) {
            wrongLoginModal.style.display = 'flex';
            wrongLoginModal.querySelector('p').textContent = "Incorrect username or password. Please try again.";
            setTimeout(() => { wrongLoginModal.style.display = 'none'; }, 3000);
        }
    }

    renderCart();
};

// ===================== SKINFOLIO (PROFILE MODAL) =====================
    const skinfolioLoginIcon  = document.getElementById("profileBtnTop"); // Home page login icon
    const skinfolioModal      = document.getElementById("skinfolioModal");
    const skinfolioName       = document.getElementById("skinfolioName");
    const skinfolioEmail      = document.getElementById("skinfolioEmail");
    const skinfolioSkinType   = document.getElementById("skinfolioSkinType");
    const skinfolioLogout     = document.getElementById("logoutBtn");

    if (skinfolioLoginIcon && skinfolioModal) {
        skinfolioLoginIcon.addEventListener("click", () => {
            const username = localStorage.getItem("username");
            const email    = localStorage.getItem("email");
            const skinType = localStorage.getItem("skin_type");

            if (!username) {
                alert("Please login first!");
                return;
            }

            skinfolioName.textContent     = username || "N/A";
            skinfolioEmail.textContent    = email || "N/A";
            skinfolioSkinType.textContent = skinType || "N/A";

            // Hide auth modal if open
            if (authModal) authModal.style.display = "none";

            skinfolioModal.classList.remove("hidden");
            skinfolioModal.style.display = "flex";
        });
    }

    if (skinfolioLogout) {
        skinfolioLogout.addEventListener("click", () => {
            localStorage.removeItem("username");
            localStorage.removeItem("email");
            localStorage.removeItem("skin_type");

            skinfolioModal.classList.add("hidden");
            skinfolioModal.style.display = "none";

            alert("You have been logged out.");
            hideAllSections();
            document.getElementById("homePage").style.display = "flex";
            updateIconVisibility();
        });
    }

    // ===================== UPDATE SKIN TYPE =====================
    async function updateSkinType(type) {
        try {
            const response = await fetch("http://127.0.0.1:5000/auth/update_skin_type", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ skin_type: type })
            });
            const result = await response.json();
            if (response.ok) localStorage.setItem("skin_type", result.skin_type);
            else console.error(result.error);
        } catch (err) { console.error(err); }
    }
    window.updateSkinType = updateSkinType;
});

// ==================== Skin Type Selection ====================
function openForm(type) {
    // Store skin type in backend
    updateSkinType(type);

    // Google Form URLs
    const urls = {
        dry: "https://docs.google.com/forms/d/e/1FAIpQLSdT3yTkQSGJZ61yK7zfnXGWTA9lI6Wke-5X9UI7UDCIGZFTAw/viewform?usp=header",
        oily: "https://docs.google.com/forms/d/e/1FAIpQLSe_JwVnsrrGWp1ErEpzxc1s3eozkN7RSoOI5IeKxD1482IuiA/viewform?usp=header",
        normal: "https://docs.google.com/forms/d/e/1FAIpQLSfWLFNlM6AxhVel0qpQ0evLEq-IU_AV9mnkiTlcuA8Q0at0wg/viewform?usp=header",
        combination: "https://docs.google.com/forms/d/e/1FAIpQLSc89prpr2BJvNJGatH_nMcH9flEJa9D901I4wow4_oepCRuPg/viewform?usp=header",
        acne: "https://docs.google.com/forms/d/e/1FAIpQLSfj2pxuQN-AQGkjw_DZctknnpmV6lfYKpS6Nk07NBevwDAjUw/viewform?usp=header"
    };

    // Validate skin type
    if (!urls[type]) {
        alert("Form not found for this skin type!");
        return;
    }

    // Open Google Form in a new tab (directly, avoids pop-up blockers)
    window.open(urls[type], "_blank", "noopener");

    // Page navigation after opening the form
    const page3 = document.getElementById("page3");
    if (page3) page3.style.display = "none";
    showPage("homePage");
}


// ==================== Profile Button Top ====================
const profileTop = document.getElementById("profileTop");
if (profileTop) profileTop.addEventListener("click", () => { authModal.style.display = "flex"; });

const profileBtnTop = document.getElementById("profileBtnTop");
if (profileBtnTop) profileBtnTop.addEventListener("click", () => { authModal.style.display = "flex"; });

// Hamburger menu
const hamburger = document.getElementById("hamburger");
const sideNav = document.getElementById("sideNav");
const closeNav = document.getElementById("closeNav");

if (hamburger) {
    hamburger.addEventListener("click", () => {
        sideNav.style.width = "250px";
    });
}
if (closeNav) {
    closeNav.addEventListener("click", () => {
        sideNav.style.width = "0";
    });
}
if (sideNav) {
    sideNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            sideNav.style.width = "0";
        });
    });
}

// A single function to hide all major content sections
function hideAllSections() {
    const sections = [
        document.querySelector(".hero"),
        document.getElementById("page3"),
        document.getElementById("homePage"),
        document.getElementById("contactUsSection"),
        document.getElementById("productPage"),
        document.getElementById("trackerSection"),
        document.getElementById("cartPage"),
        document.getElementById("checkoutPage"),
        document.getElementById("aboutUsSection")
    ];

    sections.forEach(section => {
        if (section) {
            section.style.display = "none";
            section.classList.remove("show");
        }
    });
}

function showPage(pageId) {
    hideAllSections();
    const page = document.getElementById(pageId);
    if (page) {
        page.style.display = "flex";
        page.classList.add("show");
    }
}
window.showPage = showPage;

// ===================== NAVIGATION LISTENERS =====================
const aboutNav = document.getElementById("navAbout");
if (aboutNav) aboutNav.addEventListener("click", () => {
    hideAllSections();
    const aboutSection = document.getElementById("aboutUsSection");
    if (aboutSection) aboutSection.style.display = "block"; 
});

const contactNav = document.getElementById("navContact");
if (contactNav) contactNav.addEventListener("click", () => {
    hideAllSections();
    const contactSection = document.getElementById("contactUsSection");
    if (contactSection) contactSection.style.display = "block";
});

const homeNav = document.getElementById("navHome");
if (homeNav) homeNav.addEventListener("click", () => {
    hideAllSections();
    const homePage = document.getElementById("homePage");
    if (homePage) homePage.style.display = "flex";
});

const productNav = document.getElementById("navProducts");
if (productNav) productNav.addEventListener("click", () => {
    hideAllSections();
    const productPage = document.getElementById("productPage");
    if (productPage) productPage.style.display = "block";
});

// ===================== DAILY TIPS & TAGLINES =====================
const tips = [
    "Hydrate! Drink at least 8 glasses of water daily.",
    "Always remove makeup before sleeping.",
    "Use sunscreen even on cloudy days.",
    "Double cleanse to say goodbye to dirt & hello to glow.",
    "Hydration isn’t just water your skin drinks serum too.",
    "Less is more – don’t over-layer products."
];

let tipIndex = 0;
const tipText = document.getElementById("tipText");
function showNextTip() {
    if (tipText) {
        tipText.textContent = tips[tipIndex];
        tipIndex = (tipIndex + 1) % tips.length;
    }
}
setInterval(showNextTip, 5000);
showNextTip();

let taglineIndex = 0;
const taglines = document.querySelectorAll(".tagline-block");
function showNextTagline() {
    if (taglines.length > 0) {
        taglines.forEach(t => t.classList.remove("active"));
        taglines[taglineIndex].classList.add("active");
        taglineIndex = (taglineIndex + 1) % taglines.length;
    }
}
setInterval(showNextTagline, 7000);
showNextTagline();

// Dummy Product Database - All good, no changes needed here.
const productsDB = { 
   dry: [
    {
      type: "Cleanser",
      options: [
        { brand: "Cetaphil", name: "Hydrating Cleanser", price: 299, image: "./assets/cleanser1.jpg" },
        { brand: "CeraVe", name: "Hydrating Cleanser", price: 599, image: "./assets/cleanser2.jpg" },
        { brand: "Dot & Key", name: "Hydrating Cleanser", price: 399, image: "./assets/cleanser3.jpg" },
        { brand: "The Body Shop", name: "Hydrating Cleanser", price: 499, image: "./assets/cleanser4.jpg" },
        { brand: "La Roche-Posay", name: "Hydrating Cleanser", price: 699, image: "./assets/cleanser5.jpg" }
      ]
    },
    {
      type: "Moisturizer",
      options: [
        { brand: "Neutrogena", name: "Moisture Boost Cream", price: 699, image: "./assets/moist1.jpg" },
        { brand: "Clinique", name: "Moisture Boost Cream", price: 499, image: "./assets/moist2.jpg" },
        { brand: "The Derma Co", name: "Moisture Boost Cream", price: 399, image: "./assets/moist3.jpg" },
        { brand: "Lakmé Peach Milk", name: "Moisture Boost Cream", price: 599, image: "./assets/moist4.jpg" },
        { brand: "NIVEA", name: "Moisture Boost Cream", price: 299, image: "./assets/moist5.jpg" }
      ]
    },
    {
      type: "Sunscreen",
      options: [
        { brand: "La Roche-Posay", name: "Gentle Sunscreen", price: 699, image: "./assets/sun1.jpg" },
        { brand: "Neutrogena", name: "Gentle Sunscreen", price: 399, image: "./assets/sun2.jpg" },
        { brand: "Minimalist", name: "SPF 50 Sunscreen", price: 799, image: "./assets/sun3.jpg" },
        { brand: "Aqualogica", name: "Hydrate+ Dewy Sunscreen", price: 499, image: "./assets/sun4.jpg" },
        { brand: "Dot & Key", name: "Watermelon Hyaluronic Sunscreen", price: 599, image: "./assets/sun5.jpg" }
      ]
    },
    {
      type: "Serum",
      options: [
        { brand: "The Ordinary", name: "Hyaluronic Acid 2% + B5", price: 799, image: "./assets/ser1.jpg" },
        { brand: "Minimalist", name: "2% Hyaluronic Acid + B5 Serum", price: 699, image: "./assets/ser2.jpg" },
        { brand: "Dot & Key", name: "Hyaluronic + Vitamin C Serum", price: 499, image: "./assets/ser3.jpg" },
        { brand: "The Derma Co", name: "5% Hyaluronic Acid Serum", price: 599, image: "./assets/ser4.jpg" },
        { brand: "CeraVe", name: "Hydrating Hyaluronic Acid Serum", price: 799, image: "./assets/ser5.jpg" }
      ]
    },
    {
      type: "Mask",
      options: [
        { brand: "Innisfree", name: "Super Volcanic Pore Clay Mask", price: 799, image: "./assets/mask1.jpg" },
        { brand: "COSRX", name: "Full Fit Propolis Honey Overnight Mask", price: 699, image: "./assets/mask2.jpg" },
        { brand: "Biotique", name: "Brightening-Depigmentation", price: 499, image: "./assets/mask3.jpg" },
        { brand: "Pilgrim", name: "Glow Sleeping Mask", price: 599, image: "./assets/mask4.jpg" },
        { brand: "Laneige", name: "Water Sleeping Mask", price: 899, image: "./assets/mask5.jpg" }
      ]
    },
    {
      type: "Toner",
      options: [
        { brand: "The Fash Shop", name: "Rice and Ceramide", price: 799, image: "./assets/ton1.jpg" },
        { brand: "Centella", name: "Madagascar Centella Hyalu-cica", price: 699, image: "./assets/ton2.jpg" },
        { brand: "Plum", name: "3% Niacinamide with Rice Water", price: 399, image: "./assets/ton3.jpg" },
        { brand: "Dot & Key", name: "Rice Water Hydrating Toner", price: 499, image: "./assets/ton4.jpg" },
        { brand: "TIRTIR", name: "Milk Skin Toner", price: 599, image: "./assets/ton5.jpg" }
      ]
    },
    {
      type: "Gel",
      options: [
        { brand: "Neutrogena", name: "Hydro Boost Hyaluronic Acid", price: 799, image: "./assets/gel1.jpg" },
        { brand: "CeraVe", name: "Gel Hyalu-cica", price: 699, image: "./assets/gel2.jpg" },
        { brand: "Plum", name: "2% Niacinamide with Rice Water Gel", price: 399, image: "./assets/gel3.jpg" },
        { brand: "Innisfree", name: "Aloe Vera Revital Gel", price: 499, image: "./assets/gel4.jpg" },
        { brand: "Wishcare", name: "Pure and Natural Aloe Vera Gel", price: 599, image: "./assets/gel5.jpg" }
      ]
    }
  ],
  oily: [
    {
      type: "Cleanser",
      options: [
        { brand: "Cetaphil", name: "Oily Skin Cleanser", price: 299, image: "./assets/cleanser6.jpg" },
        { brand: "CeraVe", name: "Foaming Cleanser", price: 499, image: "./assets/cleanser7.jpg" },
        { brand: "Minimalist", name: "2% Salicylic Cleanser", price: 399, image: "./assets/cleanser8.jpg" },
        { brand: "Bioderma", name: "Sebium Cleanser", price: 599, image: "./assets/cleanser9.jpg" },
        { brand: "Plum", name: "2% Niacinamide Cleanser", price: 699, image: "./assets/cleanser10.jpg" }
      ]
    },
    {
      type: "Moisturizer",
      options: [
        { brand: "Minimalist", name: "Vitamin B5 10% Moist", price: 699, image: "./assets/moist6.jpg" },
        { brand: "CeraVe", name: "Oil Control Light Moisturize", price: 499, image: "./assets/moist7.jpg" },
        { brand: "Foxtale", name: "Oil Balancing Moisturizer", price: 399, image: "./assets/moist8.jpg" },
        { brand: "Neutrogena", name: "Hydro Boost Hyaluronic Acid Water Gel", price: 599, image: "./assets/moist9.jpg" },
        { brand: "Dot & Key", name: "Cica Niacinamide Oil Free Moisturizer", price: 299, image: "./assets/moist10.jpg" }
      ]
    },
    {
      type: "Sunscreen",
      options: [
        { brand: "Cetaphil", name: "Sun SPF 30 Light", price: 699, image: "./assets/sun6.jpg" },
        { brand: "Neutrogena", name: "Ultrasheer SPF50+PA++++", price: 399, image: "./assets/sun7.jpg" },
        { brand: "Wishcare", name: "Niacinamide Oil Balance Fluid", price: 799, image: "./assets/sun8.jpg" },
        { brand: "The Derma Co", name: "1% Hyaluronic Sunscreen Oil-free", price: 499, image: "./assets/sun9.jpg" },
        { brand: "Dot & Key", name: "Watermelon Cica Calming Niacinamide", price: 599, image: "./assets/sun10.jpg" }
      ]
    },
    {
      type: "Serum",
      options: [
        { brand: "Plum", name: "10% Niacinamide Brightening Serum", price: 799, image: "./assets/ser6.jpg" },
        { brand: "Minimalist", name: "10% Niacinamide Serum", price: 699, image: "./assets/ser7.jpg" },
        { brand: "Pilgrim", name: "Salicylic Acid + Niacinamide", price: 499, image: "./assets/ser8.jpg" },
        { brand: "The Derma Co", name: "2% Salicylic Acid Serum", price: 599, image: "./assets/ser9.jpg" },
        { brand: "Dot & Key", name: "2% Salicylic Acid Serum", price: 799, image: "./assets/ser10.jpg" }
      ]
    },
    {
      type: "Mask",
      options: [
        { brand: "Forest Essentials", name: "Neem Varnya Lepa", price: 799, image: "./assets/mask6.jpg" },
        { brand: "Innisfree", name: "Volcanic Pore Clay Mask", price: 699, image: "./assets/mask7.jpg" },
        { brand: "Dot & Key", name: "Anti-Acne Salicylic Green Clay Mask", price: 499, image: "./assets/mask8.jpg" },
        { brand: "Beauty of Joseon", name: "Red Bean Refreshing Pore Mask", price: 599, image: "./assets/mask9.jpg" },
        { brand: "Foxtale", name: "Radiance Mask with Lactic Acid", price: 899, image: "./assets/mask10.jpg" }
      ]
    },
    {
      type: "Toner",
      options: [
        { brand: "Foxtale", name: "Exfoliating Toner", price: 799, image: "./assets/ton6.jpg" },
        { brand: "Centella", name: "Madagascar Centella Pore Min Toner", price: 699, image: "./assets/ton7.jpg" },
        { brand: "Plum", name: "3% Niacinamide with Rice Water", price: 399, image: "./assets/ton8.jpg" },
        { brand: "Dot & Key", name: "Cica Green Tea Toner", price: 499, image: "./assets/ton9.jpg" },
        { brand: "TONYMOLY", name: "Korean Tea Tree Pore Fresh Toner", price: 599, image: "./assets/ton10.jpg" }
      ]
    },
    {
      type: "Gel",
      options: [
        { brand: "Neutrogena", name: "Hydro Boost Hyaluronic Acid Gel", price: 799, image: "./assets/gel6.jpg" },
        { brand: "CeraVe", name: "Oil Control Gel", price: 699, image: "./assets/gel7.jpg" },
        { brand: "Plum", name: "2% Niacinamide with Rice Water Gel", price: 399, image: "./assets/gel8.jpg" },
        { brand: "Bioderma", name: "Sebium Gel", price: 499, image: "./assets/gel9.jpg" },
        { brand: "Beauty of Joseon", name: "Rice Bean Water Gel", price: 599, image: "./assets/gel10.jpg" }
      ]
    }
  ],
  normal: [
    {
      type: "Cleanser",
      options: [
        { brand: "Simple", name: "Refreshing facewash mild facewash", price: 299, image: "./assets/cleanser11.jpg" },
        { brand: "Dot & Key", name: "Vitamin C+super bright gel Face wash", price: 499, image: "./assets/cleanser12.jpg" },
        { brand: "Minimalist", name: "7% ALA&AHA brightening face wash", price: 399, image: "./assets/cleanser13.jpg" },
        { brand: "Nyka", name: "Rice water & Glycolic Acid face wash", price: 599, image: "./assets/cleanser14.jpg" },
        { brand: "The Derma Co", name: "2% Vitamin C gel Cleanser", price: 699, image: "./assets/cleanser15.jpg" }
      ]
    },
    {
      type: "Moisturizer",
      options: [
        { brand: "Citaphil", name: "moisturizing cream", price: 699, image: "./assets/moist11.jpg" },
        { brand: "Nivea", name: "soft vit E light non sticky face moisturizer", price: 499, image: "./assets/moist12.jpg" },
        { brand: "Cerave", name: "PM facial moisturixer", price: 399, image: "./assets/moist13.jpg" },
        { brand: "Neutrogena", name: "Hydro Boost hyloronic acid water gel moist", price: 599, image: "./assets/moist14.jpg" },
        { brand: "Dot & key", name: "Hyluronic+ceramide barrier repair", price: 299, image: "./assets/moist15.jpg" }
      ]
    },
    {
      type: "Sunscreen",
      options: [
        { brand: "Cetaphil", name: "Sun SPF 50+ light gel very high Protection mineral", price: 699, image: "./assets/sun11.jpg" },
        { brand: "Aqualogica", name: "Glow+Dewy lightweight sunscreen gel", price: 399, image: "./assets/sun12.jpg" },
        { brand: "Wishcare", name: "invisible gel sunscreen", price: 799, image: "./assets/sun13.jpg" },
        { brand: "The Derma Co", name: "1% Hyluronic suncreenn oil-free", price: 499, image: "./assets/sun14.jpg" },
        { brand: "Dot & Key", name: "Watermelon wster light face suncreen", price: 599, image: "./assets/sun15.jpg" }
      ]
    },
    {
      type: "Serum",
      options: [
        { brand: "Plum", name: "15% Vitamin C", price: 799, image: "./assets/ser11.jpg" },
        { brand: "Minimalist", name: "16% vitamin C Face serum", price: 699, image: "./assets/ser12.jpg" },
        { brand: "Foxtale", name: "Brightening vitamin c", price: 499, image: "./assets/ser13.jpg" },
        { brand: "The Derma Co", name: "10% Vitamin C Serum", price: 599, image: "./assets/ser14.jpg" },
        { brand: "The Ordinary", name: "12% Ascorbyl Glucoside solution", price: 799, image: "./assets/ser15.jpg" }
      ]
    },
    {
      type: "Mask",
      options: [
        { brand: "House of nykaa", name: "nykaa natural skin secret", price: 799, image: "./assets/mask11.jpg" },
        { brand: "Biotique", name: "Fruit brightening Depigmentation tan removal mask", price: 699, image: "./assets/mask12.jpg" },
        { brand: "Ozone", name: "D-tan face pack", price: 499, image: "./assets/mask13.jpg" },
        { brand: "Beauty of Joseon", name: "Apricot blossom peeling gel mask", price: 599, image: "./assets/mask14.jpg" },
        { brand: "Foxtale", name: "De-tan skin radiance mask", price: 899, image: "./assets/mask10.jpg" }
      ]
    },
    {
      type: "Toner",
      options: [
        { brand: "The Ordinary", name: "Exfoliating toner", price: 799, image: "./assets/ton11.jpg" },
        { brand: "Wishacare", name: " Pure and natural kannauj rose water", price: 699, image: "./assets/ton12.jpg" },
        { brand: "Beauty of joseon", name: "Ginseng essennce water", price: 399, image: "./assets/ton13.jpg" },
        { brand: "Dot & Key", name: "watermelon & Gylcolic super glow", price: 499, image: "./assets/ton14.jpg" },
        { brand: "TONYMOLY", name: "Korean wonder ceramide mochi toner", price: 599, image: "./assets/ton15.jpg" }
      ]
    },
    {
      type: "Gel",
      options: [
        { brand: "Neutrogena", name: "Hydro Boost Hyluronic acid", price: 799, image: "./assets/gel11.jpg" },
        { brand: "Cerave", name: " Goil control", price: 699, image: "./assets/gel12.jpg" },
        { brand: "Plum", name: "2% Niacinamide with rice water", price: 399, image: "./assets/gel13.jpg" },
        { brand: "Bioderma", name: "Sebium gel", price: 499, image: "./assets/gel14.jpg" },
        { brand: "Beauty of Joseon", name: "Rice bean water gel", price: 599, image: "./assets/gel15.jpg" }
      ]
    }
  ],
  combination: [
    {
      type: "Cleanser",
      options: [
        { brand: "Simple", name: "Kind to Skin Refreshing Facial Wash", price: 299, image: "./assets/cleanser16.jpg" },
        { brand: "Neutrogena", name: "Oil-Free Acne Wash", price: 499, image: "./assets/cleanser17.jpg" },
        { brand: "Cetaphil", name: "Gentle Skin Cleanser", price: 399, image: "./assets/cleanser18.jpg" },
        { brand: "Plum", name: "Green Tea Pore Cleansing Face Wash", price: 349, image: "./assets/cleanser19.jpg" },
        { brand: "The Derma Co", name: "2% Salicylic Acid Face Wash", price: 599, image: "./assets/cleanser20.jpg" }
      ]
    },
    {
      type: "Moisturizer",
      options: [
        { brand: "Neutrogena", name: "Oil-Free Moisture SPF 15", price: 599, image: "./assets/moist16.jpg" },
        { brand: "Clinique", name: "Dramatically Different Moisturizing Gel", price: 799, image: "./assets/moist17.jpg" },
        { brand: "Plum", name: "Green Tea Mattifying Moisturizer", price: 399, image: "./assets/moist18.jpg" },
        { brand: "Cetaphil", name: "Daily Oil-Free Hydrating Lotion", price: 499, image: "./assets/moist19.jpg" },
        { brand: "Dot & Key", name: "Hydrating Water Cream", price: 599, image: "./assets/moist20.jpg" }
      ]
    },
    {
      type: "Sunscreen",
      options: [
        { brand: "Aqualogica", name: "Hydrate+ Dewy Sunscreen", price: 399, image: "./assets/sun16.jpg" },
        { brand: "Re’equil", name: "Oxybenzone Free Sunscreen SPF 50", price: 699, image: "./assets/sun17.jpg" },
        { brand: "The Derma Co", name: "1% Hyaluronic Gel Sunscreen", price: 499, image: "./assets/sun18.jpg" },
        { brand: "La Shield", name: "Oil-Free Sunscreen Gel", price: 749, image: "./assets/sun19.jpg" },
        { brand: "Lotus", name: "Safe Sun Matte Gel SPF 50", price: 549, image: "./assets/sun20.jpg" }
      ]
    },
    {
      type: "Serum",
      options: [
        { brand: "Minimalist", name: "Niacinamide 10% + Zinc", price: 599, image: "./assets/ser16.jpg" },
        { brand: "Plum", name: "Green Tea Skin Clarifying Serum", price: 799, image: "./assets/ser17.jpg" },
        { brand: "Foxtale", name: "Niacinamide Face Serum", price: 499, image: "./assets/ser18.jpg" },
        { brand: "The Ordinary", name: "Niacinamide 10% + Zinc 1%", price: 699, image: "./assets/_ser19.jpg" },
        { brand: "Dot & Key", name: "10% Niacinamide + Cica Serum", price: 799, image: "./assets/ser20.jpg" }
      ]
    },
    {
      type: "Mask",
      options: [
        { brand: "House of nykaa", name: "nykaa natural skin secret", price: 799, image: "./assets/mask16.jpg" },
        { brand: "Biotique", name: "Fruit brightening Depigmentation tan removal mask", price: 699, image: "./assets/mask17.jpg" },
        { brand: "Ozone", name: "D-tan face pack", price: 499, image: "./assets/mask18.jpg" },
        { brand: "Beauty of Joseon", name: "Apricot blossom peeling gel mask", price: 599, image: "./assets/mask19.jpg" },
        { brand: "Foxtale", name: "De-tan skin radiance mask", price: 899, image: "./assets/mask20.jpg" }
      ]
    },
    {
      type: "Toner",
      options: [
        { brand: "The Ordinary", name: "Exfoliating toner", price: 799, image: "./assets/ton16.jpg" },
        { brand: "Wishacare", name: " Pure and natural kannauj rose water", price: 699, image: "./assets/ton17.jpg" },
        { brand: "Beauty of joseon", name: "Ginseng essennce water", price: 399, image: "./assets/ton18.jpg" },
        { brand: "Dot & Key", name: "watermelon & Gylcolic super glow", price: 499, image: "./assets/ton19.jpg" },
        { brand: "TONYMOLY", name: "Korean wonder ceramide mochi toner", price: 599, image: "./assets/ton10.jpg" }
      ]
    },
    {
      type: "Gel",
      options: [
        { brand: "Neutrogena", name: "Hydro Boost Hyluronic acid", price: 799, image: "./assets/gel16.jpg" },
        { brand: "Cerave", name: " Goil control", price: 699, image: "./assets/gel17.jpg" },
        { brand: "Plum", name: "2% Niacinamide with rice water", price: 399, image: "./assets/gel18.jpg" },
        { brand: "Bioderma", name: "Sebium gel", price: 499, image: "./assets/gel19.jpg" },
        { brand: "Beauty of Joseon", name: "Rice bean water gel", price: 599, image: "./assets/gel20.jpg" }
      ]
    }
  ],
  acneprone: [
    {
      type: "Cleanser",
      options: [
        { brand: "Cetaphil", name: "Oily Skin Cleanser", price: 399, image: "./assets/cleanser21.jpg" },
        { brand: "Neutrogena", name: "Oil-Free Acne Wash", price: 499, image: "./assets/cleanser22.jpg" },
        { brand: "La Roche-Posay", name: "Effaclar Purifying Foaming Gel", price: 799, image: "./assets/cleanser23.jpg" },
        { brand: "Plum", name: "Green Tea Pore Cleanser", price: 349, image: "./assets/cleanser24.jpg" },
        { brand: "The Derma Co", name: "2% Salicylic Acid Cleanser", price: 599, image: "./assets/cleanser25.jpg" }
      ]
    },
    {
      type: "Moisturizer",
      options: [
        { brand: "Neutrogena", name: "Oil-Free Moisturizer", price: 499, image: "./assets/moist21.jpg" },
        { brand: "Re’equil", name: "Oil-Free Mattifying Moisturizer", price: 599, image: "./assets/moist22.jpg" },
        { brand: "Plum", name: "Green Tea Mattifying Moisturizer", price: 399, image: "./assets/moist23.jpg" },
        { brand: "Clinique", name: "Acne Solutions Clearing Moisturizer", price: 899, image: "./assets/moist24.jpg" },
        { brand: "Cetaphil", name: "PRO Oil Absorbing Moisturizer SPF 30", price: 799, image: "./assets/moist25.jpg" }
      ]
    },
    {
      type: "Sunscreen",
      options: [
        { brand: "Aqualogica", name: "Clear+ Invisible Sunscreen", price: 499, image: "./assets/sun21.jpg" },
        { brand: "La Shield", name: "Oil-Free Sunscreen Gel SPF 40", price: 699, image: "./assets/sun22.jpg" },
        { brand: "Re’equil", name: "Oxybenzone Free Sunscreen SPF 50", price: 649, image: "./assets/sun23.jpg" },
        { brand: "Bioderma", name: "Photoderm AKN Mat Sunscreen", price: 849, image: "./assets/sun24.jpg" },
        { brand: "The Derma Co", name: "Salicylic Acid Sunscreen", price: 599, image: "./assets/sun25.jpg" }
      ]
    },
    {
      type: "Serum",
      options: [
        { brand: "Minimalist", name: "2% Salicylic Acid Serum", price: 599, image: "./assets/ser21.jpg" },
        { brand: "Plum", name: "Green Tea Skin Clarifying Serum", price: 799, image: "./assets/ser22.jpg" },
        { brand: "The Ordinary", name: "Salicylic Acid 2% Solution", price: 699, image: "./assets/ser23.jpg" },
        { brand: "Foxtale", name: "Acne Control Salicylic Serum", price: 499, image: "./assets/ser24.jpg" },
        { brand: "Dot & Key", name: "Cica + Salicylic Serum", price: 799, image: "./assets/ser25.jpg" }
      ]
    },
    {
      type: "Mask",
      options: [
        { brand: "House of nykaa", name: "nykaa natural skin secret", price: 799, image: "./assets/mask21.jpg" },
        { brand: "Biotique", name: "Fruit brightening Depigmentation tan removal mask", price: 699, image: "./assets/mask22.jpg" },
        { brand: "Ozone", name: "D-tan face pack", price: 499, image: "./assets/mask23.jpg" },
        { brand: "Beauty of Joseon", name: "Apricot blossom peeling gel mask", price: 599, image: "./assets/mask24.jpg" },
        { brand: "Foxtale", name: "De-tan skin radiance mask", price: 899, image: "./assets/mask25.jpg" }
      ]
    },
    {
      type: "Toner",
      options: [
        { brand: "The Ordinary", name: "Exfoliating toner", price: 799, image: "./assets/ton21.jpg" },
        { brand: "Wishacare", name: " Pure and natural kannauj rose water", price: 699, image: "./assets/ton22.jpg" },
        { brand: "Beauty of joseon", name: "Ginseng essennce water", price: 399, image: "./assets/ton23.jpg" },
        { brand: "Dot & Key", name: "watermelon & Gylcolic super glow", price: 499, image: "./assets/ton24.jpg" },
        { brand: "TONYMOLY", name: "Korean wonder ceramide mochi toner", price: 599, image: "./assets/ton25.jpg" }
      ]
    },
    {
      type: "Gel",
      options: [
        { brand: "Neutrogena", name: "Hydro Boost Hyluronic acid", price: 799, image: "./assets/gel21.jpg" },
        { brand: "Cerave", name: " Goil control", price: 699, image: "./assets/gel22.jpg" },
        { brand: "Plum", name: "2% Niacinamide with rice water", price: 399, image: "./assets/gel23.jpg" },
        { brand: "Bioderma", name: "Sebium gel", price: 499, image: "./assets/gel24.jpg" },
        { brand: "Beauty of Joseon", name: "Rice bean water gel", price: 599, image: "./assets/gel25.jpg" }
      ]
    }
  ]
 };

// ===================== SELECTED SKIN TYPE =====================
let selectedSkinType = localStorage.getItem("skin_type") || null;

// ===================== HANDLE SKIN TYPE SELECTION =====================
document.querySelectorAll(".skin-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        let type = btn.dataset.type.toLowerCase().trim(); // normalize
        if (type === "acne") type = "acneprone";          // fix naming
        selectedSkinType = type;
        localStorage.setItem("skin_type", type);
    });
});

// ===================== USER CART ISOLATION =====================
const currentUser = localStorage.getItem("username");
const lastUser = localStorage.getItem("lastUser");
if (currentUser !== lastUser) {
    localStorage.setItem("cart", JSON.stringify([])); // empty cart for new user
    localStorage.setItem("lastUser", currentUser);
}

// ===================== Skin Type Not Selected Popup =====================
const skinTypeErrorPopup = document.getElementById("skinTypeErrorPopup");
const closeSkinTypeError = document.getElementById("closeSkinTypeError");
closeSkinTypeError.onclick = () => { skinTypeErrorPopup.style.display = "none"; };

// ===================== PRODUCT LEVEL BUTTONS =====================
document.querySelectorAll('.level-buttons button').forEach(button => {
    button.addEventListener('click', () => {
        const currentSkinType = localStorage.getItem("skin_type");
        if (!currentSkinType || currentSkinType.trim() === "") {
            skinTypeErrorPopup.style.display = "flex";
            return;
        }
        const level = button.getAttribute("onclick").match(/'(\w+)'/)[1];
        selectLevel(level);
    });
});

// ===================== SELECT LEVEL FUNCTION =====================
function selectLevel(level) {
    const selectedSkinType = localStorage.getItem("skin_type");
    const productList = document.getElementById("productList");
    productList.innerHTML = ""; // clear previous products

    let limit;
    switch(level) {
        case 'beginner': limit = 3; break;
        case 'moderate': limit = 5; break;
        case 'expert': limit = 7; break;
        default: limit = 0; break;
    }

    // Always point to normalized key in productsDB
    const products = productsDB[selectedSkinType] || [];
    products.slice(0, limit).forEach(prod => {
        const optionsHtml = prod.options.map(option => `
            <div class="product-item" data-name="${option.name}" data-brand="${option.brand}" data-price="${option.price}" data-image="${option.image}">
                <img src="${option.image}" alt="${option.name}">
                <p class="product-name">${option.name}</p>
                <p class="product-brand"><b>${option.brand}</b></p>
                <p class="product-price"><b>₹${option.price}</b></p>
                <button class="add-to-cart-btn">Add to Cart</button>
            </div>
        `).join('');
        const box = document.createElement("div");
        box.className = "product-recommendation-box";
        box.innerHTML = `<h4>${prod.type}</h4><div class="product-grid">${optionsHtml}</div>`;
        productList.appendChild(box);
    });

    // ===================== ADD TO CART =====================
    productList.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productItem = e.target.closest('.product-item');
            if (!productItem) return;
            const product = {
                name: productItem.dataset.name,
                brand: productItem.dataset.brand,
                price: parseFloat(productItem.dataset.price),
                image: productItem.dataset.image
            };
            addToCart(product);
        });
    });
}

window.selectLevel = selectLevel;

// ===================== FLOATING ICONS VISIBILITY =====================
const icons = document.querySelectorAll(".floating-icons .icon");
function updateIconVisibility() {
    const currentPage = document.querySelector(".show")?.id || "";
    if (currentPage === "aboutUsSection" || currentPage === "contactUsSection" || currentPage === "productPage") {
        icons.forEach(icon => icon.style.display = "none");
    } else {
        icons.forEach(icon => icon.style.display = "block");
    }
}
const observer = new MutationObserver(updateIconVisibility);
observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
updateIconVisibility();


// ===================== SkinFolio (User Profile) =====================
const skinfolioLoginIcon  = document.getElementById("profileBtnTop"); // Home page login icon
const skinfolioModal      = document.getElementById("skinfolioModal"); // Modal
const skinfolioName       = document.getElementById("skinfolioName");
const skinfolioEmail      = document.getElementById("skinfolioEmail");
const skinfolioSkinType   = document.getElementById("skinfolioSkinType");
const skinfolioLogout     = document.getElementById("logoutBtn");
const skinfolioCloseBtn   = document.getElementById("skinfolioCloseBtn"); // X button

// Open SkinFolio
if (skinfolioLoginIcon && skinfolioModal) {
    skinfolioLoginIcon.addEventListener("click", () => {
        const username = localStorage.getItem("username");
        const email    = localStorage.getItem("email");
        const skinType = localStorage.getItem("skin_type");

        if (!username) {
            alert("Please login first!");
            return;
        }

        // Populate modal
        if (skinfolioName)     skinfolioName.textContent     = username || "N/A";
        if (skinfolioEmail)    skinfolioEmail.textContent    = email || "N/A";
        if (skinfolioSkinType) skinfolioSkinType.textContent = skinType || "N/A";

        // Hide auth modal if open
        const authModal = document.getElementById("authModal");
        if (authModal) authModal.style.display = "none";

        // Show SkinFolio modal
        skinfolioModal.classList.remove("hidden");
        skinfolioModal.style.display = "flex";
    });
}

// Close with X button
if (skinfolioCloseBtn && skinfolioModal) {
    skinfolioCloseBtn.addEventListener("click", () => {
        skinfolioModal.classList.add("hidden");
        skinfolioModal.style.display = "none";
    });
}

// Logout button
if (skinfolioLogout && skinfolioModal) {
    skinfolioLogout.addEventListener("click", () => {
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("skin_type");

        // Hide modal
        skinfolioModal.classList.add("hidden");
        skinfolioModal.style.display = "none";

        alert("You have been logged out.");

        // Show home page
        hideAllSections();
        const homePage = document.getElementById("homePage");
        if (homePage) homePage.style.display = "flex";

        // Update floating icons
        updateIconVisibility();
    });
}

// ===================== SkinTell Skincare JS =====================
// ---------------- Global Variables ----------------
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartCountElement = document.getElementById('cartCount');
const cartNav = document.getElementById('navCart');
const cartPage = document.getElementById('cartPage');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutPage = document.getElementById('checkoutPage');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');

// New About Us elements
const navAbout = document.getElementById('navAbout');
const aboutPage = document.getElementById('aboutPage');

// Modal
const confirmationModal = document.getElementById('confirmationModal');
const confirmationMessage = document.getElementById('confirmationMessage');

// ---------------- Utility Functions ----------------
function updateCartCount() {
    if (cartCountElement) {
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCountElement.textContent = count > 0 ? `(${count})` : '';
    }
}
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}
function showConfirmationMessage(message) {
    if (confirmationModal && confirmationMessage) {
        confirmationMessage.textContent = message;
        confirmationModal.style.display = 'flex';
        setTimeout(() => { confirmationModal.style.display = 'none'; }, 3000);
    }
}

// ---------------- Cart Functions ----------------
function addToCart(product) {
    if (!product.quantity) product.quantity = 1;
    cart.push(product);
    saveCart();
    showConfirmationMessage(`🎉 ${product.name} has been added to your cart! 🎉`);
}
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
    showConfirmationMessage("🗑️ Item removed from cart.");
}
function calculateTotal() {
    if (cartTotalElement) {
        const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
        cartTotalElement.textContent = `₹${total.toFixed(2)}`;
    }
}
function renderCart() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #888;">Your cart is empty.</p>';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
    } else {
        cart.forEach((item, index) => {
            const cartItemHTML = `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <p class="product-name">${item.name}</p>
                        <p class="product-brand">${item.brand}</p>
                        <p class="product-price">₹${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                    </div>
                    <button class="remove-item-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItemHTML;
        });
        if (checkoutBtn) checkoutBtn.style.display = 'block';
    }
    calculateTotal();
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.currentTarget.dataset.index;
            if (index !== undefined) removeFromCart(index);
        });
    });
}

// ---------------- Navigation ----------------
if (cartNav) {
    cartNav.addEventListener('click', () => {
        hideAllSections();
        if (cartPage) cartPage.style.display = 'flex';
        renderCart();
        updateIconVisibility();
    });
}
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        hideAllSections();
        if (checkoutPage) checkoutPage.style.display = 'flex';
        updateIconVisibility();
    });
}
if (navAbout) {
    navAbout.addEventListener('click', () => {
        hideAllSections();
        if (aboutPage) aboutPage.style.display = 'flex';
        updateIconVisibility();
    });
}

// ---------------- Hide/Show Pages ----------------
function hideAllSections() {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    updateIconVisibility();
}
// ---------------- Email OTP + Phone Validation ----------------
let otpVerified = false;

const sendOtpBtn = document.getElementById("send-otp-btn");
const verifyOtpBtn = document.getElementById("verify-otp-btn");
const otpMessage = document.getElementById("otp-message");
const verifyOtpDiv = document.getElementById("verify-otp-div");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

if (confirmOrderBtn) confirmOrderBtn.disabled = true;

if (sendOtpBtn) {
  sendOtpBtn.addEventListener("click", () => {
    let email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    email = email.replace(/\s+/g, '');

    if (!phone) { otpMessage.style.color = "red"; otpMessage.innerText = "Please enter your phone number."; return; }
    if (!email) { otpMessage.style.color = "red"; otpMessage.innerText = "Please enter your email."; return; }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(email)) { otpMessage.style.color = "red"; otpMessage.innerText = "Invalid email format."; return; }

    fetch("http://127.0.0.1:5000/send_email_otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        otpMessage.style.color = data.status === "success" ? "green" : "red";
        otpMessage.innerText = data.message;
        if (data.status === "success") verifyOtpDiv.style.display = "block";
      })
      .catch(err => { otpMessage.style.color = "red"; otpMessage.innerText = "Failed to send OTP."; console.error(err); });
  });
}

if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", () => {
    const otp = document.getElementById("otp").value.trim();
    if (!otp) { otpMessage.style.color = "red"; otpMessage.innerText = "Please enter the OTP."; return; }

    fetch("http://127.0.0.1:5000/verify_email_otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ otp })
    })
      .then(res => res.json())
      .then(data => {
        otpMessage.style.color = data.status === "success" ? "green" : "red";
        otpMessage.innerText = data.message;
        if (data.status === "success") { otpVerified = true; if (confirmOrderBtn) confirmOrderBtn.disabled = false; showConfirmationMessage("✅ OTP verified! You can now confirm your order."); }
      })
      .catch(err => { otpMessage.style.color = "red"; otpMessage.innerText = "Failed to verify OTP."; console.error(err); });
  });
}

// ---------------- Confirm Order & Send to Backend ----------------
if (confirmOrderBtn) {
  confirmOrderBtn.addEventListener('click', async () => {
    if (!otpVerified) { showConfirmationMessage("⚠️ Please verify your email with OTP before confirming the order."); return; }

    const customerName = document.getElementById('name').value.trim();
    const customerAddress = document.getElementById('address').value.trim();
    const phoneNumber = document.getElementById('phone').value.trim();
    const paymentMethod = document.getElementById('payment-method').value.trim();
    const email = emailInput.value.trim().replace(/\s+/g, '');
    
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    if (!customerName || !customerAddress || !phoneNumber || !paymentMethod || !email) { showConfirmationMessage('⚠️ Please fill out all the fields to confirm your order.'); return; }
    if (cartItems.length === 0) { showConfirmationMessage('⚠️ Your cart is empty.'); return; }

    try {
      // ---------------- Save phone number ----------------
      const phoneResp = await fetch("http://127.0.0.1:5000/auth/update_phone_number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone_number: phoneNumber })
      });
      const phoneResult = await phoneResp.json();
      if (!phoneResp.ok) console.error("Failed to update phone number:", phoneResult);

      // ---------------- POST order with cart items ----------------
      const totalPrice = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
      const orderResp = await fetch("http://127.0.0.1:5000/orders/create_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          customer_name: customerName,
          email,
          phone_number: phoneNumber,
          delivery_address: customerAddress,
          total_price: totalPrice,
          payment_method: paymentMethod,
          payment_status: "Paid",
          cart_items: cartItems.map(item => ({ name: item.name, brand: item.brand, quantity: item.quantity || 1, price: item.price }))
        })
      });

      const orderResult = await orderResp.json();
      if (!orderResp.ok) { console.error("Failed to create order:", orderResult); showConfirmationMessage("❌ Failed to create order. Please try again."); return; }

      console.log("Order created successfully:", orderResult);
      showConfirmationMessage('🎉 Payment Successful! Generating Invoice... 🎉');
      showInvoice(customerName, customerAddress, phoneNumber, cartItems);

      // Clear cart
      cart = [];
      saveCart();

    } catch (err) { console.error("Error processing order:", err); showConfirmationMessage("❌ An error occurred while processing your order. Please try again."); }
  });
}

// ---------------- Invoice Feature ----------------
function showInvoice(customerName, customerAddress, customerPhone, cartItems) {
    hideAllSections();
    const invoicePage = document.getElementById('invoicePage');
    invoicePage.style.display = 'flex';

    // Fill customer details
    document.getElementById('invoiceCustomerName').textContent = customerName || "N/A";
    document.getElementById('invoiceCustomerAddress').textContent = customerAddress || "N/A";
    const phoneSpan = document.getElementById('invoiceCustomerPhone');
    if (phoneSpan) phoneSpan.textContent = customerPhone || "N/A";

    // Fill date & invoice ID
    const today = new Date();
    document.getElementById('invoiceDate').textContent = today.toLocaleDateString();
    document.getElementById('invoiceId').textContent = 'INV-' + Date.now();

    // Fill cart items
    const invoiceItems = document.getElementById('invoiceItems');
    invoiceItems.innerHTML = '';
    let total = 0;
    if (cartItems && cartItems.length > 0) {
        cartItems.forEach(item => {
            if (!item.quantity) item.quantity = 1;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.brand}</td>
                <td>${item.quantity}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
            `;
            invoiceItems.appendChild(row);
            total += item.price * item.quantity;
        });
    }
    document.getElementById('invoiceTotal').textContent = total.toFixed(2);

    // Back button
    document.getElementById('backToHomeFromInvoice').onclick = () => {
        invoicePage.style.display = 'none';
        document.getElementById('homePage').style.display = 'flex';
        updateIconVisibility(); // Make icons visible again
    };
}

// ---------------- Download Invoice PDF ----------------
const downloadBtn = document.getElementById('downloadInvoiceBtn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert("PDF library not loaded. Please check jsPDF script include.");
            return;
        }
        const doc = new window.jspdf.jsPDF();

        doc.setFontSize(20);
        doc.setTextColor('#ff80ab');
        doc.text('🌸 SkinTell Skincare - Invoice', 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Name: ${document.getElementById('invoiceCustomerName').textContent}`, 20, 35);
        doc.text(`Address: ${document.getElementById('invoiceCustomerAddress').textContent}`, 20, 45);
        doc.text(`Phone: ${document.getElementById('invoiceCustomerPhone')?.textContent || ""}`, 20, 55);
        doc.text(`Date: ${document.getElementById('invoiceDate').textContent}`, 150, 35);
        doc.text(`Invoice ID: ${document.getElementById('invoiceId').textContent}`, 150, 45);

        // Table header
        doc.setFillColor(240, 248, 255);
        doc.rect(20, 65, 170, 10, 'F');
        doc.setTextColor(77, 166, 255);
        doc.text('Product', 25, 72);
        doc.text('Brand', 70, 72);
        doc.text('Qty', 120, 72);
        doc.text('Price (₹)', 150, 72);

        // Table rows
        let y = 82;
        let total = 0;
        const invoiceRows = Array.from(document.querySelectorAll('#invoiceItems tr')).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                name: cells[0].textContent,
                brand: cells[1].textContent,
                qty: cells[2].textContent,
                price: cells[3].textContent
            };
        });
        doc.setTextColor(0, 0, 0);
        invoiceRows.forEach(item => {
            doc.text(item.name, 25, y);
            doc.text(item.brand, 70, y);
            doc.text(item.qty, 120, y);
            doc.text(item.price, 150, y);
            y += 10;
            total += parseFloat(item.price);
        });

        // Total
        doc.setFontSize(14);
        doc.text(`Total: ₹${total.toFixed(2)}`, 140, y + 10);

        // Footer
        doc.setFontSize(12);
        doc.setTextColor(102, 102, 102);
        doc.text('💖 Thank you for shopping with SkinTell Skincare!', 20, y + 25);

        doc.save(`invoice_${document.getElementById('invoiceId').textContent}.pdf`);
    });
}

// ---------------- Payment Method Toggle ----------------
const paymentMethodSelect = document.getElementById('payment-method');
if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener('change', (e) => {
        const paymentDetails = document.getElementById('paymentDetails');
        if (paymentDetails) paymentDetails.style.display = e.target.value === 'card' ? 'block' : 'none';
    });
}
// ---------------- Modal Close ----------------
if (typeof confirmationModal !== "undefined" && confirmationModal) {
    const closeBtn = confirmationModal.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => confirmationModal.style.display = 'none');
}
// ---------------- Initialize ----------------
updateCartCount();
renderCart();
// ===================== ELEMENTS =====================
const trackerSection = document.getElementById('trackerSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const selfieInput = document.getElementById('selfieInput');
const selfiePreviewContainer = document.getElementById('selfiePreview');
const newTaskInput = document.getElementById('newTaskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const viewGalleryBtn = document.getElementById('viewGalleryBtn');
const gallerySection = document.getElementById('gallerySection');
const hideGalleryBtn = document.getElementById('hideGalleryBtn');
const galleryContainer = document.getElementById('galleryContainer');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const captionText = document.getElementById('caption');
const modalCloseBtn = document.querySelector('.modal-close-btn');
const navTracker = document.getElementById("navTracker");
const saveTrackerBtn = document.getElementById("saveTrackerBtn");
const toast = document.getElementById("toast"); // <-- Toast element

// ===================== HELPERS =====================
function getCurrentUsername() { return localStorage.getItem("username") || null; }
function getUserSkinPhotosKey() { return `skinPhotos_${getCurrentUsername()}`; }
function getUserTasksKey() { return `tasks_${getCurrentUsername()}`; }
function getUserHabitsKey() { return `habits_${getCurrentUsername()}`; }
function getUserProgressKey() { return `progress_${getCurrentUsername()}`; }

function updateProgress() {
    const allCheckboxes = document.querySelectorAll('.tracker-card input[type="checkbox"], .additional-task input[type="checkbox"]');
    const completed = document.querySelectorAll('.tracker-card input[type="checkbox"]:checked, .additional-task input[type="checkbox"]:checked').length;
    const total = allCheckboxes.length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}% Completed`;
    if (getCurrentUsername()) localStorage.setItem(getUserProgressKey(), percent);
}

document.addEventListener("change", (e) => {
    if (e.target.matches('.tracker-card input[type="checkbox"], .additional-task input[type="checkbox"]')) {
        updateProgress();
    }
});

// ===================== SELFIE FUNCTIONS =====================
function renderSelfies() {
    const username = getCurrentUsername();
    if (!username || !selfiePreviewContainer) return;
    const skinPhotos = JSON.parse(localStorage.getItem(getUserSkinPhotosKey())) || [];
    selfiePreviewContainer.innerHTML = '';

    skinPhotos.forEach(photo => {
        const wrapper = document.createElement('div');
        wrapper.className = 'selfie-wrapper';

        const img = document.createElement('img');
        img.src = photo.data;
        img.alt = `Selfie - Day ${photo.day}`;
        img.style.width = '150px';
        img.style.height = '150px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-selfie-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', () => {
            const index = skinPhotos.findIndex(p => p.timestamp === photo.timestamp);
            if (index > -1) {
                skinPhotos.splice(index, 1);
                localStorage.setItem(getUserSkinPhotosKey(), JSON.stringify(skinPhotos));
                renderSelfies();
                loadGallery();
                updateProgress();
            }
        });

        wrapper.appendChild(img);
        wrapper.appendChild(deleteBtn);
        selfiePreviewContainer.appendChild(wrapper);
    });
}

function loadGallery() {
    const username = getCurrentUsername();
    if (!username || !galleryContainer) return;
    const skinPhotos = JSON.parse(localStorage.getItem(getUserSkinPhotosKey())) || [];
    galleryContainer.innerHTML = '';

    skinPhotos.forEach(photo => {
        const wrapper = document.createElement('div');
        wrapper.className = 'selfie-wrapper';

        const img = document.createElement('img');
        img.src = photo.data;
        img.alt = `Selfie - Day ${photo.day}`;
        img.className = 'gallery-image';
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            if (imageModal && modalImage && captionText) {
                imageModal.style.display = 'flex';
                modalImage.src = img.src;
                captionText.textContent = img.alt;
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-selfie-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', () => {
            const index = skinPhotos.findIndex(p => p.timestamp === photo.timestamp);
            if (index > -1) {
                skinPhotos.splice(index, 1);
                localStorage.setItem(getUserSkinPhotosKey(), JSON.stringify(skinPhotos));
                loadGallery();
                renderSelfies();
                updateProgress();
            }
        });

        wrapper.appendChild(img);
        wrapper.appendChild(deleteBtn);
        galleryContainer.appendChild(wrapper);
    });
}

// ===================== SELFIE UPLOAD =====================
if (selfieInput) {
    selfieInput.addEventListener('change', function () {
        const username = getCurrentUsername();
        if (!username) { alert("Please login first!"); return; }

        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const maxSize = 300;
                let width = img.width;
                let height = img.height;
                if (width > height && width > maxSize) { height *= maxSize / width; width = maxSize; }
                else if (height > width && height > maxSize) { width *= maxSize / height; height = maxSize; }
                else if (width > maxSize) { width = height = maxSize; }

                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                const skinPhotos = JSON.parse(localStorage.getItem(getUserSkinPhotosKey())) || [];
                const today = new Date();
                const newPhoto = { data: dataUrl, timestamp: today.getTime(), day: skinPhotos.length + 1 };
                skinPhotos.push(newPhoto);
                localStorage.setItem(getUserSkinPhotosKey(), JSON.stringify(skinPhotos));
                renderSelfies();
                loadGallery();
                updateProgress();
            }
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ===================== TASKS =====================
if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
        const username = getCurrentUsername();
        if (!username) { alert("Please login first!"); return; }

        const taskText = newTaskInput.value.trim();
        if (!taskText) return;

        const taskItem = document.createElement('li');
        taskItem.className = 'additional-task';
        taskItem.innerHTML = `
            <input type="checkbox" class="habit-checkbox" data-habit="${taskText}"> ${taskText}
            <button class="remove-task-btn">x</button>
        `;
        taskList.appendChild(taskItem);
        const cb = taskItem.querySelector('input[type="checkbox"]');
        cb.addEventListener('change', updateProgress);
        const removeButton = taskItem.querySelector('.remove-task-btn');
        removeButton.addEventListener('click', () => { taskItem.remove(); updateProgress(); });

        newTaskInput.value = '';
        updateProgress();
    });
}

// ===================== NAVIGATION =====================
if (navTracker) {
    navTracker.addEventListener("click", async () => {
        hideAllSections();
        if (trackerSection) trackerSection.style.display = "flex";

        const username = getCurrentUsername();
        if (!username) return;

        try {
            const response = await fetch(`http://127.0.0.1:5000/tracker/tracker/${username}`);
            const result = await response.json();

            if (result.status === "success" && result.data.length > 0) {
                const latest = result.data[0];

                if (latest.habits) {
                    for (const [habit, checked] of Object.entries(latest.habits)) {
                        const cb = document.querySelector(`.tracker-card input[data-habit="${habit}"]`);
                        if (cb) cb.checked = checked;
                    }
                    localStorage.setItem(getUserHabitsKey(), JSON.stringify(latest.habits));
                }

                if (latest.tasks) {
                    taskList.innerHTML = '';
                    latest.tasks.forEach(task => {
                        const taskItem = document.createElement('li');
                        taskItem.className = 'additional-task';
                        taskItem.innerHTML = `
                            <input type="checkbox" class="habit-checkbox" data-habit="${task.task}" ${task.completed ? 'checked' : ''}> ${task.task}
                            <button class="remove-task-btn">x</button>
                        `;
                        taskList.appendChild(taskItem);
                        const cb = taskItem.querySelector('input[type="checkbox"]');
                        cb.addEventListener('change', updateProgress);
                        const removeButton = taskItem.querySelector('.remove-task-btn');
                        removeButton.addEventListener('click', () => { taskItem.remove(); updateProgress(); });
                    });
                    localStorage.setItem(getUserTasksKey(), JSON.stringify(latest.tasks));
                }

                if (latest.selfies) {
                    localStorage.setItem(getUserSkinPhotosKey(), JSON.stringify(latest.selfies));
                    renderSelfies();
                    loadGallery();
                }

                if (progressFill) progressFill.style.width = `${latest.progress_percentage || 0}%`;
                if (progressText) progressText.textContent = `${latest.progress_percentage || 0}% Completed`;
                localStorage.setItem(getUserProgressKey(), latest.progress_percentage || 0);
            }
        } catch (err) { console.error("Error fetching tracker data:", err); }

        updateProgress();
    });
}

// ===================== GALLERY NAV =====================
if (viewGalleryBtn) viewGalleryBtn.addEventListener('click', () => { if (gallerySection) gallerySection.style.display = 'block'; loadGallery(); });
if (hideGalleryBtn) hideGalleryBtn.addEventListener('click', () => { if (gallerySection) gallerySection.style.display = 'none'; });
if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => { if (imageModal) imageModal.style.display = 'none'; });

// ===================== SAVE TRACKER =====================
if (saveTrackerBtn) {
    saveTrackerBtn.addEventListener('click', async () => {
        const username = getCurrentUsername();
        if (!username) { alert("Please login first!"); return; }

        const habits = {};
        document.querySelectorAll('.tracker-card input[type="checkbox"]').forEach(cb => { if(cb.dataset.habit) habits[cb.dataset.habit] = cb.checked; });

        const tasks = [];
        document.querySelectorAll('.additional-task').forEach(taskEl => {
            const cb = taskEl.querySelector('input[type="checkbox"]');
            const taskText = cb.dataset.habit;
            if (taskText) tasks.push({ task: taskText, completed: cb.checked });
        });

        const progress = progressFill ? parseInt(progressFill.style.width.replace('%','')) : 0;
        const skinPhotos = JSON.parse(localStorage.getItem(getUserSkinPhotosKey())) || [];
        const selfies = skinPhotos.map(photo => ({ data: photo.data, day: photo.day, timestamp: photo.timestamp || Date.now() }));

        try {
            const saveRes = await fetch('http://127.0.0.1:5000/tracker/tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, selfies, habits, tasks, progress_percentage: progress })
            });
            const saveResult = await saveRes.json();
            if (saveRes.ok && saveResult.status==="success") {
                // === Toast popup added here ===
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            } else {
                alert("Error saving tracker: "+(saveResult.message||"Unknown error"));
            }
        } catch (err) {
            console.error("Save tracker failed:", err);
            alert("Error saving tracker. Please try again.");
        }
    });
}

// ===================== INITIAL LOAD =====================
const initialUsername = getCurrentUsername();
if (initialUsername) {
    updateProgress();
    renderSelfies();
    loadGallery();
} else {
    if (selfiePreviewContainer) selfiePreviewContainer.innerHTML = '';
    if (galleryContainer) galleryContainer.innerHTML = '';
    if (taskList) taskList.innerHTML = '';
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = '0% Completed';
}


const navDiary = document.getElementById('navDiary');
const diaryPage = document.getElementById('diaryPage');
const closeDiaryBtn = document.getElementById('closeDiaryBtn');
const diaryInput = document.getElementById('diaryInput');
const saveDiaryBtn = document.getElementById('saveDiaryBtn');
const diaryEntriesContainer = document.getElementById('diaryEntriesContainer');

// Helper: get current user diary key
function getDiaryKey() {
    const username = localStorage.getItem('username');
    if (!username) return null;
    return `diary_${username}`;
}

// Open diary from hamburger menu
if(navDiary) {
    navDiary.addEventListener('click', () => {
        hideAllSections();
        diaryPage.style.display = 'flex';
        loadDiaryEntries();
    });
}

// Close diary
if(closeDiaryBtn) {
    closeDiaryBtn.addEventListener('click', () => {
        diaryPage.style.display = 'none';
    });
}

// Save diary entry
if(saveDiaryBtn) {
    saveDiaryBtn.addEventListener('click', () => {
        const text = diaryInput.value.trim();
        const diaryKey = getDiaryKey();
        if (!diaryKey) { alert("Please login first!"); return; }

        if(text) {
            const diaryData = JSON.parse(localStorage.getItem(diaryKey)) || [];
            const entry = {
                text: text,
                timestamp: new Date().getTime()
            };
            diaryData.push(entry);
            localStorage.setItem(diaryKey, JSON.stringify(diaryData));
            diaryInput.value = '';
            loadDiaryEntries();
        }
    });
}

// Load diary entries
function loadDiaryEntries() {
    const diaryKey = getDiaryKey();
    if (!diaryKey) {
        diaryEntriesContainer.innerHTML = '<p>Please login to see your diary entries.</p>';
        return;
    }

    const diaryData = JSON.parse(localStorage.getItem(diaryKey)) || [];
    diaryEntriesContainer.innerHTML = '';

    diaryData.slice().reverse().forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'diary-entry';
        const date = new Date(entry.timestamp);
        div.innerHTML = `
            <b>${date.toLocaleString()}</b><br>${entry.text}
            <button class="delete-entry-btn" data-index="${index}">🗑️</button>
        `;
        diaryEntriesContainer.appendChild(div);
    });

    const deleteButtons = diaryEntriesContainer.querySelectorAll('.delete-entry-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.getAttribute('data-index');
            const diaryData = JSON.parse(localStorage.getItem(diaryKey)) || [];
            diaryData.splice(diaryData.length - 1 - idx, 1);
            localStorage.setItem(diaryKey, JSON.stringify(diaryData));
            loadDiaryEntries();
        });
    });
}

// ---------------- Hide All Sections ----------------
function hideAllSections() {
    const sections = [
        document.querySelector(".hero"),
        document.getElementById("page3"),
        document.getElementById("homePage"),
        document.getElementById("productPage"),
        document.getElementById("trackerSection"),
        document.getElementById("cartPage"),
        document.getElementById("checkoutPage"),
        document.getElementById("contactUsSection"),
        document.getElementById("diaryPage"),
        document.getElementById("aboutUsSection")
    ];
    sections.forEach(section => {
        if (section) {
            section.style.display = "none";
            section.classList.remove("show");
        }
    });
}
// ---------------- Hamburger Menu Navigation ----------------
const navElements = {
    navHome: 'homePage',
    navProducts: 'productPage',
    navCart: 'cartPage',
    navTracker: 'trackerSection',
    navContact: 'contactUsSection',
    navDiary: 'diaryPage',
    navAbout: 'aboutUsSection'
};

const floatingIcons = document.querySelectorAll(".floating-icons"); // first page icons
Object.keys(navElements).forEach(navId => {
    const navEl = document.getElementById(navId);
    const sectionId = navElements[navId];
    if (navEl) {
        navEl.addEventListener('click', () => {
            hideAllSections();

            // Show floating icons only on Home page and Tracker page
            if (floatingIcons) {
                floatingIcons.forEach(icon => {
                    if (sectionId === 'homePage' || sectionId === 'trackerSection') {
                        icon.style.display = 'flex';
                    } else {
                        icon.style.display = 'none';
                    }
                });
            }

            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = (sectionId === 'productPage' || sectionId === 'contactUsSection' || sectionId === 'aboutUsSection') ? 'block' : 'flex';
                if (sectionId === 'cartPage') renderCart();
            }
        });
    }
});

// ===================== LOGIN ICON OPEN MODAL =====================
const loginIcon = document.getElementById("loginSignupIcon");
const authModal = document.getElementById("authModal");

if (loginIcon && authModal) {
    loginIcon.addEventListener("click", () => {
        authModal.style.display = "block";
    });
}




