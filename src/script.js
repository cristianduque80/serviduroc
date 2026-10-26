// Tailwind Extended Color Configuration
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
};

// Initialize Lucide Icons
lucide.createIcons();

// Mobile Navigation Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Textarea Character Counter
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

// Input Sanitization for XSS Prevention
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

// Global variable for rate limiting
let lastSubmissionTime = 0;

// Web3Forms Asynchronous Submission Handler
async function handleSecureContactSubmit(event) {
    event.preventDefault();

    // 1. Rate Limiting Check (30s Cooldown)
    const now = Date.now();
    const cooldownMs = 30000;
    if (now - lastSubmissionTime < cooldownMs) {
        const remainingSecs = Math.ceil((cooldownMs - (now - lastSubmissionTime)) / 1000);
        showModal("Límite de Envíos", `Por razones de seguridad, espere ${remainingSecs} segundos antes de enviar otra solicitud.`, "error");
        return;
    }

    // 2. Honeypot Check
    const honeypot = document.getElementById('website_hp');
    if (honeypot && honeypot.value.trim() !== "") {
        console.warn("Bot anti-spam detectado.");
        document.getElementById('contact-form').reset();
        return;
    }

    // 3. Extract Raw Field Values
    const rawNombre = document.getElementById('form-nombre').value.trim();
    const rawTelefono = document.getElementById('form-telefono').value.trim();
    const rawEmail = document.getElementById('form-email').value.trim();
    const rawCondominio = document.getElementById('form-condominio').value.trim();
    const rawMensaje = document.getElementById('message-input').value.trim();

    // 4. Required Field Checks
    if (!rawNombre || !rawTelefono || !rawEmail || !rawCondominio || !rawMensaje) {
        showModal("Campos Incompletos", "Por favor complete todos los campos obligatorios del formulario.", "error");
        return;
    }

    // 5. Regex Validation
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

    // UI Loading State
    const submitBtn = document.getElementById('submit-btn');
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Enviando...`;
    lucide.createIcons();

    try {
        const form = document.getElementById('contact-form');
        const formData = new FormData(form);

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            lastSubmissionTime = Date.now();
            showModal("¡Solicitud Enviada!", "Gracias por contactar a Serviduroc C.A. Su mensaje ha sido enviado exitosamente. Nos pondremos en contacto a la brevedad.", "success");
            
            form.reset();
            const counter = document.getElementById('char-counter');
            if (counter) {
                counter.textContent = "0 / 500 caracteres";
                counter.classList.remove('text-red-500', 'font-bold');
                counter.classList.add('text-slate-500');
            }
        } else {
            showModal("Error al Enviar", result.message || "Ocurrió un error al procesar el envío. Por favor intente nuevamente.", "error");
        }
    } catch (error) {
        console.error("Error Web3Forms:", error);
        showModal("Error de Conexión", "No se pudo conectar con el servidor. Verifique su conexión a internet e intente más tarde.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        lucide.createIcons();
    }
}

// Custom Modal Handler
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