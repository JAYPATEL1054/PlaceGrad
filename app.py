from flask import Flask, request, jsonify, send_from_directory
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

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)  # Enable CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ResumeAnalyzer:
    def __init__(self):
        self.technical_skills = [
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
            'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring',
            'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
            'machine learning', 'deep learning', 'ai', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch',
            'agile', 'scrum', 'devops', 'ci/cd', 'rest api', 'graphql', 'microservices'
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
            logger.error(f"Error extracting text from PDF: {e}")
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

@app.route('/analyze', methods=['POST'])
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


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Resume Analyzer API is running',
        'version': '1.0.0'
    })


@app.route("/", methods=["GET"])
def index():
    return send_from_directory(".", "myresume.html")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
