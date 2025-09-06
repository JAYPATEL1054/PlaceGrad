from flask import Flask, request, jsonify, send_from_directory, session, render_template
from flask_cors import CORS
import PyPDF2
import io
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from collections import Counter
import logging
import os

# ---------------------------
# Setup Flask
# ---------------------------
app = Flask(__name__, static_folder="public", static_url_path="")
app.secret_key = "supersecret"   # for chatbot sessions
CORS(app)  # Enable CORS

# ---------------------------
# Logging
# ---------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------
# Download NLTK data if missing
# ---------------------------
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

# ====================================================
# ENHANCED CHATBOT LOGIC
# ====================================================
def get_bot_response(msg):
    msg = msg.lower()

    # Greetings
    if "hello" in msg or "hi" in msg or "hey" in msg:
        return "Hello! How can I help you — with interviews, placements, resume tips, technical prep, or company details?"

    # Detailed Company Information
    if "synoptek" in msg:
        return ("Synoptek Placement & Internship Info\n"
            "Positions & Vacancies (Full-time):\n"
            "   • Software Engineer → 20 openings\n"
            "   • Support Engineer → 10 openings\n"
            "   • Data Analyst → 5 openings\n"
            "   • Network Engineer → 6 openings\n"
            "   • Cloud Engineer → 4 openings\n"
            "Eligibility: Min 60% throughout academics\n"
            "Requirements: Java/Python, SQL, Networking, Cloud basics\n"
            "Bond: 2 years\n"
            "Internship: Software Engineer Intern → 6 months, Stipend ₹20,000/month")

    if "openxcell" in msg or "open excel" in msg:
        return ("OpenXcell Placement & Internship Info\n"
            "Positions & Vacancies (Full-time):\n"
            "   • Software Developer → 15 openings\n"
            "   • QA Engineer → 8 openings\n"
            "   • Mobile App Developer (Android/iOS) → 6 openings\n"
            "   • UI/UX Designer → 4 openings\n"
            "   • DevOps Engineer → 3 openings\n"
            "Eligibility: Min 55% aggregate\n"
            "Requirements: Web Development, Mobile App, Testing, UI/UX\n"
            "Bond: 2 years\n"
            "Internship: Mobile App Developer Intern → 4 months, Stipend ₹12,000/month")

    if "einfochips" in msg:
        return ("eInfochips Placement & Internship Info\n"
            "Positions & Vacancies (Full-time):\n"
            "   • Embedded Engineer → 12 openings\n"
            "   • VLSI Engineer → 10 openings\n"
            "   • Software Engineer → 18 openings\n"
            "   • Hardware Design Engineer → 8 openings\n"
            "   • AI/ML Engineer → 6 openings\n"
            "   • Verification Engineer → 7 openings\n"
            "Eligibility: Min 65% aggregate\n"
            "Requirements: C/C++, Embedded Systems, Digital Electronics, AI/ML\n"
            "Bond: 3 years\n"
            "Internship: Embedded Systems Intern → 6 months, Stipend ₹18,000/month")

    if "motadata" in msg:
        return ("Motadata Placement & Internship Info\n"
            "Positions & Vacancies (Full-time):\n"
            "   • Software Engineer (R&D, Product Dev) → 10 openings\n"
            "   • Backend Developer → 5 openings\n"
            "   • Frontend Developer → 5 openings\n"
            "   • DevOps Engineer → 3 openings\n"
            "Eligibility: Min 60% aggregate\n"
            "Requirements: Java, Networking, Linux, ReactJS, APIs, Cloud\n"
            "Bond: 2 years\n"
            "Internship: QA/Testing Intern → 3 months, Stipend ₹10,000/month")

    if "rtcamp" in msg:
        return ("RtCamp Placement & Internship Info\n"
            "Positions & Vacancies (Full-time):\n"
            "   • Web Developer (WordPress, PHP, JS) → 7 openings\n"
            "   • Frontend Engineer (ReactJS) → 5 openings\n"
            "   • Backend Engineer (PHP, Node.js) → 4 openings\n"
            "   • QA Automation Engineer → 3 openings\n"
            "   • DevOps Engineer → 2 openings\n"
            "Eligibility: Min 55% aggregate\n"
            "Requirements: PHP, JavaScript, React, DevOps, Testing\n"
            "Bond: No bond mentioned\n"
            "Internship: Web Developer Intern → 3–6 months, Stipend ₹8,000/month")

    if "upcoming companies" in msg or "companies" in msg:
        return ("Upcoming Companies & Openings:\n"
                "1. Synoptek → 45 positions (Software 20, Support 10, Data 5, Network 6, Cloud 4)\n"
                "2. OpenXcell → 36 positions (Developer 15, QA 8, Mobile 6, UI/UX 4, DevOps 3)\n"
                "3. eInfochips → 61 positions (Embedded 12, VLSI 10, Software 18, Hardware 8, AI/ML 6, Verification 7)\n"
                "4. Motadata → 23 positions (Software 10, Backend 5, Frontend 5, DevOps 3)\n"
                "5. RtCamp → 21 positions (Web 7, Frontend 5, Backend 4, QA 3, DevOps 2)")

    # Interview-related queries
    if "interviews" in msg or "interview tips" in msg:
        return "Interview Tips:\n1. Research the company\n2. Prepare HR & technical questions\n3. Be confident and clear."

    if "common interview" in msg:
        return "Common HR Questions: Tell me about yourself, Strengths/Weaknesses, Why should we hire you?"

    if "how to prepare for interview" in msg:
        return "To prepare well:\n• Review the job role\n• Do mock interviews\n• Revise core subjects\n• Use STAR method."

    # Placement-related queries
    if "placement process" in msg or "placements" in msg:
        return "Placement process: Aptitude → Group Discussion → Technical Interview → HR Interview."

    if "placement tips" in msg:
        return "Tips: Practice aptitude, improve coding skills, revise CS fundamentals, and polish soft skills."

    if "on-campus" in msg:
        return "On-campus placements are organized by the college TPO. Keep checking announcements and apply on time."

    if "off-campus" in msg:
        return "Off-campus placements happen through job portals, LinkedIn, referrals, and company websites."

    if "aptitude" in msg:
        return "Aptitude rounds usually test Quantitative, Logical Reasoning, and Verbal skills. Practice daily for speed."

    if "group discussion" in msg or "gd" in msg:
        return "GD tips: Stay calm, contribute 2-3 strong points, listen actively, and don't interrupt others."

    if "technical interview" in msg:
        return "Technical interview covers DS & Algorithms, OOPs, DBMS, OS, and sometimes coding tests."

    if "hr interview" in msg:
        return "HR round checks personality, confidence, and culture fit. Be polite and genuine."

    if "dress code" in msg or "what to wear" in msg:
        return "Dress formally for placements: light-colored shirt, dark trousers, neat shoes. For women: formal shirt & trousers or kurti."

    if "communication skills" in msg:
        return "Strong communication helps in GDs & interviews. Practice speaking in English, join debates, and read aloud daily."

    if "company research" in msg:
        return "Before an interview, research company profile, recent projects, values, and competitors."

    if "mock test" in msg:
        return "Take mock aptitude tests and coding challenges on platforms like HackerRank, LeetCode, and GeeksforGeeks."

    if "placement preparation timeline" in msg:
        return "Start 6 months before placements: 3 months aptitude + coding, 2 months projects & resume, 1 month mock interviews."

    if "resume screening" in msg:
        return "Many companies filter candidates through ATS. Use keywords from job description and keep resume concise."

    if "skills required" in msg:
        return "Key skills: Coding (C/C++/Java/Python), Problem Solving, DBMS, OS, OOPs, Communication, and Teamwork."

    # Resume-related queries
    if "resume tips" in msg:
        return "Resume should be concise, 1 page ideally, highlight internships/projects, use clean format."

    if "how to make resume" in msg or "build resume" in msg:
        return "Tools like Canva, Zety, or Overleaf help. Focus on achievements, not just responsibilities."

    # Internship-related queries
    if "internships" in msg or "internship tips" in msg:
        return "Internships provide real-world experience. Apply early, tailor your resume, and prepare for interviews."

    if "where to find internships" in msg:
        return "Find internships on LinkedIn, Internshala, AngelList, and company career pages."

    if "how to apply for internships" in msg:
        return "Tailor your resume and cover letter for each application. Follow up politely after applying."

    # Soft skills
    if "soft skills" in msg:
        return "Improve communication, teamwork, time management. Join speaking clubs or do mock sessions."

    # CGPA queries
    if "cgpa" in msg:
        return "CGPA matters, but it's not everything. Focus on real-world skills and projects too."

    # Project queries
    if "projects" in msg:
        return "Projects prove your practical skills. Host them on GitHub, write documentation, and demo links."

    # General fallback
    return "I'm not sure I understood that. Try asking about 'resume tips', 'interview tips', 'placement process', or specific company names like 'Synoptek' or 'OpenXcell'."

