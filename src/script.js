//Config Tailwind 
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                navy: {
                    800: '#1e3a8a',
                    900: '#1e1b4b',
                    950: '#0f172a',
                },
                bluebrand: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                }
            }
        }
    }
}


// Initialize Lucide icons
lucide.createIcons();

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Track last submission timestamp for Client-side Rate-limiting (Cooldown: 30s)
let lastSubmissionTime = 0;

// Update character counter for textarea with strict length validation
function updateCharCount(textarea) {
    const maxLength = parseInt(textarea.getAttribute('maxlength')) || 500;
    if (textarea.value.length > maxLength) {
        textarea.value = textarea.value.substring(0, maxLength);
    }
    const currentLength = textarea.value.length;
    const counter = document.getElementById('char-counter');
    if (counter) {
        counter.textContent = `${currentLength} / ${maxLength} caracteres`;
        if (currentLength >= maxLength) {
            counter.classList.remove('text-slate-500');
            counter.classList.add('text-red-500', 'font-bold');
        } else {
            counter.classList.remove('text-red-500', 'font-bold');
            counter.classList.add('text-slate-500');
        }
    }
}

// HTML Entity Encoding to prevent DOM-based XSS when processing input
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Hardened contact & quote submission handler with rate-limiting, honeypot, and strict validations
function handleSecureContactSubmit(event) {
    event.preventDefault();

    // 1. Rate Limiting Check (Prevent spam submissions)
    const now = Date.now();
    const cooldownMs = 30000; // 30 seconds
    if (now - lastSubmissionTime < cooldownMs) {
        const remainingSecs = Math.ceil((cooldownMs - (now - lastSubmissionTime)) / 1000);
        showModal("Límite de Envíos", `Por razones de seguridad, espere ${remainingSecs} segundos antes de enviar otra solicitud.`, "error");
        return;
    }

    // 2. Check Honeypot Anti-Bot Field
    const honeypot = document.getElementById('website_hp');
    if (honeypot && honeypot.value.trim() !== "") {
        console.warn("Acceso no autorizado detectado (Bot anti-spam).");
        document.getElementById('contact-form').reset();
        return;
    }

    // 3. Retrieve raw input values
    const rawNombre = document.getElementById('form-nombre').value.trim();
    const rawTelefono = document.getElementById('form-telefono').value.trim();
    const rawEmail = document.getElementById('form-email').value.trim();
    const rawCondominio = document.getElementById('form-condominio').value.trim();
    const rawMensaje = document.getElementById('message-input').value.trim();

    // 4. Check Required Fields
    if (!rawNombre || !rawTelefono || !rawEmail || !rawCondominio || !rawMensaje) {
        showModal("Campos Incompletos", "Por favor complete todos los campos obligatorios del formulario.", "error");
        return;
    }

    // 5. Strict Validations
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'.-]{2,100}$/;
    if (!nameRegex.test(rawNombre)) {
        showModal("Error en Nombre", "Por favor ingrese un nombre válido (sin caracteres especiales).", "error");
        document.getElementById('form-nombre').focus();
        return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(rawEmail) || /[\r\n]/.test(rawEmail)) {
        showModal("Correo Inválido", "Por favor, ingrese una dirección de correo electrónico válida.", "error");
        document.getElementById('form-email').focus();
        return;
    }

    const phoneRegex = /^[\+]?[(]?[0-9]{3,4}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(rawTelefono)) {
        showModal("Teléfono Inválido", "Por favor, ingrese un número de teléfono de contacto válido.", "error");
        document.getElementById('form-telefono').focus();
        return;
    }

    // 6. Length Constraints Check
    if (rawNombre.length > 100 || rawCondominio.length > 120 || rawMensaje.length > 500) {
        showModal("Exceso de Caracteres", "Uno de los campos supera la longitud máxima permitida.", "error");
        return;
    }

    // 7. Secure Sanitized Payload
    const safeData = {
        nombre: sanitizeInput(rawNombre),
        telefono: sanitizeInput(rawTelefono),
        email: sanitizeInput(rawEmail),
        condominio: sanitizeInput(rawCondominio),
        mensaje: sanitizeInput(rawMensaje),
        submittedAt: new Date().toISOString()
    };

    lastSubmissionTime = Date.now();
    console.log("Payload sanitizado e inspeccionado correctamente:", safeData);

    showModal("¡Solicitud Enviada!", "Gracias por contactar a Serviduroc C.A. Su mensaje ha sido validado correctamente. Nos pondremos en contacto con su Junta de Condominio a la brevedad.", "success");
    
    document.getElementById('contact-form').reset();
    const counter = document.getElementById('char-counter');
    if (counter) {
        counter.textContent = "0 / 500 caracteres";
        counter.classList.remove('text-red-500', 'font-bold');
        counter.classList.add('text-slate-500');
    }
}

// Modal functions using secure textContent
function showModal(title, text, type) {
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalIcon = document.getElementById('modal-icon');

    if (modalTitle) modalTitle.textContent = title;
    if (modalText) modalText.textContent = text;
    
    if (modalIcon) {
        if (type === 'error') {
            modalIcon.className = "w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto";
            modalIcon.innerHTML = `<i data-lucide="alert-circle" class="w-8 h-8"></i>`;
        } else {
            modalIcon.className = "w-16 h-16 bg-bluebrand-100 text-bluebrand-600 rounded-full flex items-center justify-center mx-auto";
            modalIcon.innerHTML = `<i data-lucide="check-circle" class="w-8 h-8"></i>`;
        }
        lucide.createIcons();
    }

    const modal = document.getElementById('custom-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('custom-modal');
    if (modal) modal.classList.add('hidden');
}