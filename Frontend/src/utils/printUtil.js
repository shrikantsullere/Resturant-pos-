/**
 * Universal Print Utility
 * Optimized for Thermal POS Printing (80mm) and A4 Manifests
 */
let isPrinting = false;

export const printContent = (elementId = 'printable-area', paperSize = 'thermal') => {
  if (isPrinting) {
    console.warn('[PrintUtil] Print already in progress, ignoring request.');
    return;
  }
  isPrinting = true;

  const source = document.getElementById(elementId) 
    || document.querySelector(`.${elementId}`)
    || document.querySelector('.printable-area')
    || document.querySelector('.print-section');

  if (!source) {
    console.warn('[PrintUtil] No printable element found for:', elementId);
    window.print(); // fallback
    isPrinting = false;
    return;
  }

  // Create a hidden iframe for clean, isolated printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = paperSize === 'thermal' ? '80mm' : '210mm'; 
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;

  const isA4 = paperSize === 'A4';

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title></title>
      <style>
        /* ===== Universal Print CSS ===== */
        @page { 
          size: ${isA4 ? 'A4 portrait' : '80mm auto'}; 
          margin: ${isA4 ? '10mm' : '0'} !important; 
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            width: 100% !important;
            height: auto !important;
            -webkit-print-color-adjust: exact;
          }

          body * {
            visibility: hidden !important;
          }

          .print-container,
          .print-container * {
            visibility: visible !important;
          }

          .print-container {
            position: absolute !important;
            top: 0 !important;
            left: ${isA4 ? '0' : '50%'} !important;
            ${!isA4 ? 'transform: translateX(-50%) !important;' : ''}
            width: ${isA4 ? '100%' : '80mm'} !important;
            max-width: ${isA4 ? 'none' : '80mm'} !important;
            margin: 0 auto !important;
            padding: ${isA4 ? '5mm' : '4mm'} !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid !important;
            font-family: ${isA4 ? "'Inter', 'Segoe UI', Arial, sans-serif" : "'Courier New', Courier, monospace"} !important;
          }
        }

        /* ===== General Styling ===== */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          font-family: ${isA4 ? "'Inter', 'Segoe UI', Arial, sans-serif" : "'Courier New', Courier, monospace"};
          background: #fff;
          width: 100%;
        }

        .print-container {
          width: ${isA4 ? '100%' : '80mm'};
          margin: 0 auto;
          padding: ${isA4 ? '5mm' : '4mm'};
        }

        /* Utility classes */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-black { font-weight: 900; }
        .font-bold { font-weight: 700; }
        .uppercase { text-transform: uppercase; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .w-full { width: 100%; }
        .text-xs { font-size: ${isA4 ? '10px' : '10px'}; }
        .text-sm { font-size: ${isA4 ? '12px' : '12px'}; }
        .text-base { font-size: ${isA4 ? '14px' : '14px'}; }
        .text-lg { font-size: ${isA4 ? '16px' : '16px'}; }
        .text-xl { font-size: ${isA4 ? '18px' : '18px'}; }
        .text-2xl { font-size: ${isA4 ? '22px' : '22px'}; }
        .text-3xl { font-size: ${isA4 ? '28px' : '28px'}; }
        
        .border-b { border-bottom: 1px solid #000; }
        .border-b-2 { border-bottom: 2px solid #000; }
        .border-t { border-top: 1px solid #000; }
        .border-t-2 { border-top: 2px solid #000; }
        .border-dashed { border-style: dashed !important; border-width: 1px !important; }
        .my-4 { margin-top: 16px; margin-bottom: 16px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-8 { margin-bottom: 32px; }
        .pb-4 { padding-bottom: 16px; }
        .pr-4 { padding-right: 16px; }
        .py-2 { padding-top: 8px; padding-bottom: 8px; }
        .py-3 { padding-top: 12px; padding-bottom: 12px; }
        .py-4 { padding-top: 16px; padding-bottom: 16px; }
        .pt-2 { padding-top: 8px; }
        .pt-4 { padding-top: 16px; }
        .pt-8 { padding-top: 32px; }
        .mt-1 { margin-top: 4px; }
        
        .space-y-1 > * + * { margin-top: 4px; }
        .space-y-2 > * + * { margin-top: 8px; }
        
        table { width: 100%; border-collapse: collapse; }
        th, td { font-size: ${isA4 ? '12px' : '11px'}; padding: ${isA4 ? '8px 4px' : '4px 0'}; }
        .divide-y-dashed > * + * { border-top: 1px dashed #000; }
        .divide-y > * + * { border-top: 1px solid #eee; }

        /* Colors */
        .text-slate-400 { color: #94a3b8; }
        .text-slate-500 { color: #64748b; }
      </style>
    </head>
    <body>
      <div class="print-container active-print">
        ${source.innerHTML}
      </div>
    </body>
    </html>
  `);
  doc.close();

  let hasPrinted = false;

  const triggerPrint = () => {
    if (hasPrinted) return;
    hasPrinted = true;
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('[PrintUtil] Print failed:', e);
    }
    
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      isPrinting = false;
    }, 1000);
  };

  iframe.contentWindow.onafterprint = () => {
    isPrinting = false;
  };

  iframe.onload = () => {
    setTimeout(triggerPrint, 300);
  };

  setTimeout(triggerPrint, 2000);
};

export default printContent;
