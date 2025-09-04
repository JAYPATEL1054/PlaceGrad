from flask import Flask, render_template, request, jsonify, session

app = Flask(__name__)
app.secret_key = "supersecret"   # required for session

# Bot logic
def get_bot_response(msg):
    msg = msg.lower()

    # Greetings
    if "hello" in msg or "hi" in msg:
        return "Hello 👋! How can I help you — with interviews, placements, resume tips, technical prep, or company details?"

    if "synoptek" in msg:
        return ("🏢 **Synoptek Placement & Internship Info**\n"
            "📌 Positions & Vacancies (Full-time):\n"
            "   • Software Engineer → 20 openings\n"
            "   • Support Engineer → 10 openings\n"
            "   • Data Analyst → 5 openings\n"
            "   • Network Engineer → 6 openings\n"
            "   • Cloud Engineer → 4 openings\n"
            "🎓 Eligibility: Min 60% throughout academics\n"
            "🛠 Requirements: Java/Python, SQL, Networking, Cloud basics\n"
            "📑 Bond: 2 years\n"
            "💼 Internship: Software Engineer Intern → 6 months, Stipend ₹20,000/month\n")

    if "openxcell" in msg or "open excel" in msg:
        return ("🏢 **OpenXcell Placement & Internship Info**\n"
            "📌 Positions & Vacancies (Full-time):\n"
            "   • Software Developer → 15 openings\n"
            "   • QA Engineer → 8 openings\n"
            "   • Mobile App Developer (Android/iOS) → 6 openings\n"
            "   • UI/UX Designer → 4 openings\n"
            "   • DevOps Engineer → 3 openings\n"
            "🎓 Eligibility: Min 55% aggregate\n"
            "🛠 Requirements: Web Development, Mobile App, Testing, UI/UX\n"
            "📑 Bond: 2 years\n"
            "💼 Internship: Mobile App Developer Intern → 4 months, Stipend ₹12,000/month\n")

    if "einfochips" in msg:
        return ("🏢 **eInfochips Placement & Internship Info**\n"
            "📌 Positions & Vacancies (Full-time):\n"
            "   • Embedded Engineer → 12 openings\n"
            "   • VLSI Engineer → 10 openings\n"
            "   • Software Engineer → 18 openings\n"
            "   • Hardware Design Engineer → 8 openings\n"
            "   • AI/ML Engineer → 6 openings\n"
            "   • Verification Engineer → 7 openings\n"
            "🎓 Eligibility: Min 65% aggregate\n"
            "🛠 Requirements: C/C++, Embedded Systems, Digital Electronics, AI/ML\n"
            "📑 Bond: 3 years\n"
            "💼 Internship: Embedded Systems Intern → 6 months, Stipend ₹18,000/month\n")

    if "motadata" in msg:
        return ("🏢 **Motadata Placement & Internship Info**\n"
            "📌 Positions & Vacancies (Full-time):\n"
            "   • Software Engineer (R&D, Product Dev) → 10 openings\n"
            "   • Backend Developer → 5 openings\n"
            "   • Frontend Developer → 5 openings\n"
            "   • DevOps Engineer → 3 openings\n"
            "🎓 Eligibility: Min 60% aggregate\n"
            "🛠 Requirements: Java, Networking, Linux, ReactJS, APIs, Cloud\n"
            "📑 Bond: 2 years\n"
            "💼 Internship: QA/Testing Intern → 3 months, Stipend ₹10,000/month\n")

    if "rtcamp" in msg:
        return ("🏢 **RtCamp Placement & Internship Info**\n"
            "📌 Positions & Vacancies (Full-time):\n"
            "   • Web Developer (WordPress, PHP, JS) → 7 openings\n"
            "   • Frontend Engineer (ReactJS) → 5 openings\n"
            "   • Backend Engineer (PHP, Node.js) → 4 openings\n"
            "   • QA Automation Engineer → 3 openings\n"
            "   • DevOps Engineer → 2 openings\n"
            "🎓 Eligibility: Min 55% aggregate\n"
            "🛠 Requirements: PHP, JavaScript, React, DevOps, Testing\n"
            "📑 Bond: No bond mentioned\n"
            "💼 Internship: Web Developer Intern → 3–6 months, Stipend ₹8,000/month\n")


    if "upcoming companies" in msg or "companies" in msg:
        return ("📢 Upcoming Companies & Openings:\n"
                "1️⃣ Synoptek → 45 positions (Software 20, Support 10, Data 5, Network 6, Cloud 4)\n"
                "2️⃣ OpenXcell → 36 positions (Developer 15, QA 8, Mobile 6, UI/UX 4, DevOps 3)\n"
                "3️⃣ eInfochips → 61 positions (Embedded 12, VLSI 10, Software 18, Hardware 8, AI/ML 6, Verification 7)\n"
                "4️⃣ Motadata → 23 positions (Software 10, Backend 5, Frontend 5, DevOps 3)\n"
                "5️⃣ RtCamp → 21 positions (Web 7, Frontend 5, Backend 4, QA 3, DevOps 2)\n")
    
    # Interview-related
    if "interviews" in msg or "interview tips" in msg:
        return "✅ Interview Tips:\n1. Research the company\n2. Prepare HR & technical questions\n3. Be confident and clear."

    if "common interview" in msg:
        return "📝 Common HR Qs: Tell me about yourself, Strengths/Weaknesses, Why should we hire you?"

    if "how to prepare for interview" in msg:
        return "📚 To prepare well:\n• Review the job role\n• Do mock interviews\n• Revise core subjects\n• Use STAR method."

    # Placement-related
    if "placement process" in msg or "placements" in msg:
        return "📌 Placement process: Aptitude → Group Discussion → Technical Interview → HR Interview."

    if "placement tips" in msg:
        return "📈 Tips: Practice aptitude, improve coding skills, revise CS fundamentals, and polish soft skills."

    if "on-campus" in msg:
        return "🏫 On-campus placements are organized by the college TPO. Keep checking announcements and apply on time."

    if "off-campus" in msg:
        return "🌐 Off-campus placements happen through job portals, LinkedIn, referrals, and company websites."

    if "aptitude" in msg:
        return "🧮 Aptitude rounds usually test Quantitative, Logical Reasoning, and Verbal skills. Practice daily for speed."

    if "group discussion" in msg or "gd" in msg:
        return "💬 GD tips: Stay calm, contribute 2-3 strong points, listen actively, and don’t interrupt others."

    if "technical interview" in msg:
        return "💻 Technical interview covers DS & Algorithms, OOPs, DBMS, OS, and sometimes coding tests."

    if "hr interview" in msg:
        return "👔 HR round checks personality, confidence, and culture fit. Be polite and genuine."

    if "dress code" in msg or "what to wear" in msg:
        return "👕 Dress formally for placements: light-colored shirt, dark trousers, neat shoes. For women: formal shirt & trousers or kurti."

    if "communication skills" in msg:
        return "🗣 Strong communication helps in GDs & interviews. Practice speaking in English, join debates, and read aloud daily."

    if "company research" in msg:
        return "🔍 Before an interview, research company profile, recent projects, values, and competitors."

    if "mock test" in msg:
        return "📝 Take mock aptitude tests and coding challenges on platforms like HackerRank, LeetCode, and GeeksforGeeks."

    if "placement preparation timeline" in msg:
        return "📅 Start 6 months before placements: 3 months aptitude + coding, 2 months projects & resume, 1 month mock interviews."

    if "resume screening" in msg:
        return "📄 Many companies filter candidates through ATS. Use keywords from job description and keep resume concise."

    if "skills required" in msg:
        return "⚡ Key skills: Coding (C/C++/Java/Python), Problem Solving, DBMS, OS, OOPs, Communication, and Teamwork."

    # Resume
    if "resume tips" in msg:
        return "📄 Resume should be concise, 1 page ideally, highlight internships/projects, use clean format."

    if "how to make resume" in msg or "build resume" in msg:
        return "🛠️ Tools like Canva, Zety, or Overleaf help. Focus on achievements, not just responsibilities."

    # Internships
    if "internships" in msg or "internship tips" in msg:
        return "🌟 Internships provide real-world experience. Apply early, tailor your resume, and prepare for interviews."
    if "where to find internships" in msg:
        return "🔍 Find internships on LinkedIn, Internshala, AngelList, and company career pages."
    if "how to apply for internships" in msg:
        return "📝 Tailor your resume and cover letter for each application. Follow up politely after applying."
    
    # Soft skills
    if "soft skills" in msg:
        return "🗣 Improve communication, teamwork, time management. Join speaking clubs or do mock sessions."

    # CGPA
    if "cgpa" in msg:
        return "🎯 CGPA matters, but it's not everything. Focus on real-world skills and projects too."

    # Projects
    if "projects" in msg:
        return "🚀 Projects prove your practical skills. Host them on GitHub, write documentation, and demo links."

    # General fallback
    return "❓ I'm not sure I understood that. Try asking about 'resume tips', 'interview tips', or 'placement process'."

# Routes
@app.route("/")
def home():
    return render_template("home.html") 

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True)
    user_message = data.get("message", "") if data else ""
    reply = get_bot_response(user_message)

    if "conversation" not in session:
        session["conversation"] = []
    session["conversation"].append({"role": "User", "message": user_message})
    session["conversation"].append({"role": "Bot", "message": reply})
    session.modified = True

    return jsonify({"reply": reply})

@app.route("/history")
def history():
    return jsonify(session.get("conversation", []))

@app.route("/clear", methods=["POST"])
def clear():
    session.pop("conversation", None)
    return jsonify({"status": "cleared"})

if __name__ == "__main__":
    app.run(debug=True)
