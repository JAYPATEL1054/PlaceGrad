document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const templateOptions = document.querySelectorAll('.template-option');
    const formSections = document.querySelectorAll('.form-section');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const addEducationBtn = document.getElementById('add-education');
    const addExperienceBtn = document.getElementById('add-experience');
    const addProjectBtn = document.getElementById('add-project');
    const generateResumeBtn = document.getElementById('generate-resume');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const downloadDocxBtn = document.getElementById('download-docx');
    const resumePreview = document.getElementById('resume-preview');
    
    // Form inputs that trigger live preview updates
    const allInputs = document.querySelectorAll('input, textarea');
    
    // Current template
    let currentTemplate = 'professional';
    
    // Initialize resume data from localStorage if available
    let resumeData = JSON.parse(localStorage.getItem('resumeData')) || {};
    
    // Suggestive text examples
    const suggestiveText = {
        summary: [
            "Results-driven Computer Science graduate with strong programming skills in Java and Python. Seeking to leverage academic excellence and internship experience to contribute to innovative software development projects.",
            "Detail-oriented IT professional with expertise in web development and database management. Passionate about creating user-friendly applications that solve real-world problems.",
            "Motivated engineering graduate with hands-on experience in machine learning projects. Eager to apply technical skills and collaborative approach to develop cutting-edge AI solutions."
        ],
        responsibilities: [
            "• Developed and maintained company website, improving page load speed by 40%\n• Collaborated with a cross-functional team of 5 developers to implement new features\n• Created responsive designs that improved mobile user engagement by 25%",
            "• Led a team of 3 interns to complete project deliverables ahead of schedule\n• Optimized database queries resulting in 30% faster application performance\n• Implemented automated testing that reduced bug reports by 15%",
            "• Designed and implemented RESTful APIs for mobile application integration\n• Conducted code reviews and mentored junior developers\n• Created technical documentation for internal and client-facing products"
        ],
        projectDesc: [
            "• Built a full-stack e-commerce platform with user authentication\n• Implemented payment gateway integration with Stripe\n• Designed responsive UI that works across all devices",
            "• Created a machine learning model that predicts stock prices with 85% accuracy\n• Processed and analyzed large datasets using Python and Pandas\n• Visualized results with interactive dashboards using D3.js",
            "• Developed a mobile app for campus navigation using React Native\n• Implemented real-time location tracking and route optimization\n• Integrated with university database for classroom schedules"
        ]
    };
    
    // Template selection
    templateOptions.forEach(option => {
        option.addEventListener('click', function() {
            templateOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            currentTemplate = this.getAttribute('data-template');
            updateResumePreview();
        });
    });
    
    // Form navigation
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentSection = this.closest('.form-section');
            const nextSectionId = this.getAttribute('data-next');
            const nextSection = document.getElementById(nextSectionId);
            
            currentSection.classList.remove('active');
            nextSection.classList.add('active');
            
            // Save form data
            saveFormData();
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentSection = this.closest('.form-section');
            const prevSectionId = this.getAttribute('data-prev');
            const prevSection = document.getElementById(prevSectionId);
            
            currentSection.classList.remove('active');
            prevSection.classList.add('active');
            
            // Save form data
            saveFormData();
        });
    });
    
    // Add education entry
    addEducationBtn.addEventListener('click', function() {
        const educationEntries = document.getElementById('education-entries');
        const newEntry = document.createElement('div');
        newEntry.className = 'education-entry';
        newEntry.innerHTML = `
            <button type="button" class="entry-remove"><i class="fas fa-times"></i></button>
            <div class="form-group">
                <label>Degree</label>
                <input type="text" class="degree" placeholder="Bachelor of Technology">
                <div class="suggestion-chip">Try "B.Tech in Computer Science" or "Master of Business Administration"</div>
            </div>
            <div class="form-group">
                <label>Institution</label>
                <input type="text" class="institution" placeholder="LDRP Institute of Technology">
                <div class="suggestion-chip">Include full name of your university/college</div>
            </div>
            <div class="form-row">
                <div class="form-group half">
                    <label>Start Year</label>
                    <input type="text" class="start-year" placeholder="2020">
                </div>
                <div class="form-group half">
                    <label>End Year (or Expected)</label>
                    <input type="text" class="end-year" placeholder="2024">
                    <div class="suggestion-chip">Use "Present" if still studying</div>
                </div>
            </div>
            <div class="form-group">
                <label>CGPA/Percentage</label>
                <input type="text" class="cgpa" placeholder="8.5 CGPA">
                <div class="suggestion-chip">Specify if it's CGPA or percentage (e.g., "8.5/10 CGPA" or "85%")</div>
            </div>
        `;
        educationEntries.appendChild(newEntry);
        
        // Add event listeners to new inputs
        newEntry.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updateResumePreview);
            input.addEventListener('focus', showSuggestion);
            input.addEventListener('blur', hideSuggestion);
        });
        
        // Add remove button functionality
        newEntry.querySelector('.entry-remove').addEventListener('click', function() {
            newEntry.remove();
            updateResumePreview();
        });
    });
    
    // Add experience entry
    addExperienceBtn.addEventListener('click', function() {
        const experienceEntries = document.getElementById('experience-entries');
        const newEntry = document.createElement('div');
        newEntry.className = 'experience-entry';
        newEntry.innerHTML = `
            <button type="button" class="entry-remove"><i class="fas fa-times"></i></button>
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" class="job-title" placeholder="Software Engineer Intern">
                <div class="suggestion-chip">Be specific with your role (e.g., "Frontend Developer" instead of just "Developer")</div>
            </div>
            <div class="form-group">
                <label>Company</label>
                <input type="text" class="company" placeholder="Tech Solutions Ltd.">
                <div class="suggestion-chip">Include company location if relevant (e.g., "Google, Bangalore")</div>
            </div>
            <div class="form-row">
                <div class="form-group half">
                    <label>Start Date</label>
                    <input type="text" class="start-date" placeholder="June 2023">
                    <div class="suggestion-chip">Month and year format is best (e.g., "May 2022")</div>
                </div>
                <div class="form-group half">
                    <label>End Date</label>
                    <input type="text" class="end-date" placeholder="August 2023 (or Present)">
                    <div class="suggestion-chip">Use "Present" for current positions</div>
                </div>
            </div>
            <div class="form-group">
                <label>Responsibilities & Achievements</label>
                <textarea class="responsibilities" rows="4" placeholder="• Developed a feature that improved efficiency by 20%&#10;• Collaborated with a team of 5 developers&#10;• Implemented responsive design for mobile users"></textarea>
                <div class="suggestion-chip">Use bullet points and quantify achievements when possible</div>
                <button type="button" class="suggestion-btn" data-target="responsibilities">Show Examples</button>
            </div>
        `;
        experienceEntries.appendChild(newEntry);
        
        // Add event listeners to new inputs
        newEntry.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updateResumePreview);
            input.addEventListener('focus', showSuggestion);
            input.addEventListener('blur', hideSuggestion);
        });
        
        // Add remove button functionality
        newEntry.querySelector('.entry-remove').addEventListener('click', function() {
            newEntry.remove();
            updateResumePreview();
        });
        
        // Add suggestion button functionality
        newEntry.querySelector('.suggestion-btn').addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            const textArea = this.parentElement.querySelector('textarea');
            const randomIndex = Math.floor(Math.random() * suggestiveText[target].length);
            textArea.value = suggestiveText[target][randomIndex];
            updateResumePreview();
        });
    });
    
    // Add project entry
    addProjectBtn.addEventListener('click', function() {
        const projectEntries = document.getElementById('project-entries');
        const newEntry = document.createElement('div');
        newEntry.className = 'project-entry';
        newEntry.innerHTML = `
            <button type="button" class="entry-remove"><i class="fas fa-times"></i></button>
            <div class="form-group">
                <label>Project Name</label>
                <input type="text" class="project-name" placeholder="E-commerce Website">
                <div class="suggestion-chip">Use a descriptive name that indicates the project's purpose</div>
            </div>
            <div class="form-group">
                <label>Technologies Used</label>
                <input type="text" class="technologies" placeholder="React, Node.js, MongoDB">
                <div class="suggestion-chip">List all relevant technologies, frameworks, and tools</div>
            </div>
            <div class="form-group">
                <label>Project Description</label>
                <textarea class="project-description" rows="4" placeholder="• Built a full-stack e-commerce platform&#10;• Implemented user authentication and payment gateway&#10;• Designed responsive UI for all devices"></textarea>
                <div class="suggestion-chip">Describe your role, challenges overcome, and outcomes</div>
                <button type="button" class="suggestion-btn" data-target="projectDesc">Show Examples</button>
            </div>
            <div class="form-group">
                <label>Project Link (Optional)</label>
                <input type="url" class="project-link" placeholder="https://github.com/yourusername/project">
                <div class="suggestion-chip">Include GitHub repo, live demo, or documentation link</div>
            </div>
        `;
        projectEntries.appendChild(newEntry);
        
        // Add event listeners to new inputs
        newEntry.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updateResumePreview);
            input.addEventListener('focus', showSuggestion);
            input.addEventListener('blur', hideSuggestion);
        });
        
        // Add remove button functionality
        newEntry.querySelector('.entry-remove').addEventListener('click', function() {
            newEntry.remove();
            updateResumePreview();
        });
        
        // Add suggestion button functionality
        newEntry.querySelector('.suggestion-btn').addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            const textArea = this.parentElement.querySelector('textarea');
            const randomIndex = Math.floor(Math.random() * suggestiveText[target].length);
            textArea.value = suggestiveText[target][randomIndex];
            updateResumePreview();
        });
    });
    
    // Show suggestion on input focus
    function showSuggestion() {
        const suggestion = this.nextElementSibling;
        if (suggestion && suggestion.classList.contains('suggestion-chip')) {
            suggestion.style.display = 'block';
            suggestion.style.opacity = '1';
        }
    }
    
    // Hide suggestion on input blur
    function hideSuggestion() {
        const suggestion = this.nextElementSibling;
        if (suggestion && suggestion.classList.contains('suggestion-chip')) {
            suggestion.style.opacity = '0';
            setTimeout(() => {
                suggestion.style.display = 'none';
            }, 300);
        }
    }
    
    // Add event listeners for suggestions
    allInputs.forEach(input => {
        input.addEventListener('focus', showSuggestion);
        input.addEventListener('blur', hideSuggestion);
        input.addEventListener('input', updateResumePreview);
    });
    
    // Add suggestion button functionality
    document.querySelectorAll('.suggestion-btn').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            const textArea = this.parentElement.querySelector('textarea');
            const randomIndex = Math.floor(Math.random() * suggestiveText[target].length);
            textArea.value = suggestiveText[target][randomIndex];
            updateResumePreview();
        });
    });
    
    // Generate resume
    generateResumeBtn.addEventListener('click', function() {
        saveFormData();
        updateResumePreview();
        alert('Resume generated! You can now download it as PDF or DOCX.');
    });
    
    // Download as PDF with improved sizing
    downloadPdfBtn.addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        
        // Create a new jsPDF instance with A4 size
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        // Get the resume preview element
        const element = document.getElementById('resume-preview');
        
        // Use html2canvas with better settings for quality
        html2canvas(element, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            // A4 dimensions in mm (210 x 297)
            const imgWidth = 210;
            const pageHeight = 297;
            
            // Calculate the height based on the canvas ratio
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Get the image data from canvas
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            // Add image to PDF - centered on page with proper margins
            let heightLeft = imgHeight;
            let position = 0;
            
            // Add first page
            doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
            heightLeft -= pageHeight;
            
            // Add new pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
                heightLeft -= pageHeight;
            }
            
            // Save the PDF with a meaningful name
            const userName = resumeData.personal.fullName || 'Resume';
            doc.save(`${userName.replace(/\s+/g, '_')}_Resume.pdf`);
        });
    });
    
    // Download as DOCX (simplified version)
    downloadDocxBtn.addEventListener('click', function() {
        alert('DOCX export functionality requires additional libraries. In a production environment, this would use docx.js or a server-side conversion.');
        
        // For demonstration purposes, we'll just export the HTML content
        const resumeHTML = resumePreview.innerHTML;
        const blob = new Blob([resumeHTML], { type: 'application/vnd.ms-word' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const userName = resumeData.personal.fullName || 'Resume';
        link.download = `${userName.replace(/\s+/g, '_')}_Resume.doc`;
        link.click();
    });
    
    // Save form data to localStorage
    function saveFormData() {
        const data = {
            template: currentTemplate,
            personal: {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                location: document.getElementById('location').value,
                linkedin: document.getElementById('linkedin').value,
                github: document.getElementById('github').value,
                summary: document.getElementById('summary').value
            },
            education: getEducationData(),
            experience: getExperienceData(),
            skills: {
                technical: document.getElementById('technical-skills').value,
                soft: document.getElementById('soft-skills').value,
                languages: document.getElementById('languages').value
            },
            projects: getProjectData()
        };
        
        resumeData = data;
        localStorage.setItem('resumeData', JSON.stringify(data));
    }
    
    // Get education data from form
    function getEducationData() {
        const educationEntries = document.querySelectorAll('.education-entry');
        const educationData = [];
        
        educationEntries.forEach(entry => {
            educationData.push({
                degree: entry.querySelector('.degree').value,
                institution: entry.querySelector('.institution').value,
                startYear: entry.querySelector('.start-year').value,
                endYear: entry.querySelector('.end-year').value,
                cgpa: entry.querySelector('.cgpa').value
            });
        });
        
        return educationData;
    }
    
    // Get experience data from form
    function getExperienceData() {
        const experienceEntries = document.querySelectorAll('.experience-entry');
        const experienceData = [];
        
        experienceEntries.forEach(entry => {
            experienceData.push({
                jobTitle: entry.querySelector('.job-title').value,
                company: entry.querySelector('.company').value,
                startDate: entry.querySelector('.start-date').value,
                endDate: entry.querySelector('.end-date').value,
                responsibilities: entry.querySelector('.responsibilities').value
            });
        });
        
        return experienceData;
    }
    
    // Get project data from form
    function getProjectData() {
        const projectEntries = document.querySelectorAll('.project-entry');
        const projectData = [];
        
        projectEntries.forEach(entry => {
            projectData.push({
                name: entry.querySelector('.project-name').value,
                technologies: entry.querySelector('.technologies').value,
                description: entry.querySelector('.project-description').value,
                link: entry.querySelector('.project-link').value
            });
        });
        
        return projectData;
    }
    
    // Update resume preview with template styling
    function updateResumePreview() {
        saveFormData();
        
        // Clear previous preview
        resumePreview.innerHTML = '';
        
        // Add template class
        resumePreview.className = `resume-document resume-${currentTemplate}`;
        
        // Apply template-specific styling
        let templateStyles = '';
        switch(currentTemplate) {
            case 'professional':
                templateStyles = `
                    font-family: 'Calibri', 'Segoe UI', sans-serif;
                    color: #000;
                    
                    line-height: 1.5;
                `;
                break;
            case 'modern':
                templateStyles = `
                    font-family: 'Arial', sans-serif;
                    color: #0e1114ff;
                    line-height: 1.6;
                    background: linear-gradient(to bottom, #ffffff 0%, #f7f9fc 100%);
                `;
                break;
            case 'creative':
                templateStyles = `
                    font-family: 'Georgia', serif;
                    color: #444;
                    line-height: 1.6;
                    background-color: #fff9f0;
                    border-left: 5px solid #0d0d0dff;
                    padding-left: 15px;
                `;
                break;
            case 'elegant':
                templateStyles = `
                    font-family: 'Garamond', serif;
                    color: #2c3e50;
                    line-height: 1.6;
                    background-color: #f8f9fa;
                    border-top: 3px solid #6c5ce7;
                    padding-top: 15px;
                `;
                break;
            case 'vibrant':
                templateStyles = `
                    font-family: 'Trebuchet MS', sans-serif;
                    color: #333;
                    line-height: 1.5;
                    background: linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(240,249,255,1) 100%);
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                `;
                break;
        }
        
        resumePreview.style.cssText = templateStyles;
        
        // Create resume content based on template
        const resumeContent = document.createElement('div');
        resumeContent.className = 'resume-content';
        
        // Header section with name and contact info
        const headerSection = document.createElement('div');
        headerSection.className = 'resume-header-section';
        
        // Apply template-specific header styling
        switch(currentTemplate) {
            case 'professional':
                headerSection.style.cssText = `
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #0e0f10ff;
                `;
                break;
            case 'modern':
                headerSection.style.cssText = `
                    text-align: center;
                    margin-bottom: 25px;
                    padding: 15px;
                    background: linear-gradient(to right, #3498db, #2c3e50);
                    color: white;
                    border-radius: 5px;
                `;
                break;
            case 'creative':
                headerSection.style.cssText = `
                    text-align: left;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 2px dashed #0d0d0dff;
                `;
                break;
            case 'elegant':
                headerSection.style.cssText = `
                    text-align: center;
                    margin-bottom: 25px;
                    padding: 20px 0;
                    border-bottom: 1px solid #ddd;
                    color: #6c5ce7;
                `;
                break;
            case 'vibrant':
                headerSection.style.cssText = `
                    text-align: center;
                    margin-bottom: 25px;
                    padding: 20px;
                    background: linear-gradient(135deg, #00b09b, #96c93d);
                    color: white;
                `;
                break;
        }
        
        const name = document.createElement('div');
        name.className = 'resume-name';
        name.textContent = resumeData.personal.fullName || 'Your Name';
        
        // Apply template-specific name styling
        switch(currentTemplate) {
            case 'professional':
                name.style.cssText = `
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #0a0a0aff;
                `;
                break;
            case 'modern':
                name.style.cssText = `
                    font-size: 32px;
                    font-weight: 600;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                `;
                break;
            case 'creative':
                name.style.cssText = `
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: #0d0d0dff;
                    font-family: 'Georgia', serif;
                `;
                break;
            case 'elegant':
                name.style.cssText = `
                    font-size: 32px;
                    font-weight: normal;
                    margin-bottom: 10px;
                    font-family: 'Garamond', serif;
                `;
                break;
            case 'vibrant':
                name.style.cssText = `
                    font-size: 34px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
                `;
                break;
        }
        
        headerSection.appendChild(name);
        
        const contact = document.createElement('div');
        contact.className = 'resume-contact';
        
        // Apply template-specific contact styling
        switch(currentTemplate) {
            case 'professional':
                contact.style.cssText = `
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 15px;
                    font-size: 14px;
                `;
                break;
            case 'modern':
                contact.style.cssText = `
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 20px;
                    font-size: 14px;
                    margin-top: 15px;
                `;
                break;
            case 'creative':
                contact.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    font-size: 15px;
                    margin-top: 10px;
                `;
                break;
            case 'elegant':
                contact.style.cssText = `
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 25px;
                    font-size: 15px;
                    margin-top: 15px;
                    color: #555;
                `;
                break;
            case 'vibrant':
                contact.style.cssText = `
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 20px;
                    font-size: 14px;
                    margin-top: 15px;
                `;
                break;
        }
        
        if (resumeData.personal.email) {
            const email = document.createElement('span');
            email.innerHTML = `<i class="fas fa-envelope"></i> ${resumeData.personal.email}`;
            contact.appendChild(email);
        }
        
        if (resumeData.personal.phone) {
            const phone = document.createElement('span');
            phone.innerHTML = `<i class="fas fa-phone"></i> ${resumeData.personal.phone}`;
            contact.appendChild(phone);
        }
        
        if (resumeData.personal.location) {
            const location = document.createElement('span');
            location.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${resumeData.personal.location}`;
            contact.appendChild(location);
        }
        
        if (resumeData.personal.linkedin) {
            const linkedin = document.createElement('span');
            linkedin.innerHTML = `<i class="fab fa-linkedin"></i> ${resumeData.personal.linkedin}`;
            contact.appendChild(linkedin);
        }
        
        if (resumeData.personal.github) {
            const github = document.createElement('span');
            github.innerHTML = `<i class="fab fa-github"></i> ${resumeData.personal.github}`;
            contact.appendChild(github);
        }
        
        headerSection.appendChild(contact);
        resumeContent.appendChild(headerSection);
        
        // Summary section
        if (resumeData.personal.summary) {
            const summarySection = document.createElement('div');
            
            const summaryTitle = document.createElement('div');
            summaryTitle.className = 'resume-section-title';
            summaryTitle.textContent = 'Professional Summary';
            
            // Apply template-specific section title styling
            applyTemplateSectionTitleStyle(summaryTitle);
            
            summarySection.appendChild(summaryTitle);
            
            const summary = document.createElement('div');
            summary.textContent = resumeData.personal.summary;
            summary.style.marginBottom = '20px';
            summarySection.appendChild(summary);
            
            resumeContent.appendChild(summarySection);
        }
        
        // Education section
        if (resumeData.education && resumeData.education.length > 0) {
            const educationSection = document.createElement('div');
            
            const educationTitle = document.createElement('div');
            educationTitle.className = 'resume-section-title';
            educationTitle.textContent = 'Education';
            
            // Apply template-specific section title styling
            applyTemplateSectionTitleStyle(educationTitle);
            
            educationSection.appendChild(educationTitle);
            
            resumeData.education.forEach(edu => {
                if (edu.degree || edu.institution) {
                    const educationEntry = document.createElement('div');
                    educationEntry.className = 'resume-entry';
                    educationEntry.style.marginBottom = '15px';
                    
                    const eduHeader = document.createElement('div');
                    eduHeader.className = 'resume-entry-header';
                    eduHeader.style.display = 'flex';
                    eduHeader.style.justifyContent = 'space-between';
                    eduHeader.style.fontWeight = 'bold';
                    
                    // Apply template-specific entry header styling
                    applyTemplateEntryHeaderStyle(eduHeader);
                    
                    eduHeader.innerHTML = `<span>${edu.degree || 'Degree'}</span><span>${edu.startYear || ''} - ${edu.endYear || 'Present'}</span>`;
                    educationEntry.appendChild(eduHeader);
                    
                    const eduSubheader = document.createElement('div');
                    eduSubheader.className = 'resume-entry-subheader';
                    eduSubheader.style.display = 'flex';
                    eduSubheader.style.justifyContent = 'space-between';
                    eduSubheader.style.fontStyle = 'italic';
                    eduSubheader.style.marginBottom = '5px';
                    
                    // Apply template-specific entry subheader styling
                    applyTemplateEntrySubheaderStyle(eduSubheader);
                    
                    eduSubheader.innerHTML = `<span>${edu.institution || 'Institution'}</span><span>${edu.cgpa || ''}</span>`;
                    educationEntry.appendChild(eduSubheader);
                    
                    educationSection.appendChild(educationEntry);
                }
            });
            
            resumeContent.appendChild(educationSection);
        }
        
        // Experience section
        if (resumeData.experience && resumeData.experience.length > 0) {
            const experienceSection = document.createElement('div');
            
            const experienceTitle = document.createElement('div');
            experienceTitle.className = 'resume-section-title';
            experienceTitle.textContent = 'Work Experience';
            
            // Apply template-specific section title styling
            applyTemplateSectionTitleStyle(experienceTitle);
            
            experienceSection.appendChild(experienceTitle);
            
            resumeData.experience.forEach(exp => {
                if (exp.jobTitle || exp.company) {
                    const experienceEntry = document.createElement('div');
                    experienceEntry.className = 'resume-entry';
                    experienceEntry.style.marginBottom = '15px';
                    
                    const expHeader = document.createElement('div');
                    expHeader.className = 'resume-entry-header';
                    expHeader.style.display = 'flex';
                    expHeader.style.justifyContent = 'space-between';
                    expHeader.style.fontWeight = 'bold';
                    
                    // Apply template-specific entry header styling
                    applyTemplateEntryHeaderStyle(expHeader);
                    
                    expHeader.innerHTML = `<span>${exp.jobTitle || 'Position'}</span><span>${exp.startDate || ''} - ${exp.endDate || 'Present'}</span>`;
                    experienceEntry.appendChild(expHeader);
                    
                    const expSubheader = document.createElement('div');
                    expSubheader.className = 'resume-entry-subheader';
                    expSubheader.style.display = 'flex';
                    expSubheader.style.justifyContent = 'space-between';
                    expSubheader.style.fontStyle = 'bold';
                    expSubheader.style.marginBottom = '5px';
                    
                    // Apply template-specific entry subheader styling
                    applyTemplateEntrySubheaderStyle(expSubheader);
                    
                    expSubheader.innerHTML = `<span>${exp.company || 'Company'}</span>`;
                    experienceEntry.appendChild(expSubheader);
                    
                    if (exp.responsibilities) {
                        const responsibilities = document.createElement('div');
                        responsibilities.innerHTML = exp.responsibilities.replace(/\n/g, '<br>');
                        experienceEntry.appendChild(responsibilities);
                    }
                    
                    experienceSection.appendChild(experienceEntry);
                }
            });
            
            resumeContent.appendChild(experienceSection);
        }
        
        // Skills section
        if (resumeData.skills.technical || resumeData.skills.soft || resumeData.skills.languages) {
            const skillsSection = document.createElement('div');
            
            const skillsTitle = document.createElement('div');
            skillsTitle.className = 'resume-section-title';
            skillsTitle.textContent = 'Skills';
            
            // Apply template-specific section title styling
            applyTemplateSectionTitleStyle(skillsTitle);
            
            skillsSection.appendChild(skillsTitle);
            
            const skillsContent = document.createElement('div');
            skillsContent.className = 'resume-skills';
            
            // Apply template-specific skills styling
            switch(currentTemplate) {
                case 'professional':
                    skillsContent.style.cssText = `
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    `;
                    break;
                case 'modern':
                    skillsContent.style.cssText = `
                        display: flex;
                        flex-wrap: wrap;
                        gap: 20px;
                    `;
                    break;
                case 'creative':
                    skillsContent.style.cssText = `
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    `;
                    break;
                case 'elegant':
                    skillsContent.style.cssText = `
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    `;
                    break;
                case 'vibrant':
                    skillsContent.style.cssText = `
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                    `;
                    break;
            }
            
            if (resumeData.skills.technical) {
                const technicalSkills = document.createElement('div');
                technicalSkills.className = 'resume-skill-category';
                
                const technicalTitle = document.createElement('div');
                technicalTitle.className = 'resume-skill-title';
                technicalTitle.textContent = 'Technical Skills:';
                technicalTitle.style.fontWeight = 'bold';
                technicalTitle.style.marginBottom = '5px';
                
                // Apply template-specific skill title styling
                switch(currentTemplate) {
                    case 'professional':
                        technicalTitle.style.color = '#004080';
                        break;
                    case 'modern':
                        technicalTitle.style.color = '#3498db';
                        break;
                    case 'creative':
                        technicalTitle.style.color = '#101010ff';
                        break;
                    case 'elegant':
                        technicalTitle.style.color = '#6c5ce7';
                        break;
                    case 'vibrant':
                        technicalTitle.style.color = '#00b09b';
                        break;
                }
                
                technicalSkills.appendChild(technicalTitle);
                
                const technicalContent = document.createElement('div');
                
                // Apply template-specific skill content styling
                if (currentTemplate === 'modern' || currentTemplate === 'vibrant') {
                    // Create skill pills for modern and vibrant templates
                    const skills = resumeData.skills.technical.split(',').map(skill => skill.trim());
                    skills.forEach(skill => {
                        if (skill) {
                            const pill = document.createElement('span');
                            pill.textContent = skill;
                            pill.style.display = 'inline-block';
                            pill.style.padding = '3px 10px';
                            pill.style.margin = '0 5px 5px 0';
                            pill.style.borderRadius = '15px';
                            pill.style.fontSize = '13px';
                            
                            if (currentTemplate === 'modern') {
                                pill.style.backgroundColor = '#e8f4fc';
                                pill.style.color = '#3498db';
                                pill.style.border = '1px solid #3498db';
                            } else {
                                pill.style.backgroundColor = 'rgba(0, 176, 155, 0.1)';
                                pill.style.color = '#00b09b';
                                pill.style.border = '1px solid #00b09b';
                            }
                            
                            technicalContent.appendChild(pill);
                        }
                    });
                } else {
                    technicalContent.textContent = resumeData.skills.technical;
                }
                
                technicalSkills.appendChild(technicalContent);
                skillsContent.appendChild(technicalSkills);
            }
            
            if (resumeData.skills.soft) {
                const softSkills = document.createElement('div');
                softSkills.className = 'resume-skill-category';
                
                const softTitle = document.createElement('div');
                softTitle.className = 'resume-skill-title';
                softTitle.textContent = 'Soft Skills:';
                softTitle.style.fontWeight = 'bold';
                softTitle.style.marginBottom = '5px';
                
                // Apply template-specific skill title styling
                switch(currentTemplate) {
                    case 'professional':
                        softTitle.style.color = '#101111ff';
                        break;
                    case 'modern':
                        softTitle.style.color = '#3498db';
                        break;
                    case 'creative':
                        softTitle.style.color = '#101010ff';
                        break;
                    case 'elegant':
                        softTitle.style.color = '#6c5ce7';
                        break;
                    case 'vibrant':
                        softTitle.style.color = '#00b09b';
                        break;
                }
                
                softSkills.appendChild(softTitle);
                
                const softContent = document.createElement('div');
                
                // Apply template-specific skill content styling
                if (currentTemplate === 'modern' || currentTemplate === 'vibrant') {
                    // Create skill pills for modern and vibrant templates
                    const skills = resumeData.skills.soft.split(',').map(skill => skill.trim());
                    skills.forEach(skill => {
                        if (skill) {
                            const pill = document.createElement('span');
                            pill.textContent = skill;
                            pill.style.display = 'inline-block';
                            pill.style.padding = '3px 10px';
                            pill.style.margin = '0 5px 5px 0';
                            pill.style.borderRadius = '15px';
                            pill.style.fontSize = '13px';
                            
                            if (currentTemplate === 'modern') {
                                pill.style.backgroundColor = '#eef7ed';
                                pill.style.color = '#27ae60';
                                pill.style.border = '1px solid #27ae60';
                            } else {
                                pill.style.backgroundColor = 'rgba(150, 201, 61, 0.1)';
                                pill.style.color = '#96c93d';
                                pill.style.border = '1px solid #96c93d';
                            }
                            
                            softContent.appendChild(pill);
                        }
                    });
                } else {
                    softContent.textContent = resumeData.skills.soft;
                }
                
                softSkills.appendChild(softContent);
                skillsContent.appendChild(softSkills);
            }
            
            if (resumeData.skills.languages) {
                const languageSkills = document.createElement('div');
                languageSkills.className = 'resume-skill-category';
                
                const languageTitle = document.createElement('div');
                languageTitle.className = 'resume-skill-title';
                languageTitle.textContent = 'Languages:';
                languageTitle.style.fontWeight = 'bold';
                languageTitle.style.marginBottom = '5px';
                
                // Apply template-specific skill title styling
                switch(currentTemplate) {
                    case 'professional':
                        languageTitle.style.color = '#080808ff';
                        break;
                    case 'modern':
                        languageTitle.style.color = '#3498db';
                        break;
                    case 'creative':
                        languageTitle.style.color = '#070707ff';
                        break;
                    case 'elegant':
                        languageTitle.style.color = '#6c5ce7';
                        break;
                    case 'vibrant':
                        languageTitle.style.color = '#00b09b';
                        break;
                }
                
                languageSkills.appendChild(languageTitle);
                
                const languageContent = document.createElement('div');
                
                // Apply template-specific skill content styling
                if (currentTemplate === 'modern' || currentTemplate === 'vibrant') {
                    // Create skill pills for modern and vibrant templates
                    const skills = resumeData.skills.languages.split(',').map(skill => skill.trim());
                    skills.forEach(skill => {
                        if (skill) {
                            const pill = document.createElement('span');
                            pill.textContent = skill;
                            pill.style.display = 'inline-block';
                            pill.style.padding = '3px 10px';
                            pill.style.margin = '0 5px 5px 0';
                            pill.style.borderRadius = '15px';
                            pill.style.fontSize = '13px';
                            
                            if (currentTemplate === 'modern') {
                                pill.style.backgroundColor = '#f0e6f6';
                                pill.style.color = '#8e44ad';
                                pill.style.border = '1px solid #8e44ad';
                            } else {
                                pill.style.backgroundColor = 'rgba(106, 137, 204, 0.1)';
                                pill.style.color = '#6a89cc';
                                pill.style.border = '1px solid #6a89cc';
                            }
                            
                            languageContent.appendChild(pill);
                        }
                    });
                } else {
                    languageContent.textContent = resumeData.skills.languages;
                }
                
                languageSkills.appendChild(languageContent);
                skillsContent.appendChild(languageSkills);
            }
            
            skillsSection.appendChild(skillsContent);
            resumeContent.appendChild(skillsSection);
        }
        
        // Projects section
        if (resumeData.projects && resumeData.projects.length > 0) {
            const projectsSection = document.createElement('div');
            
            const projectsTitle = document.createElement('div');
            projectsTitle.className = 'resume-section-title';
            projectsTitle.textContent = 'Projects';
            
            // Apply template-specific section title styling
            applyTemplateSectionTitleStyle(projectsTitle);
            
            projectsSection.appendChild(projectsTitle);
            
            resumeData.projects.forEach(project => {
                if (project.name) {
                    const projectEntry = document.createElement('div');
                    projectEntry.className = 'resume-entry';
                    projectEntry.style.marginBottom = '15px';
                    
                    const projectHeader = document.createElement('div');
                    projectHeader.className = 'resume-entry-header';
                    projectHeader.style.display = 'flex';
                    projectHeader.style.justifyContent = 'space-between';
                    projectHeader.style.fontWeight = 'bold';
                    
                    // Apply template-specific entry header styling
                    applyTemplateEntryHeaderStyle(projectHeader);
                    
                    if (project.link) {
                        projectHeader.innerHTML = `<span>${project.name || 'Project'}</span><span><a href="${project.link}" target="_blank" style="color: inherit; text-decoration: underline;">View Project</a></span>`;
                    } else {
                        projectHeader.innerHTML = `<span>${project.name || 'Project'}</span>`;
                    }
                    
                    projectEntry.appendChild(projectHeader);
                    
                    if (project.technologies) {
                        const technologies = document.createElement('div');
                        technologies.className = 'resume-entry-subheader';
                        technologies.style.display = 'flex';
                        technologies.style.justifyContent = 'space-between';
                        technologies.style.fontStyle = 'italic';
                        technologies.style.marginBottom = '5px';
                        
                        // Apply template-specific entry subheader styling
                        applyTemplateEntrySubheaderStyle(technologies);
                        
                        technologies.innerHTML = `<span>Technologies: ${project.technologies}</span>`;
                        projectEntry.appendChild(technologies);
                    }
                    
                    if (project.description) {
                        const description = document.createElement('div');
                        description.innerHTML = project.description.replace(/\n/g, '<br>');
                        projectEntry.appendChild(description);
                    }
                    
                    projectsSection.appendChild(projectEntry);
                }
            });
            
            resumeContent.appendChild(projectsSection);
        }
        
        resumePreview.appendChild(resumeContent);
    }
    
    // Helper function to apply template-specific section title styling
    function applyTemplateSectionTitleStyle(element) {
        switch(currentTemplate) {
            case 'professional':
                element.style.cssText = `
                    font-size: 18px;
                    font-weight: bold;
                    color: #0f0f10ff;
                    border-bottom: 2px solid #0c0d0dff;
                    padding-bottom: 5px;
                    margin: 20px 0 15px;
                `;
                break;
            case 'modern':
                element.style.cssText = `
                    font-size: 18px;
                    font-weight: bold;
                    color: #3498db;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 5px;
                    margin: 20px 0 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                `;
                break;
            case 'creative':
                element.style.cssText = `
                    font-size: 20px;
                    font-weight: bold;
                    color: #130e0eff;
                    border-bottom: 2px dashed #121212ff;
                    padding-bottom: 5px;
                    margin: 25px 0 15px;
                    font-family: 'Georgia', serif;
                `;
                break;
            case 'elegant':
                element.style.cssText = `
                    font-size: 19px;
                    font-weight: normal;
                    color: #6c5ce7;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 8px;
                    margin: 25px 0 15px;
                    font-family: 'Garamond', serif;
                `;
                break;
            case 'vibrant':
                element.style.cssText = `
                    font-size: 18px;
                    font-weight: bold;
                    color: #00b09b;
                    background: linear-gradient(90deg, rgba(0,176,155,0.2) 0%, rgba(150,201,61,0.1) 100%);
                    padding: 8px 15px;
                    border-radius: 5px;
                    margin: 25px 0 15px;
                `;
                break;
        }
    }
    
    // Helper function to apply template-specific entry header styling
    function applyTemplateEntryHeaderStyle(element) {
        switch(currentTemplate) {
            case 'professional':
                element.style.color = '#004080';
                break;
            case 'modern':
                element.style.color = '#3498db';
                break;
            case 'creative':
                element.style.color = '#111111ff';
                break;
            case 'elegant':
                element.style.color = '#6c5ce7';
                element.style.fontWeight = 'normal';
                break;
            case 'vibrant':
                element.style.color = '#00b09b';
                break;
        }
    }
    
    // Helper function to apply template-specific entry subheader styling
    function applyTemplateEntrySubheaderStyle(element) {
        switch(currentTemplate) {
            case 'professional':
                // Default styling
                break;
            case 'modern':
                element.style.color = '#7f8c8d';
                break;
            case 'creative':
                element.style.color = '#666';
                break;
            case 'elegant':
                element.style.color = '#555';
                break;
            case 'vibrant':
                element.style.color = '#555';
                break;
        }
    }
    
    // Load saved data if available
    function loadSavedData() {
        if (Object.keys(resumeData).length > 0) {
            // Set template
            if (resumeData.template) {
                currentTemplate = resumeData.template;
                document.querySelector(`.template-option[data-template="${currentTemplate}"]`).classList.add('active');
            }
            
            // Fill personal info
            if (resumeData.personal) {
                document.getElementById('fullName').value = resumeData.personal.fullName || '';
                document.getElementById('email').value = resumeData.personal.email || '';
                document.getElementById('phone').value = resumeData.personal.phone || '';
                document.getElementById('location').value = resumeData.personal.location || '';
                document.getElementById('linkedin').value = resumeData.personal.linkedin || '';
                document.getElementById('github').value = resumeData.personal.github || '';
                document.getElementById('summary').value = resumeData.personal.summary || '';
            }
            
            // Fill education entries
            if (resumeData.education && resumeData.education.length > 0) {
                const educationEntries = document.getElementById('education-entries');
                educationEntries.innerHTML = ''; // Clear default entry
                
                resumeData.education.forEach(edu => {
                    const newEntry = document.createElement('div');
                    newEntry.className = 'education-entry';
                    newEntry.innerHTML = `
                        <button type="button" class="entry-remove"><i class="fas fa-times"></i></button>
                        <div class="form-group">
                            <label>Degree</label>
                            <input type="text" class="degree" placeholder="Bachelor of Technology" value="${edu.degree || ''}">
                            <div class="suggestion-chip">Try "B.Tech in Computer Science" or "Master of Business Administration"</div>
                        </div>
                        <div class="form-group">
                            <label>Institution</label>
                            <input type="text" class="institution" placeholder="LDRP Institute of Technology" value="${edu.institution || ''}">
                            <div class="suggestion-chip">Include full name of your university/college</div>
                        </div>
                        <div class="form-row">
                            <div class="form-group half">
                                <label>Start Year</label>
                                <input type="text" class="start-year" placeholder="2020" value="${edu.startYear || ''}">
                            </div>
                            <div class="form-group half">
                                <label>End Year (or Expected)</label>
                                <input type="text" class="end-year" placeholder="2024" value="${edu.endYear || ''}">
                                <div class="suggestion-chip">Use "Present" if still studying</div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>CGPA/Percentage</label>
                            <input type="text" class="cgpa" placeholder="8.5 CGPA" value="${edu.cgpa || ''}">
                            <div class="suggestion-chip">Specify if it's CGPA or percentage (e.g., "8.5/10 CGPA" or "85%")</div>
                        </div>
                    `;
                    educationEntries.appendChild(newEntry);
                    
                    // Add event listeners
                    newEntry.querySelectorAll('input').forEach(input => {
                        input.addEventListener('input', updateResumePreview);
                        input.addEventListener('focus', showSuggestion);
                        input.addEventListener('blur', hideSuggestion);
                    });
                    
                    // Add remove button functionality
                    newEntry.querySelector('.entry-remove').addEventListener('click', function() {
                        newEntry.remove();
                        updateResumePreview();
                    });
                });
            }
            
            // Fill experience entries
            if (resumeData.experience && resumeData.experience.length > 0) {
                const experienceEntries = document.getElementById('experience-entries');
                experienceEntries.innerHTML = ''; // Clear default entry
                
                resumeData.experience.forEach(exp => {
                    const newEntry = document.createElement('div');
                    newEntry.className = 'experience-entry';
                    newEntry.innerHTML = `
                        <button type="button" class="entry-remove"><i class="fas fa-times"></i></button>
                        <div class="form-group">
                            <label>Job Title</label>
                            <input type="text" class="job-title" placeholder="Software Engineer Intern" value="${exp.jobTitle || ''}">
                            <div class="suggestion-chip">Be specific with your role (e.g., "Frontend Developer" instead of just "Developer")</div>
                        </div>
                        <div class="form-group">
                            <label>Company</label>
                            <input type="text" class="company" placeholder="Tech Solutions Ltd." value="${exp.company || ''}">
                            <div class="suggestion-chip">Include company location if relevant (e.g., "Google, Bangalore")</div>
                        </div>
                        <div class="form-row">
                            <div class="form-group half">
                                <label>Start Date</label>
                                <input type="text" class="start-date" placeholder="June 2023" value="${exp.startDate || ''}">
                                <div class="suggestion-chip">Month and year format is best (e.g., "May 2022")</div>
                            </div>
                            <div class="form-group half">
                                <label>End Date</label>
                                <input type="text" class="end-date" placeholder="August 2023 (or Present)" value="${exp.endDate || ''}">
                                <div class="suggestion-chip">Use "Present" for current positions</div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Responsibilities & Achievements</label>
                            <textarea class="responsibilities" rows="4" placeholder="• Developed a feature that improved efficiency by 20%&#10;• Collaborated with a team of 5 developers&#10;• Implemented responsive design for mobile users">${exp.responsibilities || ''}</textarea>
                            <div class="suggestion-chip">Use bullet points and quantify achievements when possible</div>
                            <button type="button" class="suggestion-btn" data-target="responsibilities">Show Examples</button>
                        </div>
                    `;
                    experienceEntries.appendChild(newEntry);
                    
                    // Add event listeners
                    newEntry.querySelectorAll('input, textarea').forEach(input => {
                        input.addEventListener('input', updateResumePreview);
                        input.addEventListener('focus', showSuggestion);
                        input.addEventListener('blur', hideSuggestion);
                    });
                    
                    // Add remove button functionality
                    newEntry.querySelector('.entry-remove').addEventListener('click', function() {
                        newEntry.remove();
                        updateResumePreview();
                    });
                    
                    // Add suggestion button functionality
                    newEntry.querySelector('.suggestion-btn').addEventListener('click', function() {
                        const target = this.getAttribute('data-target');
                        const textArea = this.parentElement.querySelector('textarea');
                        const randomIndex = Math.floor(Math.random() * suggestiveText[target].length);
                        textArea.value = suggestiveText[target][randomIndex];
                        updateResumePreview();
                    });
                });
            }
            
            // Fill skills
            if (resumeData.skills) {
                document.getElementById('technical-skills').value = resumeData.skills.technical || '';
                document.getElementById('soft-skills').value = resumeData.skills.soft || '';
                document.getElementById('languages').value = resumeData.skills.languages || '';
            }
            
            // Fill project entries
            if (resumeData.projects && resumeData.projects.length > 0) {
                const projectEntries = document.getElementById('project-entries');
                projectEntries.innerHTML = ''; // Clear default entry
                
                resumeData.projects.forEach(project => {
                    const newEntry = document.createElement('div');
                    newEntry.className = 'project-entry';
                    newEntry.innerHTML = `
                        <button type="button" class="entry-remove"><i class="fas fa-times"></i></button>
                        <div class="form-group">
                            <label>Project Name</label>
                            <input type="text" class="project-name" placeholder="E-commerce Website" value="${project.name || ''}">
                            <div class="suggestion-chip">Use a descriptive name that indicates the project's purpose</div>
                        </div>
                        <div class="form-group">
                            <label>Technologies Used</label>
                            <input type="text" class="technologies" placeholder="React, Node.js, MongoDB" value="${project.technologies || ''}">
                            <div class="suggestion-chip">List all relevant technologies, frameworks, and tools</div>
                        </div>
                        <div class="form-group">
                            <label>Project Description</label>
                            <textarea class="project-description" rows="4" placeholder="• Built a full-stack e-commerce platform&#10;• Implemented user authentication and payment gateway&#10;• Designed responsive UI for all devices">${project.description || ''}</textarea>
                            <div class="suggestion-chip">Describe your role, challenges overcome, and outcomes</div>
                            <button type="button" class="suggestion-btn" data-target="projectDesc">Show Examples</button>
                        </div>
                        <div class="form-group">
                            <label>Project Link (Optional)</label>
                            <input type="url" class="project-link" placeholder="https://github.com/yourusername/project" value="${project.link || ''}">
                            <div class="suggestion-chip">Include GitHub repo, live demo, or documentation link</div>
                        </div>
                    `;
                    projectEntries.appendChild(newEntry);
                    
                    // Add event listeners
                    newEntry.querySelectorAll('input, textarea').forEach(input => {
                        input.addEventListener('input', updateResumePreview);
                        input.addEventListener('focus', showSuggestion);
                        input.addEventListener('blur', hideSuggestion);
                    });
                    
                    // Add remove button functionality
                    newEntry.querySelector('.entry-remove').addEventListener('click', function() {
                        newEntry.remove();
                        updateResumePreview();
                    });
                    
                    // Add suggestion button functionality
                    newEntry.querySelector('.suggestion-btn').addEventListener('click', function() {
                        const target = this.getAttribute('data-target');
                        const textArea = this.parentElement.querySelector('textarea');
                        const randomIndex = Math.floor(Math.random() * suggestiveText[target].length);
                        textArea.value = suggestiveText[target][randomIndex];
                        updateResumePreview();
                    });
                });
            }
            
            // Update preview
            updateResumePreview();
        }
    }
    
    // Add remove button functionality to initial entries
    document.querySelectorAll('.entry-remove').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.education-entry, .experience-entry, .project-entry').remove();
            updateResumePreview();
        });
    });
        // PDF export functionality
    function exportToPDF() {
        // Create a clone of the preview to modify for PDF export
        const previewClone = document.querySelector('.resume-preview').cloneNode(true);
        
        // Apply specific styling for PDF export to ensure proper sizing
        previewClone.style.width = '210mm'; // A4 width
        previewClone.style.minHeight = '297mm'; // A4 height
        previewClone.style.padding = '15mm'; // Add some padding
        previewClone.style.boxSizing = 'border-box';
        previewClone.style.backgroundColor = 'white';
        previewClone.style.position = 'absolute';
        previewClone.style.left = '-9999px';
        previewClone.style.top = '-9999px';
        
        // Add the clone to the document for html2pdf to process
        document.body.appendChild(previewClone);
        
        // Configure html2pdf options
        const options = {
            margin: 10,
            filename: `${document.getElementById('name').value || 'resume'}_resume.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };
        
        // Generate PDF
        html2pdf().from(previewClone).set(options).save().then(() => {
            // Remove the clone after PDF generation
            document.body.removeChild(previewClone);
        });
    }
    
    // DOCX export functionality
    function exportToDOCX() {
        // Get resume data
        const resumeData = getResumeData();
        
        // Create a new Document
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: resumeData.personalInfo.name,
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({
                        text: `${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}`,
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({
                        text: "Education",
                        heading: HeadingLevel.HEADING_2
                    })
                ]
            }]
        });
        
        // Add education entries
        resumeData.education.forEach(edu => {
            doc.addSection({
                children: [
                    new Paragraph({
                        text: `${edu.degree} - ${edu.institution}`,
                        bold: true
                    }),
                    new Paragraph({
                        text: `${edu.startDate} - ${edu.endDate} | GPA: ${edu.gpa}`
                    })
                ]
            });
        });
        
        // Add experience section
        doc.addSection({
            children: [
                new Paragraph({
                    text: "Experience",
                    heading: HeadingLevel.HEADING_2
                })
            ]
        });
        
        // Add experience entries
        resumeData.experience.forEach(exp => {
            doc.addSection({
                children: [
                    new Paragraph({
                        text: `${exp.position} - ${exp.company}`,
                        bold: true
                    }),
                    new Paragraph({
                        text: `${exp.startDate} - ${exp.endDate} | ${exp.location}`
                    }),
                    new Paragraph({
                        text: exp.description
                    })
                ]
            });
        });
        
        // Add skills section
        doc.addSection({
            children: [
                new Paragraph({
                    text: "Skills",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    text: resumeData.skills.join(", ")
                })
            ]
        });
        
        // Add projects section
        doc.addSection({
            children: [
                new Paragraph({
                    text: "Projects",
                    heading: HeadingLevel.HEADING_2
                })
            ]
        });
        
        // Add project entries
        resumeData.projects.forEach(project => {
            doc.addSection({
                children: [
                    new Paragraph({
                        text: project.title,
                        bold: true
                    }),
                    new Paragraph({
                        text: project.description
                    })
                ]
            });
        });
        
        // Generate and save the document
        Packer.toBlob(doc).then(blob => {
            const fileName = `${resumeData.personalInfo.name || 'resume'}_resume.docx`;
            saveAs(blob, fileName);
        });
    }
    
    // Function to handle template selection
    function selectTemplate(templateId) {
        // Remove active class from all templates
        document.querySelectorAll('.template-option').forEach(template => {
            template.classList.remove('active');
        });
        
        // Add active class to selected template
        document.getElementById(templateId).classList.add('active');
        
        // Update the preview with the selected template
        const previewContainer = document.querySelector('.resume-preview');
        previewContainer.className = 'resume-preview';
        previewContainer.classList.add(templateId);
        
        // Save the selected template to local storage
        localStorage.setItem('selectedTemplate', templateId);
        
        // Update the preview with current data
        updatePreview();
    }
    
    // Function to add placeholder/suggestive text to input fields
    function addSuggestiveText() {
        // Personal Information suggestions
        document.getElementById('name').placeholder = 'e.g., John Doe';
        document.getElementById('email').placeholder = 'e.g., john.doe@example.com';
        document.getElementById('phone').placeholder = 'e.g., (555) 123-4567';
        document.getElementById('location').placeholder = 'e.g., New York, NY';
        document.getElementById('summary').placeholder = 'e.g., Dedicated software engineer with 5 years of experience in web development...';
        
        // Education field suggestions
        document.querySelectorAll('.education-entry').forEach(entry => {
            entry.querySelector('[name="degree"]').placeholder = 'e.g., Bachelor of Science in Computer Science';
            entry.querySelector('[name="institution"]').placeholder = 'e.g., University of Technology';
            entry.querySelector('[name="startDate"]').placeholder = 'e.g., Aug 2018';
            entry.querySelector('[name="endDate"]').placeholder = 'e.g., May 2022 or Present';
            entry.querySelector('[name="gpa"]').placeholder = 'e.g., 3.8/4.0';
        });
        
        // Experience field suggestions
        document.querySelectorAll('.experience-entry').forEach(entry => {
            entry.querySelector('[name="position"]').placeholder = 'e.g., Software Developer';
            entry.querySelector('[name="company"]').placeholder = 'e.g., Tech Solutions Inc.';
            entry.querySelector('[name="location"]').placeholder = 'e.g., San Francisco, CA';
            entry.querySelector('[name="startDate"]').placeholder = 'e.g., Jan 2020';
            entry.querySelector('[name="endDate"]').placeholder = 'e.g., Present or Dec 2022';
            entry.querySelector('[name="description"]').placeholder = 'e.g., Developed and maintained web applications using React.js and Node.js...';
        });
        
        // Skills field suggestions
        document.querySelectorAll('.skills-entry input').forEach(input => {
            input.placeholder = 'e.g., JavaScript, Python, Project Management';
        });
        
        // Projects field suggestions
        document.querySelectorAll('.project-entry').forEach(entry => {
            entry.querySelector('[name="title"]').placeholder = 'e.g., E-commerce Website';
            entry.querySelector('[name="description"]').placeholder = 'e.g., Developed a responsive e-commerce platform with shopping cart functionality...';
        });
    }
    
    // Initialize the application
    function init() {
        // Set up event listeners for form navigation
        setupFormNavigation();
        
        // Set up event listeners for dynamic form fields
        setupDynamicFields();
        
        // Load saved data from local storage
        loadSavedData();
        
        // Add suggestive text to input fields
        addSuggestiveText();
        
        // Set up event listeners for form inputs to update preview
        setupPreviewUpdates();
        
        // Set up event listeners for export buttons
        document.getElementById('export-pdf').addEventListener('click', exportToPDF);
        document.getElementById('export-docx').addEventListener('click', exportToDOCX);
        
        // Set up event listeners for template selection
        document.querySelectorAll('.template-option').forEach(template => {
            template.addEventListener('click', () => {
                selectTemplate(template.id);
            });
        });
        
        // Initialize with the default template or the saved one
        const savedTemplate = localStorage.getItem('selectedTemplate') || 'template-professional';
        selectTemplate(savedTemplate);
        
        // Initial preview update
        updatePreview();
    }
    
    // Initialize the application when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', init);
})();