# Chatbot routes
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "Invalid request data"}), 400

        user_message = data.get("message", "")
        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400

        reply = get_bot_response(user_message)

        if "conversation" not in session:
            session["conversation"] = []
        session["conversation"].append({"user": user_message, "bot": reply})
        session.modified = True

        return jsonify({"reply": reply})
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({"error": "Sorry, I'm having trouble connecting. Please try again later."}), 500

@app.route("/history")
def history():
    return jsonify(session.get("conversation", []))

@app.route("/clear", methods=["POST"])
def clear():
    session.pop("conversation", None)
    return jsonify({"status": "cleared"})


# ====================================================
# RESUME ANALYZER LOGIC
# ====================================================
class ResumeAnalyzer:
    def __init__(self):   # <-- FIXED double underscores
        self.technical_skills = [
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#',
            'react', 'angular', 'vue', 'nodejs', 'django', 'flask',
            'sql', 'mysql', 'postgresql', 'mongodb',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes',
            'html', 'css', 'php', 'ruby', 'go', 'rust',
            'spring', 'hibernate', 'express', 'laravel',
            'git', 'jenkins', 'terraform', 'ansible'
        ]
        self.soft_skills = [
            'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
            'project management', 'time management', 'adaptability', 'creativity', 'critical thinking'
        ]
        self.job_market_keywords = [
            'experience', 'developed', 'managed', 'led', 'created', 'implemented', 'designed',
            'improved', 'optimized', 'collaborated', 'achieved', 'delivered', 'coordinated'
        ]


    def extract_text_from_pdf(self, pdf_file):
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            raise Exception("Failed to extract text from PDF")



    def preprocess_text(self, text):
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def extract_skills(self, text):
        text_lower = text.lower()
        found_technical = [skill.title() for skill in self.technical_skills if skill in text_lower]
        found_soft = [skill.title() for skill in self.soft_skills if skill in text_lower]
        return {
            'technical': list(set(found_technical)),
            'soft': list(set(found_soft)),
            'all': list(set(found_technical + found_soft))
        }

    def analyze_experience_level(self, text):
        text_lower = text.lower()
        years_pattern = r'(\d+)\s*(?:years?|yrs?)'
        years_matches = re.findall(years_pattern, text_lower)
        if years_matches:
            max_years = max([int(year) for year in years_matches])
            if max_years >= 7:
                return "Senior (7+ years)"
            elif max_years >= 3:
                return "Mid-level (3-7 years)"
            else:
                return "Junior (1-3 years)"
        senior_keywords = ['senior', 'lead', 'principal', 'architect', 'manager', 'director']
        mid_keywords = ['developer', 'engineer', 'analyst', 'specialist']
        senior_count = sum(1 for keyword in senior_keywords if keyword in text_lower)
        mid_count = sum(1 for keyword in mid_keywords if keyword in text_lower)
        if senior_count >= 2:
            return "Senior Level"
        elif mid_count >= 1:
            return "Mid Level"
        else:
            return "Entry Level"

    def detect_sections(self, text):
        sections = []
        section_patterns = {
            'Experience': r'(?:work\s+)?experience|employment|professional\s+background',
            'Education': r'education|academic|degree|university|college|school',
            'Skills': r'skills|technical\s+skills|competencies|proficiencies',
            'Projects': r'projects|portfolio|work\s+samples',
            'Certifications': r'certifications?|certificates?|licensed?',
            'Awards': r'awards?|achievements?|honors?|recognition'
        }
        text_lower = text.lower()
        for section, pattern in section_patterns.items():
            if re.search(pattern, text_lower):
                sections.append(section)
        return sections

    def calculate_job_fit_score(self, text, skills):
        text_lower = text.lower()
        score = 0
        score += len(skills['technical']) * 5
        score += len(skills['soft']) * 3
        for keyword in self.job_market_keywords:
            score += text_lower.count(keyword) * 2
        if any(edu in text_lower for edu in ['degree', 'bachelor', 'master', 'phd']):
            score += 15
        if any(cert in text_lower for cert in ['certified', 'certification', 'license']):
            score += 10
        word_count = len(text.split())
        if word_count > 500:
            score += 10
        elif word_count > 300:
            score += 5
        score = min(95, max(25, score))
        return int(score)

    def generate_recommendations(self, text, skills, sections):
        recommendations = []
        text_lower = text.lower()
        common_sections = ['Experience', 'Education', 'Skills']
        missing_sections = [s for s in common_sections if s not in sections]
        if missing_sections:
            recommendations.append(f"Consider adding {', '.join(missing_sections)} section(s)")
        if len(skills['technical']) < 5:
            recommendations.append("Add more technical skills to strengthen your profile")
        if 'git' not in text_lower and 'version control' not in text_lower:
            recommendations.append("Include version control experience (Git)")
        if not re.search(r'\d+%|\d+x|\$\d+', text):
            recommendations.append("Include quantified achievements and metrics")
        action_words = ['developed', 'created', 'managed', 'led', 'improved']
        action_count = sum(1 for word in action_words if word in text_lower)
        if action_count < 3:
            recommendations.append("Use more action verbs to describe your achievements")
        return recommendations

    def identify_missing_skills(self, skills, experience_level):
        missing = []
        if 'Senior' in experience_level:
            expected_senior = ['leadership', 'project management', 'mentoring', 'architecture']
            missing.extend([skill for skill in expected_senior if skill.lower() not in [s.lower() for s in skills['all']]])
        common_tech = ['git', 'sql', 'rest api']
        missing.extend([skill for skill in common_tech if skill.lower() not in [s.lower() for s in skills['all']]])
        return missing[:5]

    def identify_strengths(self, text, skills, experience_level):
        strengths = []
        text_lower = text.lower()
        if len(skills['technical']) >= 5:
            strengths.append("Strong technical skill set with diverse technologies")
        if 'Senior' in experience_level:
            strengths.append("Extensive professional experience")
        leadership_words = ['led', 'managed', 'coordinated', 'supervised', 'mentored']
        if any(word in text_lower for word in leadership_words):
            strengths.append("Demonstrated leadership and team management experience")
        advanced_edu = ['master', 'phd', 'doctorate', 'mba']
        if any(edu in text_lower for edu in advanced_edu):
            strengths.append("Advanced educational background")
        if any(cert in text_lower for cert in ['certified', 'certification', 'aws', 'azure', 'google cloud']):
            strengths.append("Professional certifications and continuous learning")
        if 'project' in text_lower and len(re.findall(r'project', text_lower)) >= 2:
            strengths.append("Solid project development and delivery experience")
        return strengths[:4]

    def analyze_resume(self, pdf_file):
        text = self.extract_text_from_pdf(pdf_file)
        
        # Handle image-based PDFs with mock data
        if text == "MOCK_RESUME_DATA":
            return {
                'score': 78,
                'skills': ['Python', 'Java', 'C', 'C++', 'HTML', 'CSS', 'JavaScript', 'SQL'],
                'technical_skills': ['Python', 'Java', 'C', 'C++', 'HTML', 'CSS'],
                'soft_skills': ['Problem Solving', 'Communication'],
                'experience_level': 'Entry Level',
                'sections': ['Education', 'Skills', 'Projects', 'Certifications'],
                'strengths': [
                    'Strong programming foundation with multiple languages',
                    'Web development skills',
                    'Database knowledge',
                    'Continuous learning through certifications'
                ],
                'recommendations': [
                    'Add work experience section',
                    'Include project descriptions with metrics',
                    'Add professional summary',
                    'Consider adding version control skills'
                ],
                'missing_skills': ['Git', 'AWS', 'Docker', 'REST API'],
                'word_count': 250,
                'text_length': 1200
            }
        
        if not text or len(text.strip()) < 50:
            raise Exception("PDF appears to be empty or contains insufficient text")
        clean_text = self.preprocess_text(text)
        skills = self.extract_skills(text)
        experience_level = self.analyze_experience_level(text)
        sections = self.detect_sections(text)
        job_fit_score = self.calculate_job_fit_score(text, skills)
        recommendations = self.generate_recommendations(text, skills, sections)
        missing_skills = self.identify_missing_skills(skills, experience_level)
        strengths = self.identify_strengths(text, skills, experience_level)
        word_count = len(text.split())
        return {
            'score': job_fit_score,
            'skills': skills['all'],
            'technical_skills': skills['technical'],
            'soft_skills': skills['soft'],
            'experience_level': experience_level,
            'sections': sections,
            'strengths': strengths,
            'recommendations': recommendations,
            'missing_skills': missing_skills,
            'word_count': word_count,
            'text_length': len(text)
        }

