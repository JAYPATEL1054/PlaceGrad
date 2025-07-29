const questions = [
    // --- General Aptitude (10) ---
    { id: 1, part: "Part 1 - General Aptitude", question: "What comes next in: 1, 4, 9, 16, ?", options: ["20", "25", "24", "30"], answer: 1 },
    { id: 2, part: "Part 1 - General Aptitude", question: "Which one is an odd one out: Pen, Pencil, Eraser, Sharpener?", options: ["Pen", "Pencil", "Eraser", "Sharpener"], answer: 0 },
    { id: 3, part: "Part 1 - General Aptitude", question: "What is the synonym of 'Happy'?", options: ["Sad", "Joyful", "Angry", "Cry"], answer: 1 },
    { id: 4, part: "Part 1 - General Aptitude", question: "Which number is divisible by both 3 and 5?", options: ["10", "15", "20", "25"], answer: 1 },
    { id: 5, part: "Part 1 - General Aptitude", question: "Find the missing letter: A, C, E, G, ?", options: ["H", "I", "J", "K"], answer: 1 },
    { id: 6, part: "Part 1 - General Aptitude", question: "Which is not a primary color?", options: ["Red", "Blue", "Green", "Yellow"], answer: 2 },
    { id: 7, part: "Part 1 - General Aptitude", question: "In which direction does the sun rise?", options: ["North", "South", "East", "West"], answer: 2 },
    { id: 8, part: "Part 1 - General Aptitude", question: "A dozen = ?", options: ["6", "10", "12", "24"], answer: 2 },
    { id: 9, part: "Part 1 - General Aptitude", question: "Which is heavier: 1 kg iron or 1 kg cotton?", options: ["Iron", "Cotton", "Both same", "None"], answer: 2 },
    { id: 10, part: "Part 1 - General Aptitude", question: "Which is not an even number?", options: ["2", "4", "7", "10"], answer: 2 },
  
    // --- Quantitative Aptitude (15) ---
    { id: 11, part: "Part 1 - Quantitative Aptitude", question: "Simplify: 45 + 25 × 2", options: ["95", "70", "60", "100"], answer: 1 },
    { id: 12, part: "Part 1 - Quantitative Aptitude", question: "What is 20% of 250?", options: ["40", "45", "50", "60"], answer: 2 },
    { id: 13, part: "Part 1 - Quantitative Aptitude", question: "Square root of 81?", options: ["7", "8", "9", "10"], answer: 2 },
    { id: 14, part: "Part 1 - Quantitative Aptitude", question: "What is 12 × 8?", options: ["96", "92", "108", "100"], answer: 0 },
    { id: 15, part: "Part 1 - Quantitative Aptitude", question: "Find x: 2x = 14", options: ["5", "6", "7", "8"], answer: 2 },
    { id: 16, part: "Part 1 - Quantitative Aptitude", question: "Area of square with side 4?", options: ["8", "16", "12", "20"], answer: 1 },
    { id: 17, part: "Part 1 - Quantitative Aptitude", question: "15 is what % of 60?", options: ["15%", "20%", "25%", "30%"], answer: 2 },
    { id: 18, part: "Part 1 - Quantitative Aptitude", question: "100 ÷ 4 + 6 = ?", options: ["31", "30", "25", "24"], answer: 0 },
    { id: 19, part: "Part 1 - Quantitative Aptitude", question: "What is (3 + 5)²?", options: ["64", "16", "36", "100"], answer: 0 },
    { id: 20, part: "Part 1 - Quantitative Aptitude", question: "12.5% of 200?", options: ["20", "25", "30", "35"], answer: 1 },
    { id: 21, part: "Part 1 - Quantitative Aptitude", question: "What is the LCM of 6 and 8?", options: ["24", "48", "12", "18"], answer: 0 },
    { id: 22, part: "Part 1 - Quantitative Aptitude", question: "Speed = Distance / ?", options: ["Mass", "Time", "Area", "Volume"], answer: 1 },
    { id: 23, part: "Part 1 - Quantitative Aptitude", question: "What is 3/4 as a decimal?", options: ["0.25", "0.5", "0.75", "1.25"], answer: 2 },
    { id: 24, part: "Part 1 - Quantitative Aptitude", question: "Cost of 5 pens at ₹12 each?", options: ["₹50", "₹60", "₹70", "₹80"], answer: 1 },
    { id: 25, part: "Part 1 - Quantitative Aptitude", question: "10² - 4² = ?", options: ["100", "96", "84", "64"], answer: 2 },
  
    // --- Spatial Aptitude (15) ---
    { id: 26, part: "Part 2 - Spatial Aptitude", question: "Cube has how many faces?", options: ["4", "5", "6", "8"], answer: 2 },
    { id: 27, part: "Part 2 - Spatial Aptitude", question: "Which shape has no corners?", options: ["Triangle", "Square", "Circle", "Rectangle"], answer: 2 },
    { id: 28, part: "Part 2 - Spatial Aptitude", question: "Mirror image of 'P' is?", options: ["d", "b", "q", "Reversed P"], answer: 3 },
    { id: 29, part: "Part 2 - Spatial Aptitude", question: "Cube has how many edges?", options: ["12", "8", "6", "4"], answer: 0 },
    { id: 30, part: "Part 2 - Spatial Aptitude", question: "Which one is 3D shape?", options: ["Square", "Circle", "Triangle", "Sphere"], answer: 3 },
    { id: 31, part: "Part 2 - Spatial Aptitude", question: "How many corners does a cube have?", options: ["4", "8", "6", "12"], answer: 1 },
    { id: 32, part: "Part 2 - Spatial Aptitude", question: "A cylinder has how many faces?", options: ["1", "2", "3", "4"], answer: 2 },
    { id: 33, part: "Part 2 - Spatial Aptitude", question: "If folded, which makes a cube?", options: ["Option A", "Option B", "Option C", "All"], answer: 3 },
    { id: 34, part: "Part 2 - Spatial Aptitude", question: "A cube painted all sides, how many unpainted?", options: ["0", "4", "6", "None"], answer: 0 },
    { id: 35, part: "Part 2 - Spatial Aptitude", question: "Which direction is right of North?", options: ["East", "West", "South", "North"], answer: 0 },
    { id: 36, part: "Part 2 - Spatial Aptitude", question: "Which shape fits best?", options: ["Circle", "Square", "Triangle", "None"], answer: 1 },
    { id: 37, part: "Part 2 - Spatial Aptitude", question: "Which pair is same?", options: ["A & E", "P & R", "C & G", "D & B"], answer: 3 },
    { id: 38, part: "Part 2 - Spatial Aptitude", question: "Top view of a cone?", options: ["Circle", "Triangle", "Dot", "Line"], answer: 0 },
    { id: 39, part: "Part 2 - Spatial Aptitude", question: "Which object has symmetry?", options: ["Book", "Pen", "Leaf", "Stone"], answer: 2 },
    { id: 40, part: "Part 2 - Spatial Aptitude", question: "Which object has a rectangular face?", options: ["Sphere", "Ball", "Box", "Egg"], answer: 2 },
  
    // --- Logical Reasoning (10) ---
    { id: 41, part: "Part 2 - Logical Reasoning", question: "Find the next number: 2, 6, 12, 20, ?", options: ["28", "30", "32", "34"], answer: 1 },
    { id: 42, part: "Part 2 - Logical Reasoning", question: "Which one is the odd one out?", options: ["Apple", "Mango", "Banana", "Carrot"], answer: 3 },
    { id: 43, part: "Part 2 - Logical Reasoning", question: "If all roses are red, and this is a rose, it is?", options: ["Red", "Blue", "Pink", "Not enough info"], answer: 0 },
    { id: 44, part: "Part 2 - Logical Reasoning", question: "Which shape completes the pattern?", options: ["A", "B", "C", "D"], answer: 2 },
    { id: 45, part: "Part 2 - Logical Reasoning", question: "If A = 1, B = 2, Z = ?", options: ["24", "25", "26", "27"], answer: 2 },
    { id: 46, part: "Part 2 - Logical Reasoning", question: "One is to Two as Three is to ?", options: ["Five", "Four", "Six", "None"], answer: 1 },
    { id: 47, part: "Part 2 - Logical Reasoning", question: "What comes next? Monday, Tuesday, Wednesday, ?", options: ["Friday", "Sunday", "Thursday", "None"], answer: 2 },
    { id: 48, part: "Part 2 - Logical Reasoning", question: "Which number is missing? 2, 4, __, 8, 10", options: ["5", "6", "7", "None"], answer: 1 },
    { id: 49, part: "Part 2 - Logical Reasoning", question: "Which direction is opposite to South-East?", options: ["North-West", "South-West", "North-East", "North"], answer: 0 },
    { id: 50, part: "Part 2 - Logical Reasoning", question: "Which shape has 3 sides?", options: ["Triangle", "Circle", "Hexagon", "Square"], answer: 0 }
  ];
  function renderQuestions() {
    const container = document.getElementById("test-container");
    let currentPart = "";
    let sectionIndex = 0;
  
    questions.forEach((q, index) => {
      if (q.part !== currentPart) {
        currentPart = q.part;
        sectionIndex++;
  
        container.innerHTML += `
          <section class="question-section section-${sectionIndex}">
            <h2 class="section-title">${q.part}</h2>
            <div id="section-${sectionIndex}-questions"></div>
          </section>
        `;
      }
  
      const questionHTML = `
        <div class="question-block">
          <p><strong>Q${index + 1}:</strong> ${q.question}</p>
          ${q.options.map((opt, i) => `
            <label>
              <input type="radio" name="q${q.id}" value="${i}"> ${opt}
            </label>
          `).join("")}
        </div>
      `;
  
      // Append to current section container
      document.getElementById(`section-${sectionIndex}-questions`).innerHTML += questionHTML;
    });
  }
  
  
  function submitTest() {
    alert("Test Submitted!");
    // You can add result evaluation here
  }
  
  // Timer
  let totalTime = 60 * 60;
  function startTimer() {
    const timerDisplay = document.getElementById("timer");
    const interval = setInterval(() => {
      let minutes = Math.floor(totalTime / 60);
      let seconds = totalTime % 60;
      timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
      if (totalTime <= 0) {
        clearInterval(interval);
        alert("Time's up!");
        submitTest();
      }
      totalTime--;
    }, 1000);
  }
  
  window.onload = function () {
    renderQuestions();
    startTimer();
  };

  function submitTest() {
    let score = 0;
    const resultContainer = document.getElementById("test-container");
    resultContainer.innerHTML = "<h2>Your Results</h2>";
  
    questions.forEach((q, index) => {
      const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
      const isCorrect = selected && parseInt(selected.value) === q.answer;
      if (isCorrect) score++;
  
      const userAnswerText = selected
        ? q.options[parseInt(selected.value)]
        : "No Answer";
  
      const correctAnswerText = q.options[q.answer];
  
      resultContainer.innerHTML += `
        <div class="result-block">
          <p><strong>Q${index + 1}: ${q.question}</strong></p>
          <p>Your Answer: <span style="color: ${isCorrect ? 'lightgreen' : 'red'};">
            ${userAnswerText} ${isCorrect ? '✅' : '❌'}
          </span></p>
          ${
            !isCorrect
              ? `<p>Correct Answer: <span style="color: lightgreen;">${correctAnswerText}</span></p>`
              : ""
          }
          <hr/>
        </div>
      `;
    });
  
    resultContainer.innerHTML += `<h3 style="text-align:center; color: black;">Total Score: ${score} / ${questions.length}</h3>`;
  
    // Disable all inputs after submission
    const allInputs = document.querySelectorAll('input[type="radio"]');
    allInputs.forEach(input => input.disabled = true);
  
    // Disable the Submit button
    const submitBtn = document.querySelector('.submit-section button');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
      submitBtn.style.cursor = 'not-allowed';
    }
  }
// document.addEventListener("DOMContentLoaded", () => {
//     renderQuestions();
//     startTimer();
  
//     const submitButton = document.querySelector('.submit-section button');
//     submitButton.addEventListener('click', submitTest);
//   });  