document.addEventListener('DOMContentLoaded', () => {
    
    // --- State & Selectors ---
    const itemsContainer = document.getElementById('items-container');
    const template = document.getElementById('item-row-template');
    const addItemBtn = document.getElementById('add-item-btn');
    const downloadBtn = document.getElementById('download-btn');
    const taxInput = document.getElementById('tax-rate');
    const themeColorInput = document.getElementById('theme-color');
    const logoDropzone = document.getElementById('logo-dropzone');
    const logoInput = document.getElementById('logo-upload');
    const logoImg = document.getElementById('company-logo');
    const logoPlaceholder = document.querySelector('.logo-placeholder');

    // --- Init ---
    // Add one empty row by default
    addItem();
    updateDate();

    // --- Events ---
    addItemBtn.addEventListener('click', addItem);
    
    itemsContainer.addEventListener('input', (e) => {
        if (e.target.matches('.qty-input') || e.target.matches('.price-input')) {
            updateRowTotal(e.target.closest('.item-row'));
            updateGrandTotals();
        }
    });

    itemsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.delete-row-btn')) {
            const row = e.target.closest('.item-row');
            // Don't remove the last row if it's the only one, maybe? 
            // Better to allow empty state or keep one. Let's allow clearing info but maybe keep one row or allow empty.
            // If we remove logic, we just remove.
            row.remove();
            updateGrandTotals();
        }
    });

    taxInput.addEventListener('input', updateGrandTotals);

    // Theme Color
    themeColorInput.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--primary', e.target.value);
        // Also update a darker variant for hover
        // Simple hex darkened logic or just basic opacity?
        // For simplicity, we just keep primary.
    });

    // Logo Upload
    logoDropzone.addEventListener('click', () => logoInput.click());
    logoInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                logoImg.src = e.target.result;
                logoImg.classList.remove('hidden');
                logoPlaceholder.style.display = 'none';
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Download PDF
    downloadBtn.addEventListener('click', generatePDF);


    // --- Functions ---

    function updateDate() {
        const dateInput = document.getElementById('invoice-date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    function addItem() {
        const clone = template.content.cloneNode(true);
        itemsContainer.appendChild(clone);
    }

    function updateRowTotal(row) {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const total = qty * price;
        row.querySelector('.row-total').textContent = formatCurrency(total);
        row.dataset.total = total; // Store raw value
    }

    function updateGrandTotals() {
        const rows = document.querySelectorAll('.item-row');
        let subtotal = 0;

        rows.forEach(row => {
            const rowTotal = parseFloat(row.dataset.total) || 0;
            subtotal += rowTotal;
        });

        const taxRate = parseFloat(taxInput.value) || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const grandTotal = subtotal + taxAmount;

        document.getElementById('subtotal-display').textContent = formatCurrency(subtotal);
        document.getElementById('tax-display').textContent = formatCurrency(taxAmount);
        document.getElementById('total-display').textContent = formatCurrency(grandTotal);
    }

    function formatCurrency(num) {
        return '$' + num.toFixed(2);
    }

    function generatePDF() {
        const element = document.getElementById('invoice-paper');
        
        // Add a class to handle print styles specifically if needed
        document.body.classList.add('pdf-mode');

        const opt = {
            margin:       0,
            filename:     'presupuesto.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Temporary hide action buttons manually if CSS fails
        const actions = element.querySelectorAll('.col-action');
        actions.forEach(el => el.style.opacity = '0');

        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                // Cleanup
                document.body.classList.remove('pdf-mode');
                actions.forEach(el => el.style.opacity = '');
            });
    }

});