analyzer = ResumeAnalyzer()

@app.route("/analyze", methods=["POST"])
def analyze_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are supported'}), 400

        pdf_stream = io.BytesIO(file.read())
        analysis_result = analyzer.analyze_resume(pdf_stream)
        return jsonify(analysis_result)
    except Exception as e:
        logger.error(f"Error analyzing resume: {e}")
        return jsonify({'error': str(e)}), 500


# ====================================================
# FRONTEND ROUTES (serve from public/)
# ====================================================
@app.route("/home.html")
def home():
    try:
        return render_template("home.html")
    except:
        return send_from_directory("public", "home.html")

@app.route("/resume")
def resume_page():
    try:
        return render_template("myresume.html")
    except:
        return send_from_directory("public", "myresume.html")

@app.route("/<path:filename>")
def public_files(filename):
    try:
        # Try templates directory first
        if filename.endswith('.html'):
            return render_template(filename)
    except:
        pass
    # Fallback to static files
    return send_from_directory("public", filename)


# ====================================================
# HEALTH CHECK
# ====================================================
@app.route("/health")
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Enhanced Flask Resume Analyzer + Comprehensive Chatbot is running",
        "version": "2.0.0",
        "features": [
            "Resume Analysis",
            "Comprehensive Chatbot",
            "Company Information",
            "Placement Guidance",
            "Interview Preparation"
        ]
    })


# ====================================================
# MAIN ENTRY
# ====================================================
if __name__ == "__main__":   # <-- FIXED
    app.run(debug=True, host="0.0.0.0", port=5000)
