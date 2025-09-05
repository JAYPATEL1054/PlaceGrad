document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    let currentPdfFile = null;
    let pdfDoc = null;
    const API_BASE_URL = '/api';  // relative path so it works with Flask server

    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const mainContent = document.getElementById('mainContent');
    const pdfCanvas = document.getElementById('pdfCanvas');
    const analysisContent = document.getElementById('analysisContent');
    const analysisLoading = document.getElementById('analysisLoading');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const downloadBtn = document.getElementById('downloadBtn');
    const printBtn = document.getElementById('printBtn');
    const clearBtn = document.getElementById('clearBtn');

    // Initialize PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Event listeners
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    downloadBtn.addEventListener('click', downloadFile);
    printBtn.addEventListener('click', printFile);
    clearBtn.addEventListener('click', clearFile);

    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    function handleFile(file) {
        if (!file.type.includes('pdf')) {
            showError('Please upload a PDF file.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showError('File size must be less than 10MB.');
            return;
        }
        currentPdfFile = file;
        showProgress();
        loadPdf(file);
        analyzeResume(file);
    }

    function showProgress() {
        progressBar.classList.remove('hidden');
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            progressFill.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    progressBar.classList.add('hidden');
                    mainContent.classList.remove('hidden');
                }, 500);
            }
        }, 200);
    }

    async function loadPdf(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
            renderPage(1);
        } catch (error) {
            console.error('Error loading PDF:', error);
            showError('Error loading PDF file. Please try again.');
        }
    }

    async function renderPage(pageNum) {
        try {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.2 });
            pdfCanvas.width = viewport.width;
            pdfCanvas.height = viewport.height;
            const renderContext = {
                canvasContext: pdfCanvas.getContext('2d'),
                viewport: viewport
            };
            await page.render(renderContext).promise;
        } catch (error) {
            console.error('Error rendering PDF page:', error);
            showError('Error displaying PDF preview.');
        }
    }

    async function analyzeResume(file) {
        analysisLoading.classList.remove('hidden');
        try {
            const formData = new FormData();
            formData.append('resume', file);
            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            const analysis = await response.json();
            displayAnalysis(analysis);
        } catch (error) {
            console.error('Error analyzing resume:', error);
            displayError('Failed to analyze résumé. Please check your connection and try again.');
        } finally {
            analysisLoading.classList.add('hidden');
        }
    }

    function displayAnalysis(analysis) {
        const html = `
            <div class="success-message">✅ Analysis completed successfully!</div>
            <div class="score-card">
                <div class="score-label">Job Market Fit Score</div>
                <div class="score-value">${analysis.score}%</div>
            </div>
            <div class="analysis-section">
                <h3 class="analysis-title">💪 Key Strengths</h3>
                ${analysis.strengths && analysis.strengths.length > 0 ? 
                    analysis.strengths.map(strength => 
                        `<div class="insight-item"><div class="insight-category">Strength</div>${strength}</div>`
                    ).join('') : 
                    '<div class="insight-item"><div class="insight-category">Note</div>Upload a more detailed résumé to identify specific strengths.</div>'
                }
            </div>
            <div class="analysis-section">
                <h3 class="analysis-title">🎯 Skills Detected</h3>
                <div>
                    ${analysis.skills && analysis.skills.length > 0 ? 
                        analysis.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('') : 
                        '<p class="empty-state">No technical skills detected. Consider adding a skills section.</p>'
                    }
                </div>
            </div>
            <div class="analysis-section">
                <h3 class="analysis-title">⚡ Recommendations</h3>
                ${analysis.recommendations && analysis.recommendations.length > 0 ? 
                    analysis.recommendations.map(rec => 
                        `<div class="insight-item"><div class="insight-category">Recommendation</div>${rec}</div>`
                    ).join('') : 
                    '<div class="insight-item"><div class="insight-category">Great!</div>Your résumé looks well-structured.</div>'
                }
            </div>
            <div class="analysis-section">
                <h3 class="analysis-title">📈 Missing Skills</h3>
                <div>
                    ${analysis.missing_skills && analysis.missing_skills.length > 0 ? 
                        analysis.missing_skills.map(skill => 
                            `<span class="skill-tag" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #dc2626;">${skill}</span>`
                        ).join('') : 
                        '<p class="empty-state">No critical skills appear to be missing.</p>'
                    }
                </div>
            </div>
            <div class="analysis-section">
                <h3 class="analysis-title">📊 Document Statistics</h3>
                <div class="insight-item"><div class="insight-category">Word Count</div>${analysis.word_count || 'N/A'} words</div>
                <div class="insight-item"><div class="insight-category">Sections</div>${analysis.sections ? analysis.sections.join(', ') : 'Not specified'}</div>
                <div class="insight-item"><div class="insight-category">Experience Level</div>${analysis.experience_level || 'Not determined'}</div>
            </div>
        `;
        analysisContent.innerHTML = html;
    }

    function displayError(message) {
        analysisContent.innerHTML = `
            <div class="error-message">❌ ${message}</div>
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>Analysis Unavailable</h3>
                <p>Please ensure the backend server is running and try again.</p>
            </div>
        `;
    }

    function showError(message) {
        alert(message);
    }

    function downloadFile() {
        if (currentPdfFile) {
            const url = URL.createObjectURL(currentPdfFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = currentPdfFile.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    function printFile() {
        if (pdfCanvas) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head><title>Print Resume</title></head>
                    <body style="margin:0;padding:20px;background:white;">
                        <img src="${pdfCanvas.toDataURL()}" style="max-width:100%;height:auto;" />
                        <script>window.onload = () => { window.print(); window.close(); }</script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    }

    function clearFile() {
    currentPdfFile = null;
    pdfDoc = null;
    fileInput.value = '';
    mainContent.classList.add('hidden');
    progressBar.classList.add('hidden');
    progressFill.style.width = '0%';
    analysisContent.innerHTML = '<div class="loading" id="analysisLoading"><div class="loading-spinner"></div><p>Analyzing your résumé...</p></div>';

    // Add this line to clear the canvas
    const context = pdfCanvas.getContext('2d');
    context.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);
}
});
